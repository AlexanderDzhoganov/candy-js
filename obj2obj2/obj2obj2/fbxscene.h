#ifndef __FBXSCENE_H
#define __FBXSCENE_H

FbxScene* ImportFbxScene(const string& fileName, FbxManager* manager);

void TraverseFbxNode(FbxNode* node, vector<FbxMesh*>& meshes, FbxNode*& skeleton);

unique_ptr<FbxMeshReader> TraverseFbxScene(FbxScene* scene);

#endif
