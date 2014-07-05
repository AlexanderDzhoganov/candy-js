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

void WriteDualQuaternion(stringstream& ss, const FbxAMatrix& matrix)
{
	auto translation = matrix.GetT();
	auto rotation = matrix.GetQ();

	FbxDualQuaternion dQ(rotation, translation);

	ss << "dq ";

	for (auto i = 0; i < 4; i++)
	{
		ss << dQ.GetFirstQuaternion().GetAt(i) << " ";
	}

	for (auto i = 0; i < 4; i++)
	{
		ss << dQ.GetSecondQuaternion().GetAt(i) << " ";
	}

	ss << endl;
}

auto writeOutToFile(const vector<SubMesh>& submeshes, const string& fileName, const Skeleton* skeleton = nullptr, const NavMesh* navmesh = nullptr) -> void
{
	fstream f(fileName, ios::out);

	stringstream ss;

	LOG("Writing out to \"%\"", fileName);

	ss << "flags: ";

	if (skeleton->joints.size() > 0)
	{
		ss << "animated ";

		if (CONFIG_KEY("export-mat4", "true"))
		{
			ss << "anim-store-mat4 ";
		}
		else
		{
			ss << "anim-store-dq ";
		}
	}

	if (navmesh != nullptr)
	{
		ss << "navmesh ";
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

	if (navmesh != nullptr)
	{
		for (auto& vertex : navmesh->GetVertices())
		{
			ss << "nmv " << vertex.x << " " << vertex.y << " " << vertex.z << endl;
		}


		ss << "nmi ";
		for (auto idx : navmesh->GetIndices())
		{
			ss << idx << " ";
		}

		ss << endl;
	}

	string result = ss.str();
	f.write(result.c_str(), result.size());

	LOG("Conversion finished. Wrote % kbytes.", result.size() / 1024);
}

#endif
