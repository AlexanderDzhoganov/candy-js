#include <fbxsdk.h> 
#include <fbxsdk/fileio/fbxiosettings.h>

#include <fstream>
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <iterator>
#include <sstream>
#include <limits>
#include <tuple>
#include <set>
#include <thread>
#include <future>

#include "glm\glm.hpp"

using namespace std;
using namespace glm;

#include "util.h"

#include "fbxutil.h"
#include "fbxelement.h"
#include "fbxanim.h"
#include "fbxmesh.h"
#include "fbxinfo.h"

void ReadSkeletonHierarchy(FbxNode* node, int index, int parentIndex, Skeleton& result)
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
		result.joints.push_back(joint);
	}

	auto childCount = node->GetChildCount();

	for (auto i = 0; i < childCount; i++)
	{
		ReadSkeletonHierarchy(node->GetChild(i), result.joints.size(), index, result);
	}
}

Skeleton ReadSkeletonHierarchy(FbxNode* skeletonRoot)
{
	cout << "Reading skeleton hierarchy.. ";

	Skeleton result;
	auto childCount = skeletonRoot->GetChildCount();

	for (auto i = 0; i < childCount; i++)
	{
		ReadSkeletonHierarchy(skeletonRoot->GetChild(i), 0, -1, result);
	}

	cout << "Done! " << result.joints.size() << " joints." << endl;
	return result;
}

vector<vector<BlendingIndexWeightPair>> ReadAnimationBlendingIndexWeightPairs(FbxMesh* mesh, Skeleton& skeleton)
{
	cout << "Reading index-weight pairs.. ";

	auto deformerCount = mesh->GetDeformerCount();
	vector<vector<BlendingIndexWeightPair>> indexWeightPairs;
	indexWeightPairs.resize(mesh->GetControlPointsCount());

	for (auto deformerIdx = 0; deformerIdx < deformerCount; deformerIdx++)
	{
		auto currentSkin = reinterpret_cast<FbxSkin*>(mesh->GetDeformer(deformerIdx, FbxDeformer::eSkin));

		if (currentSkin == nullptr) continue;

		auto clusterCount = currentSkin->GetClusterCount();

		for (auto clusterIdx = 0; clusterIdx < clusterCount; clusterIdx++)
		{
			auto currentCluster = currentSkin->GetCluster(clusterIdx);
			auto currentJointName = currentCluster->GetLink()->GetName();
			auto currentJointIndex = skeleton.GetJointIndexByName(currentJointName);

			auto indicesCount = currentCluster->GetControlPointIndicesCount();
			auto indices = currentCluster->GetControlPointIndices();
			auto weights = currentCluster->GetControlPointWeights();

			for (auto i = 0; i < indicesCount; i++)
			{
				BlendingIndexWeightPair pair;
				pair.jointIndex = currentJointIndex;
				pair.weight = weights[i];
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

	cout << "Done!" << endl;

	return indexWeightPairs;
}

FbxAMatrix GetGeometryTransformation(FbxNode* node)
{
	const FbxVector4 lT = node->GetGeometricTranslation(FbxNode::eSourcePivot);
	const FbxVector4 lR = node->GetGeometricRotation(FbxNode::eSourcePivot);
	const FbxVector4 lS = node->GetGeometricScaling(FbxNode::eSourcePivot);

	return FbxAMatrix(lT, lR, lS);
}

void ReadAnimations(FbxScene* scene, FbxMesh* mesh, Skeleton& skeleton)
{
	cout << "Reading animation frame data.. ";

	auto deformerCount = mesh->GetDeformerCount();

	auto geometryTransform = GetGeometryTransformation(mesh->GetNode());

	auto animationStack = scene->GetCurrentAnimationStack();

	auto animationStackName = animationStack->GetName();
	auto animationTake = scene->GetTakeInfo(animationStackName);

	auto startTime = animationTake->mLocalTimeSpan.GetStart();
	auto endTime = animationTake->mLocalTimeSpan.GetStop();

	auto startTimeFrames = startTime.GetFrameCount(FbxTime::eFrames24);
	auto endTimeFrames = endTime.GetFrameCount(FbxTime::eFrames24);

	auto animationLength = endTimeFrames - startTimeFrames + 1;

	for (auto deformerIdx = 0; deformerIdx < deformerCount; deformerIdx++)
	{
		auto currentSkin = reinterpret_cast<FbxSkin*>(mesh->GetDeformer(deformerIdx, FbxDeformer::eSkin));

		if (currentSkin == nullptr) continue;

		auto clusterCount = currentSkin->GetClusterCount();

		for (auto clusterIdx = 0; clusterIdx < clusterCount; clusterIdx++)
		{
			auto currentCluster = currentSkin->GetCluster(clusterIdx);
			auto currentJointName = currentCluster->GetLink()->GetName();
			auto currentJointIndex = skeleton.GetJointIndexByName(currentJointName);

			FbxAMatrix transformMatrix;
			currentCluster->GetTransformMatrix(transformMatrix);

			FbxAMatrix transformLinkMatrix;
			currentCluster->GetTransformLinkMatrix(transformLinkMatrix);

			auto globalBindPoseInverseMatrix = transformLinkMatrix.Inverse() * transformMatrix * geometryTransform;

			skeleton.joints[currentJointIndex].globalBindPoseInverse = globalBindPoseInverseMatrix;
			skeleton.joints[currentJointIndex].node = currentCluster->GetLink();

			for (auto frame = startTimeFrames; frame < endTimeFrames; frame++)
			{
				FbxTime currentTime;
				currentTime.SetFrame(frame, FbxTime::eFrames24);

				KeyFrame currentFrame;
				currentFrame.frameNum = frame;

				auto currentTransformOffset = mesh->GetNode()->EvaluateGlobalTransform(currentTime) * geometryTransform;

				currentFrame.globalTransform = currentTransformOffset.Inverse() *
					currentCluster->GetLink()->EvaluateGlobalTransform(currentTime);

				currentFrame.globalTransform = currentFrame.globalTransform * globalBindPoseInverseMatrix;

				skeleton.joints[currentJointIndex].animation.push_back(currentFrame);
			}
		}
	}

	cout << "Done!" << endl;
}