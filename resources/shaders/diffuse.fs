precision mediump float;

varying vec3 normal_out;
varying vec2 uvs_out;

uniform sampler2D diffuse;

void main()
{
	gl_FragColor = vec4(texture2D(diffuse, uvs_out).xyz, 1.0);
}