#ifndef __FBXMESH_H
#define __FBXMESH_H

struct BlendingIndexWeightPair;
struct Skeleton;

static int GetHashCodeForBytes(const char * bytes, int numBytes)
{
	unsigned long h = 0, g;
	for (int i = 0; i < numBytes; i++)
	{
		h = (h << 4) + bytes[i];
		if (g = h & 0xF0000000L) { h ^= g >> 24; }
		h &= ~g;
	}
	return h;
}

struct Vertex
{
	vec3 position;
	vec3 normal;
	vec2 uv;
	float boneWeights[4];
	int boneIndices[4];
};

struct AABB
{
	vec3 center;
	vec3 extents;

	AABB() = default;
	AABB(const vec3& _center, const vec3& _extents) : center(_center), extents(_extents) {}

	static auto fromVertices(const vector<Vertex>& vertices) -> AABB
	{
		vec3 vmin(numeric_limits<float>::max(), numeric_limits<float>::max(), numeric_limits<float>::max());
		vec3 vmax(numeric_limits<float>::min(), numeric_limits<float>::min(), numeric_limits<float>::min());

		for (auto i = 0u; i < vertices.size(); i++)
		{
			vec3 position = vertices[i].position;

			vmin = min(vmin, position);
			vmax = max(vmax, position);
		}
		vec3 diff = vmax - vmin;
		diff *= 0.5f;

		vec3 center = vmin + diff;
		vec3 extents = diff;

		return AABB(center, extents);
	}
};

struct SubMesh
{
	vector<Vertex> vertices;
	vector<size_t> indices;
	string material;
	AABB aabb;
	bool hasAnimation = false;
};

static int GetVertexHash(const Vertex& vertex)
{
	return GetHashCodeForBytes((const char*)(&vertex), sizeof(Vertex));
}

class FbxMeshReader
{

	public:
	FbxMeshReader(FbxMesh* mesh) : m_Mesh(mesh)
	{
		LOG("Initialized.");
		LOG("Node: \"%\"", mesh->GetNode()->GetName());
		LOG("Polygons: %", mesh->GetPolygonCount());
		LOG("Primitive type: %", mesh->IsTriangleMesh() ? "triangles" : "mixed");
		LOG("Deformers: %", mesh->GetDeformerCount());
		LOG("Layers: %", mesh->GetLayerCount());
	};

	~FbxMeshReader() {}

	bool ReadMeshStaticData();
	bool ReadMeshSkeletonAndAnimations(FbxScene* scene, FbxNode* skeletonRoot);

	const vector<SubMesh>& GetSubMeshes() { return m_SubMeshes; }

	const Skeleton& GetSkeleton() { return m_Skeleton; }

	private:
	void CalculateAABBs();
	
	static pair<vector<Vertex>, vector<size_t>> DeduplicateVertices(const vector<Vertex>& vertices);

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
