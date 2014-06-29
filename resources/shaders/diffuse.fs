precision mediump float;
varying vec3 normal_out;
varying vec2 uvs_out;
varying vec4 position_out;

uniform sampler2D diffuse;

void main()
{
	float l = length(position_out.xyz);
	vec3 lightDir = -position_out.xyz / l;
	float invSq = 1.0 / sqrt(l);
	gl_FragColor = vec4(texture2D(diffuse, uvs_out).xyz * max(0.0, dot(lightDir, normal_out) * invSq), 1.0);
}