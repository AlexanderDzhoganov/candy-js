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

#include "..\dep\glm\glm.hpp"

using namespace std;
using namespace glm;

#include "..\include\logging.h"
#include "..\include\fbxinfo.h"
#include "..\include\fbxutil.h"

void PrintFbxMeshInfo(FbxMesh* mesh)
{
	LOG("");
	LOG("--- FbxMesh info for \"%\" ---", mesh->GetNode()->GetName());

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

	LOG("Primitives: %", mesh->IsTriangleMesh() ? "triangles" : "mixed");

	LOG("Deformers: %", mesh->GetDeformerCount());

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

	LOG("");
}

void PrintFbxSkeletonInfo(FbxSkeleton* skeleton)
{
	LOG("");
	LOG("--- FbxSkeleton info for \"%\" ---", skeleton->GetNode()->GetName());

	LOG("IsSkeletonRoot: %", skeleton->IsSkeletonRoot() ? "true" : "false");
	LOG("SkeletonType: %", EnumToString(skeleton->GetSkeletonType()));

	LOG("");
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

	LOG("FbxNode: \"%\" (%)", node->GetName(), EnumToString(type));
	auto translation = node->LclTranslation.Get();
	auto rotation = node->LclRotation.Get();
	auto scale = node->LclScaling.Get();

	LOG("Translation: %, %, %", translation[0], translation[1], translation[2]);
	LOG("Rotation: %, %, %", rotation[0], rotation[1], rotation[2]);
	LOG("Scale: %, %, %", scale[0], scale[1], scale[2]);

	LOG("");

	if (type == FbxNodeAttribute::eMesh)
	{
		PrintFbxMeshInfo((FbxMesh*)attrib);
	}
	else if (type == FbxNodeAttribute::eSkeleton)
	{
		PrintFbxSkeletonInfo((FbxSkeleton*)attrib);
	}

	auto childCount = node->GetChildCount();
	for (auto i = 0; i < childCount; i++)
	{
		PrintNode(node->GetChild(i), depth + 1);
	}

}
void PrintScene(FbxScene* scene)
{
	LOG("Starting scene traversal");

	auto root = scene->GetRootNode();
	PrintNode(root);
}
