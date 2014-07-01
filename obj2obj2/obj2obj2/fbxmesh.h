#ifndef __FBXMESH_H
#define __FBXMESH_H

struct ConvertedSubmesh
{
	size_t materialIndex;
	vector<Vertex> vertices;
	vector<size_t> indices;
	bool hasAnimation = false;
};

struct ConvertedMesh
{
	vector<FbxSurfaceMaterial*> materials;
	vector<ConvertedSubmesh> submeshes;
};

struct BlendingIndexWeightPair;
struct Skeleton;

vector<vec3> GetPositionsFromFbxMesh(FbxMesh* mesh);

vector<vec3> GetNormalsFromFbxMesh(FbxMesh* mesh, int normalElementIndex = 0);

vector<vec2> GetUVsFromFbxMesh(FbxMesh* mesh, int uvElementIndex = 0);

vector<Vertex> CombineFbxVertices(const vector<vec3>& positions, const vector<vec3>& normals, const vector<vec2>& uvs);

vector<Vertex> CombineFbxVerticesWithAnimation(const vector<vec3>& positions, const vector<vec3>& normals, const vector<vec2>& uvs,
														const vector<vector<BlendingIndexWeightPair>>& weightPairs);

pair<vector<Vertex>, vector<size_t>> DeduplicateVertices(const vector<Vertex>& vertices);

vector<vector<Vertex>> SplitFbxMeshByMaterial(FbxMesh* mesh);

ConvertedMesh ConvertMesh(FbxMesh* mesh, Skeleton* skeleton = nullptr);

#endif
