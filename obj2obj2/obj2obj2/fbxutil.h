#ifndef __FBXUTIL_H
#define __FBXUTIL_H

struct ConvertedMesh;

FbxScene* ImportFbxScene(const string& fileName, FbxManager* manager);

void TraverseFbxNode(FbxNode* node, vector<FbxMesh*>& meshes);

vector<ConvertedMesh> TraverseFbxScene(FbxScene* scene);

string EnumToString(FbxLayerElement::EMappingMode mappingMode);

string EnumToString(FbxLayerElement::EReferenceMode referenceMode);

#endif
