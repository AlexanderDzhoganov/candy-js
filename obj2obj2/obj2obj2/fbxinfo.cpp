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

#include "util.h"

#include "fbxinfo.h"
#include "fbxutil.h"

void PrintFbxMeshInfo(FbxMesh* mesh)
{
	FbxVector4* controlPoints = mesh->GetControlPoints();
	size_t controlPointsCount = mesh->GetControlPointsCount();

	cout << "Control points: " << controlPointsCount << endl;

	auto normalsElement = mesh->GetElementNormal();
	auto normalMappingMode = normalsElement->GetMappingMode();
	auto normalReferenceMode = normalsElement->GetReferenceMode();

	cout << "Normals mapping mode: " << EnumToString(normalMappingMode) << endl;
	cout << "Normals reference mode: " << EnumToString(normalReferenceMode) << endl;

	auto uvsElement = mesh->GetElementUV();
	auto uvsMappingMode = uvsElement->GetMappingMode();
	auto uvsReferenceMode = uvsElement->GetReferenceMode();

	cout << "UVs mapping mode: " << EnumToString(uvsMappingMode) << endl;
	cout << "UVs reference mode: " << EnumToString(uvsReferenceMode) << endl;

	size_t polygonCount = mesh->GetPolygonCount();

	cout << "Polygon count: " << polygonCount << endl;

	auto materialCount = mesh->GetElementMaterialCount();

	cout << "Materials count: " << materialCount << endl;

	for (auto i = 0; i < materialCount; i++)
	{
		auto materialElement = mesh->GetElementMaterial(i);
		cout << "Material #" << i << " - \"" << materialElement->GetName() << "\"" << endl;

		auto materialReferenceMode = materialElement->GetReferenceMode();
		auto materialMappingMode = materialElement->GetMappingMode();

		cout << "  Reference mode: " << EnumToString(materialReferenceMode) << endl;
		cout << "  Mapping mode: " << EnumToString(materialMappingMode) << endl;
	}
}