#ifndef __FBXMESH_H
#define __FBXMESH_H

void PrintFbxMeshInfo(FbxMesh* mesh);
vector<vec3> GetPositionsFromFbxMesh(FbxMesh* mesh);
vector<vec3> GetNormalsFromFbxMesh(FbxMesh* mesh, int normalElementIndex = 0);
vector<vec2> GetUVsFromFbxMesh(FbxMesh* mesh, int uvElementIndex = 0);

string enumToString(FbxLayerElement::EMappingMode mappingMode)
{
	switch (mappingMode)
	{
	case FbxLayerElement::eAllSame:
		return "eAllSame";
	case FbxLayerElement::eByControlPoint:
		return "eByControlPoint";
	case FbxLayerElement::eByEdge:
		return "eByEdge";
	case FbxLayerElement::eByPolygon:
		return "eByPolygon";
	case FbxLayerElement::eByPolygonVertex:
		return "eByPolygonVertex";
	case FbxLayerElement::eNone:
		return "eNone";
	}

	return "undefined";
}

string enumToString(FbxLayerElement::EReferenceMode referenceMode)
{
	switch (referenceMode)
	{
	case FbxLayerElement::eDirect:
		return "eDirect";
	case FbxLayerElement::eIndex:
		return "eIndex";
	case FbxLayerElement::eIndexToDirect:
		return "eIndexToDirect";
	}

	return "undefined";
}

vector<vec3> GetPositionsFromFbxMesh(FbxMesh* mesh)
{
	cout << "Reading positions.. ";

	FbxVector4* controlPoints = mesh->GetControlPoints();
	size_t polygonCount = mesh->GetPolygonCount();

	vector<vec3> positions;
	for (auto i = 0u; i < polygonCount; i++)
	{
		for (auto j = 0u; j < 3; j++)
		{
			auto index = mesh->GetPolygonVertex(i, j);
			FbxVector4 vertex = controlPoints[index];
			positions.emplace_back(vertex[0], vertex[1], vertex[2]);
		}
	}

	cout << "Done!" << endl;
	return positions;
}

vec3 ReadNormalFromFbxMesh(FbxMesh* mesh, int controlPointIndex, int vertexIndex, int polygonIndex, int normalElementIndex)
{
	auto normalElement = mesh->GetElementNormal(normalElementIndex);
	auto mappingMode = normalElement->GetMappingMode();
	auto referenceMode = normalElement->GetReferenceMode();

	int normalDirectIndex = -1;

	if (mappingMode == FbxGeometryElement::eByControlPoint)
	{
		if (referenceMode == FbxGeometryElement::eDirect)
		{
			normalDirectIndex = controlPointIndex;
		}
		else if (referenceMode == FbxGeometryElement::eIndexToDirect || referenceMode == FbxGeometryElement::eIndex)
		{
			normalDirectIndex = normalElement->GetIndexArray().GetAt(controlPointIndex);
		}
	}
	else if (mappingMode == FbxGeometryElement::eByPolygonVertex)
	{
		if (referenceMode == FbxGeometryElement::eDirect)
		{
			normalDirectIndex = vertexIndex;
		}
		else if (referenceMode == FbxGeometryElement::eIndexToDirect || referenceMode == FbxGeometryElement::eIndex)
		{
			normalDirectIndex = normalElement->GetIndexArray().GetAt(vertexIndex);
		}
	}
	else if (mappingMode == FbxGeometryElement::eByPolygon)
	{
		if (referenceMode == FbxGeometryElement::eDirect)
		{
			normalDirectIndex = polygonIndex;
		}
		else if (referenceMode == FbxGeometryElement::eIndexToDirect || referenceMode == FbxGeometryElement::eIndex)
		{
			normalDirectIndex = normalElement->GetIndexArray().GetAt(polygonIndex);
		}
	}
	else if (mappingMode == FbxGeometryElement::eAllSame)
	{
		if (referenceMode == FbxGeometryElement::eDirect)
		{
			normalDirectIndex = 0;
		}
		else if (referenceMode == FbxGeometryElement::eIndexToDirect || referenceMode == FbxGeometryElement::eIndex)
		{
			normalDirectIndex = normalElement->GetIndexArray().GetAt(0);
		}
	}
	else
	{
		cout << "Unsupported mapping mode: " << enumToString(mappingMode) << endl;
		return vec3(0.0);
	}

	if (normalDirectIndex == -1)
	{
		cout << "Invalid normal direct index" << endl;
		return vec3(0.0);
	}

	auto normal = normalElement->GetDirectArray().GetAt(normalDirectIndex);
	return vec3(normal[0], normal[1], normal[2]);
}

vector<vec3> GetNormalsFromFbxMesh(FbxMesh* mesh, int normalElementIndex)
{
	cout << "Reading normals.. ";
	auto polygonCount = mesh->GetPolygonCount();

	int vertexCounter = 0;

	vector<vec3> normals;

	for (auto i = 0; i < polygonCount; i++)
	{
		auto vertices = mesh->GetPolygonSize(i);

		for (auto q = 0; q < vertices; q++)
		{
			auto controlPointIndex = mesh->GetPolygonVertex(i, q);
			auto normal = ReadNormalFromFbxMesh(mesh, controlPointIndex, vertexCounter, i, normalElementIndex);
			normals.push_back(normal);
			vertexCounter++;
		}
	}

	cout << "Done!" << endl;
	return normals;
}

vec2 ReadUVFromFbxMesh(FbxMesh* mesh, int controlPointIndex, int vertexIndex, int polygonIndex, int uvElementIndex)
{
	auto uvElement = mesh->GetElementNormal(uvElementIndex);
	auto mappingMode = uvElement->GetMappingMode();
	auto referenceMode = uvElement->GetReferenceMode();

	int uvDirectIndex = -1;

	if (mappingMode == FbxGeometryElement::eByControlPoint)
	{
		if (referenceMode == FbxGeometryElement::eDirect)
		{
			uvDirectIndex = controlPointIndex;
		}
		else if (referenceMode == FbxGeometryElement::eIndexToDirect || referenceMode == FbxGeometryElement::eIndex)
		{
			uvDirectIndex = uvElement->GetIndexArray().GetAt(controlPointIndex);
		}
	}
	else if (mappingMode == FbxGeometryElement::eByPolygonVertex)
	{
		if (referenceMode == FbxGeometryElement::eDirect)
		{
			uvDirectIndex = vertexIndex;
		}
		else if (referenceMode == FbxGeometryElement::eIndexToDirect || referenceMode == FbxGeometryElement::eIndex)
		{
			uvDirectIndex = uvElement->GetIndexArray().GetAt(vertexIndex);
		}
	}
	else if (mappingMode == FbxGeometryElement::eByPolygon)
	{
		if (referenceMode == FbxGeometryElement::eDirect)
		{
			uvDirectIndex = polygonIndex;
		}
		else if (referenceMode == FbxGeometryElement::eIndexToDirect || referenceMode == FbxGeometryElement::eIndex)
		{
			uvDirectIndex = uvElement->GetIndexArray().GetAt(polygonIndex);
		}
	}
	else if (mappingMode == FbxGeometryElement::eAllSame)
	{
		if (referenceMode == FbxGeometryElement::eDirect)
		{
			uvDirectIndex = 0;
		}
		else if (referenceMode == FbxGeometryElement::eIndexToDirect || referenceMode == FbxGeometryElement::eIndex)
		{
			uvDirectIndex = uvElement->GetIndexArray().GetAt(0);
		}
	}
	else
	{
		cout << "Unsupported mapping mode: " << enumToString(mappingMode) << endl;
		return vec2(0.0);
	}

	if (uvDirectIndex == -1)
	{
		cout << "Invalid uv direct index" << endl;
		return vec2(0.0);
	}

	auto uv = uvElement->GetDirectArray().GetAt(uvDirectIndex);
	return vec2(uv[0], uv[1]);
}

vector<vec2> GetUVsFromFbxMesh(FbxMesh* mesh, int uvElementIndex)
{
	cout << "Reading UVs.. ";

	auto polygonCount = mesh->GetPolygonCount();
	int vertexCounter = 0;
	vector<vec2> uvs;

	for (auto i = 0; i < polygonCount; i++)
	{
		auto vertices = mesh->GetPolygonSize(i);

		for (auto q = 0; q < vertices; q++)
		{
			auto controlPointIndex = mesh->GetPolygonVertex(i, q);
			auto uv = ReadUVFromFbxMesh(mesh, controlPointIndex, vertexCounter, i, uvElementIndex);
			uvs.push_back(uv);
			vertexCounter++;
		}
	}

	cout << "Done!" << endl;
	return uvs;
}

size_t ReadMaterialFromFbxMesh(FbxMesh* mesh, int controlPointIndex, int polygonIndex, int materialElementIndex)
{
	auto materialElement = mesh->GetElementMaterial(materialElementIndex);
	auto mappingMode = materialElement->GetMappingMode();

	if (mappingMode == FbxGeometryElement::eByControlPoint)
	{
		return controlPointIndex;
	}
	else if (mappingMode == FbxGeometryElement::eByPolygon)
	{
		return materialElement->GetIndexArray().GetAt(polygonIndex);
	}
	else if (mappingMode == FbxGeometryElement::eAllSame)
	{
		return 0;
	}

	cout << "Unsupported mapping mode: " << enumToString(mappingMode) << endl;
	return 0;
}

void PrintFbxMeshInfo(FbxMesh* mesh)
{
	FbxVector4* controlPoints = mesh->GetControlPoints();
	size_t controlPointsCount = mesh->GetControlPointsCount();

	cout << "Control points: " << controlPointsCount << endl;

	auto normalsElement = mesh->GetElementNormal();
	auto normalMappingMode = normalsElement->GetMappingMode();
	auto normalReferenceMode = normalsElement->GetReferenceMode();

	cout << "Normals mapping mode: " << enumToString(normalMappingMode) << endl;
	cout << "Normals reference mode: " << enumToString(normalReferenceMode) << endl;

	auto uvsElement = mesh->GetElementUV();
	auto uvsMappingMode = uvsElement->GetMappingMode();
	auto uvsReferenceMode = uvsElement->GetReferenceMode();

	cout << "UVs mapping mode: " << enumToString(uvsMappingMode) << endl;
	cout << "UVs reference mode: " << enumToString(uvsReferenceMode) << endl;

	size_t polygonCount = mesh->GetPolygonCount();

	cout << "Polygon count: " << polygonCount << endl;

	auto materialCount = mesh->GetElementMaterialCount();

	cout << "Materials count: " << materialCount << endl;

	for (auto i = 0u; i < materialCount; i++)
	{
		auto materialElement = mesh->GetElementMaterial(i);
		cout << "Material #" << i << " - \"" << materialElement->GetName() << "\"" << endl;

		auto materialReferenceMode = materialElement->GetReferenceMode();
		auto materialMappingMode = materialElement->GetMappingMode();

		cout << "  Reference mode: " << enumToString(materialReferenceMode) << endl;
		cout << "  Mapping mode: " << enumToString(materialMappingMode) << endl;
	}
}

Mesh ConvertMesh(FbxMesh* mesh)
{
	auto positions = GetPositionsFromFbxMesh(mesh);
	auto normals = GetNormalsFromFbxMesh(mesh);
	auto uvs = GetUVsFromFbxMesh(mesh);

	return Mesh();
}

#endif
