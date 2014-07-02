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

#include "logging.h"
#include "fbxinfo.h"
#include "fbxutil.h"

void PrintFbxMeshInfo(FbxMesh* mesh)
{
	LOG("--- Mesh info for \"%\" ---", mesh->GetNode()->GetName());

	FbxVector4* controlPoints = mesh->GetControlPoints();
	size_t controlPointsCount = mesh->GetControlPointsCount();

	LOG("Control points: %", controlPointsCount);

	auto normalsElement = mesh->GetElementNormal();
	auto normalMappingMode = normalsElement->GetMappingMode();
	auto normalReferenceMode = normalsElement->GetReferenceMode();

	LOG("Normals mapping mode: %", EnumToString(normalMappingMode));
	LOG("Normals reference mode: %", EnumToString(normalReferenceMode));

	auto uvsElement = mesh->GetElementUV();
	auto uvsMappingMode = uvsElement->GetMappingMode();
	auto uvsReferenceMode = uvsElement->GetReferenceMode();

	LOG("UVs mapping mode: %", EnumToString(uvsMappingMode));
	LOG("UVs reference mode: %", EnumToString(uvsReferenceMode));

	size_t polygonCount = mesh->GetPolygonCount();

	LOG("Polygon count: %", polygonCount);

	auto materialCount = mesh->GetElementMaterialCount();

	LOG("Materials count: %", materialCount);

	for (auto i = 0; i < materialCount; i++)
	{
		auto materialElement = mesh->GetElementMaterial(i);
		LOG("Material #%: %", i, materialElement->GetName());

		auto materialReferenceMode = materialElement->GetReferenceMode();
		auto materialMappingMode = materialElement->GetMappingMode();

		LOG("Reference mode: %", EnumToString(materialReferenceMode));
		LOG("Mapping mode: %", EnumToString(materialMappingMode));
	}

	LOG("---  ---");
}

void PrintNode(FbxNode* node, int depth = 0)
{
	// print node type etc..
	auto attrib = node->GetNodeAttribute();
	auto type = FbxNodeAttribute::eUnknown;

	if (attrib != nullptr)
	{
		type = attrib->GetAttributeType();;
	}

	for (auto i = 0; i < depth; i++)
	{
		cout << " ";
	}

	cout << "- " << EnumToString(type) << endl;

	// for each child - recurse
	auto childCount = node->GetChildCount();

	for (auto i = 0; i < childCount; i++)
	{
		PrintNode(node->GetChild(i), depth + 1);
	}

}
void PrintScene(FbxScene* scene)
{
	auto root = scene->GetRootNode();

	PrintNode(root);

}
