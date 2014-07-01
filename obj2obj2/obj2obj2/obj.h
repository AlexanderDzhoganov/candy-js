#ifndef __OBJ_H
#define __OBJ_H

const auto MAX_VERTICES_PER_SUBMESH = 65535; // max of Uint16.
const auto MAX_TRIANGLES_PER_LEAF = 3000;

extern vector<string> lines;

typedef tuple<vector<float>, vector<float>, vector<float>> PositionsNormalsUVs;
typedef vector<pair<string, vector<size_t>>> MaterialMap;

string strip(const string& s);

vector<string> split(const string& s, char delim);

size_t splitNewlines(const string& s);

vector<string>& readFile(const string& fileName);

size_t addUniqueVertex(const string& hash, unordered_map<string, size_t>& indices, vector<Vertex>& vertices, const PositionsNormalsUVs& input);

MaterialMap extractFaces(const PositionsNormalsUVs& input, vector<Vertex>& vertices);

PositionsNormalsUVs extractVertices(size_t startLine, size_t endLine);

PositionsNormalsUVs extractVerticesConcurrent();

vector<SubMesh> splitMesh
(
	size_t maxVerticesPerBucket,
	const vector<Vertex>& verticesForSubMesh,
	const vector<size_t>& subMeshIndices,
	const string& materialName
);

vector<SubMesh> splitToSubMeshes(const MaterialMap& materials, const vector<Vertex>& vertices, size_t materialStart, size_t materialEnd);

vector<SubMesh> splitToSubMeshesConcurrent(const MaterialMap& materials, const vector<Vertex>& vertices);

#endif
