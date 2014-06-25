precision mediump float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uvs;

uniform mat4 view;
uniform mat4 viewProjection;
uniform mat4 model;
uniform mat4 inverseModelView;

void main()
{
	mat4 modelViewProj = viewProjection * model;
	gl_Position = modelViewProj * vec4(position.xyz, 1.0);
}