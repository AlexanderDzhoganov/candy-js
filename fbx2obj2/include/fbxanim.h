#ifndef __FBXANIM_H
#define __FBXANIM_H

struct BlendingIndexWeightPair
{
	int jointIndex;
	float weight;
};

struct Joint
{
	string name;
	int parentIndex;
	vector<FbxAMatrix> animation;
	FbxAMatrix globalBindPoseInverse;
	FbxNode* node;
};

struct Skeleton
{
	vector<Joint> joints;
	mat4 transform;

	int GetJointIndexByName(const string& jointName) const
	{
		for (auto i = 0u; i < joints.size(); i++)
		{
			if (joints[i].name == jointName)
			{
				return (int)i;
			}
		}

		return -1;
	}
};

class FbxSkeletonReader
{

	public:
	FbxSkeletonReader(FbxScene* scene, FbxNode* skeletonRoot) : m_Scene(scene), m_RootNode(skeletonRoot) {};
	~FbxSkeletonReader() {}

	bool ReadSkeletonHierarchy();

	const Skeleton& GetSkeleton() { return m_Skeleton; }

	vector<vector<BlendingIndexWeightPair>> ReadAnimationBlendingIndexWeightPairs(FbxMesh* mesh);
	void ReadAnimations(FbxScene* scene, FbxMesh* mesh);

	private:
	void ReadSkeletonHierarchy(FbxNode* node, int index, int parentIndex, Skeleton& result);

	Skeleton m_Skeleton;
	vector<vector<BlendingIndexWeightPair>> m_IndexWeightPairs;

	FbxNode* m_RootNode = nullptr;
	FbxScene* m_Scene = nullptr;

	FbxAMatrix m_GlobalPosition;
	FbxPose* m_Pose = nullptr;

};

#endif
