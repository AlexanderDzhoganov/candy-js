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
#include "obj.h"

vector<string> lines; 

auto strip(const string& s) -> string
{
	size_t spacesFront = 0;
	size_t spacesBack = 0;

	for (char c : s)
	{
		if (c != ' ')
		{
			break;
		}

		spacesFront++;
	}

	for (auto it = s.rbegin(); it != s.rend(); it++)
	{
		if (*it != ' ')
		{
			break;
		}

		spacesBack++;
	}

	stringstream ss;
	for (auto it = s.begin() + spacesFront; it != s.end() - spacesBack; it++)
	{
		if (it < s.end() - spacesBack - 1)
		{
			if (*it == ' ' && *(it + 1) == ' ')
			{
				continue;
			}
		}

		ss << *it;
	}

	auto s = ss.str();
	return s;
}

auto split(const string& s, char delim) -> vector<string>
{
	vector<string> elems;
	stringstream ss(s);
	string item;
	while (getline(ss, item, delim))
	{
		elems.push_back(item);
	}
	return elems;
}

auto splitNewlines(const string& s) -> size_t
{
	char* ptr = (char*)s.c_str();
	char* start = ptr;

	size_t newLinesCount = 0;

	for (auto i = 0u; i < s.size(); i++)
	{
		if (ptr[i] == '\n')
		{
			ptr[i] = '\0';
			auto length = (ptr + i) - start;
			lines.emplace_back(start, length);
			start = ptr + i + 1;
		}
	}
	return lines.size();
}

auto readFile(const string& fileName) -> vector<string>&
{
	cout << "Reading file.." << endl;

	ifstream f(fileName);
	if (!f.is_open())
	{
		throw runtime_error("error opening file");
	}

	string s;

	f.seekg(0, ios::end);
	auto length = f.tellg();
	s.reserve(length);
	f.seekg(0, ios::beg);

	s.assign(istreambuf_iterator<char>(f), istreambuf_iterator<char>());

	auto linesCount = splitNewlines(s);

	cout << "Done! " << linesCount << " lines read" << endl;
	return lines;
}

auto addUniqueVertex(const string& hash, unordered_map<string, size_t>& indices,
	vector<Vertex>& vertices,
	const PositionsNormalsUVs& input) -> size_t
{
	auto components = split(hash, '/');

	size_t positionIndex = stoi(components[0]) - 1;
	size_t normalsIndex = stoi(components[2]) - 1;
	size_t uvsIndex = stoi(components[1]) - 1;

	const auto& positions = get<0>(input);
	const auto& normals = get<1>(input);
	const auto& uvs = get<2>(input);

	Vertex vertex;
	vertex.position.x = positions[positionIndex * 3 + 0];
	vertex.position.y = positions[positionIndex * 3 + 1];
	vertex.position.z = positions[positionIndex * 3 + 2];

	vertex.normal.x = normals[normalsIndex * 3 + 0];
	vertex.normal.y = normals[normalsIndex * 3 + 1];
	vertex.normal.z = normals[normalsIndex * 3 + 2];

	vertex.uv.x = uvs[uvsIndex * 2 + 0];
	vertex.uv.y = uvs[uvsIndex * 2 + 1];

	vertices.push_back(vertex);
	indices[hash] = vertices.size() - 1;
	return indices[hash];
}

auto extractFaces(const PositionsNormalsUVs& input, vector<Vertex>& vertices) -> MaterialMap
{
	cout << "Extracing faces.." << endl;

	unordered_map<string, vector<size_t>> materials;
	unordered_map<string, size_t> indices;

	string currentMaterial = "default";

	for (auto line : lines)
	{
		auto stripped = strip(line);

		auto components = split(stripped, ' ');

		if (stripped.size() < 6)
		{
			continue;
		}

		if (components[0] == "usemtl")
		{
			currentMaterial = strip(components[1]);
		}
		else if (components[0] == "f")
		{
			size_t numVertices = components.size() - 1;

			for (auto q = 0u; q < numVertices - 2; q++)
			{
				size_t indexA, indexB, indexC;

				auto a = components[1];
				if (indices.find(a) != indices.end())
				{
					indexA = indices[a];
				}
				else
				{
					indexA = addUniqueVertex(a, indices, vertices, input);
				}

				auto b = components[2 + q];
				if (indices.find(b) != indices.end())
				{
					indexB = indices[b];
				}
				else
				{
					indexB = addUniqueVertex(b, indices, vertices, input);
				}

				auto c = components[3 + q];
				if (indices.find(c) != indices.end())
				{
					indexC = indices[c];
				}
				else
				{
					indexC = addUniqueVertex(c, indices, vertices, input);
				}

				materials[currentMaterial].push_back(indexA);
				materials[currentMaterial].push_back(indexB);
				materials[currentMaterial].push_back(indexC);
			}
		}
	}

	MaterialMap result;
	size_t numberOfFaces = 0;

	for (auto& kv : materials)
	{
		numberOfFaces += kv.second.size();
		result.push_back(make_pair(kv.first, move(kv.second)));
	}

	cout << "Done! Extracted " << result.size() << " materials with " << numberOfFaces / 3 << " faces" << endl;
	return result;
}

auto extractVertices(size_t startLine, size_t endLine) -> PositionsNormalsUVs
{
	vector<float> positions;
	vector<float> normals;
	vector<float> uvs;

	for (auto l = startLine; l < endLine; l++)
	{
		auto line = lines[l];
		auto stripped = strip(line);

		if (line.size() < 6)
		{
			continue;
		}

		auto components = split(stripped, ' ');

		if (stripped[0] == '#')
		{
			continue;
		}

		if (components[0] == "v")
		{
			positions.push_back(stof(components[1]));
			positions.push_back(stof(components[2]));
			positions.push_back(stof(components[3]));
		}

		if (components[0] == "vn")
		{
			normals.push_back(stof(components[1]));
			normals.push_back(stof(components[2]));
			normals.push_back(stof(components[3]));
		}

		if (components[0] == "vt")
		{
			uvs.push_back(stof(components[1]));
			uvs.push_back(stof(components[2]));
		}
	}

	return PositionsNormalsUVs(positions, normals, uvs);
}

auto extractVerticesConcurrent() -> PositionsNormalsUVs
{
	size_t cpuCores = thread::hardware_concurrency();
	cout << "Extracting vertices (" << cpuCores << " threads)" << endl;

	vector<thread> threads;
	size_t lineCount = lines.size();
	size_t linesPerThread = lineCount / cpuCores;

	vector<PositionsNormalsUVs> results;

	size_t currentLine = 0;
	for (auto i = 0u; i < cpuCores; i++)
	{
		results.emplace_back();
		auto startLine = currentLine;
		auto endLine = currentLine + linesPerThread;
		threads.emplace_back([startLine, endLine, i, &results]()
		{
			results[i] = extractVertices(startLine, endLine);
		});

		currentLine += linesPerThread;
	}

	PositionsNormalsUVs combinedResults;
	for (auto i = 0u; i < cpuCores; i++)
	{
		threads[i].join();

		const auto& resultPositions = get<0>(results[i]);
		const auto& resultNormals = get<1>(results[i]);
		const auto& resultUVs = get<2>(results[i]);

		for (auto q = 0u; q < resultPositions.size(); q++)
		{
			get<0>(combinedResults).push_back(resultPositions[q]);
		}

		for (auto q = 0u; q < resultNormals.size(); q++)
		{
			get<1>(combinedResults).push_back(resultNormals[q]);
		}

		for (auto q = 0u; q < resultUVs.size(); q++)
		{
			get<2>(combinedResults).push_back(resultUVs[q]);
		}
	}

	cout << "Done! Extracted " <<
		get<0>(combinedResults).size() <<
		" positions, " << get<1>(combinedResults).size() <<
		" normal and " << get<2>(combinedResults).size() << " uvs" << endl;

	return combinedResults;
}

auto splitMesh(size_t maxVerticesPerBucket, const vector<Vertex>& verticesForSubMesh,
	const vector<size_t>& subMeshIndices,
	const string& materialName) -> vector<SubMesh>
{
	auto bucketCount = (size_t)(ceil(verticesForSubMesh.size() / (float)maxVerticesPerBucket));

	vector<SubMesh> submeshes; // result of split. holds all ( disjoint and normal submeshes
	unordered_map<size_t, bool> disjointTrianglesMap;
	vector<size_t> disjointTriangles;

	for (auto i = 0; i < bucketCount; i++)
	{
		size_t verticesToCopy = maxVerticesPerBucket;
		if (i == bucketCount - 1)
		{
			verticesToCopy = verticesForSubMesh.size() - (bucketCount - 1) * maxVerticesPerBucket;
		}

		auto windowStart = i * maxVerticesPerBucket; // begin of copy idx
		auto windowEnd = windowStart + verticesToCopy; // end of copy idx

		vector<Vertex> finalVertices;
		for (auto q = windowStart; q < windowEnd; q++)
		{
			finalVertices.push_back(verticesForSubMesh[q]);
		}

		auto indexOffset = -i * maxVerticesPerBucket; //bucket offset. traslates from big (global) to local (small) idx

		vector<size_t> finalIndices; //bucked indices;
		for (auto j = 0u; j < subMeshIndices.size() / 3; j++)
		{
			//triangle idx
			auto index0 = subMeshIndices[j * 3 + 0];
			auto index1 = subMeshIndices[j * 3 + 1];
			auto index2 = subMeshIndices[j * 3 + 2];

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
		mesh.material = materialName;

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
		auto vertex = verticesForSubMesh[uniqueIndice];
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
	disjointMesh.material = materialName;
	disjointMesh.vertices = disjointVertices;
	disjointMesh.disjoint = true;

	if (disjointMesh.vertices.size() > maxVerticesPerBucket)
	{
		cout << disjointMesh.vertices.size() << endl;
		auto disjointSubmeshes = splitMesh(maxVerticesPerBucket, disjointMesh.vertices, disjointMesh.indices, materialName);
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

auto splitToSubMeshes(const MaterialMap& materials, const vector<Vertex>& vertices, size_t materialStart, size_t materialEnd) -> vector<SubMesh>
{
	vector<SubMesh> submeshes;

	for (auto i = materialStart; i < materialEnd; i++)
	{
		auto& material = materials[i];
		vector<Vertex> verticesForSubMesh;

		set<size_t> uniqueIndices(material.second.begin(), material.second.end());

		unordered_map<size_t, size_t> globalToSubmeshIndicesMap;

		for (auto& uniqueIdx : uniqueIndices)
		{
			const auto& vertex = vertices[uniqueIdx];
			verticesForSubMesh.push_back(vertex);
			auto newIndex = verticesForSubMesh.size() - 1;
			globalToSubmeshIndicesMap[uniqueIdx] = newIndex;
		}

		vector<size_t> subMeshIndices;
		for (auto& index : material.second)
		{
			subMeshIndices.push_back(globalToSubmeshIndicesMap[index]);
		}

		vector<Vertex> expandedVertices;
		for (auto i = 0u; i < subMeshIndices.size(); i++)
		{
			expandedVertices.push_back(verticesForSubMesh[subMeshIndices[i]]);
		}

		auto deduplicated = DeduplicateVertices(expandedVertices);

		auto materialSubMeshes = splitMesh(MAX_VERTICES_PER_SUBMESH, deduplicated.first, deduplicated.second, material.first);

		for (auto& matSubmesh : materialSubMeshes)
		{
			submeshes.push_back(matSubmesh);
		}
	}

	return submeshes;
}

auto splitToSubMeshesConcurrent(const MaterialMap& materials, const vector<Vertex>& vertices) -> vector<SubMesh>
{
	size_t cpuCores = thread::hardware_concurrency();

	cout << "Splitting submeshes recursively (" << cpuCores << " threads)" << endl;

	vector<thread> threads;
	size_t materialCount = materials.size();
	size_t materialsPerThread = (size_t)std::floor(materialCount / cpuCores);
	size_t leftOver = materialCount % cpuCores;

	vector<vector<SubMesh>> results;

	size_t currentMaterial = 0;
	for (auto i = 0u; i < cpuCores; i++)
	{
		results.emplace_back();
		auto startIndex = currentMaterial;
		auto endIndex = currentMaterial + materialsPerThread + (i == (cpuCores - 1) ? leftOver : 0);

		threads.emplace_back([&materials, &vertices, startIndex, endIndex, i, &results]()
		{
			results[i] = splitToSubMeshes(materials, vertices, startIndex, endIndex);
		});

		currentMaterial += materialsPerThread;
	}

	vector<SubMesh> combinedResults;

	size_t numFaces = 0;

	for (auto i = 0u; i < cpuCores; i++)
	{
		threads[i].join();

		for (auto& mesh : results[i])
		{
			numFaces += mesh.indices.size() / 3;
			combinedResults.push_back(mesh);
		}
	}

	cout << "Done! Total of " << combinedResults.size() << " submeshes with " << numFaces << " faces in resulting mesh" << endl;
	return combinedResults;
}