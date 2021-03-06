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

#include "..\dep\glm\glm.hpp"

using namespace std;


#include "..\include\logging.h"
#include "..\include\config.h"

#include "..\include\fbxutil.h"
#include "..\include\fbxanim.h"
#include "..\include\fbxmesh.h"
#include "..\include\fbxelement.h"

bool FbxMeshReader::ReadMeshData(FbxScene* scene, FbxNode* skeletonRoot)
{
	LOG_VERBOSE("Preparing to read mesh data");

	if (!m_Mesh->IsTriangleMesh())
	{
		LOG("Mesh contains non-triangle primitives. Triangulating");
		FbxGeometryConverter converter(m_Mesh->GetFbxManager());
		m_Mesh = (FbxMesh*)converter.Triangulate(m_Mesh, true);
		LOG_VERBOSE("Triangulation complete, % resulting triangles", m_Mesh->GetPolygonCount());
	}

	if (skeletonRoot != nullptr)
	{
		LOG("Valid skeleton encountered, will parse animation data");
		ReadMeshSkeletonAndAnimations(scene, skeletonRoot);
	}

	LOG_VERBOSE("Parsing data");

	m_SubMeshes.clear();
	auto verticesByMaterial = ProcessMesh();

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

		if (submesh.vertices.size() >= 65535)
		{
			LOG_VERBOSE("Mesh vertices over limit, splitting..");
			auto splitSubmeshes = SplitToVertexLimit(65535, submesh);
			for (auto& splitSubmesh : splitSubmeshes)
			{
				m_SubMeshes.push_back(splitSubmesh);
			}
		}
		else
		{
			m_SubMeshes.push_back(submesh);
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

	LOG("Result: % submeshes, % vertices, % triangles", submeshesCount, vertexCount, trianglesCount);
	return true;
}

bool FbxMeshReader::ReadMeshSkeletonAndAnimations(FbxScene* scene, FbxNode* skeletonRoot)
{
	LOG_VERBOSE("Preparing to read animation data");

	if (!skeletonRoot)
	{
		LOG("Invalid skeletonRoot, bailing out");
		return false;
	}

	FbxSkeletonReader skeletonReader(scene, skeletonRoot, m_Mesh);
	m_Skeleton = skeletonReader.GetSkeleton();
	m_BlendingIndexWeightPairs = skeletonReader.GetBlendingIndexWeightPairs();

	LOG_VERBOSE("Finished reading animation data");
	return true;
}

void FbxMeshReader::CalculateAABBs()
{
	LOG_VERBOSE("Calculating AABBs");

	for (auto& submesh : m_SubMeshes)
	{
		submesh.aabb = AABB::fromVertices(submesh.vertices);
	}
}

vector<glm::vec3> FbxMeshReader::ReadPositionsByPolyVertex()
{
	LOG_VERBOSE("Reading positions");

	FbxVector4* controlPoints = m_Mesh->GetControlPoints();
	size_t polygonCount = m_Mesh->GetPolygonCount();

	vector<glm::vec3> positions;
	for (auto i = 0u; i < polygonCount; i++)
	{
		auto polygonSize = m_Mesh->GetPolygonSize(i);
		for (auto j = 0; j < polygonSize; j++)
		{
			auto index = m_Mesh->GetPolygonVertex(i, j);
			FbxVector4 vertex = controlPoints[index];
			positions.emplace_back(vertex[0], vertex[1], vertex[2]);
		}
	}

	return positions;
}

vector<glm::vec3> FbxMeshReader::ReadNormalsByPolyVertex(int normalElementIndex)
{
	LOG_VERBOSE("Reading normals");
	auto polygonCount = m_Mesh->GetPolygonCount();

	int vertexCounter = 0;

	vector<glm::vec3> normals;

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

	return normals;
}

vector<glm::vec2> FbxMeshReader::ReadUVsByPolyVertex(int uvElementIndex)
{
	LOG_VERBOSE("Reading UVs");

	auto polygonCount = m_Mesh->GetPolygonCount();
	int vertexCounter = 0;
	vector<glm::vec2> uvs;

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

	return uvs;
}

vector<vector<Vertex>> FbxMeshReader::ProcessMesh()
{
	auto positions = ReadPositionsByPolyVertex();
	auto normals = ReadNormalsByPolyVertex();
	auto uvs = ReadUVsByPolyVertex();

	auto polygonCount = m_Mesh->GetPolygonCount();
	auto materialCount = m_Mesh->GetNode()->GetMaterialCount();

	LOG_VERBOSE("Splitting mesh by material type (% materials, % polygons)", materialCount, polygonCount);

	vector<vector<Vertex>> submeshes;
	submeshes.resize(materialCount);

	auto vertexCount = 0;
	for (auto i = 0; i < polygonCount; i++)
	{
		auto polygonSize = m_Mesh->GetPolygonSize(i);
			
		if (polygonSize > 3)
		{
			LOG("Critical Error! Non-triangle primitive encountered, bailing out");
			return vector<vector<Vertex>>();
		}

		for (auto q = 0; q < polygonSize; q++)
		{
			auto controlPointIndex = m_Mesh->GetPolygonVertex(i, q);
			auto materialIndex = ReadMaterialFromFbxMesh(m_Mesh, controlPointIndex, i, 0);

			auto vertex = Vertex();

			if (m_Skeleton.joints.size() > 0)
			{
				vertex.position = glm::vec3((m_Skeleton.transform * glm::vec4(positions[vertexCount], 1.0)));

				for (auto k = 0u; k < 4; k++)
				{
					vertex.boneWeights[k] = m_BlendingIndexWeightPairs[controlPointIndex][k].weight;
					vertex.boneIndices[k] = m_BlendingIndexWeightPairs[controlPointIndex][k].jointIndex;
				}
			}
			else
			{
				vertex.position = positions[vertexCount];
			}

			vertex.normal = normals[vertexCount];

			vertex.uv = uvs[vertexCount];

			submeshes[materialIndex].push_back(move(vertex));
			vertexCount++;
		}
	}

	return submeshes;
}

vector<SubMesh> FbxMeshReader::SplitToVertexLimit(size_t maxVerticesPerBucket, SubMesh submesh, size_t depth)
{
	if (depth == 0)
	{
		LOG_VERBOSE("Splitting submesh (maxVerticesPerBucket = %)", maxVerticesPerBucket);
	}

	auto bucketCount = (size_t)(ceil(submesh.vertices.size() / (float)maxVerticesPerBucket));

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

	return submeshes;
}

pair<vector<Vertex>, vector<size_t>> FbxMeshReader::DeduplicateVertices(const vector<Vertex>& vertices)
{
	LOG_VERBOSE("Deduplicating % vertices.. ", vertices.size());

	vector<string> vertexHashes;
	for (auto i = 0u; i < vertices.size(); i++)
	{
		if (m_Skeleton.joints.size() > 0)
		{
			vertexHashes.push_back(GetAnimatedVertexHash(vertices[i]));
		}
		else
		{
			vertexHashes.push_back(GetStaticVertexHash(vertices[i]));
		}
	}

	vector<Vertex> dedupedVertices;
	unordered_map<string, size_t> dedupeIndexMap;

	for (auto i = 0u; i < vertices.size(); i++)
	{
		const auto& hash = vertexHashes[i];
		if (dedupeIndexMap.find(hash) == dedupeIndexMap.end())
		{
			dedupedVertices.push_back(vertices[i]);
			dedupeIndexMap[hash] = dedupedVertices.size() - 1;
		}
		else
		{
			const auto& a = vertices[i];
			const auto& b = dedupedVertices[dedupeIndexMap[hash]];
			if (!VertexCompare(a, b, false))
			{
				LOG("HASH COLLISION!");
			}
		}
	}

	auto duplicatesCount = vertices.size() - dedupedVertices.size();

	vector<size_t> indices;
	indices.reserve(vertices.size());

	for (auto i = 0u; i < vertices.size(); i++)
	{
		const auto& hash = vertexHashes[i];
		indices.push_back(dedupeIndexMap[hash]);// dedupeIndexMap[hash]);
	}

	LOG_VERBOSE("Removed % duplicate vertices.", duplicatesCount);
	return make_pair(dedupedVertices, indices);
}