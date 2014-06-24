precision mediump float;

varying vec2 uvsOut;

uniform sampler2D texture;
uniform vec2 windowSize;

void main()
{
	gl_FragColor = vec4(texture2D(texture, uvsOut.xy).xyzw);
}