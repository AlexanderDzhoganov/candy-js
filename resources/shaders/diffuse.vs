precision mediump float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uvs;

varying vec3 normal_out;
varying vec2 uvs_out;

uniform mat4 view;
uniform mat4 viewProjection;
uniform mat4 model;
uniform mat4 inverseModelView;

void main()
{
	mat4 modelViewProj = viewProjection * model;
	normal_out = (inverseModelView * vec4(normal, 0)).xyz;
	uvs_out = uvs;
	gl_Position = modelViewProj * vec4(position.xyz, 1.0);
}