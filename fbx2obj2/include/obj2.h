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
					WriteMatrix(ss, animationTake.second[i][q]);
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
