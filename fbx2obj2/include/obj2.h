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

inline glm::quat CalculateRotation(const mat4& a)
{
	glm::quat q;
	float trace = a[0][0] + a[1][1] + a[2][2]; // I removed + 1.0f; see discussion with Ethan
	if (trace > 0.0000001)
	{// I changed M_EPSILON to 0
		float s = 0.5f / sqrtf(trace + 1.0f);
		q.w = 0.25f / s;
		q.x = (a[2][1] - a[1][2]) * s;
		q.y = (a[0][2] - a[2][0]) * s;
		q.z = (a[1][0] - a[0][1]) * s;
	}
	else
	{
		if (a[0][0] > a[1][1] && a[0][0] > a[2][2])
		{
			float s = 2.0f * sqrtf(1.0f + a[0][0] - a[1][1] - a[2][2]);
			q.w = (a[2][1] - a[1][2]) / s;
			q.x = 0.25f * s;
			q.y = (a[0][1] + a[1][0]) / s;
			q.z = (a[0][2] + a[2][0]) / s;
		}
		else if (a[1][1] > a[2][2])
		{
			float s = 2.0f * sqrtf(1.0f + a[1][1] - a[0][0] - a[2][2]);
			q.w = (a[0][2] - a[2][0]) / s;
			q.x = (a[0][1] + a[1][0]) / s;
			q.y = 0.25f * s;
			q.z = (a[1][2] + a[2][1]) / s;
		}
		else
		{
			float s = 2.0f * sqrtf(1.0f + a[2][2] - a[0][0] - a[1][1]);
			q.w = (a[1][0] - a[0][1]) / s;
			q.x = (a[0][2] + a[2][0]) / s;
			q.y = (a[1][2] + a[2][1]) / s;
			q.z = 0.25f * s;
		}
	}
	return q;
}

void WriteQuaternionTranslation(stringstream& ss, const FbxAMatrix& matrix)
{
	auto translation = matrix.GetT();
	auto rotation = matrix.GetQ();

	ss << "qt " << rotation[0] << " " << rotation[1] << " " << rotation[2] << " " << rotation[3] << " "
		<< translation[0] << " " << translation[1] << " " << translation[2] << endl;
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
						WriteQuaternionTranslation(ss, animationTake.second[i][q]);
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
