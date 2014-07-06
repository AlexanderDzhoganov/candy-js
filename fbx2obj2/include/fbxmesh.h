#ifndef __FBXMESH_H
#define __FBXMESH_H

#include "../include/md5.h"

struct BlendingIndexWeightPair;
struct Skeleton;

static string GetHashCodeForBytes(const char * bytes, int numBytes)
{
	MD5 md5;
	return md5(bytes, numBytes);
}

struct Vertex
{
	glm::vec3 position;
	glm::vec3 normal;
	glm::vec2 uv;
	float boneWeights[4];
	int boneIndices[4];
};

static bool VertexCompare(const Vertex& a, const Vertex& b, bool animated)
{
	if (a.position != b.position || a.normal != b.normal || a.uv != b.uv)
	{
		return false;
	}

	if (animated)
	{
		for (auto i = 0u; i < 4; i++)
		{
			if (a.boneWeights[i] != b.boneWeights[i])
			{
				return false;
			}

			if (a.boneIndices[i] != b.boneIndices[i])
			{
				return false;
			}
		}
	}

	return true;
}

static string GetStaticVertexHash(const Vertex& vertex)
{
	return GetHashCodeForBytes((const char*)(&vertex), sizeof(glm::vec3)+sizeof(glm::vec3)+sizeof(glm::vec2));
}

static string GetAnimatedVertexHash(const Vertex& vertex)
{
	return GetHashCodeForBytes((const char*)(&vertex), sizeof(Vertex));
}

struct AABB
{
	glm::vec3 center;
	glm::vec3 extents;
	glm::vec3 vmin;
	glm::vec3 vmax;

	AABB() = default;
	AABB(const glm::vec3& _center, const glm::vec3& _extents, const glm::vec3& _vmin, const glm::vec3& _vmax) : center(_center), extents(_extents), vmin(_vmin), vmax(_vmax) {}

	static auto fromVertices(const vector<Vertex>& vertices) -> AABB
	{
		glm::vec3 vmin(numeric_limits<float>::max(), numeric_limits<float>::max(), numeric_limits<float>::max());
		glm::vec3 vmax(numeric_limits<float>::min(), numeric_limits<float>::min(), numeric_limits<float>::min());

		for (auto i = 0u; i < vertices.size(); i++)
		{
			glm::vec3 position = vertices[i].position;

			vmin = glm::min(vmin, position);
			vmax = glm::max(vmax, position);
		}
		glm::vec3 diff = vmax - vmin;
		diff *= 0.5f;

		glm::vec3 center = vmin + diff;
		glm::vec3 extents = diff;

		return AABB(center, extents, vmin, vmax);
	}

	static auto fromVertices(const vector<float>& vertices) -> AABB
	{
		glm::vec3 vmin(numeric_limits<float>::max(), numeric_limits<float>::max(), numeric_limits<float>::max());
		glm::vec3 vmax(numeric_limits<float>::min(), numeric_limits<float>::min(), numeric_limits<float>::min());

		for (auto i = 0u; i < vertices.size() / 3; i++)
		{
			glm::vec3 position
				(
				vertices[i * 3 + 0],
				vertices[i * 3 + 1],
				vertices[i * 3 + 2]
				);

			vmin = glm::min(vmin, position);
			vmax = glm::max(vmax, position);
		}
		glm::vec3 diff = vmax - vmin;
		diff *= 0.5f;

		glm::vec3 center = vmin + diff;
		glm::vec3 extents = diff;

		return AABB(center, extents, vmin, vmax);
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

	const vector<SubMesh>& GetSubMeshes() { return m_SubMeshes; }

	const Skeleton& GetSkeleton() { return m_Skeleton; }

	bool ReadMeshData(FbxScene* scene, FbxNode* skeletonRoot);

	private:
	bool ReadMeshSkeletonAndAnimations(FbxScene* scene, FbxNode* skeletonRoot);
	void CalculateAABBs();
	vector<glm::vec3> ReadPositionsByPolyVertex();
	vector<glm::vec3> ReadNormalsByPolyVertex(int normalElementIndex = 0);
	vector<glm::vec2> ReadUVsByPolyVertex(int uvElementIndex = 0);
	vector<vector<Vertex>> ProcessMesh();

	static vector<SubMesh> SplitToVertexLimit(size_t maxVerticesPerBucket, SubMesh submesh, size_t depth = 0);
	pair<vector<Vertex>, vector<size_t>> DeduplicateVertices(const vector<Vertex>& vertices);

	FbxMesh* m_Mesh = nullptr;
	Skeleton m_Skeleton;

	vector<Vertex> m_Vertices;
	vector<size_t> m_Indices;

	vector<SubMesh> m_SubMeshes;

	vector<glm::vec3> m_ControlPoints;

	vector<vector<BlendingIndexWeightPair>> m_BlendingIndexWeightPairs;

};





#endif
