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

#include "..\include\serialization.h"
#include "..\include\obj2.h"

void OBJ2BinaryWriter::SetMaterials(const vector<string>& materialNames)
{
	m_Binary->materials.resize(materialNames.size());

	for (auto i = 0u; i < materialNames.size(); i++)
	{
		m_Binary->materials[i].name = materialNames[i];
		m_MaterialToIndex[materialNames[i]] = i;
	}
}

void OBJ2BinaryWriter::SetSubMeshes(const vector<SubMesh>& subMeshes)
{
	m_Binary->submeshes.resize(subMeshes.size());

	for (auto i = 0u; i < subMeshes.size(); i++)
	{
		auto& aabb = subMeshes[i].aabb;
		m_Binary->submeshes[i].aabb.resize(6);
		memcpy(m_Binary->submeshes[i].aabb.data(), &(aabb.center[0]), sizeof(float_t)* 3);
		memcpy(m_Binary->submeshes[i].aabb.data() + 3, &(aabb.extents[0]), sizeof(float_t)* 3);

		m_Binary->submeshes[i].materialIndex = (uint32_t)m_MaterialToIndex[subMeshes[i].material];
		auto componentsCount = subMeshes[i].hasAnimation ? 16 : 8;
		auto vertexCount = subMeshes[i].vertices.size();

		m_Binary->submeshes[i].vertexComponentsCount = componentsCount;
		m_Binary->submeshes[i].vertices.resize(vertexCount * componentsCount);

		for (auto q = 0u; q < vertexCount; q++)
		{
			auto& position = subMeshes[i].vertices[q].position;
			auto& normal = subMeshes[i].vertices[q].normal;
			auto& uvs = subMeshes[i].vertices[q].uv;

			auto& boneWeights = subMeshes[i].vertices[q].boneWeights;
			auto& boneIndices = subMeshes[i].vertices[q].boneIndices;

			float boneIndicesFloat[4];
			for (auto bi = 0; bi < 4; bi++)
			{
				boneIndicesFloat[bi] = (float)boneIndices[bi];
			}

			float vertex[] =
			{
				position.x,
				position.y,
				position.z,
				normal.x,
				normal.y,
				normal.z,
				uvs.x,
				uvs.y,
				boneIndicesFloat[0],
				boneIndicesFloat[1],
				boneIndicesFloat[2],
				boneIndicesFloat[3],
				boneWeights[0],
				boneWeights[1],
				boneWeights[2],
				boneWeights[3]
			};

			memcpy(&(m_Binary->submeshes[i].vertices[q * componentsCount]), vertex, sizeof(float_t) * componentsCount);
		}

		auto indicesCount = subMeshes[i].indices.size();
		m_Binary->submeshes[i].indices.resize(indicesCount);

		for (auto idx = 0; idx < indicesCount; idx++)
		{
			m_Binary->submeshes[i].indices[idx] = (uint32_t)subMeshes[i].indices[idx];
		}
	}
}

void OBJ2BinaryWriter::SetSkeleton(const Skeleton& skeleton)
{
	m_Binary->flags |= (uint32_t)OBJ2BinaryFlags::ANIMATED;

	m_Binary->jointsCount = (uint32_t)skeleton.joints.size();
	m_Binary->animations.resize(skeleton.animations.size());

	auto i = 0u;
	for (auto& anim : skeleton.animations)
	{
		m_Binary->animations[i].name = anim.first;

		m_Binary->animations[i].jointsCount = (uint32_t)skeleton.joints.size();
		m_Binary->animations[i].framesCount = (uint32_t)anim.second.size();
		
		auto dualQuaternionsCount = skeleton.joints.size() * anim.second.size();
		m_Binary->animations[i].frameData.resize(dualQuaternionsCount * 8);
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
					m_Binary->animations[i].frameData[ptr++] = (float)dQ.GetFirstQuaternion().GetAt(c);
				}

				for (auto c = 0; c < 4; c++)
				{
					m_Binary->animations[i].frameData[ptr++] = (float)dQ.GetSecondQuaternion().GetAt(c);
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

	m_Binary->navMesh->vertices.resize(vertices.size() * 3);
	memcpy(m_Binary->navMesh->vertices.data(), vertices.data(), sizeof(float_t)* vertices.size() * 3);

	m_Binary->navMesh->indices.resize(indices.size());
	
	for (auto i = 0u; i < indices.size(); i++)
	{
		m_Binary->navMesh->indices[i] = indices[i];
	}
}

void OBJ2BinaryWriter::WriteToFile(const string& filename)
{
	ofstream f(filename, ios::binary);

	if (!f.is_open())
	{
		LOG("Failed to open \"%\" for writing", filename);
		return;
	}

	LOG("Writing to \"%\"", filename);

	BinarySizeCalculator sizeCalculator;
	SerializeObject(sizeCalculator, *m_Binary);
	BinaryWriter writer(sizeCalculator.GetSize());
	SerializeObject(writer, *m_Binary);

	f.write((char*)writer.GetData().data(), writer.GetData().size() * sizeof(uint8_t));
	LOG("Done! Written % kbytes.", writer.GetData().size() / 1024);
}