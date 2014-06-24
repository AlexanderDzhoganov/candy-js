precision mediump float;

uniform sampler2D texture;
uniform vec2 windowSize;

void main()
{
	gl_FragColor = vec4(texture2D(texture, gl_FragCoord.xy / windowSize).xyzw);
}