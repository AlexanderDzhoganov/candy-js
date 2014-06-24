precision mediump float;

attribute vec3 position;
attribute vec2 uvs;

varying vec2 uvsOut;

uniform vec2 translation;

void main()
{
	uvsOut = uvs;
	gl_Position = vec4(translation + position.xy, 0, 1);
}