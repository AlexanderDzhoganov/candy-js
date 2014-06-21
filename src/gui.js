var Gui = function (canvas)
{
	this.renderingLayer = RENDERING_LAYER.GUI;

	var vertexSource = Shader.GetSourceFromHTMLElement("gui-vertex-shader");
	var fragmentSource = Shader.GetSourceFromHTMLElement("gui-fragment-shader");

	this._program = Shader.CreateProgram(vertexSource, fragmentSource);
	this._texture = GL.createTexture();
	GL.bindTexture(GL.TEXTURE_2D, this._texture);
	GL.bindTexture(GL.TEXTURE_2D, this._texture);

	GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE); 
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
	
	this._canvas = canvas;
};

Gui.extend(
{
	
});

Gui.prototype.extend(
{

	renderSelf: function ()
	{
		Shader.ActiveProgram(this._program);
		GL.bindTexture(GL.TEXTURE_2D, this._texture);
		GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, this._canvas);
		Renderer.drawFullscreenQuad();
	},

	getModelMatrix: function ()
	{
		return mat4.create();
	},

});