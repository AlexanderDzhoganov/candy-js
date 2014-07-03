#include <fbxsdk.h> 
#include <fbxsdk/fileio/fbxiosettings.h>

#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <mutex>
#include <condition_variable>
#include <memory>
#include <thread>
#include <sstream>

#include "..\dep\glm\glm.hpp"

using namespace std;
using namespace glm;

#include "..\include\logging.h"
#include "..\include\config.h"

#include "..\include\fbxutil.h"
#include "..\include\fbxelement.h"
#include "..\include\fbxanim.h"
#include "..\include\fbxmesh.h"
#include "..\include\fbxinfo.h"

void FbxSkeletonReader::ReadSkeletonHierarchy(FbxNode* node, int index, int parentIndex, Skeleton& result)
{
	if (node->GetNodeAttribute() == nullptr || node->GetNodeAttribute()->GetAttributeType() != FbxNodeAttribute::eSkeleton)
	{
		return;
	}
	else
	{
		Joint joint;
		joint.parentIndex = parentIndex;
		joint.name = node->GetName();

		if (CONFIG_KEY("include-identity-frame", "true"))
		{
			KeyFrame zeroKeyframe;
			zeroKeyframe.globalTransform = FbxAMatrix();
			zeroKeyframe.frameNum = 0;
			joint.animation.push_back(zeroKeyframe);
		}

		LOG_VERBOSE("Found joint node - \"%\"", joint.name);
		result.joints.push_back(joint);
	}

	auto childCount = node->GetChildCount();
	for (auto i = 0; i < childCount; i++)
	{
		ReadSkeletonHierarchy(node->GetChild(i), (int) result.joints.size(), index, result);
	}
}

mat4 convertFbxMatrix(const FbxAMatrix& rhs)
{
	mat4 result;
	for (auto x = 0; x < 4; x++)
	{
		for (auto y = 0; y < 4; y++)
		{
			result[x][y] = rhs.Get(x, y);
		}
	}
	return result;
}

bool FbxSkeletonReader::ReadSkeletonHierarchy()
{
	LOG("Reading skeleton hierarchy");

	m_Skeleton.joints.clear();
	
	auto childCount = m_RootNode->GetChildCount();
	for (auto i = 0; i < childCount; i++)
	{
		if (m_RootNode->GetChild(i)->GetNodeAttribute() && m_RootNode->GetChild(i)->GetNodeAttribute()->GetAttributeType() == FbxNodeAttribute::eSkeleton)
		{
			LOG_VERBOSE("Found global transform for skeleton");
			FbxAMatrix linkMatrix = m_RootNode->GetChild(i)->EvaluateGlobalTransform();
			m_Skeleton.transform = convertFbxMatrix(linkMatrix);
			break;
		}
	}

	for (auto i = 0; i < childCount; i++)
	{
		ReadSkeletonHierarchy(m_RootNode->GetChild(i), 0, -1, m_Skeleton);
	}

	if (m_Skeleton.joints.size() == 0)
	{
		LOG("Error! No joints were found in the tree.");
		return false;
	}

	LOG("Finished! % joints.", m_Skeleton.joints.size());
	return true;
}

vector<vector<BlendingIndexWeightPair>> FbxSkeletonReader::ReadAnimationBlendingIndexWeightPairs(FbxMesh* mesh)
{
	LOG("Reading index-weight pairs");

	auto deformerCount = mesh->GetDeformerCount();
	vector<vector<BlendingIndexWeightPair>> indexWeightPairs;
	indexWeightPairs.resize(mesh->GetControlPointsCount());

	for (auto deformerIdx = 0; deformerIdx < deformerCount; deformerIdx++)
	{
		auto currentSkin = reinterpret_cast<FbxSkin*>(mesh->GetDeformer(deformerIdx, FbxDeformer::eSkin));

		if (currentSkin == nullptr) continue;

		auto clusterCount = currentSkin->GetClusterCount();
		LOG_VERBOSE("Mesh contains % clusters", clusterCount);

		for (auto clusterIdx = 0; clusterIdx < clusterCount; clusterIdx++)
		{
			auto currentCluster = currentSkin->GetCluster(clusterIdx);
			auto currentJointName = currentCluster->GetLink()->GetName();
			auto currentJointIndex = m_Skeleton.GetJointIndexByName(currentJointName);

			auto indicesCount = currentCluster->GetControlPointIndicesCount();
			auto indices = currentCluster->GetControlPointIndices();
			auto weights = currentCluster->GetControlPointWeights();

			for (auto i = 0; i < indicesCount; i++)
			{
				BlendingIndexWeightPair pair;
				pair.jointIndex = currentJointIndex;
				pair.weight = (float) weights[i];
				indexWeightPairs[indices[i]].push_back(pair);
			}
		}
	}

	for (auto& vertexPairs : indexWeightPairs)
	{
		while (vertexPairs.size() < 4)
		{
			BlendingIndexWeightPair pair;
			pair.jointIndex = 0;
			pair.weight = 0.0f;
			vertexPairs.push_back(pair);
		}
	}

	LOG_VERBOSE("Read % index-weight pairs", indexWeightPairs.size());
	return indexWeightPairs;
}

FbxAMatrix FbxSkeletonReader::GetGeometryTransformation(FbxNode* node)
{
	const FbxVector4 lT = node->GetGeometricTranslation(FbxNode::eSourcePivot);
	const FbxVector4 lR = node->GetGeometricRotation(FbxNode::eSourcePivot);
	const FbxVector4 lS = node->GetGeometricScaling(FbxNode::eSourcePivot);
	return FbxAMatrix(lT, lR, lS);
}

FbxAMatrix FbxSkeletonReader::ComputeClusterDeformation(FbxMesh* mesh, FbxCluster* cluster)
{
	FbxAMatrix lClusterGlobalInitPosition;
	FbxAMatrix lReferenceGlobalInitPosition;
	cluster->GetTransformMatrix(lReferenceGlobalInitPosition);

	FbxAMatrix lReferenceGeometry;
	lReferenceGeometry = GetGeometryTransformation(mesh->GetNode());

	lReferenceGlobalInitPosition *= lReferenceGeometry;

	cluster->GetTransformLinkMatrix(lClusterGlobalInitPosition);

	return lClusterGlobalInitPosition.Inverse() * lReferenceGlobalInitPosition;
}

void FbxSkeletonReader::ReadAnimations(FbxScene* scene, FbxMesh* mesh)
{
	LOG("Reading animation frame data");

	auto deformerCount = mesh->GetDeformerCount();
	for (auto deformerIdx = 0; deformerIdx < deformerCount; deformerIdx++)
	{
		auto currentSkin = reinterpret_cast<FbxSkin*>(mesh->GetDeformer(deformerIdx, FbxDeformer::eSkin));

		if (currentSkin == nullptr) continue;

		auto clusterCount = currentSkin->GetClusterCount();

		for (auto clusterIdx = 0; clusterIdx < clusterCount; clusterIdx++)
		{
			auto currentCluster = currentSkin->GetCluster(clusterIdx);
			auto currentJointName = currentCluster->GetLink()->GetName();
			auto currentJointIndex = m_Skeleton.GetJointIndexByName(currentJointName);

			m_Skeleton.joints[currentJointIndex].globalBindPoseInverse = ComputeClusterDeformation(mesh, currentCluster);
			m_Skeleton.joints[currentJointIndex].node = currentCluster->GetLink();
		}
	}
	
	BakeAnimations(scene, mesh);
}

void FbxSkeletonReader::BakeAnimations(FbxScene* scene, FbxMesh* mesh)
{
	auto deformerCount = mesh->GetDeformerCount();

	auto geometryTransform = GetGeometryTransformation(mesh->GetNode());

	auto animationStack = scene->GetCurrentAnimationStack();

	auto animationStackName = animationStack->GetName();

	auto animationTake = scene->GetTakeInfo(animationStackName);

	auto startTime = animationTake->mLocalTimeSpan.GetStart();
	auto endTime = animationTake->mLocalTimeSpan.GetStop();

	auto startTimeFrames = startTime.GetFrameCount(FbxTime::eFrames24);
	auto endTimeFrames = endTime.GetFrameCount(FbxTime::eFrames24);

	LOG_VERBOSE("Start frame: %", startTimeFrames);
	LOG_VERBOSE("End frame: %", endTimeFrames);

	auto animationLength = endTimeFrames - startTimeFrames + 1;

	LOG_VERBOSE("Evaluating % frames of animation", animationLength);

	for (auto deformerIdx = 0; deformerIdx < deformerCount; deformerIdx++)
	{
		auto currentSkin = reinterpret_cast<FbxSkin*>(mesh->GetDeformer(deformerIdx, FbxDeformer::eSkin));

		if (currentSkin == nullptr) continue;

		auto clusterCount = currentSkin->GetClusterCount();

		for (auto clusterIdx = 0; clusterIdx < clusterCount; clusterIdx++)
		{
			auto currentCluster = currentSkin->GetCluster(clusterIdx);
			auto currentJointName = currentCluster->GetLink()->GetName();
			auto currentJointIndex = m_Skeleton.GetJointIndexByName(currentJointName);

			for (auto frame = startTimeFrames; frame < endTimeFrames; frame++)
			{
				FbxTime currentTime;
				currentTime.SetFrame(frame, FbxTime::eFrames24);

				KeyFrame currentFrame;
				currentFrame.frameNum = frame;

				auto currentTransformOffset = mesh->GetNode()->EvaluateGlobalTransform(currentTime) * geometryTransform;

				currentFrame.globalTransform = currentCluster-> * m_Skeleton.joints[currentJointIndex].globalBindPoseInverse;

				m_Skeleton.joints[currentJointIndex].animation.push_back(currentFrame);
			}
		}
	}
}
