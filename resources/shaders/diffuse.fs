precision mediump float;
varying vec3 normal_out;
varying vec2 uvs_out;
varying vec4 position_out;

uniform sampler2D diffuse;

void main()
{
	vec3 lightDir = normalize(-position_out.xyz);
	gl_FragColor = vec4(texture2D(diffuse, uvs_out).xyz * max(0.0, dot(lightDir, normal_out)), 1.0);
}