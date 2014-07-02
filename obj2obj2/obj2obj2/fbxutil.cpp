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

#include "logging.h"
#include "fbxutil.h"
#include "fbxinfo.h"
#include "fbxanim.h"
#include "fbxmesh.h"
#include "fbxscene.h"

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

string EnumToString(FbxSkeleton::EType type)
{
	switch (type)
	{
		case FbxSkeleton::eRoot:
			return "eRoot";
		case FbxSkeleton::eLimb:
			return "eLimb";
		case FbxSkeleton::eLimbNode:
			return "eLimbNode";
		case FbxSkeleton::eEffector:
			return "eEffector";
	}

	return "undefined";
}
