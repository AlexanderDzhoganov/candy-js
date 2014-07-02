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
#include "fbxelement.h"
#include "fbxanim.h"
#include "fbxmesh.h"
#include "fbxinfo.h"
#include "fbxscene.h"

auto writeOutToFile(const vector<SubMesh>& submeshes, const string& fileName, const Skeleton* skeleton) -> void
{
	fstream f(fileName, ios::out);

	stringstream ss;

	cout << "Writing out to \"" << fileName << "\"" << endl;

	ss << "flags: ";

	if (skeleton)
	{
		ss << "animated ";
	}

	ss << endl;

	auto count = 0u;
	for (auto& subMesh : submeshes)
	{
		ss << "m " << subMesh.material << " " << subMesh.vertices.size() << " " << subMesh.indices.size() << endl;

		for (auto& vertex : subMesh.vertices)
		{
			ss << "vnt " << vertex.position.x << " " << vertex.position.y << " " << vertex.position.z << " "
				<< vertex.normal.x << " " << vertex.normal.y << " " << vertex.normal.z << " "
				<< vertex.uv.x << " " << vertex.uv.y;

			if (subMesh.hasAnimation)
			{
				ss << " ";

				for (auto i = 0u; i < 4; i++)
				{
					ss << vertex.boneIndices[i] << " ";
				}

				for (auto i = 0u; i < 4; i++)
				{
					ss << vertex.boneWeights[i] << " ";
				}
			}

			ss << endl;
		}

		ss << "i ";

		for (auto& i : subMesh.indices)
		{
			ss << i << " ";
		}
		ss << endl;

		ss << "aabb " << subMesh.aabb.center.x << " " << subMesh.aabb.center.y << " " << subMesh.aabb.center.z << " "
			<< subMesh.aabb.extents.x << " " << subMesh.aabb.extents.y << " " << subMesh.aabb.extents.z << endl;

		ss << endl;

		count++;
	}

	if (skeleton)
	{
		auto frameCount = skeleton->joints[0].animation.size();
		ss << "a " << frameCount << " " << skeleton->joints.size() << endl;

		for (auto i = 0u; i < frameCount; i++)
		{
			ss << "f " << i << endl;

			for (auto q = 0u; q < skeleton->joints.size(); q++)
			{
				auto& m = skeleton->joints[q].animation[i].globalTransform;
				ss << "mat4 ";

				for (auto y = 0u; y < 4; y++)
				for (auto x = 0u; x < 4; x++)
				{
					ss << m.Get(x, y) << " ";
				}

				ss << endl;
			}
		}
	}

	string result = ss.str();
	f.write(result.c_str(), result.size());

	cout << endl << "Conversion finished." << endl << endl;
}

void ProcessFbx(const string& fileName)
{
	FbxManager* manager = FbxManager::Create();
	cout << ">> FBX SDK " << manager->GetVersion() << " <<" << endl;

	FbxScene* scene = ImportFbxScene(fileName, manager);

	if (scene == nullptr)
	{
		return;
	}

	//PrintScene(scene);

	auto meshReader = TraverseFbxScene(scene);

	string outFilename = fileName.substr(0, fileName.find_last_of(".")) + "_fbx.obj2";
	writeOutToFile(meshReader->GetSubMeshes(), outFilename, &meshReader->GetSkeleton());
}

auto main(int argc, char** argv) -> int
{
	if (argc == 1)
	{
		cout << "Usage:" << endl;
		cout << argv[0] << " <.obj>" << endl;
		return -1;
	}

	for (auto i = 1; i < argc; i++)
	{
		string fileName(argv[i]);
		string extension = fileName.substr(fileName.find_last_of(".") + 1);

		if (extension == "fbx")
		{
			cout << "Extension is .fbx, assuming FBX format.." << endl;
			ProcessFbx(fileName);
		}
		else
		{
			cout << "Unrecognized format: " << extension << endl;
		}
	}

	cout << "Press Enter to exit" << endl;
	cin.ignore(numeric_limits<streamsize>::max(), '\n');

	return 0;
}