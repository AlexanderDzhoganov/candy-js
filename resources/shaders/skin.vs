precision mediump float;

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
uniform mat4 boneMatrices[36];

void main()
{
	mat4 modelViewProj = viewProjection * model;

	mat4 transform = mat4(1.0);
	float weight = 0.0;

	for(int i = 0; i < 4; i++)
	{
		transform += boneMatrices[int(floor(boneIndices[i]))] * boneWeights[i];
		weight += boneWeights[i];
	}

	normal_out = (inverseModelView * vec4(normal, 0)).xyz;
	uvs_out = uvs;
	vec4 dstVertex = transform * vec4(position, 1.0);
	dstVertex /= weight;
	gl_Position = modelViewProj * dstVertex;
}