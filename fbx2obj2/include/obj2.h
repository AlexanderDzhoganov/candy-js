#ifndef __OBJ2_H
#define __OBJ2_H

#define OBJ2_VERSION 1000
#define OBJ2_MAGIC 0xCADCFFFF

struct OBJ2Material
{
	uint32_t nameLength = 0;
	int8_t name[256];
};

struct OBJ2SubMesh
{
	// material
	uint32_t materialIndex = 0;

	// aabb
	float_t aabb[6];

	// vertices
	uint32_t vertexCount = 0;
	uint32_t vertexComponentsCount = 0;
	float_t* vertices = nullptr;

	// indices
	uint32_t indicesCount = 0;
	uint32_t* indices = nullptr;
};

struct OBJ2Animation
{
	uint32_t animationNameLength = 0;
	int8_t animationName[256];

	uint32_t jointsCount = 0;

	uint32_t framesCount = 0;
	float_t* frameData = nullptr;
};

struct OBJ2NavMesh
{
	// vertices
	uint32_t vertexCount = 0;
	float_t* vertices = nullptr;

	// indices
	uint32_t indexCount = 0;
	uint32_t* indices = nullptr;
};

enum class OBJ2BinaryFlags
{
	ANIMATED = 1 << 0,
	CONTAINS_NAVMESH = 1 << 1,
};

struct OBJ2Binary
{
	uint32_t magic = OBJ2_MAGIC;
	uint32_t version = OBJ2_VERSION;

	uint32_t flags = 0;

	// materials
	uint32_t materialsCount = 0;
	OBJ2Material* materials = nullptr;

	// submeshes
	uint32_t submeshesCount = 0;
	OBJ2SubMesh* submeshes = nullptr;

	// animations
	uint32_t jointsCount = 0;
	uint32_t animationsCount = 0;
	OBJ2Animation* animations = nullptr;

	// navmesh
	OBJ2NavMesh* navMesh = nullptr;
};

size_t CalculateSize(OBJ2Material* material);
size_t CalculateSize(OBJ2SubMesh* submesh);
size_t CalculateSize(OBJ2Animation* animation);
size_t CalculateSize(OBJ2NavMesh* navmesh);
size_t CalculateSize(OBJ2Binary* obj2);

void Flatten(OBJ2Material* material, uint8_t* result);
void Flatten(OBJ2SubMesh* submesh, uint8_t* result);
void Flatten(OBJ2Animation* animation, uint8_t* result);
void Flatten(OBJ2NavMesh* navmesh, uint8_t* result);
void Flatten(OBJ2Binary* obj2, uint8_t* result);

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

void WriteMatrix(stringstream& ss, const FbxAMatrix& matrix);

void WriteQuaternionTranslation(stringstream& ss, const FbxAMatrix& matrix);

void WriteDualQuaternion(stringstream& ss, const FbxAMatrix& matrix);

void writeOutToFile(const vector<SubMesh>& submeshes, const string& fileName, const Skeleton* skeleton = nullptr, const NavMesh* navmesh = nullptr);

#endif
