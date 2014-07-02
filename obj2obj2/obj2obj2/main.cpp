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
#include <mutex>
#include <condition_variable>
#include <future>

#include "glm\glm.hpp"

using namespace std;
using namespace glm;

#include "logging.h"
#include "config.h"

#include "fbxutil.h"
#include "fbxelement.h"
#include "fbxanim.h"
#include "fbxmesh.h"
#include "fbxinfo.h"
#include "fbxscene.h"

#include "obj2.h"

/*
Command-line options:
--no-file-write - disables writing of the exported mesh (all previous steps will still be performed)
--no-export-animation - disables reading and exporting of animation data
--log=verbose - enables verbose logging
--print-fbx-info - prints information about the FBX file and exits

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

	cout << "Press Enter to exit" << endl;
	cin.ignore(numeric_limits<streamsize>::max(), '\n');

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

	if (CONFIG_KEY("no-file-write", "true"))
	{
		return;
	}
	
	string outFilename = fileName.substr(0, fileName.find_last_of(".")) + "_fbx.obj2";
	writeOutToFile(meshReader->GetSubMeshes(), outFilename, &meshReader->GetSkeleton());
}