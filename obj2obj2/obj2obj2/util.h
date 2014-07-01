#ifndef __UTIL_H
#define __UTIL_H

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

	bool disjoint = false;

	SubMesh() { vertices.reserve(65536); }
};

static int GetVertexHash(const Vertex& vertex)
{
	return GetHashCodeForBytes((const char*)(&vertex), 32);
}

static pair<vector<Vertex>, vector<size_t>> DeduplicateVertices(const vector<Vertex>& vertices)
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

	cout << "Done! Removed " << duplicatesCount << " duplicate vertices." << endl;

	cout << "Writing out indices..";
	vector<size_t> indices;
	indices.reserve(vertices.size());

	for (auto i = 0u; i < vertices.size(); i++)
	{
		const auto& hash = vertexHashes[i];
		indices.push_back(dedupeIndexMap[hash]);
	}

	cout << "Done! Written out " << indices.size() << " indices." << endl;
	return make_pair(dedupedVertices, indices);
}

#endif
