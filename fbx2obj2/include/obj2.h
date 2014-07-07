#ifndef __OBJ2_H
#define __OBJ2_H

#define OBJ2_VERSION 1000
#define OBJ2_MAGIC 0xCADCFFFF

enum class OBJ2BinaryFlags
{
	ANIMATED = 1 << 0,
	CONTAINS_NAVMESH = 1 << 1,
};

struct OBJ2Material
{
	string name = "";

	void SerializeSelf(BinaryArchive& ar) const
	{
		Serialize(ar, name);
	}
};

struct OBJ2SubMesh
{
	uint32_t materialIndex = 0;
	vector<float_t> aabb;
	uint32_t vertexComponentsCount = 0;
	vector<float_t> vertices;
	vector<uint32_t> indices;

	void SerializeSelf(BinaryArchive& ar) const
	{
		Serialize(ar, materialIndex);
		Serialize(ar, aabb);
		Serialize(ar, vertexComponentsCount);
		Serialize(ar, vertices);
		Serialize(ar, indices);
	}
};

struct OBJ2Animation
{
	string name = "";
	uint32_t jointsCount = 0;
	uint32_t framesCount = 0;
	vector<float_t> frameData;

	void SerializeSelf(BinaryArchive& ar) const
	{
		Serialize(ar, name);
		Serialize(ar, jointsCount);
		Serialize(ar, framesCount);
		Serialize(ar, frameData);
	}
};

struct OBJ2NavMesh
{
	vector<float_t> vertices;
	vector<uint32_t> indices;

	void SerializeSelf(BinaryArchive& ar) const
	{
		Serialize(ar, vertices);
		Serialize(ar, indices);
	}
};

struct OBJ2Binary
{
	uint32_t magic = OBJ2_MAGIC;
	uint32_t version = OBJ2_VERSION;
	uint32_t flags = 0;

	vector<OBJ2Material> materials;
	vector<OBJ2SubMesh> submeshes;

	uint32_t jointsCount = 0;
	vector<OBJ2Animation> animations;

	OBJ2NavMesh* navMesh = nullptr;

	void SerializeSelf(BinaryArchive& ar) const
	{
		Serialize(ar, magic);
		Serialize(ar, version);
		Serialize(ar, flags);
		
		SerializeObjectVector(ar, materials);
		SerializeObjectVector(ar, submeshes);
		SerializeObjectVector(ar, animations);

		if (navMesh)
		{
			SerializeObject(ar, *navMesh);
		}
	}
};

class OBJ2BinaryWriter
{

	public:
	void SetMaterials(const vector<string>& materialNames);
	void SetSubMeshes(const vector<SubMesh>& subMeshes);
	void SetSkeleton(const Skeleton& skeleton);
	void SetNavMesh(const NavMesh& navMesh);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         

	void WriteToFile(const string& filename);

	private:
	unique_ptr<OBJ2Binary> m_Binary = make_unique<OBJ2Binary>();
	unordered_map<string, size_t> m_MaterialToIndex;

};

#endif
