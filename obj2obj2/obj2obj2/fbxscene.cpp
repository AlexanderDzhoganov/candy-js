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
#include "fbxscene.h"

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
			cout << ">> Encountered mesh node : " << name << " <<" << endl;

			auto translation = node->LclTranslation.Get();
			auto rotation = node->LclRotation.Get();
			auto scale = node->LclScaling.Get();

			cout << "Translation: " << translation[0] << ", " << translation[1] << ", " << translation[2] << endl;
			cout << "Rotation: " << rotation[0] << ", " << rotation[1] << ", " << rotation[2] << endl;
			cout << "Scale: " << scale[0] << ", " << scale[1] << ", " << scale[2] << endl;

			cout << "Type: FbxMesh" << endl;
			FbxMesh* mesh = (FbxMesh*)attribute;
			PrintFbxMeshInfo(mesh);

			cout << ">> <<" << endl;

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
	cout << endl << ">> Starting scene traversal <<" << endl;

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

	cout << endl << ">> Scene traversal complete <<" << endl;
	return mesh;
}