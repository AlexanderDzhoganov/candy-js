#ifndef __FBXANIM_H
#define __FBXANIM_H

struct BlendingIndexWeightPair
{
	int jointIndex;
	float weight;
};

enum class JointLinkMode
{
	Additive = FbxCluster::ELinkMode::eAdditive,
	Normalize = FbxCluster::ELinkMode::eNormalize,
	TotalOne = FbxCluster::ELinkMode::eTotalOne,
};

struct Joint
{
	string name;
	int parentIndex;
};

struct Skeleton
{
	JointLinkMode linkMode;
	vector<Joint> joints;
	mat4 transform;

	unordered_map<string, vector<vector<FbxAMatrix>>> animations;

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
	FbxSkeletonReader(FbxScene* scene, FbxNode* skeletonRoot, FbxMesh* mesh);

	~FbxSkeletonReader() {}

	const Skeleton& GetSkeleton() { return m_Skeleton; }

	const vector<vector<BlendingIndexWeightPair>>& GetBlendingIndexWeightPairs()
	{
		return m_IndexWeightPairs;
	}

	private:
	bool ReadSkeletonHierarchy();
	void ReadSkeletonHierarchy(FbxNode* node, int index, int parentIndex, Skeleton& result);
	void ReadAnimationBlendingIndexWeightPairs();
	void ReadAnimationStack(const string& stackName);
	void ReadAnimations();

	vector<string> m_AnimationStackNames;

	Skeleton m_Skeleton;
	vector<vector<BlendingIndexWeightPair>> m_IndexWeightPairs;

	FbxNode* m_RootNode = nullptr;
	FbxScene* m_Scene = nullptr;
	FbxMesh* m_Mesh = nullptr;

	FbxAMatrix m_GlobalPosition;
	FbxPose* m_Pose = nullptr;

	FbxCluster::ELinkMode m_LinkMode;

};

#endif
