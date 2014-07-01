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

#include "fbxutil.h"
#include "fbxinfo.h"
#include "fbxmesh.h"

FbxScene* ImportFbxScene(const string& fileName, FbxManager* manager)
{
	cout << "Importing \"" << fileName << "\"" << endl;

	FbxImporter* importer = FbxImporter::Create(manager, "");
	FbxIOSettings* iosettings = FbxIOSettings::Create(manager, IOSROOT);
	manager->SetIOSettings(iosettings);

	auto importStatus = importer->Initialize(fileName.c_str(), -1, iosettings); //bool

	if (!importStatus)
	{
		cout << "Error initializing fbx importer: " << importer->GetStatus().GetErrorString() << endl;
		throw runtime_error("");
	}

	FbxScene* scene = FbxScene::Create(manager, "Scene");
	importer->Import(scene);

	int major, minor, revision;
	importer->GetFileVersion(major, minor, revision);

	cout << "Success! File version is " << major << "." << minor << "." << revision << endl;
	return scene;
}

void TraverseFbxNode(FbxNode* node, vector<FbxMesh*>& meshes)
{
	auto attribute = node->GetNodeAttribute();

	if (attribute != nullptr)
	{
		auto name = string(attribute->GetName());
		if (name.length() == 0)
		{
			name = "<name empty>";
		}
		
		auto type = attribute->GetAttributeType();

		if (type == FbxNodeAttribute::EType::eMesh)
		{
			cout << "Node: " << name << endl;

			auto translation = node->LclTranslation.Get();
			auto rotation = node->LclRotation.Get();
			auto scale = node->LclScaling.Get();

			cout << "Translation: " << translation[0] << ", " << translation[1] << ", " << translation[2] << endl;
			cout << "Rotation: " << rotation[0] << ", " << rotation[1] << ", " << rotation[2] << endl;
			cout << "Scale: " << scale[0] << ", " << scale[1] << ", " << scale[2] << endl;

			cout << "Type: FbxMesh" << endl;
			FbxMesh* mesh = (FbxMesh*)attribute;
			PrintFbxMeshInfo(mesh);

			meshes.push_back(mesh);
		}
	}

	auto childCount = (size_t)node->GetChildCount();
	for (auto i = 0u; i < childCount; i++)
	{
		auto child = node->GetChild(i);
		TraverseFbxNode(child, meshes);
	}
};

vector<ConvertedMesh> TraverseFbxScene(FbxScene* scene)
{
	cout << endl << "Starting scene traversal.." << endl;

	vector<FbxMesh*> meshes;
	TraverseFbxNode(scene->GetRootNode(), meshes);

	vector<ConvertedMesh> convertedMeshes;
	for (FbxMesh* mesh : meshes)
	{
		convertedMeshes.push_back(ConvertMesh(mesh));
	}

	cout << endl << "Scene traversal complete" << endl;

	return convertedMeshes;
}

string EnumToString(FbxLayerElement::EMappingMode mappingMode)
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

string EnumToString(FbxLayerElement::EReferenceMode referenceMode)
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
