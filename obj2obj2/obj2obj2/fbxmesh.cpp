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
#include "fbxmesh.h"
#include "fbxelement.h"
#include "fbxanim.h"

vector<vec3> GetPositionsFromFbxMesh(FbxMesh* mesh)
{
	cout << "Reading positions.. ";

	FbxVector4* controlPoints = mesh->GetControlPoints();
	size_t polygonCount = mesh->GetPolygonCount();

	vector<vec3> positions;
	for (auto i = 0u; i < polygonCount; i++)
	{
		for (auto j = 0u; j < 3; j++)
		{
			auto index = mesh->GetPolygonVertex(i, j);
			FbxVector4 vertex = controlPoints[index];
			positions.emplace_back(vertex[0], vertex[1], vertex[2]);
		}
	}

	cout << "Done!" << endl;
	return positions;
}

vector<vec3> GetNormalsFromFbxMesh(FbxMesh* mesh, int normalElementIndex)
{
	cout << "Reading normals.. ";
	auto polygonCount = mesh->GetPolygonCount();

	int vertexCounter = 0;

	vector<vec3> normals;

	for (auto i = 0; i < polygonCount; i++)
	{
		auto vertices = mesh->GetPolygonSize(i);

		for (auto q = 0; q < vertices; q++)
		{
			auto controlPointIndex = mesh->GetPolygonVertex(i, q);
			auto normal = ReadNormalFromFbxMesh(mesh, controlPointIndex, vertexCounter, i, normalElementIndex);
			normals.push_back(normal);
			vertexCounter++;
		}
	}

	cout << "Done!" << endl;
	return normals;
}

vector<vec2> GetUVsFromFbxMesh(FbxMesh* mesh, int uvElementIndex)
{
	cout << "Reading UVs.. ";

	auto polygonCount = mesh->GetPolygonCount();
	int vertexCounter = 0;
	vector<vec2> uvs;

	for (auto i = 0; i < polygonCount; i++)
	{
		auto vertices = mesh->GetPolygonSize(i);

		for (auto q = 0; q < vertices; q++)
		{
			auto controlPointIndex = mesh->GetPolygonVertex(i, q);
			auto uv = ReadUVFromFbxMesh(mesh, controlPointIndex, vertexCounter, i, uvElementIndex);
			uvs.push_back(uv);
			vertexCounter++;
		}
	}

	cout << "Done!" << endl;
	return uvs;
}

vector<Vertex> CombineFbxVertices(const vector<vec3>& positions, const vector<vec3>& normals, const vector<vec2>& uvs)
{
	assert(positions.size() == normals.size() == uvs.size());
	vector<Vertex> vertices;

	for (auto i = 0; i < positions.size(); i++)
	{
		vertices.emplace_back();
		vertices[i].position = positions[i];
		vertices[i].normal = normals[i];
		vertices[i].uv = uvs[i];
	}

	return vertices;
}

vector<Vertex> CombineFbxVerticesWithAnimation(const vector<vec3>& positions, const vector<vec3>& normals, const vector<vec2>& uvs, 
														const vector<vector<BlendingIndexWeightPair>>& weightPairs)
{
	assert(positions.size() == normals.size() == uvs.size());
	vector<Vertex> vertices;

	for (auto i = 0; i < positions.size(); i++)
	{
		vertices.emplace_back();
		vertices[i].position = positions[i];
		vertices[i].normal = normals[i];
		vertices[i].uv = uvs[i];

		for (auto q = 0u; q < 4; q++)
		{
			vertices[i].boneWeights[q] = weightPairs[i][q].weight;
			vertices[i].boneIndices[q] = weightPairs[i][q].jointIndex;
		}
	}

	return vertices;
}

vector<vector<Vertex>> SplitFbxMeshByMaterial(FbxMesh* mesh, Skeleton* skeleton = nullptr)
{
	auto positions = GetPositionsFromFbxMesh(mesh);
	auto normals = GetNormalsFromFbxMesh(mesh);
	auto uvs = GetUVsFromFbxMesh(mesh);

	vector<vector<BlendingIndexWeightPair>> weightPairs;

	if (skeleton)
	{
		weightPairs = ReadAnimationBlendingIndexWeightPairs(mesh, *skeleton);
	}

	auto polygonCount = mesh->GetPolygonCount();
	auto materialCount = mesh->GetNode()->GetMaterialCount();

	cout << "Splitting mesh by material type (" << materialCount << " materials).. ";

	vector<vector<Vertex>> submeshes;
	submeshes.resize(materialCount);

	auto vertexCount = 0;
	for (auto i = 0; i < polygonCount; i++)
	{
		auto polygonSize = mesh->GetPolygonSize(i);

		for (auto q = 0; q < polygonSize; q++)
		{
			auto controlPointIndex = mesh->GetPolygonVertex(i, q);
			auto materialIndex = ReadMaterialFromFbxMesh(mesh, controlPointIndex, i, 0);

			auto vertex = Vertex();
			vertex.position = positions[vertexCount];
			vertex.normal = normals[vertexCount];
			vertex.uv = uvs[vertexCount];

			if (skeleton)
			{
				for (auto k = 0u; k < 4; k++)
				{
					vertex.boneWeights[k] = weightPairs[controlPointIndex][k].weight;
					vertex.boneIndices[k] = weightPairs[controlPointIndex][k].jointIndex;
				}
			}

			submeshes[materialIndex].push_back(move(vertex));
			vertexCount++;
		}
	}

	cout << "Done!" << endl;
	return submeshes;
}

vector<ConvertedSubmesh> SplitConvertedSubmesh(size_t maxVerticesPerBucket, ConvertedSubmesh submesh, size_t depth = 0)
{
	if (depth == 0)
	{
		cout << "Splitting submesh at a maximum of " << maxVerticesPerBucket << " vertices.. [";
	}

	auto bucketCount = (size_t)(ceil(submesh.vertices.size() / (float)maxVerticesPerBucket));

	for (auto i = 0u; i < bucketCount; i++)
	{
		if (depth == 0)
		{
			cout << ".";
		}
		else
		{
			cout << "x";
		}
	}

	vector<ConvertedSubmesh> submeshes;
	unordered_map<size_t, bool> disjointTrianglesMap;
	vector<size_t> disjointTriangles;

	for (auto i = 0; i < bucketCount; i++)
	{
		size_t verticesToCopy = maxVerticesPerBucket;
		if (i == bucketCount - 1)
		{
			verticesToCopy = submesh.vertices.size() - (bucketCount - 1) * maxVerticesPerBucket;
		}

		auto windowStart = i * maxVerticesPerBucket; 
		auto windowEnd = windowStart + verticesToCopy;

		vector<Vertex> finalVertices;
		for (auto q = windowStart; q < windowEnd; q++)
		{
			finalVertices.push_back(submesh.vertices[q]);
		}

		auto indexOffset = -i * maxVerticesPerBucket; //bucket offset. traslates from big (global) to local (small) idx

		vector<size_t> finalIndices; //bucked indices;
		for (auto j = 0u; j < submesh.indices.size() / 3; j++)
		{
			//triangle idx
			auto index0 = submesh.indices[j * 3 + 0];
			auto index1 = submesh.indices[j * 3 + 1];
			auto index2 = submesh.indices[j * 3 + 2];

			bool belongsToBucket =
				(index0 >= windowStart && index0 < windowEnd) &&
				(index1 >= windowStart && index1 < windowEnd) &&
				(index2 >= windowStart && index2 < windowEnd);

			if (belongsToBucket && disjointTrianglesMap[j] != true)
			{
				disjointTrianglesMap[j] = true;
				finalIndices.push_back(index0 + indexOffset);
				finalIndices.push_back(index1 + indexOffset);
				finalIndices.push_back(index2 + indexOffset);
			}
			else if (disjointTrianglesMap[j] != true)
			{
				disjointTriangles.push_back(index0);
				disjointTriangles.push_back(index1);
				disjointTriangles.push_back(index2);
				disjointTrianglesMap[j] = true;
			}
		}

		ConvertedSubmesh mesh;
		mesh.indices = finalIndices;
		mesh.vertices = finalVertices;
		mesh.materialIndex = submesh.materialIndex;
		mesh.hasAnimation = submesh.hasAnimation;

		if (mesh.indices.size() > 0 && mesh.vertices.size() > 0)
		{
			submeshes.push_back(mesh);
		}
	}

	set<size_t> uniqueDisjointIndices(disjointTriangles.begin(), disjointTriangles.end());

	unordered_map<size_t, size_t> disjointVerticesMap;
	vector<Vertex> disjointVertices;

	for (auto& uniqueIndice : uniqueDisjointIndices)
	{
		auto vertex = submesh.vertices[uniqueIndice];
		disjointVertices.push_back(vertex);
		disjointVerticesMap[uniqueIndice] = disjointVertices.size() - 1;
	}

	vector<size_t> disjointIndices;

	for (auto i = 0u; i < disjointTriangles.size() / 3; i++)
	{
		auto index0 = disjointTriangles[3 * i + 0];
		auto index1 = disjointTriangles[3 * i + 1];
		auto index2 = disjointTriangles[3 * i + 2];

		auto localIndex0 = disjointVerticesMap[index0];
		auto localIndex1 = disjointVerticesMap[index1];
		auto localIndex2 = disjointVerticesMap[index2];

		disjointIndices.push_back(localIndex0);
		disjointIndices.push_back(localIndex1);
		disjointIndices.push_back(localIndex2);
	}

	ConvertedSubmesh disjointMesh;
	disjointMesh.indices = disjointIndices;
	disjointMesh.vertices = disjointVertices;
	disjointMesh.materialIndex = submesh.materialIndex;

	if (disjointMesh.vertices.size() > maxVerticesPerBucket)
	{
		auto disjointSubmeshes = SplitConvertedSubmesh(maxVerticesPerBucket, disjointMesh, depth + 1);
		for (auto& submesh : disjointSubmeshes)
		{
			submeshes.push_back(submesh);
		}
	}
	else if (disjointMesh.indices.size() > 0 && disjointMesh.vertices.size() > 0)
	{
		submeshes.push_back(disjointMesh);
	}

	if (depth == 0)
	{
		cout << "] Done!" << endl;
	}

	return submeshes;
}

ConvertedMesh ConvertMesh(FbxMesh* mesh, Skeleton* skeleton)
{
	cout << endl << "Starting mesh conversion.." << endl;

	auto verticesByMaterial = SplitFbxMeshByMaterial(mesh, skeleton);

	ConvertedMesh result;

	auto materialIndex = 0u;
	for (auto& materialVertices : verticesByMaterial)
	{
		ConvertedSubmesh submesh;

		if (skeleton != nullptr)
		{
			submesh.hasAnimation = true;
		}

		auto deduplicated = DeduplicateVertices(materialVertices);
		submesh.vertices = deduplicated.first;
		submesh.indices = deduplicated.second;
		submesh.materialIndex = materialIndex;

		auto splitSubmeshes = SplitConvertedSubmesh(65535, submesh);
		for (auto& splitSubmesh : splitSubmeshes)
		{
			result.submeshes.push_back(splitSubmesh);
		}

		materialIndex++;
	}

	auto materialsCount = materialIndex;

	for (auto i = 0u; i < materialsCount; i++)
	{
		result.materials.push_back(mesh->GetNode()->GetMaterial(i));
	}

	auto submeshesCount = result.submeshes.size();

	size_t vertexCount = 0;
	size_t trianglesCount = 0;

	for (auto& submesh : result.submeshes)
	{
		vertexCount += submesh.vertices.size();
		trianglesCount += submesh.indices.size() / 3;
	}

	cout << "Mesh conversion successful! " <<
		materialsCount << " materials, " <<
		submeshesCount << " submeshes, " <<
		vertexCount << " vertices, " <<
		trianglesCount << " triangles" <<
		endl;

	return result;
}
