#ifndef __FBXANIM_H
#define __FBXANIM_H

struct BlendingIndexWeightPair
{
	int jointIndex;
	float weight;
};

struct KeyFrame
{
	FbxAMatrix globalTransform;
	unsigned long long frameNum;
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

class FbxSkeletonReader
{

	public:
	FbxSkeletonReader(FbxNode* skeletonRoot) : m_RootNode(skeletonRoot) {};
	~FbxSkeletonReader() {}

	bool ReadSkeletonHierarchy();

	const Skeleton& GetSkeleton() { return m_Skeleton; }

	vector<vector<BlendingIndexWeightPair>> ReadAnimationBlendingIndexWeightPairs(FbxMesh* mesh);
	void ReadAnimations(FbxScene* scene, FbxMesh* mesh);

	private:
	void ReadSkeletonHierarchy(FbxNode* node, int index, int parentIndex, Skeleton& result);
	static FbxAMatrix GetGeometryTransformation(FbxNode* node);

	Skeleton m_Skeleton;
	vector<vector<BlendingIndexWeightPair>> m_IndexWeightPairs;

	FbxNode* m_RootNode = nullptr;

};

#endif
