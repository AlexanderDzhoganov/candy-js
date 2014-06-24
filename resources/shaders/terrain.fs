precision mediump float;
varying vec3 normal_out;
varying vec2 uvs_out;

varying vec3 lightPositionOut;

uniform sampler2D texture;

void main()
{
	vec3 lightDir = lightPositionOut;
	float d = max(dot(normal_out, lightDir), 0.0);

	vec3 color = vec3(texture2D(texture, uvs_out).xyz) * max(d, 0.0);
	gl_FragColor = vec4(color, 1.0);
}