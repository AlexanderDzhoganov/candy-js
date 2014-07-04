
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uvs;
attribute vec4 boneIndices;
attribute vec4 boneWeights;

varying vec3 normal_out;
varying vec2 uvs_out;

uniform mat4 view;
uniform mat4 viewProjection;
uniform mat4 model;
uniform mat4 inverseModelView;

uniform vec4 DQn[72];
uniform vec4 DQd[72];

mat4 transpose(mat4 m)
{
	mat4 r = mat4(1.0);
	for(int x = 0; x < 4; x++)
	{
		for(int y = 0; y < 4; y++)
		{
			r[y][x] = m[x][y];
		}
	}

	return r;
}

mat4 DQToMatrix(vec4 Qn, vec4 Qd)
{	
	mat4 M = mat4(1.0); // M is actually 3x4
	float len2 = dot(Qn, Qn);

	float x = Qn.x, y = Qn.y, z = Qn.z, w = Qn.w;
	float t0 = Qd.w, t1 = Qd.x, t2 = Qd.y, t3 = Qd.z;
		
	M[0][0] = w * w + x * x - y * y - z * z;
	M[1][0] = 2.0 * x * y + 2.0 * w * z;
	M[2][0] = 2.0 * x * z - 2.0 * w * y;

	M[0][1] = 2.0 * x * y - 2.0 * w * z;
	M[1][1] = w * w + y * y - x * x - z * z;
	M[2][1] = 2.0 * y * z + 2.0 * w * x;

	M[0][2] = 2.0 * x * z + 2.0 * w * y;
	M[1][2] = 2.0 * y * z - 2.0 * w * x; 
	M[2][2] = w * w + z * z - x * x - y * y;
	
	M[0][3] = -2.0 * t0 * x + 2.0 * w * t1 - 2.0 * t2 * z + 2.0 * y * t3;
	M[1][3] = -2.0 * t0 * y + 2.0 * t1 * z - 2.0 * x * t3 + 2.0 * w * t2;
	M[2][3] = -2.0 * t0 * z + 2.0 * x * t2 + 2.0 * w * t3 - 2.0 * t1 * y;
	
	M /= len2;
	
	M[3][0] = 0.0;
	M[3][1] = 0.0;
	M[3][2] = 0.0;
	M[3][3] = 1.0; // mat3x4 -> mat4
	return M;	
}

void main()
{
	mat4 modelViewProj = viewProjection * model;
	
	ivec4 indices = ivec4(boneIndices);

	vec4 blendDQn = boneWeights.x * DQn[indices.x];
	vec4 blendDQd = boneWeights.x * DQd[indices.x];
	blendDQn += boneWeights.y * DQn[indices.y];
	blendDQd += boneWeights.y * DQd[indices.y];
	blendDQn += boneWeights.z * DQn[indices.z];
	blendDQd += boneWeights.z * DQd[indices.z];
	blendDQn += boneWeights.w * DQn[indices.w];
	blendDQd += boneWeights.w * DQd[indices.w];

	mat4 M = transpose(DQToMatrix(blendDQn, blendDQd));

	vec4 position = M * vec4(position, 1.0);
	vec4 normal = M * vec4(normal, 0.0);

	normal_out = (inverseModelView * vec4(normal.xyz, 0)).xyz;
	uvs_out = uvs;
	gl_Position = modelViewProj * vec4(position.xyz, 1.0);
}