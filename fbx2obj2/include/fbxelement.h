#ifndef __FBXELEMENT_H
#define __FBXELEMENT_H

glm::vec3 ReadNormalFromFbxMesh(FbxMesh* mesh, int controlPointIndex, int vertexIndex, int polygonIndex, int normalElementIndex = 0);

glm::vec2 ReadUVFromFbxMesh(FbxMesh* mesh, int controlPointIndex, int vertexIndex, int polygonIndex, int uvElementIndex = 0);

size_t ReadMaterialFromFbxMesh(FbxMesh* mesh, int controlPointIndex, int polygonIndex, int materialElementIndex = 0);

#endif
