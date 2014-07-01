#ifndef __FBXANIM_H
#define __FBXANIM_H

struct SkeletonNode
{

};

struct BlendingIndexWeightPair
{
	int jointIndex;
	float weight;
};

struct KeyFrame
{
	FbxAMatrix globalTransform;
	int frameNum;
};

struct Joint
{
	string name;
	int parentIndex;
	vector<KeyFrame> animation;
	FbxAMatrix globalBindPoseInverse;
	FbxNode* node;
};

struct Skeleton
{
	vector<Joint> joints;

	int GetJointIndexByName(const string& jointName) const
	{
		for (auto i = 0u; i < joints.size(); i++)
		{
			if (joints[i].name == jointName) return (int) i;
		}

		return -1;
	}
};

void ReadSkeletonHierarchy(FbxNode* node, int depth, int index, int parentIndex, Skeleton& result);

Skeleton ReadSkeletonHierarchy(FbxNode* skeletonRoot);

vector<vector<BlendingIndexWeightPair>> ReadAnimationBlendingIndexWeightPairs(FbxMesh* mesh, Skeleton& skeleton);

void ReadAnimations(FbxScene* scene, FbxMesh* mesh, Skeleton& skeleton);


#endif