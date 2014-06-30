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

#include "fbxwrapper.h"
#include "obj2scene.h"


//using namespace FbxWrapper;


/*
	[scene]


	[/scene]

	[objectGroup]

	[object]
	key: val;
	key2: val2;
	[/object]

	[/objectGroup]

	[VertexData = 0]

	0.0 0.0 0.0 0.0 0.0

	[/VertexData]

	[IndexData = 0]
	0 1 2 3 4 5  2
	[/IndexData]

	*/
FbxScene* ImportScene(const string& fileName, FbxManager* manager)
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

	cout << "Done! File version " << major << "." << minor << "." << revision << "." << endl;

	return scene;
}

Mesh ConvertMesh(FbxMesh* mesh)
{
	Mesh result;
	auto elementNormals = mesh->GetElementNormal();
	auto normalMapMode = elementNormals->GetMappingMode();
	FbxVector4* controlPoints= mesh->GetControlPoints();
	size_t vertexCount = mesh->GetControlPointsCount();
	size_t polygonCount = mesh->GetPolygonCount();
	auto polygonVertexCount = mesh->GetPolygonVertexCount();

	vector<vec3> positions;
	vector<size_t> indices;

	for (auto i = 0u; i < polygonCount; i++)
	{
		for (auto j = 0u; j < 3; j++)
		{
			auto index = mesh->GetPolygonVertex(i, j);
			indices.push_back(index);
			FbxVector4 vertex = controlPoints[index];
			positions.emplace_back(vertex[0], vertex[1], vertex[2]);
		}
	}

	FbxArray<FbxVector4> normalsFbx;
	mesh->GetPolygonVertexNormals(normalsFbx);
	vector<vec3> normals;
	normals.reserve(normalsFbx.Size());

	for (auto i = 0; i < normalsFbx.Size(); i++)
	{
		auto normal = normalsFbx.GetAt(i);
		normals.emplace_back(normal[0], normal[1], normal[2]);
	}

	size_t uvSetCount = mesh->GetElementUVCount();
	
	vector<vector<vec2>> uvSets;

	for (auto i = 0u; i < uvSetCount; i++)
	{
		uvSets.emplace_back();
		auto elemUV = mesh->GetElementUV(i);
		auto uvSetName = elemUV->GetName();
		FbxArray<FbxVector2> uvs;
		mesh->GetPolygonVertexUVs(uvSetName, uvs, nullptr);

		uvSets[i].reserve(uvs.Size());

		for (auto j = 0u; j < uvs.Size(); j++)
		{
			auto uv = uvs.GetAt(j);
			uvSets[i].emplace_back(uv[0], uv[1]);
		}
	}

	auto materialCount = mesh->GetElementMaterialCount();
	auto material = mesh->GetElementMaterial(0); 
	auto materialRefMode = material->GetReferenceMode();
	auto materialMappingMode = material->GetMappingMode();
	auto materialGet = material->GetIndexArray().GetCount();
	
	assert(materialRefMode == FbxLayerElement::EReferenceMode::eIndexToDirect);
	assert(materialMappingMode == FbxLayerElement::EMappingMode::eByPolygon);

	vector<int> materialIndices;
	for (auto i = 0; i < materialGet; i++)
	{
		materialIndices.push_back(material->GetIndexArray().GetAt(i));
	}

	vector<SubMesh> submeshes(materialCount);
	for (auto i = 0; i < materialCount; i++)
	{

	}

	return move(result);
}

void traverse(FbxNode* node)
{
	auto attribute = node->GetNodeAttribute();
	if (attribute != nullptr)
	{
		auto type = attribute->GetAttributeType();
		auto localRot = node->LclRotation.Get();
		auto localTranslate = node->LclTranslation.Get();
		auto localScale = node->LclScaling.Get();


		if (type == FbxNodeAttribute::EType::eMesh)
		{
			FbxMesh* mesh = (FbxMesh*) attribute;
			auto converted = ConvertMesh(mesh);
		}

		auto name = attribute->GetName();

	}

	auto childCount = (size_t) node->GetChildCount();
	for (auto i = 0u; i < childCount; i++)
	{
		auto child = node->GetChild(i);
		traverse(child);
	}
};

void doStuff(FbxScene* scene)
{
	FbxNode* root = scene->GetRootNode();
	traverse(root);
}

int main(int argc, char* argv[])
{
	if (argc == 1)
	{
		cout << "Usage:" << endl;
		cout << argv[0] << " <.fbx>" << endl;
		return  1;
	}
	cout << "Initializing FBX" << endl;

	FbxManager* manager = FbxManager::Create();

	string fileName(argv[1]);

	try
	{
		FbxScene* scene = ImportScene(fileName, manager);
		doStuff(move(scene));
	}
	catch (...)
	{
		return 1;
	}

	cout << "Press Enter to exit" << endl;
	cin.ignore(numeric_limits<streamsize>::max(), '\n');

	return 0;
}