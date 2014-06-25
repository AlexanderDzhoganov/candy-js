precision mediump float;

uniform vec3 wireframeColor;

void main()
{
	gl_FragColor = vec4(wireframeColor, 1.0);
}