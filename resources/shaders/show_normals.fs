precision mediump float;
varying vec3 normal_out;
varying vec2 uvs_out;

uniform sampler2D diffuse;

void main()
{
	gl_FragColor = vec4((vec3(1.0) + normal_out) * vec3(0.5), 1.0);
}