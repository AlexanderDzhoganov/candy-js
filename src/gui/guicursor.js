var GuiCursor = function (resourceName)
{
	this.renderingLayer = RENDERING_LAYER.GUI;
	this.zOrder = 255;
	this.position = vec2.fromValues(0.0, 0.0);
	this.delta = vec2.fromValues(0.0, 0.0);

	this._texture = new Texture(resourceName);

	var vertexSource = Shader.GetSourceFromHTMLElement("gui-textured-quad-vertex-shader");
	var fragmentSource = Shader.GetSourceFromHTMLElement("gui-textured-quad-fragment-shader");
	this._program = Shader.CreateProgram(vertexSource, fragmentSource);

	var pixelStepX = 1.0 / Renderer.screenWidth;
	var pixelStepY = 1.0 / Renderer.screenHeight;

	this.size = vec2.fromValues(64.0, 64.0);
	var sizeX = this.size[0] * pixelStepX;
	var sizeY = this.size[1] * pixelStepY;

	var quad =
	[
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		sizeX, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0,
		sizeX, sizeY, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		sizeX, sizeY, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0,
		0.0, sizeY, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0,
	];
	
	this._vertexBuffer = GL.createBuffer();
	GL.bindBuffer(GL.ARRAY_BUFFER, this._vertexBuffer);
	GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(quad), GL.STREAM_DRAW);

	document.onmousemove = function(e)
	{
		var dx = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
		var dy = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

		this.delta[0] = dx;
		this.delta[1] = dy;

		this.position[0] += dx;
		this.position[1] -= dy;

		if(this.position[0] < 0)
		{
			this.position[0] = 0;
		}
		else if (this.position[0] > Renderer.screenWidth)
		{
			this.position[0] = Renderer.screenWidth;
		}

		if(this.position[1] < 0)
		{
			this.position[1] = 0;
		}
		else if (this.position[1] > Renderer.screenHeight)
		{
			this.position[1] = Renderer.screenHeight;
		}

	}.bind(this);
};

GuiCursor.extend(
{
	
});

GuiCursor.prototype.extend(
{

	renderSelf: function ()
	{
		Shader.ActiveProgram(this._program);

		var positionX = -1.0 + 2.0 * this.position[0] * (1.0 / Renderer.screenWidth);
		var positionY = -1.0 + 2.0 * this.position[1] * (1.0 / Renderer.screenHeight);

		Shader.SetUniformVec2("translation", vec2.fromValues(positionX, positionY));

		this._texture.bind();

		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, null);
		GL.bindBuffer(GL.ARRAY_BUFFER, this._vertexBuffer);

		Renderer.drawTriangles(6);
	},

	getModelMatrix: function ()
	{
		return mat4.create();
	},

	dispose: function ()
	{
		GL.deleteBuffer(this._vertexBuffer);
		this._texture.dispose();
	},

});