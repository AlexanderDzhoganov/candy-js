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
using namespace glm;

#include "..\include\logging.h"
#include "..\include\config.h"

#include "..\include\fbxutil.h"
#include "..\include\fbxelement.h"
#include "..\include\fbxanim.h"
#include "..\include\fbxmesh.h"
#include "..\include\fbxinfo.h"
#include "..\include\fbxscene.h"

#include "..\include\navmesh.h"

NavMesh::NavMesh(FbxMeshReader* mesh) : m_Mesh(mesh)
{
	if (CONFIG_HAS_KEY("navmesh-cell-size"))
	{
		m_CellSize = CONFIG_GET_FLOAT_VALUE("navmesh-cell-size");
	}

	if (CONFIG_HAS_KEY("navmesh-cell-height"))
	{
		m_CellHeight = CONFIG_GET_FLOAT_VALUE("navmesh-cell-height");
	}

	if (CONFIG_HAS_KEY("navmesh-walkable-slope-angle"))
	{
		m_WalkableSlopeAngle = CONFIG_GET_FLOAT_VALUE("navmesh-walkable-slope-angle");
	}
	
	float walkableHeight = 0.0f;
	if (CONFIG_HAS_KEY("navmesh-walkable-height"))
	{
		walkableHeight = CONFIG_GET_FLOAT_VALUE("navmesh-walkable-height");
	}

	float walkableClimb = 0.0f;
	if (CONFIG_HAS_KEY("navmesh-walkable-climb"))
	{
		walkableClimb = CONFIG_GET_FLOAT_VALUE("navmesh-walkable-climb");
	}

	float walkableRadius = 0.0f;
	if (CONFIG_HAS_KEY("navmesh-walkable-radius"))
	{
		walkableRadius = CONFIG_GET_FLOAT_VALUE("navmesh-walkable-radius");
	}

	if (CONFIG_HAS_KEY("navmesh-max-edge-length"))
	{
		m_MaxEdgeLength = CONFIG_GET_INT_VALUE("navmesh-max-edge-length");
	}

	if (CONFIG_HAS_KEY("navmesh-max-simplification-error"))
	{
		m_MaxSimplyficationError = CONFIG_GET_FLOAT_VALUE("navmesh-max-simplification-error");
	}

	if (CONFIG_HAS_KEY("navmesh-min-region-area"))
	{
		m_MinRegionArea = CONFIG_GET_INT_VALUE("navmesh-min-region-area");
	}

	if (CONFIG_HAS_KEY("navmesh-merge-region-area"))
	{
		m_MergeRegionArea = CONFIG_GET_INT_VALUE("navmesh-merge-region-area");
	}

	if (CONFIG_HAS_KEY("navmesh-max-verts-per-poly"))
	{
		m_MaxVertsPerPoly = CONFIG_GET_INT_VALUE("navmesh-max-verts-per-poly");
	}

	if (CONFIG_HAS_KEY("navmesh-detail-sample-distance"))
	{
		m_DetailSampleDistance = CONFIG_GET_FLOAT_VALUE("navmesh-detail-sample-distance");
	}

	if (CONFIG_HAS_KEY("navmesh-detail-sample-max-error"))
	{
		m_DetailSampleMaxError = CONFIG_GET_FLOAT_VALUE("navmesh-detail-sample-max-error");
	}



	vector<float> vertices;
	vector<int> indices;

	int currentSubmeshStartIndex = 0;

	for (auto& submesh : m_Mesh->GetSubMeshes())
	{
		for (auto& vertex : submesh.vertices)
		{
			vertices.push_back(vertex.position.x);
			vertices.push_back(vertex.position.y);
			vertices.push_back(vertex.position.z);
		}

		for (auto idx : submesh.indices)
		{
			indices.push_back(currentSubmeshStartIndex + idx);
		}

		currentSubmeshStartIndex += (int) submesh.vertices.size();
	}
	LOG("Starting NavMesh build");

	rcConfig config;
	memset(&config, 0, sizeof(rcConfig));

	AABB aabb = AABB::fromVertices(vertices);

	auto height = aabb.extents[1] * 2.0;
	m_WalkableClimb = walkableClimb / m_CellHeight;
	m_WalkableHeight = walkableHeight / m_CellHeight;
	m_WalkableRadius = walkableRadius / m_CellSize; 

	memcpy(config.bmax, &aabb.vmax, sizeof(float) * 3);
	memcpy(config.bmin, &aabb.vmin, sizeof(float) * 3);
	config.cs = m_CellSize;
	config.ch = m_CellHeight;
	config.walkableSlopeAngle = m_WalkableSlopeAngle;
	config.walkableHeight = m_WalkableHeight;
	config.walkableClimb = m_WalkableClimb;
	config.walkableRadius = m_WalkableRadius;
	config.maxEdgeLen = m_MaxEdgeLength;
	config.maxSimplificationError = m_MaxSimplyficationError;
	config.minRegionArea = m_MinRegionArea;
	config.mergeRegionArea = m_MergeRegionArea;
	config.maxVertsPerPoly = m_MaxVertsPerPoly;
	config.detailSampleDist = m_DetailSampleDistance;
	config.detailSampleMaxError = m_DetailSampleMaxError;

	rcCalcGridSize(config.bmin, config.bmax, config.cs, &config.width, &config.height);

	LOG("Calculated grid size - % x %", config.width, config.height);

	rcContext context(false);

	auto solid = rcAllocHeightfield();
	auto status = rcCreateHeightfield(&context, *solid, config.width, config.height, config.bmin, config.bmax, config.cs, config.ch);
	if (!status)
	{
		LOG("Error! rcCreateHeightfield failed");
		return;
	}

	auto triangleAreas = new unsigned char[indices.size() / 3];

	memset(triangleAreas, 0, sizeof(unsigned char) * indices.size() / 3);

	LOG("Starting rcMarkWalkableTriangles ");
	rcMarkWalkableTriangles(&context, config.walkableSlopeAngle, vertices.data(), vertices.size() / 3, indices.data(), indices.size() / 3, triangleAreas);

	LOG("Starting rcRasterizeTriangles ");
	rcRasterizeTriangles(&context, vertices.data(), vertices.size() / 3, indices.data(), triangleAreas, indices.size() / 3, *solid, config.walkableClimb);

	delete[] triangleAreas;
	triangleAreas = nullptr;

	LOG("Starting rcFilters ");
	rcFilterLowHangingWalkableObstacles(&context, config.walkableClimb, *solid);
	rcFilterLedgeSpans(&context, config.walkableHeight, config.walkableClimb, *solid);
	rcFilterWalkableLowHeightSpans(&context, config.walkableHeight, *solid);
	
	auto compactHeightField = rcAllocCompactHeightfield();

	LOG("Starting rcBuildCompactHeightfield ");
	status = rcBuildCompactHeightfield(&context, config.walkableHeight, config.walkableClimb, *solid, *compactHeightField);
	if (!status)
	{
		LOG("Error! rcBuildCompactHeightfield failed");
		return;
	}

	rcFreeHeightField(solid);
	solid = nullptr;

	LOG("Starting rcErodeWalkableArea ");
	status = rcErodeWalkableArea(&context, config.walkableRadius, *compactHeightField);
	if (!status)
	{
		LOG("Error! rcErodeWalkableArea failed");
		return;
	}

	LOG("Starting rcBuildDistanceField ");
	status = rcBuildDistanceField(&context, *compactHeightField);
	if (!status)
	{
		LOG("Error! rcBuildDistanceField failed");
		return;
	}

	LOG("Starting rcBuildRegions ");
	status = rcBuildRegions(&context, *compactHeightField, 0, config.minRegionArea, config.mergeRegionArea);
	if (!status)
	{
		LOG("Error! rcBuildRegions failed");
		return;
	}

	LOG("Starting rcBuildContours ");
	auto contourSet = rcAllocContourSet();
	status = rcBuildContours(&context, *compactHeightField, config.maxSimplificationError, config.maxEdgeLen, *contourSet);
	if (!status)
	{
		LOG("Error! rcBuildContours failed");
		return;
	}

	LOG("Starting rcBuildPolyMesh ");
	auto polyMesh = rcAllocPolyMesh();
	status = rcBuildPolyMesh(&context, *contourSet, config.maxVertsPerPoly, *polyMesh);
	if (!status)
	{
		LOG("Error! rcBuildPolyMesh failed");
		return;
	}

	LOG("Starting rcBuildPolyMeshDetail");
	auto detailPolyMesh = rcAllocPolyMeshDetail();
	status = rcBuildPolyMeshDetail(&context, *polyMesh, *compactHeightField, config.detailSampleDist, config.detailSampleMaxError, *detailPolyMesh);
	if (!status)
	{
		LOG("Error! rcBuildPolyMeshDetail failed");
		return;
	}

	rcFreeCompactHeightfield(compactHeightField);
	rcFreeContourSet(contourSet);


	LOG("Retrieving mesh");
	for (int i = 0; i < detailPolyMesh->nmeshes; i++)
	{
		const unsigned int* meshDef = &detailPolyMesh->meshes[i * 4];
		const unsigned int baseVerts = meshDef[0];
		const unsigned int baseTri = meshDef[2];
		const int ntris = (int) meshDef[3];

		const float* verts = &detailPolyMesh->verts[baseVerts * 3];
		const unsigned char* tris = &detailPolyMesh->tris[baseTri * 4];

		for (int j = 0; j < ntris; j++)
		{
			float x0 = verts[tris[j * 4 + 0] * 3 + 0];
			float y0 = verts[tris[j * 4 + 0] * 3 + 1];
			float z0 = verts[tris[j * 4 + 0] * 3 + 2];
			m_NavmeshVertices.emplace_back(x0, y0, z0);
			m_NavmeshIndices.push_back(m_NavmeshVertices.size() - 1);

			float x1 = verts[tris[j * 4 + 1] * 3 + 0];
			float y1 = verts[tris[j * 4 + 1] * 3 + 1];
			float z1 = verts[tris[j * 4 + 1] * 3 + 2];
			m_NavmeshVertices.emplace_back(x1, y1, z1);
			m_NavmeshIndices.push_back(m_NavmeshVertices.size() - 1);

			float x2 = verts[tris[j * 4 + 2] * 3 + 0];
			float y2 = verts[tris[j * 4 + 2] * 3 + 1];
			float z2 = verts[tris[j * 4 + 2] * 3 + 2];
			m_NavmeshVertices.emplace_back(x2, y2, z2);
			m_NavmeshIndices.push_back(m_NavmeshVertices.size() - 1);
		}
	}

	rcFreePolyMesh(polyMesh);
	rcFreePolyMeshDetail(detailPolyMesh);
}