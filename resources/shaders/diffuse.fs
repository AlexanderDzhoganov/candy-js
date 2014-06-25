precision mediump float;
varying vec3 normal_out;
varying vec2 uvs_out;

varying vec3 lightPositionOut;

uniform sampler2D texture;

void main()
{
	gl_FragColor = vec4(vec3(1, 0, 1), 1.0);
}