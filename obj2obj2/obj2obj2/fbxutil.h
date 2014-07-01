#ifndef __FBXUTIL_H
#define __FBXUTIL_H

struct ConvertedMesh;
struct Skeleton;

FbxScene* ImportFbxScene(const string& fileName, FbxManager* manager);

void TraverseFbxNode(FbxNode* node, vector<FbxMesh*>& meshes, FbxNode*& skeleton);

pair<ConvertedMesh, Skeleton> TraverseFbxScene(FbxScene* scene);

string EnumToString(FbxLayerElement::EMappingMode mappingMode);

string EnumToString(FbxLayerElement::EReferenceMode referenceMode);

string EnumToString(FbxNodeAttribute::EType type);

#endif
