var Gui = function ()
{
	this.renderingLayer = RENDERING_LAYER.GUI;

	this._canvas = document.createElement('canvas');
	document.body.appendChild(this._canvas);
	this._canvas.width = Renderer.screenWidth;
	this._canvas.height = Renderer.screenHeight;
	this._canvas.style.display = "none";

	this._context = this._canvas.getContext('2d');

	this._context.font="32px Georgia";
	this._context.fillStyle = 'grey';
	this._context.fillText("hello world", 100, 100);
	this._context.stroke();

	var vertexSource = Shader.GetSourceFromHTMLElement("gui-vertex-shader");
	var fragmentSource = Shader.GetSourceFromHTMLElement("gui-fragment-shader");

	this._program = Shader.CreateProgram(vertexSource, fragmentSource);
	this._texture = GL.createTexture();

	GL.bindTexture(GL.TEXTURE_2D, this._texture);
	GL.bindTexture(GL.TEXTURE_2D, this._texture);
	GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE); 
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);

	this.windows = [];
};

Gui.extend(
{
	
});

Gui.prototype.extend(
{

	attachWindow: function (window)
	{
		this.windows.push(window);
	},

	renderSelf: function ()
	{
		this._drawCanvas();

		Shader.ActiveProgram(this._program);
		GL.bindTexture(GL.TEXTURE_2D, this._texture);
		GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, this._canvas);
		Renderer.drawFullscreenQuad();
	},

	getModelMatrix: function ()
	{
		return mat4.create();
	},

	_drawCanvas: function ()
	{
		for(var i = 0; i < this.windows.length; i++)
		{
			var controls = [];

			this.windows[i].drawSelf(
			{

				label: function (message, font)
				{
					controls.push(
					{
						type: "label",
						message: message,
						font: font,
					});
				}

			});

			for(var i = 0; i < controls.length; i++)
			{
				
			}
		}
	},

});