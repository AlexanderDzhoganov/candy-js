#include <fbxsdk.h>
#include <fbxsdk\fileio\fbxiosettings.h>

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
#include <mutex>
#include <condition_variable>
#include <future>

#include "..\dep\glm\glm.hpp"
#include "..\dep\glm\gtx\quaternion.hpp"
#include "..\dep\Recast\Recast.h"

using namespace std;

#include "..\include\logging.h"
#include "..\include\config.h"

#include "..\include\fbxutil.h"
#include "..\include\fbxelement.h"
#include "..\include\fbxanim.h"
#include "..\include\fbxmesh.h"
#include "..\include\fbxinfo.h"
#include "..\include\fbxscene.h"

#include "..\include\navmesh.h"

#include "..\include\obj2.h"

/*
Command-line options:
--no-file-write - disables writing of the exported mesh (all previous steps will still be performed)
--no-export-animation - disables reading and exporting of animation data
--log=verbose - enables verbose logging
--print-fbx-info - prints information about the FBX file and exits
--no-export-log - disables exporting of conversion log
--include-identity-frame - includes an identity (bind pose) frame at time 0
*/

void ProcessFbx(const string& fileName);

auto main(int argc, char** argv) -> int
{
	if (!Config::Instance().ParseCommandLine(argc, argv))
	{
		return -1;
	}

	const auto& fileName = Config::Instance().GetInputFilename();
	string extension = fileName.substr(fileName.find_last_of(".") + 1);

	if (extension == "fbx")
	{
		LOG("Extension is .fbx, assuming FBX format");
		ProcessFbx(fileName);
	}
	else
	{
		LOG("Unrecognized format: %", extension);
	}

	Log::Instance().Deinitialize();
	return 0;
}

void ProcessFbx(const string& fileName)
{
	FbxManager* manager = FbxManager::Create();
	LOG("FBX SDK %", manager->GetVersion());

	FbxScene* scene = ImportFbxScene(fileName, manager);

	if (scene == nullptr)
	{
		return;
	}

	if (CONFIG_KEY("print-fbx-info", "true"))
	{
		PrintScene(scene);
		return;
	}

	auto meshReader = TraverseFbxScene(scene);

	unique_ptr<NavMesh> navMesh = nullptr;

	if (CONFIG_KEY("build-navmesh", "true"))
	{
		navMesh = make_unique<NavMesh>(meshReader.get());
	}

	if (CONFIG_KEY("no-file-write", "true"))
	{
		return;
	}
	
	OBJ2BinaryWriter writer;
	set<string> materialSet;

	for (auto& submesh : meshReader->GetSubMeshes())
	{
		materialSet.insert(submesh.material);
	}

	vector<string> materials;
	for (auto& m : materialSet)
	{
		materials.push_back(m);
	}

	writer.SetMaterials(materials);
	writer.SetSubMeshes(meshReader->GetSubMeshes());
	
	if (meshReader->GetSkeleton().joints.size() > 0)
	{
		writer.SetSkeleton(meshReader->GetSkeleton());
	}

	if (navMesh)
	{
		writer.SetNavMesh(*navMesh);
	}

	string outFilename = fileName.substr(0, fileName.find_last_of(".")) + "_fbx.obj2b";
	writer.WriteToFile(outFilename);
}