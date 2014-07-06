#include <fbxsdk.h>
#include <fbxsdk\fileio\fbxiosettings.h>

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
#include <mutex>
#include <condition_variable>
#include <future>

#include "..\dep\glm\glm.hpp"
#include "..\dep\glm\gtx\quaternion.hpp"
#include "..\dep\Recast\Recast.h"

using namespace std;

#include "..\include\logging.h"
#include "..\include\config.h"

#include "..\include\fbxutil.h"
#include "..\include\fbxelement.h"
#include "..\include\fbxanim.h"
#include "..\include\fbxmesh.h"
#include "..\include\fbxinfo.h"
#include "..\include\fbxscene.h"

#include "..\include\navmesh.h"

#include "..\include\obj2.h"

size_t CalculateSize(OBJ2Material* material)
{
	return sizeof(uint32_t) + 256 * sizeof(int8_t);
}

size_t CalculateSize(OBJ2SubMesh* submesh)
{
	size_t size = 0;
	// submesh->aabb
	size += sizeof(float_t) * 6;

	// submesh->indices
	size += sizeof(uint32_t) * submesh->indicesCount;

	// submesh->indicesCount
	size += sizeof(uint32_t);

	// submesh->materialIndex
	size += sizeof(uint32_t);

	// submesh->vertexComponentsCount
	size += sizeof(uint32_t);

	// submesh->vertexCount
	size += sizeof(uint32_t);

	// submesh->vertices
	size += submesh->vertexCount * submesh->vertexComponentsCount * sizeof(float_t);

	return size;
}

size_t CalculateSize(OBJ2Animation* animation)
{
	size_t size = 0;

	// animation->animationName
	size += sizeof(int8_t) * 256;

	// animation->animationNameLength
	size += sizeof(uint32_t);

	// animation->jointsCount
	size += sizeof(uint32_t);

	// animation->framesCount
	size += sizeof(uint32_t);

	// animation->frameData
	size += sizeof(float_t) * 8 * animation->framesCount * animation->jointsCount;

	return size;
}

size_t CalculateSize(OBJ2NavMesh* navmesh)
{
	size_t size = 0;

	// navmesh->indexCount
	size += sizeof(uint32_t);

	// navmesh->indices
	size += sizeof(uint32_t) * navmesh->indexCount;

	// navmesh->vertexCount
	size += sizeof(uint32_t);

	// navmesh->vertices
	size = sizeof(float_t) * 3 * navmesh->vertexCount;

	return size;
}

size_t CalculateSize(OBJ2Binary* obj2)
{
	size_t size = 0;

	// magic
	size += sizeof(uint32_t);

	// version
	size += sizeof(uint32_t);

	// flags
	size += sizeof(uint32_t);

	// materialsCount
	size += sizeof(uint32_t);

	// materials
	for (auto i = 0u; i < obj2->materialsCount; i++)
	{
		size += CalculateSize(&(obj2->materials[i]));
	}

	// submeshesCount
	size += sizeof(uint32_t);

	// submeshes
	for (auto i = 0u; i < obj2->submeshesCount; i++)
	{
		size += CalculateSize(&(obj2->submeshes[i]));
	}

	// jointsCount
	size += sizeof(uint32_t);

	// animationsCount
	size += sizeof(uint32_t);

	// animations
	for (auto i = 0u; i < obj2->animationsCount; i++)
	{
		size += CalculateSize(&(obj2->animations[i]));
	}

	// navMesh
	if (obj2->navMesh)
	{
		size += CalculateSize(obj2->navMesh);
	}

	return size;
}

void OBJ2BinaryWriter::SetMaterials(const vector<string>& materialNames)
{
	if (m_Binary->materials != nullptr)
	{
		delete[] m_Binary->materials;
	}

	m_Binary->materialsCount = materialNames.size();
	m_Binary->materials = new OBJ2Material[materialNames.size()];

	for (auto i = 0u; i < m_Binary->materialsCount; i++)
	{
		m_Binary->materials[i].nameLength = materialNames[i].size();
//		m_Binary->materials[i].name = new int8_t[m_Binary->materials[i].nameLength];
		memcpy(m_Binary->materials[i].name, materialNames[i].c_str(), m_Binary->materials[i].nameLength);
		m_MaterialToIndex[materialNames[i]] = i;
	}
}

void OBJ2BinaryWriter::SetSubMeshes(const vector<SubMesh>& subMeshes)
{
	if (m_Binary->submeshes != nullptr)
	{
		delete[] m_Binary->submeshes;
	}

	m_Binary->submeshesCount = subMeshes.size();
	m_Binary->submeshes = new OBJ2SubMesh[m_Binary->submeshesCount];

	for (auto i = 0u; i < m_Binary->submeshesCount; i++)
	{
		auto& aabb = subMeshes[i].aabb;
		float aabbFlattened[6];
		memcpy(aabbFlattened, &(aabb.center[0]), sizeof(float_t)* 3);
		memcpy(aabbFlattened + 3, &(aabb.extents[0]), sizeof(float_t)* 3);

		m_Binary->submeshes[i].materialIndex = m_MaterialToIndex[subMeshes[i].material];
		auto componentsCount = subMeshes[i].hasAnimation ? 16 : 8;
		auto vertexCount = subMeshes[i].vertices.size();

		m_Binary->submeshes[i].vertexComponentsCount = componentsCount;

		m_Binary->submeshes[i].vertexCount = vertexCount;
		m_Binary->submeshes[i].vertices = new float_t[vertexCount * componentsCount];

		for (auto q = 0u; q < vertexCount; q++)
		{
			memcpy(&(m_Binary->submeshes[i].vertices[q * componentsCount]), &(subMeshes[i].vertices[q]), componentsCount * sizeof(float_t));
		}

		auto indicesCount = subMeshes[i].indices.size();
		m_Binary->submeshes[i].indicesCount = indicesCount;
		m_Binary->submeshes[i].indices = new uint32_t[indicesCount];
		memcpy(m_Binary->submeshes[i].indices, subMeshes[i].indices.data(), indicesCount * sizeof(uint32_t));
	}
}

void OBJ2BinaryWriter::SetSkeleton(const Skeleton& skeleton)
{
	if (m_Binary->animations != nullptr)
	{
		delete[] m_Binary->animations;
	}

	m_Binary->flags |= (uint32_t)OBJ2BinaryFlags::ANIMATED;

	m_Binary->jointsCount = skeleton.joints.size();
	m_Binary->animationsCount = skeleton.animations.size();
	m_Binary->animations = new OBJ2Animation[skeleton.animations.size()];

	auto i = 0u;
	for (auto& anim : skeleton.animations)
	{
		m_Binary->animations[i].animationNameLength = anim.first.size();
//		m_Binary->animations[i].animationName = new int8_t[anim.first.size()];
		memcpy(m_Binary->animations[i].animationName, anim.first.c_str(), anim.first.size());
		
		m_Binary->animations[i].jointsCount = skeleton.joints.size();

		m_Binary->animations[i].framesCount = anim.second.size();
		
		auto dualQuaternionsCount = skeleton.joints.size() * anim.second.size();
		m_Binary->animations[i].frameData = new float_t[dualQuaternionsCount * 8];
		auto ptr = 0u;

		for (auto frame = 0u; frame < anim.second.size(); frame++)
		{
			if (anim.second[frame].size() == 0)
			{
				continue;
			}

			for (auto joint = 0u; joint < skeleton.joints.size(); joint++)
			{
				auto& matrix = anim.second[frame][joint];
				auto translation = matrix.GetT();
				auto rotation = matrix.GetQ();
				FbxDualQuaternion dQ(rotation, translation);

				for (auto c = 0; c < 4; c++)
				{
					m_Binary->animations[i].frameData[ptr++] = dQ.GetFirstQuaternion().GetAt(c);
				}

				for (auto c = 0; c < 4; c++)
				{
					m_Binary->animations[i].frameData[ptr++] = dQ.GetSecondQuaternion().GetAt(c);
				}
			}
		}
		
		i++;
	}
}

void OBJ2BinaryWriter::SetNavMesh(const NavMesh& navMesh)
{
	if (m_Binary->navMesh != nullptr)
	{
		delete m_Binary->navMesh;
	}

	m_Binary->flags |= (uint32_t)OBJ2BinaryFlags::CONTAINS_NAVMESH;

	auto& vertices = navMesh.GetVertices();
	auto& indices = navMesh.GetIndices();

	m_Binary->navMesh = new OBJ2NavMesh();

	m_Binary->navMesh->vertexCount = vertices.size();
	m_Binary->navMesh->vertices = new float_t[vertices.size() * 3];
	memcpy(m_Binary->navMesh->vertices, vertices.data(), sizeof(float_t)* vertices.size() * 3);

	m_Binary->navMesh->indexCount = indices.size();
	m_Binary->navMesh->indices = new uint32_t[indices.size()];
	memcpy(m_Binary->navMesh->indices, indices.data(), sizeof(float_t)* indices.size());
}

void Flatten(OBJ2Material* material, uint8_t* result)
{
	auto ptr = result;
	// nameLength
	memcpy(ptr, &material->nameLength, sizeof(uint32_t));
	ptr += sizeof(uint32_t);

	// name
	memcpy(ptr, material->name, sizeof(int8_t)* material->nameLength);
	ptr += sizeof(int8_t) * 256;
}

void Flatten(OBJ2SubMesh* submesh, uint8_t* result)
{
	auto ptr = result;

	// aabb 
	memcpy(ptr, submesh->aabb, sizeof(float_t)* 6);
	ptr += sizeof(float_t)* 6;

	// materialIndex
	memcpy(ptr, &submesh->materialIndex, sizeof(uint32_t));
	ptr += sizeof(uint32_t);

	// indexCount
	memcpy(ptr, &submesh->indicesCount, sizeof(uint32_t));
	ptr += sizeof(uint32_t);

	// indices
	memcpy(ptr, submesh->indices, sizeof(uint32_t) * submesh->indicesCount);
	ptr += sizeof(uint32_t)* submesh->indicesCount;

	// vertexCount
	memcpy(ptr, &submesh->vertexCount, sizeof(uint32_t));
	ptr += sizeof(uint32_t);

	// vertexComponentsCount
	memcpy(ptr, &submesh->vertexComponentsCount, sizeof(uint32_t));
	ptr += sizeof(uint32_t);

	// vertices
	memcpy(ptr, submesh->vertices, sizeof(float_t) * submesh->vertexComponentsCount * submesh->vertexCount);
	ptr += sizeof(float_t) * submesh->vertexComponentsCount * submesh->vertexCount;
}

void Flatten(OBJ2Animation* animation, uint8_t* result)
{
	auto ptr = result;

	// animationNameLength
	memcpy(ptr, &animation->animationNameLength, sizeof(uint32_t));
	ptr += sizeof(uint32_t);

	// animationName
	memcpy(ptr, animation->animationName, sizeof(int8_t) * animation->animationNameLength);
	ptr += sizeof(int8_t) * 256;

	// frameCount
	memcpy(ptr, &(animation->framesCount), sizeof(uint32_t));
	ptr += sizeof(uint32_t);

	// jointsCount
	memcpy(ptr, &(animation->jointsCount), sizeof(uint32_t));
	ptr += sizeof(uint32_t);
	
	// frameData
	memcpy(ptr, animation->frameData, sizeof(float_t) * 8 * animation->framesCount * animation->jointsCount);
	ptr += sizeof(float_t);
}

void Flatten(OBJ2NavMesh* navmesh, uint8_t* result)
{
	auto ptr = result;

	// indexCount
	memcpy(ptr, &(navmesh->indexCount), sizeof(uint32_t));
	ptr += sizeof(uint32_t);

	// indices
	memcpy(ptr, navmesh->indices, sizeof(uint32_t) * navmesh->indexCount);
	ptr += sizeof(uint32_t) * navmesh->indexCount;

	// vertexCount
	memcpy(ptr, &(navmesh->vertexCount), sizeof(uint32_t));
	ptr += sizeof(uint32_t);

	// vertices
	memcpy(ptr, navmesh->vertices, sizeof(float_t) * 3 * navmesh->vertexCount);
	ptr += sizeof(float_t)* 3 * navmesh->vertexCount;
}

void Flatten(OBJ2Binary* obj2, uint8_t* result)
{
	auto ptr = result;

	// magic
	memcpy(ptr, &(obj2->magic), sizeof(uint32_t));
	ptr += sizeof(uint32_t);

	// version
	memcpy(ptr, &(obj2->version), sizeof(uint32_t));
	ptr += sizeof(uint32_t);

	// flags
	memcpy(ptr, &(obj2->flags), sizeof(uint32_t));
	ptr += sizeof(uint32_t);

	// materialsCount
	memcpy(ptr, &(obj2->materialsCount), sizeof(uint32_t));
	ptr += sizeof(uint32_t);

	// materials
	for (auto i = 0u; i < obj2->materialsCount; i++)
	{
		auto material = &(obj2->materials[i]);
		Flatten(material, ptr);
		ptr += CalculateSize(material);
	}

	// submeshesCount
	memcpy(ptr, &(obj2->materialsCount), sizeof(uint32_t));
	ptr += sizeof(uint32_t);

	// submeshes
	for (auto i = 0u; i < obj2->submeshesCount; i++)
	{
		auto submesh = &(obj2->submeshes[i]);
		Flatten(submesh, ptr);
		ptr += CalculateSize(submesh);
	}

	// jointsCount
	memcpy(ptr, &(obj2->materialsCount), sizeof(uint32_t));
	ptr += sizeof(uint32_t);

	// animationsCount
	memcpy(ptr, &(obj2->materialsCount), sizeof(uint32_t));
	ptr += sizeof(uint32_t);

	// animations
	for (auto i = 0u; i < obj2->animationsCount; i++)
	{
		auto animation = &(obj2->animations[i]);
		Flatten(animation, ptr);
		ptr += CalculateSize(animation);
	}

	// navMesh
	if (obj2->navMesh != nullptr)
	{
		Flatten(obj2->navMesh, ptr);
		ptr += CalculateSize(obj2->navMesh);
	}
}

void OBJ2BinaryWriter::WriteToFile(const string& filename)
{
	ofstream f(filename);

	if (!f.is_open())
	{
		LOG("Failed to open \"%\" for writing", filename);
		return;
	}

	auto size = CalculateSize(m_Binary.get());
	auto result = new uint8_t[size];
	Flatten(m_Binary.get(), result);

	f.write((char*)result, size * sizeof(uint8_t));
	LOG("Written to \"%\"", filename);
}

void WriteMatrix(stringstream& ss, const FbxAMatrix& matrix)
{
	ss << "glm::mat4 ";

	for (auto x = 0u; x < 4; x++)
	for (auto y = 0u; y < 4; y++)
	{
		ss << matrix.Get(x, y) << " ";
	}

	ss << endl;
}

void WriteQuaternionTranslation(stringstream& ss, const FbxAMatrix& matrix)
{
	auto translation = matrix.GetT();
	auto rotation = matrix.GetQ();

	ss << "qt " << rotation[0] << " " << rotation[1] << " " << rotation[2] << " " << rotation[3] << " "
		<< translation[0] << " " << translation[1] << " " << translation[2] << endl;
}

void WriteDualQuaternion(stringstream& ss, const FbxAMatrix& matrix)
{
	auto translation = matrix.GetT();
	auto rotation = matrix.GetQ();

	FbxDualQuaternion dQ(rotation, translation);

	ss << "dq ";

	for (auto i = 0; i < 4; i++)
	{
		ss << dQ.GetFirstQuaternion().GetAt(i) << " ";
	}

	for (auto i = 0; i < 4; i++)
	{
		ss << dQ.GetSecondQuaternion().GetAt(i) << " ";
	}

	ss << endl;
}

void writeOutToFile(const vector<SubMesh>& submeshes, const string& fileName, const Skeleton* skeleton, const NavMesh* navmesh)
{
	fstream f(fileName, ios::out);

	stringstream ss;

	LOG("Writing out to \"%\"", fileName);

	ss << "flags: ";

	if (skeleton->joints.size() > 0)
	{
		ss << "animated ";

		if (CONFIG_KEY("export-glm::mat4", "true"))
		{
			ss << "anim-store-glm::mat4 ";
		}
		else
		{
			ss << "anim-store-dq ";
		}
	}

	if (navmesh != nullptr)
	{
		ss << "navmesh ";
	}

	ss << endl;

	auto count = 0u;
	for (auto& subMesh : submeshes)
	{
		ss << "m " << subMesh.material << " " << subMesh.vertices.size() << " " << subMesh.indices.size() << endl;

		for (auto& vertex : subMesh.vertices)
		{
			ss << "vnt " << vertex.position.x << " " << vertex.position.y << " " << vertex.position.z << " "
				<< vertex.normal.x << " " << vertex.normal.y << " " << vertex.normal.z << " "
				<< vertex.uv.x << " " << vertex.uv.y;

			if (subMesh.hasAnimation)
			{
				ss << " ";

				for (auto i = 0u; i < 4; i++)
				{
					ss << vertex.boneIndices[i] << " ";
				}

				for (auto i = 0u; i < 4; i++)
				{
					ss << vertex.boneWeights[i] << " ";
				}
			}

			ss << endl;
		}

		ss << "i ";

		for (auto& i : subMesh.indices)
		{
			ss << i << " ";
		}
		ss << endl;

		ss << "aabb " << subMesh.aabb.center.x << " " << subMesh.aabb.center.y << " " << subMesh.aabb.center.z << " "
			<< subMesh.aabb.extents.x << " " << subMesh.aabb.extents.y << " " << subMesh.aabb.extents.z << endl;

		ss << endl;

		count++;
	}

	if (skeleton && skeleton->animations.size() > 0)
	{
		for (auto& animationTake : skeleton->animations)
		{
			auto frameCount = animationTake.second.size();
			ss << "a \"" << animationTake.first << "\" " << frameCount << " " << skeleton->joints.size() << endl;

			for (auto i = 0u; i < frameCount; i++)
			{
				ss << "f " << i << endl;

				for (auto q = 0u; q < animationTake.second[i].size(); q++)
				{
					if (CONFIG_KEY("export-glm::mat4", "true"))
					{
						WriteMatrix(ss, animationTake.second[i][q]);
					}
					else
					{
						WriteDualQuaternion(ss, animationTake.second[i][q]);
					}
				}
			}
		}

		ss << endl;
	}

	if (navmesh != nullptr)
	{
		for (auto& vertex : navmesh->GetVertices())
		{
			ss << "nmv " << vertex.x << " " << vertex.y << " " << vertex.z << endl;
		}


		ss << "nmi ";
		for (auto idx : navmesh->GetIndices())
		{
			ss << idx << " ";
		}

		ss << endl;
	}

	string result = ss.str();
	f.write(result.c_str(), result.size());

	LOG("Conversion finished. Wrote % kbytes.", result.size() / 1024);
}