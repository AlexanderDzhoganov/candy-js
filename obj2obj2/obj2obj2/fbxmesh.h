#ifndef __FBXMESH_H
#define __FBXMESH_H

struct BlendingIndexWeightPair;
struct Skeleton;

class FbxMeshReader
{

	public:
	FbxMeshReader(FbxMesh* mesh) : m_Mesh(mesh) {};
	~FbxMeshReader() {}

	bool ReadMeshStaticData();
	bool ReadMeshSkeletonAndAnimations(FbxScene* scene, FbxNode* skeletonRoot);

	const vector<SubMesh>& GetSubMeshes() { return m_SubMeshes; }

	const Skeleton& GetSkeleton() { return m_Skeleton; }

	private:
	vector<vec3> ReadPositionsByPolyVertex();
	vector<vec3> ReadNormalsByPolyVertex(int normalElementIndex = 0);
	vector<vec2> ReadUVsByPolyVertex(int uvElementIndex = 0);
	vector<SubMesh> SplitToVertexLimit(size_t maxVerticesPerBucket, SubMesh submesh, size_t depth = 0);

	vector<vector<Vertex>> SplitByMaterial();
	void Convert();

	FbxMesh* m_Mesh = nullptr;
	Skeleton m_Skeleton;

	vector<Vertex> m_Vertices;
	vector<size_t> m_Indices;

	vector<SubMesh> m_SubMeshes;

	vector<vec3> m_ControlPoints;

	vector<vector<BlendingIndexWeightPair>> m_BlendingIndexWeightPairs;

};





#endif
