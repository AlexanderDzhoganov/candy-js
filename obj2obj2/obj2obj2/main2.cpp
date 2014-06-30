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

#include "obj2scene.h"
#include "fbxmesh.h"
#include "fbxutil.h"

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
		FbxScene* scene = ImportFbxScene(fileName, manager);
		TraverseFbxScene(scene);
	}
	catch (...)
	{
		return 1;
	}

	cout << "Press Enter to exit" << endl;
	cin.ignore(numeric_limits<streamsize>::max(), '\n');

	return 0;
}