
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
uniform vec boneMatrices[64];

mat3x4 DQToMatrix(vec4 Qn, vec4 Qd)
{	
	mat3x4 M;
	float len2 = dot(Qn, Qn);
	float w = Qn.x, x = Qn.y, y = Qn.z, z = Qn.w;
	float t0 = Qd.x, t1 = Qd.y, t2 = Qd.z, t3 = Qd.w;
		
	M[0][0] = w*w + x*x - y*y - z*z; M[0][1] = 2*x*y - 2*w*z; M[0][2] = 2*x*z + 2*w*y;
	M[1][0] = 2*x*y + 2*w*z; M[1][1] = w*w + y*y - x*x - z*z; M[1][2] = 2*y*z - 2*w*x; 
	M[2][0] = 2*x*z - 2*w*y; M[2][1] = 2*y*z + 2*w*x; M[2][2] = w*w + z*z - x*x - y*y;
	
	M[0][3] = -2*t0*x + 2*w*t1 - 2*t2*z + 2*y*t3;
	M[1][3] = -2*t0*y + 2*t1*z - 2*x*t3 + 2*w*t2;
	M[2][3] = -2*t0*z + 2*x*t2 + 2*w*t3 - 2*t1*y;
	
	M /= len2;
	
	return M;
}

void main()
{
	mat4 modelViewProj = viewProjection * model;
	
	mat2x4 blendDQ = boneWeights.x * boneDQ[int(boneIndices.x)];
	blendDQ += boneWeights.y * boneDQ[int(boneIndices.y)];
	blendDQ += boneWeights.z * boneDQ[int(boneIndices.z)];
	blendDQ += boneWeights.w * boneDQ[int(boneIndices.w)];	

	mat3x4 M = DQToMatrix(blendDQ[0], blendDQ[1]);
	vec3 position = M * vec4(position, 1.0);
	vec3 normal = M * vec4(normal, 0.0);

	normal_out = (inverseModelView * vec4(normal, 0)).xyz;
	uvs_out = uvs;
	gl_Position = modelViewProj * vec4(position, 1.0);
}