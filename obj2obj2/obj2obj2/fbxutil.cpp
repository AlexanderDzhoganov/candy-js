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
#include "fbxanim.h"
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
		return nullptr;
	}

	FbxScene* scene = FbxScene::Create(manager, "Scene");
	importer->Import(scene);

	int major, minor, revision;
	importer->GetFileVersion(major, minor, revision);

	cout << "Success! File version is " << major << "." << minor << "." << revision << endl;
	return scene;
}

void TraverseFbxNode(FbxNode* node, vector<FbxMesh*>& meshes, FbxNode*& skeleton)
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

		if (type == FbxNodeAttribute::EType::eSkeleton)
		{
			if (skeleton == nullptr)
			{
				skeleton = node;
			}
		}

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
		TraverseFbxNode(child, meshes, skeleton);
	}
};

unique_ptr<FbxMeshReader> TraverseFbxScene(FbxScene* scene)
{
	cout << endl << "Starting scene traversal.." << endl;

	vector<FbxMesh*> meshes;
	FbxNode* skeletonRoot = nullptr;
	TraverseFbxNode(scene->GetRootNode(), meshes, skeletonRoot);

	if (skeletonRoot)
	{
		skeletonRoot = skeletonRoot->GetParent();
	}

	auto mesh = make_unique<FbxMeshReader>(meshes[0]);
	mesh->ReadMeshStaticData();
	mesh->ReadMeshSkeletonAndAnimations(scene, skeletonRoot);

	cout << endl << "Scene traversal complete" << endl;
	return mesh;
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

string EnumToString(FbxNodeAttribute::EType type)
{
	switch (type)
	{
		case FbxNodeAttribute::eUnknown:
			return "eUnknown";
		case FbxNodeAttribute::eNull:
			return "eNull";
		case FbxNodeAttribute::eMarker:
			return "eMarker";
		case FbxNodeAttribute::eSkeleton:
			return "eSkeleton";
		case FbxNodeAttribute::eMesh:
			return "eMesh";
		case FbxNodeAttribute::eNurbs:
			return "eNurbs";
		case FbxNodeAttribute::ePatch:
			return "ePatch";
		case FbxNodeAttribute::eCamera:
			return "eCamera";
		case FbxNodeAttribute::eCameraStereo:
			return "eCameraStereo";
		case FbxNodeAttribute::eLight:
			return "eLight";
		case FbxNodeAttribute::eOpticalReference:
			return "eOpticalReference";
		case FbxNodeAttribute::eOpticalMarker:
			return "eOpticalMarker";
		case FbxNodeAttribute::eNurbsCurve:
			return "eNurbsCurve";
		case FbxNodeAttribute::eTrimNurbsSurface:
			return "eTrimNurbsSurface";
		case FbxNodeAttribute::eBoundary:
			return "eBoundary";
		case FbxNodeAttribute::eNurbsSurface:
			return "eNurbsSurface";
		case FbxNodeAttribute::eShape:
			return "eShape";
		case FbxNodeAttribute::eLODGroup:
			return "eLODGroup";
		case FbxNodeAttribute::eSubDiv:
			return "eSubDiv";
		case FbxNodeAttribute::eCachedEffect:
			return "eCachedEffect";
		case FbxNodeAttribute::eLine:
			return "eLine";
	}

	return "undefined";
}
