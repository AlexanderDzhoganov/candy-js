precision mediump float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uvs;
attribute vec4 boneWeights;
attribute vec4 boneIndices;

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
	vec4 final = vec4(0.0);

	mat4 transform = boneMatrices[int(boneIndices[0])] * boneWeights[0];
	transform += boneMatrices[int(boneIndices[1])] * boneWeights[1];
	transform += boneMatrices[int(boneIndices[2])] * boneWeights[2];

	float finalWeight = 1.0 - (boneWeights[0] + boneWeights[1] + boneWeights[2]);

	transform += boneMatrices[int(boneIndices[3])] * finalWeight;

	final = transform * vec4(position, 1.0);

	normal_out = (inverseModelView * vec4(normal, 0)).xyz;
	uvs_out = uvs;
	gl_Position = modelViewProj * final;
}