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

using std::thread;
using std::set;
using std::vector;
using std::unordered_map;
using std::ifstream;
using std::fstream;
using std::string;
using std::stringstream;

using std::cout;
using std::cin;
using std::endl;
using std::stof;

const static auto MAX_VERTICES_PER_SUBMESH = 65535;

struct Vertex
{
	float x, y, z, nx, ny, nz, u, v; // engine format (PPPNNNTTT
};


struct SubMesh 
{
	vector<Vertex> vertices;
	vector<int> indices;
	string material;
	bool disjoint = false;

	SubMesh() { vertices.reserve(65536); }
};

string strip(const string& s)
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
		ss << *it;
	}

	auto s = ss.str();
	return s;
}

/*vector<string> split(const string& s, char delimiter)
{
	vector<stringstream> ss;
	ss.emplace_back();

	for (auto& c : s)
	{
		if (c == delimiter)
		{
			ss.emplace_back();
			continue;
		}

		ss[ss.size() - 1] << c;
	}

	vector<string> result;

	for (auto& sss : ss)
	{
		result.push_back(sss.str());
	}

	return result;
}*/

vector<string>& split2(const std::string& s, char delim, std::vector<std::string>& elems) {
	stringstream ss(s);
	std::string item;
	while (std::getline(ss, item, delim))
	{
		elems.push_back(item);
	}
	return elems;
}


std::vector<std::string> split2(const std::string& s, char delim) {
	std::vector<std::string> elems;
	split2(s, delim, elems);
	return elems;
}


vector<string> split(const std::string& s, char delim)
{
	if (s.size() == 0)
	{
		return vector<string>();
	}

	vector<string> lines;

	vector<size_t> lenghts;
	size_t currentLength = 0;

	for (auto i = 0u; i < s.size(); i++)
	{
		currentLength++;

		if (s[i] == delim)
		{
			lenghts.push_back(currentLength);
			currentLength = 0;
		}
	}

	if (s[s.size() - 1] != delim)
	{
		lenghts.push_back(currentLength);
	}

	size_t current = 0;
	lines.resize(lenghts.size());
	for (auto i = 0u; i < lenghts.size(); i++)
	{
		auto length = lenghts[i];
		lines[i].resize(length - 1);
		memcpy((void*)(lines[i].c_str()), (void*)(s.c_str() + current), length -  1);
		current += length;
	}

	return lines;
}


vector<string> readFile(const string& fileName)
{
	ifstream f(fileName);
	if (!f.is_open())
	{
		throw std::runtime_error("error opening file");
	}

	string s;

	f.seekg(0, std::ios::end);
	auto length = f.tellg();
	s.reserve(length);
	f.seekg(0, std::ios::beg);

	s.assign(std::istreambuf_iterator<char>(f), std::istreambuf_iterator<char>());
	
	cout << "finished reading file" << endl;

	return split(s, '\n');
}

typedef std::tuple<vector<float>, vector<float>, vector<float>> PositionsNormalsUVs;
typedef vector<std::pair<string, vector<int>>> MaterialMap;

auto extractFaces(const vector<string>& lines, const PositionsNormalsUVs& input, vector<Vertex>& vertices) -> MaterialMap
{
	std::unordered_map<string, vector<int>> materials;
	unordered_map<string, int> indices;

	std::string currentMaterial = "default";

	auto addUniqueVertex = [&](const string& hash)
	{
		auto components = split2(hash, '/');

		size_t positionIndex = std::stoi(components[0]) - 1;
		size_t normalsIndex = std::stoi(components[2]) - 1;
		size_t uvsIndex = std::stoi(components[1]) - 1;

		const auto& positions = std::get<0>(input);
		const auto& normals = std::get<1>(input);
		const auto& uvs = std::get<2>(input);

		Vertex vertex;
		vertex.x = positions[positionIndex * 3 + 0];
		vertex.y = positions[positionIndex * 3 + 1];
		vertex.z = positions[positionIndex * 3 + 2];

		vertex.nx = normals[normalsIndex * 3 + 0];
		vertex.ny = normals[normalsIndex * 3 + 1];
		vertex.nz = normals[normalsIndex * 3 + 2];

		vertex.u = uvs[uvsIndex * 2 + 0];
		vertex.v = uvs[uvsIndex * 2 + 1];

		vertices.push_back(vertex);
		indices[hash] = vertices.size() - 1;
		return indices[hash];
	};

	for (auto line : lines)
	{
		auto stripped = strip(line);

		auto components = split2(stripped, ' ');

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
				int indexA, indexB, indexC;

				auto a = components[1];
				if (indices.find(a) != indices.end())
				{
					indexA = indices[a];
				}
				else
				{
					indexA = addUniqueVertex(a);
				}

				auto b = components[2 + q];
				if (indices.find(b) != indices.end())
				{
					indexB = indices[b];
				}
				else
				{
					indexB = addUniqueVertex(b);
				}

				auto c = components[3 + q];
				if (indices.find(c) != indices.end())
				{
					indexC = indices[c];
				}
				else
				{
					indexC = addUniqueVertex(c);
				}

				materials[currentMaterial].push_back(indexA);
				materials[currentMaterial].push_back(indexB);
				materials[currentMaterial].push_back(indexC);
			}
		}
	}

	MaterialMap result;

	for (auto& kv : materials)
	{
		result.push_back(std::make_pair(kv.first, std::move(kv.second)));
	}

	return result;
}

auto extractVertices(const vector<string>& lines, size_t startLine, size_t endLine) -> PositionsNormalsUVs
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

auto extractVerticesConcurrent(const vector<string>& lines) -> PositionsNormalsUVs
{
	auto cpuCores = thread::hardware_concurrency();
	vector<thread> threads;
	auto lineCount = lines.size();
	auto linesPerThread = lineCount / cpuCores;

	std::vector<PositionsNormalsUVs> results;

	auto currentLine = 0;
	for (auto i = 0u; i < cpuCores; i++)
	{
		results.emplace_back();
		auto startLine = currentLine;
		auto endLine = currentLine + linesPerThread;
		threads.emplace_back([&lines, startLine, endLine, i, &results]()
		{
			results[i] = extractVertices(lines, startLine, endLine);
		});

		currentLine += linesPerThread;
	}

	PositionsNormalsUVs combinedResults;

	for (auto i = 0u; i < cpuCores; i++)
	{
		threads[i].join();

		const auto& resultPositions = std::get<0>(results[i]);
		const auto& resultNormals = std::get<1>(results[i]);
		const auto& resultUVs = std::get<2>(results[i]);

		for (auto q = 0u; q < resultPositions.size(); q++)
		{
			std::get<0>(combinedResults).push_back(resultPositions[q]);
		}

		for (auto q = 0u; q < resultNormals.size(); q++)
		{
			std::get<1>(combinedResults).push_back(resultNormals[q]);
		}

		for (auto q = 0u; q < resultUVs.size(); q++)
		{
			std::get<2>(combinedResults).push_back(resultUVs[q]);
		}
	}

	return combinedResults;
}

auto splitMesh(int maxVerticesPerBucket, const vector<Vertex>& verticesForSubMesh,
			   const vector<int>& subMeshIndices,
			   const string& materialName) -> vector<SubMesh>
{
	auto bucketCount = ceil(verticesForSubMesh.size() / (float) maxVerticesPerBucket);

	cout << '/';

	vector<SubMesh> submeshes; // result of split. holds all ( disjoint and normal submeshes

	unordered_map<int, int> disjointTrianglesMap; // 
	vector<int> disjointTriangles;

	for (auto i = 0; i < bucketCount; i++)
	{
		auto verticesToCopy = maxVerticesPerBucket;
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

		vector<int> finalIndices; //bucked indices;
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

	set<int> uniqueDisjointIndices(disjointTriangles.begin(), disjointTriangles.end());

	unordered_map<int, int> disjointVerticesMap;
	vector<Vertex> disjointVertices;

	for (auto& uniqueIndice : uniqueDisjointIndices)
	{
		auto vertex = verticesForSubMesh[uniqueIndice];
		disjointVertices.push_back(vertex);
		disjointVerticesMap[uniqueIndice] = disjointVertices.size() - 1;
	}

	vector<int> disjointIndices;

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

		set<int> uniqueIndices(material.second.begin(), material.second.end());

		unordered_map<int, int> globalToSubmeshIndicesMap;

		for (auto& uniqueIdx : uniqueIndices)
		{
			const auto& vertex = vertices[uniqueIdx];
			verticesForSubMesh.push_back(vertex);
			auto newIndex = verticesForSubMesh.size() - 1;
			globalToSubmeshIndicesMap[uniqueIdx] = newIndex;
		}

		vector<int> subMeshIndices;
		for (auto& index : material.second)
		{
			subMeshIndices.push_back(globalToSubmeshIndicesMap[index]);
		}

		auto materialSubMeshes = splitMesh(MAX_VERTICES_PER_SUBMESH, verticesForSubMesh, subMeshIndices, material.first);

		for (auto& matSubmesh : materialSubMeshes)
		{
			submeshes.push_back(matSubmesh);
		}
	}

	return submeshes;
}

auto splitToSubMeshesConcurrent(const MaterialMap& materials, const vector<Vertex>& vertices) -> vector<SubMesh>
{
	auto cpuCores = thread::hardware_concurrency();
	vector<thread> threads;
	auto materialCount = materials.size();
	auto materialsPerThread = floor(materialCount / cpuCores);
	auto leftOver = materialCount % cpuCores;

	vector<vector<SubMesh>> results;

	auto currentMaterial = 0;
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

	for (auto i = 0u; i < cpuCores; i++)
	{
		threads[i].join();

		for (auto& mesh : results[i])
		{
			combinedResults.push_back(mesh);
		}
	}

	return combinedResults;
}

auto writeOutToFile(const vector<SubMesh>& submeshes, const string& fileName) -> void
{
	fstream f(fileName, std::ios::out);

	stringstream ss;

	cout << "writing out " << submeshes.size() << " submeshes" << endl;

	auto numFaces = 0;
	for (auto& submesh : submeshes)
	{
		numFaces += submesh.indices.size() / 3;
	}
	cout << "generated a total of " << numFaces << " faces" << endl;

	auto count = 0u;
	for (auto& subMesh : submeshes)
	{
		ss << "m " << subMesh.material << endl;

		if (subMesh.disjoint)
		{
			ss << "# disjoint" << endl;
		}

		cout << "submesh " << count << " (" << subMesh.material << ")" << (subMesh.disjoint ? "DISJOINT" : "") << endl;
		cout << subMesh.vertices.size() << " vertices" << endl;
		cout << subMesh.indices.size() / 3 << " faces" << endl;

		for (auto& vertex : subMesh.vertices)
		{
			ss << "vnt " << vertex.x << " " << vertex.y << " " << vertex.z << " "
				<< vertex.nx << " " << vertex.ny << " " << vertex.nz << " "
				<< vertex.u << " " << vertex.v << endl;
		}

		ss << "i ";

		for (auto& i : subMesh.indices)
		{
			ss << i << " ";
		}
		ss << endl;
		ss << endl;

		count++;
	}

	string result = ss.str();

	f.write(result.c_str(), result.size());
}

int main(int argc, char** argv)
{
	if (argc == 1)
	{
		cout << " not enough args" << endl;
		return -1;
	}

	cout << "reading " << argv[1] << endl;

	auto lines = readFile(argv[1]);

	cout << lines.size() << " lines" << endl;

	auto vertices = extractVerticesConcurrent(lines);

	cout << "extracted " << std::get<0>(vertices).size() << " positions, " << std::get<1>(vertices).size() << " normals, " << std::get<2>(vertices).size() << " uvs" << endl;

	vector<Vertex> outVertices;
	auto materials = extractFaces(lines, vertices, outVertices);

	cout << "found " << materials.size() << " materials" << endl;

	auto originalFacesCount = 0;
	for (auto& kv : materials)
	{
		cout << " " << kv.first << " : " << kv.second.size() / 3 << " faces" << endl;
		originalFacesCount += kv.second.size() / 3;
	}

	auto submeshes = splitToSubMeshesConcurrent(materials, outVertices);

	cout << submeshes.size() << " submeshes generated" << endl;

	string fileName = string(argv[1]) + "2";

	cout << "original mesh contains " << originalFacesCount << " faces" << endl;

	writeOutToFile(submeshes, fileName);

	cout << "written to " + fileName;
	while (true);
	return 0;
}