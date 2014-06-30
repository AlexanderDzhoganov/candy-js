#ifndef __FBXUTIL_H
#define __FBXUTIL_H

FbxScene* ImportFbxScene(const string& fileName, FbxManager* manager);
void TraverseFbxScene(FbxScene* scene);
void TraverseFbxNode(FbxNode* node);

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

void TraverseFbxNode(FbxNode* node)
{
	auto attribute = node->GetNodeAttribute();

	if (attribute != nullptr)
	{
		auto name = string(attribute->GetName());
		if (name.length() == 0)
		{
			name = "<name empty>";
		}

		cout << "Node: " << name << endl;

		auto type = attribute->GetAttributeType();

		auto translation = node->LclTranslation.Get();
		auto rotation = node->LclRotation.Get();
		auto scale = node->LclScaling.Get();

		cout << "Translation: " << translation[0] << ", " << translation[1] << ", " << translation[2] << endl;
		cout << "Rotation: " << rotation[0] << ", " << rotation[1] << ", " << rotation[2] << endl;
		cout << "Scale: " << scale[0] << ", " << scale[1] << ", " << scale[2] << endl;

		if (type == FbxNodeAttribute::EType::eMesh)
		{
			cout << "Type: FbxMesh" << endl;
			FbxMesh* mesh = (FbxMesh*)attribute;
			PrintFbxMeshInfo(mesh);
			auto converted = ConvertMesh(mesh);
		}
	}

	auto childCount = (size_t)node->GetChildCount();
	for (auto i = 0u; i < childCount; i++)
	{
		auto child = node->GetChild(i);
		TraverseFbxNode(child);
	}
};

void TraverseFbxScene(FbxScene* scene)
{
	cout << endl << "Starting scene traversal.." << endl;
	TraverseFbxNode(scene->GetRootNode());
	cout << endl << "Scene traveral complete" << endl;
}

#endif
