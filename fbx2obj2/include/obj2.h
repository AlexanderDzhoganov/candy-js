#ifndef __OBJ2_H
#define __OBJ2_H

void WriteMatrix(stringstream& ss, const FbxAMatrix& matrix)
{
	ss << "mat4 ";

	for (auto x = 0u; x < 4; x++)
	for (auto y = 0u; y < 4; y++)
	{
		ss << matrix.Get(x, y) << " ";
	}

	ss << endl;
}

void WriteQuaternionTranslation(stringstream& ss, const FbxAMatrix& matrix)
{
	auto translation = matrix.GetT();
	auto rotation = matrix.GetQ();

	ss << "qt " << rotation[0] << " " << rotation[1] << " " << rotation[2] << " " << rotation[3] << " "
		<< translation[0] << " " << translation[1] << " " << translation[2] << endl;
}

void QuatTrans2UDQ(const FbxQuaternion& q0, const FbxVector4& t,
	float dq[2][4])
{
	// non-dual part (just copy q0):
	for (int i = 0; i<4; i++) dq[0][i] = q0[i];
	// dual part:
	dq[1][0] = -0.5*(t[0] * q0[1] + t[1] * q0[2] + t[2] * q0[3]);
	dq[1][1] = 0.5*(t[0] * q0[0] + t[1] * q0[3] - t[2] * q0[2]);
	dq[1][2] = 0.5*(-t[0] * q0[3] + t[1] * q0[0] + t[2] * q0[1]);
	dq[1][3] = 0.5*(t[0] * q0[2] - t[1] * q0[1] + t[2] * q0[0]);
}

void WriteDualQuaternion(stringstream& ss, const FbxAMatrix& matrix)
{
	auto translation = matrix.GetT();
	auto rotation = matrix.GetQ();
	rotation.Normalize();

	float dq[2][4];
	QuatTrans2UDQ(rotation, translation, dq);

	ss << "dq ";

	for (auto x = 0; x < 2; x++)
	{
		for (auto y = 0; y < 4; y++)
		{
			ss << dq[x][y] << " ";
		}
	}

	ss << endl;
}

auto writeOutToFile(const vector<SubMesh>& submeshes, const string& fileName, const Skeleton* skeleton) -> void
{
	fstream f(fileName, ios::out);

	stringstream ss;

	LOG("Writing out to \"%\"", fileName);

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

	if (skeleton && skeleton->animations.size() > 0)
	{
		for (auto& animationTake : skeleton->animations)
		{
			auto frameCount = animationTake.second.size();
			ss << "a \"" << animationTake.first << "\" " << frameCount << " " << skeleton->joints.size() << endl;

			for (auto i = 0u; i < frameCount; i++)
			{
				ss << "f " << i << endl;

				for (auto q = 0u; q < animationTake.second[i].size(); q++)
				{
					if (CONFIG_KEY("export-mat4", "true"))
					{
						WriteMatrix(ss, animationTake.second[i][q]);
					}
					else
					{
						WriteDualQuaternion(ss, animationTake.second[i][q]);
					}
				}
			}
		}

		ss << endl;
	}

	string result = ss.str();
	f.write(result.c_str(), result.size());

	LOG("Conversion finished. Wrote % kbytes.", result.size() / 1024);
}

#endif
