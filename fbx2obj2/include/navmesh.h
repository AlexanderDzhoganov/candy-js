#ifndef __NAVMESH_H
#define __NAVMESH_H

class NavMesh
{
	public:

	NavMesh::NavMesh(FbxMeshReader* mesh);

	const vector<int>& GetIndices() const { return m_NavmeshIndices; }
	const vector<glm::vec3>& GetVertices() const { return m_NavmeshVertices; }

	private:

	vector<int> m_NavmeshIndices;
	vector<glm::vec3> m_NavmeshVertices;

	FbxMeshReader* m_Mesh = nullptr;
	float m_CellSize = 0.3f;
	float m_CellHeight = 0.2f;

	float m_WalkableSlopeAngle = 45.0f;
	int  m_WalkableHeight = 5;
	int  m_WalkableClimb = 2;
	int m_WalkableRadius = 2;
	int m_MaxEdgeLength = 40;
	float m_MaxSimplyficationError = 1.3f;
	int m_MinRegionArea = 64;
	int m_MergeRegionArea = 400;
	int m_MaxVertsPerPoly = 3;
	float m_DetailSampleDistance = 6.0f;
	float m_DetailSampleMaxError = 1.0f;
};

#endif // navmesh_h