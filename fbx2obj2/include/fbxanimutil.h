#ifndef __FBXANIMUTIL_H
#define __FBXANIMUTIL_H

// Get the geometry offset to a node. It is never inherited by the children.
FbxAMatrix GetGeometry(FbxNode* pNode)
{
	const FbxVector4 lT = pNode->GetGeometricTranslation(FbxNode::eSourcePivot);
	const FbxVector4 lR = pNode->GetGeometricRotation(FbxNode::eSourcePivot);
	const FbxVector4 lS = pNode->GetGeometricScaling(FbxNode::eSourcePivot);
	return FbxAMatrix(lT, lR, lS);
}

// Get the matrix of the given pose
FbxAMatrix GetPoseMatrix(FbxPose* pPose, int pNodeIndex)
{
	FbxAMatrix lPoseMatrix;
	FbxMatrix lMatrix = pPose->GetMatrix(pNodeIndex);

	memcpy((double*)lPoseMatrix, (double*)lMatrix, sizeof(lMatrix.mData));

	return lPoseMatrix;
}

FbxAMatrix GetGlobalPosition(FbxNode* pNode, const FbxTime& pTime, FbxPose* pPose, FbxAMatrix* pParentGlobalPosition = nullptr)
{
	FbxAMatrix lGlobalPosition;
	bool lPositionFound = false;

	if (pPose)
	{
		int lNodeIndex = pPose->Find(pNode);

		if (lNodeIndex > -1)
		{
			if (pPose->IsBindPose() || !pPose->IsLocalMatrix(lNodeIndex))
			{
				lGlobalPosition = GetPoseMatrix(pPose, lNodeIndex);
			}
			else
			{
				FbxAMatrix lParentGlobalPosition;

				if (pParentGlobalPosition)
				{
					lParentGlobalPosition = *pParentGlobalPosition;
				}
				else
				{
					if (pNode->GetParent())
					{
						lParentGlobalPosition = GetGlobalPosition(pNode->GetParent(), pTime, pPose);
					}
				}

				FbxAMatrix lLocalPosition = GetPoseMatrix(pPose, lNodeIndex);
				lGlobalPosition = lParentGlobalPosition * lLocalPosition;
			}

			lPositionFound = true;
		}
	}

	if (!lPositionFound)
	{
		lGlobalPosition = pNode->EvaluateGlobalTransform(pTime);
	}

	return lGlobalPosition;
}

FbxAMatrix ComputeClusterDeformation(FbxAMatrix& pGlobalPosition, FbxMesh* pMesh, FbxCluster* pCluster, FbxTime pTime, FbxPose* pPose)
{
	FbxCluster::ELinkMode lClusterMode = pCluster->GetLinkMode();

	if (lClusterMode == FbxCluster::eAdditive && pCluster->GetAssociateModel())
	{
		FbxAMatrix lAssociateGlobalInitPosition;
		pCluster->GetTransformAssociateModelMatrix(lAssociateGlobalInitPosition);

		// Geometric transform of the model
		lAssociateGlobalInitPosition *= GetGeometry(pCluster->GetAssociateModel());
		auto lAssociateGlobalCurrentPosition = GetGlobalPosition(pCluster->GetAssociateModel(), pTime, pPose);

		FbxAMatrix lReferenceGlobalInitPosition;
		pCluster->GetTransformMatrix(lReferenceGlobalInitPosition);

		// Multiply lReferenceGlobalInitPosition by Geometric Transformation
		lReferenceGlobalInitPosition *= GetGeometry(pMesh->GetNode());
		auto lReferenceGlobalCurrentPosition = pGlobalPosition;

		// Get the link initial global position and the link current global position.
		FbxAMatrix lClusterGlobalInitPosition;
		pCluster->GetTransformLinkMatrix(lClusterGlobalInitPosition);

		// Multiply lClusterGlobalInitPosition by Geometric Transformation
		lClusterGlobalInitPosition *= GetGeometry(pCluster->GetLink());
		auto lClusterGlobalCurrentPosition = GetGlobalPosition(pCluster->GetLink(), pTime, pPose);

		// Compute the shift of the link relative to the reference.
		//ModelM-1 * AssoM * AssoGX-1 * LinkGX * LinkM-1*ModelM
		return lReferenceGlobalInitPosition.Inverse() * lAssociateGlobalInitPosition * lAssociateGlobalCurrentPosition.Inverse() *
			lClusterGlobalCurrentPosition * lClusterGlobalInitPosition.Inverse() * lReferenceGlobalInitPosition;
	}
	else
	{
		FbxAMatrix lReferenceGlobalInitPosition;
		pCluster->GetTransformMatrix(lReferenceGlobalInitPosition);

		auto lReferenceGlobalCurrentPosition = pGlobalPosition;

		// Multiply lReferenceGlobalInitPosition by Geometric Transformation
		lReferenceGlobalInitPosition *= GetGeometry(pMesh->GetNode());

		// Get the link initial global position and the link current global position.
		FbxAMatrix lClusterGlobalInitPosition;
		pCluster->GetTransformLinkMatrix(lClusterGlobalInitPosition);
		auto lClusterGlobalCurrentPosition = GetGlobalPosition(pCluster->GetLink(), pTime, pPose);

		// Compute the initial position of the link relative to the reference.
		auto lClusterRelativeInitPosition = lClusterGlobalInitPosition.Inverse() * lReferenceGlobalInitPosition;

		// Compute the current position of the link relative to the reference.
		auto lClusterRelativeCurrentPositionInverse = lReferenceGlobalCurrentPosition.Inverse() * lClusterGlobalCurrentPosition;

		// Compute the shift of the link relative to the reference.
		return lClusterRelativeCurrentPositionInverse * lClusterRelativeInitPosition;
	}
}

#endif