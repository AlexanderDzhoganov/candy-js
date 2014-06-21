var Gui = function ()
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

	this._canvas = document.createElement('canvas');
	document.body.appendChild(this._canvas);
	this._canvas.width = Renderer.screenWidth;
	this._canvas.height = Renderer.screenHeight;
	this._canvas.style.display = "none";

	this._context = this._canvas.getContext('2d');
	this._context.rect(20,20,150,100);
	this._context.stroke();
};

Gui.extend(
{
	
});

Gui.prototype.extend(
{

	renderSelf: function ()
	{
		//Shader.ActiveProgram(this._program);
		//GL.bindTexture(GL.TEXTURE_2D, this._texture);
		//GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, this._canvas);
		//Renderer.drawFullscreenQuad();
	},

	getModelMatrix: function ()
	{
		return mat4.create();
	},

});