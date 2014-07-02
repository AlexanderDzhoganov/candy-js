#include <fbxsdk.h>
#include <fbxsdk/fileio/fbxiosettings.h>

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

#include "glm\glm.hpp"

using namespace std;
using namespace glm;

#include "fbxelement.h"
#include "fbxutil.h"

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
		cout << "Unsupported mapping mode: " << EnumToString(mappingMode) << endl;
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
		cout << "Unsupported mapping mode: " << EnumToString(mappingMode) << endl;
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

	cout << "Unsupported mapping mode: " << EnumToString(mappingMode) << endl;
	return 0;
}
