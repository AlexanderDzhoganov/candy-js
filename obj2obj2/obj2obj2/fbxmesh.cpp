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
#include "fbxanim.h"
#include "fbxmesh.h"
#include "fbxelement.h"

bool FbxMeshReader::ReadMeshStaticData()
{
	cout << endl << ">> Preparing to read mesh data.. <<" << endl;

	if (!m_Mesh->IsTriangleMesh())
	{
		cout << "Mesh contains non-triangle primitives. Triangulating.. ";
		FbxGeometryConverter converter(m_Mesh->GetFbxManager());
		m_Mesh = (FbxMesh*)converter.Triangulate(m_Mesh, true);
		cout << "Done!" << endl;
	}

	cout << endl << ">> Parsing data.. <<" << endl;

	m_SubMeshes.clear();
	auto verticesByMaterial = SplitByMaterial();

	vector<string> materialNames;
	auto materialsCount = verticesByMaterial.size();
	for (auto i = 0u; i < materialsCount; i++)
	{
		materialNames.push_back(m_Mesh->GetNode()->GetMaterial(i)->GetName());
	}

	auto materialIndex = 0u;
	for (auto& materialVertices : verticesByMaterial)
	{
		SubMesh submesh;

		if (m_Skeleton.joints.size() > 0)
		{
			submesh.hasAnimation = true;
		}

		auto deduplicated = DeduplicateVertices(materialVertices);
		submesh.vertices = deduplicated.first;
		submesh.indices = deduplicated.second;
		submesh.material = materialNames[materialIndex];

		auto splitSubmeshes = SplitToVertexLimit(65535, submesh);
		for (auto& splitSubmesh : splitSubmeshes)
		{
			m_SubMeshes.push_back(splitSubmesh);
		}

		materialIndex++;
	}

	CalculateAABBs();

	auto submeshesCount = m_SubMeshes.size();

	size_t vertexCount = 0;
	size_t trianglesCount = 0;

	for (auto& submesh : m_SubMeshes)
	{
		vertexCount += submesh.vertices.size();
		trianglesCount += submesh.indices.size() / 3;
	}

	cout << ">> Success! " <<
		materialsCount << " materials, " <<
		submeshesCount << " submeshes, " <<
		vertexCount << " vertices, " <<
		trianglesCount << " triangles <<" <<
		endl;

	return true;
}

bool FbxMeshReader::ReadMeshSkeletonAndAnimations(FbxScene* scene, FbxNode* skeletonRoot)
{
	cout << endl << ">> Preparing to read animation data <<" << endl;

	if (!skeletonRoot)
	{
		cout << "Invalid skeletonRoot, bailing out.." << endl;
		return false;
	}

	FbxSkeletonReader skeletonReader(skeletonRoot);
	skeletonReader.ReadSkeletonHierarchy();
	skeletonReader.ReadAnimations(scene, m_Mesh);

	m_Skeleton = skeletonReader.GetSkeleton();
	m_BlendingIndexWeightPairs = skeletonReader.ReadAnimationBlendingIndexWeightPairs(m_Mesh);

	cout << ">> Finished reading animation data <<" << endl;
	return true;
}

void FbxMeshReader::CalculateAABBs()
{
	cout << "Calculating AABBs.. ";

	for (auto& submesh : m_SubMeshes)
	{
		submesh.aabb = AABB::fromVertices(submesh.vertices);
	}

	cout << "Done!" << endl;
}

pair<vector<Vertex>, vector<size_t>> FbxMeshReader::DeduplicateVertices(const vector<Vertex>& vertices)
{
	cout << "Deduplicating " << vertices.size() << " vertices.. ";

	vector<int> vertexHashes;
	for (auto i = 0u; i < vertices.size(); i++)
	{
		vertexHashes.push_back(GetVertexHash(vertices[i]));
	}

	vector<Vertex> dedupedVertices;
	unordered_map<int, size_t> dedupeIndexMap;

	for (auto i = 0u; i < vertices.size(); i++)
	{
		const auto& hash = vertexHashes[i];
		if (dedupeIndexMap.find(hash) == dedupeIndexMap.end())
		{
			dedupedVertices.push_back(vertices[i]);
			dedupeIndexMap[hash] = dedupedVertices.size() - 1;
		}
	}

	auto duplicatesCount = vertices.size() - dedupedVertices.size();

	vector<size_t> indices;
	indices.reserve(vertices.size());

	for (auto i = 0u; i < vertices.size(); i++)
	{
		const auto& hash = vertexHashes[i];
		indices.push_back(dedupeIndexMap[hash]);
	}

	cout << "Done! Removed " << duplicatesCount << " duplicate vertices." << endl;
	return make_pair(dedupedVertices, indices);
}

vector<vec3> FbxMeshReader::ReadPositionsByPolyVertex()
{
	cout << "Reading positions.. ";

	FbxVector4* controlPoints = m_Mesh->GetControlPoints();
	size_t polygonCount = m_Mesh->GetPolygonCount();

	vector<vec3> positions;
	for (auto i = 0u; i < polygonCount; i++)
	{
		for (auto j = 0u; j < 3; j++)
		{
			auto index = m_Mesh->GetPolygonVertex(i, j);
			FbxVector4 vertex = controlPoints[index];
			positions.emplace_back(vertex[0], vertex[1], vertex[2]);
		}
	}

	cout << "Done!" << endl;
	return positions;
}

vector<vec3> FbxMeshReader::ReadNormalsByPolyVertex(int normalElementIndex)
{
	cout << "Reading normals.. ";
	auto polygonCount = m_Mesh->GetPolygonCount();

	int vertexCounter = 0;

	vector<vec3> normals;

	for (auto i = 0; i < polygonCount; i++)
	{
		auto vertices = m_Mesh->GetPolygonSize(i);

		for (auto q = 0; q < vertices; q++)
		{
			auto controlPointIndex = m_Mesh->GetPolygonVertex(i, q);
			auto normal = ReadNormalFromFbxMesh(m_Mesh, controlPointIndex, vertexCounter, i, normalElementIndex);
			normals.push_back(normal);
			vertexCounter++;
		}
	}

	cout << "Done!" << endl;
	return normals;
}

vector<vec2> FbxMeshReader::ReadUVsByPolyVertex(int uvElementIndex)
{
	cout << "Reading UVs.. ";

	auto polygonCount = m_Mesh->GetPolygonCount();
	int vertexCounter = 0;
	vector<vec2> uvs;

	for (auto i = 0; i < polygonCount; i++)
	{
		auto vertices = m_Mesh->GetPolygonSize(i);

		for (auto q = 0; q < vertices; q++)
		{
			auto controlPointIndex = m_Mesh->GetPolygonVertex(i, q);
			auto uv = ReadUVFromFbxMesh(m_Mesh, controlPointIndex, vertexCounter, i, uvElementIndex);
			uvs.push_back(uv);
			vertexCounter++;
		}
	}

	cout << "Done!" << endl;
	return uvs;
}

vector<vector<Vertex>> FbxMeshReader::SplitByMaterial()
{
	auto positions = ReadPositionsByPolyVertex();
	auto normals = ReadNormalsByPolyVertex();
	auto uvs = ReadUVsByPolyVertex();

	auto polygonCount = m_Mesh->GetPolygonCount();
	auto materialCount = m_Mesh->GetNode()->GetMaterialCount();

	cout << "Splitting mesh by material type (" << materialCount << " materials).. ";

	vector<vector<Vertex>> submeshes;
	submeshes.resize(materialCount);

	auto vertexCount = 0;
	for (auto i = 0; i < polygonCount; i++)
	{
		auto polygonSize = m_Mesh->GetPolygonSize(i);
			
		if (polygonSize > 3)
		{
			cout << endl << endl << "Critical Error! Non-triangle primitive encountered, bailing out.." << endl << endl;
			return vector<vector<Vertex>>();
		}

		for (auto q = 0; q < polygonSize; q++)
		{
			auto controlPointIndex = m_Mesh->GetPolygonVertex(i, q);
			auto materialIndex = ReadMaterialFromFbxMesh(m_Mesh, controlPointIndex, i, 0);

			auto vertex = Vertex();
			vertex.position = positions[vertexCount];
			vertex.normal = normals[vertexCount];
			vertex.uv = uvs[vertexCount];

			if (m_Skeleton.joints.size() > 0)
			{
				for (auto k = 0u; k < 4; k++)
				{
					vertex.boneWeights[k] = m_BlendingIndexWeightPairs[controlPointIndex][k].weight;
					vertex.boneIndices[k] = m_BlendingIndexWeightPairs[controlPointIndex][k].jointIndex;
				}
			}

			submeshes[materialIndex].push_back(move(vertex));
			vertexCount++;
		}
	}

	cout << "Done!" << endl;
	return submeshes;
}

vector<SubMesh> FbxMeshReader::SplitToVertexLimit(size_t maxVerticesPerBucket, SubMesh submesh, size_t depth)
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

	vector<SubMesh> submeshes;
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

		SubMesh mesh;
		mesh.indices = finalIndices;
		mesh.vertices = finalVertices;
		mesh.material = submesh.material;
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

	SubMesh disjointMesh;
	disjointMesh.indices = disjointIndices;
	disjointMesh.vertices = disjointVertices;
	disjointMesh.material = submesh.material;

	if (disjointMesh.vertices.size() > maxVerticesPerBucket)
	{
		auto disjointSubmeshes = SplitToVertexLimit(maxVerticesPerBucket, disjointMesh, depth + 1);
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
