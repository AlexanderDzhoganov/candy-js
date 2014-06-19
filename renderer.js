var GL = null;

var Renderer = 
{

	Initialize : function ()
	{
		this._canvas = document.getElementById("gl-canvas");

		GL = this._canvas.getContext("experimental-webgl");
		GL.viewportWidth = this._canvas.width;
		GL.viewportHeight = this._canvas.height;

		var vertexSource = Shader.GetSourceFromHTMLElement("vertex-shader");
		var fragmentSource = Shader.GetSourceFromHTMLElement("fragment-shader");

		var program = Shader.CreateProgram(vertexSource, fragmentSource);
		if(program)
		{
			GL.useProgram(program);
		}

		var camera = Camera.Create(GL.viewportWidth, GL.viewportHeight, 45, 0.1, 100);
		var cameraMatrix = camera.GetViewProjectionMatrix();

		this.ClearFramebuffer(vec4.fromValues(0, 0, 0, 1));
		this.DrawFullscreenQuad();
	},

	Update : function ()
	{

	},

	DrawFullscreenQuad : function ()
	{
		var texture = Texture.CreateFromURL("test.jpg", function()
		{
			GL.bindTexture(GL.TEXTURE_2D, texture);

			var buffer = GL.createBuffer();
			GL.bindBuffer(GL.ARRAY_BUFFER, buffer);
			GL.bufferData(GL.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0]), GL.STATIC_DRAW);
			GL.enableVertexAttribArray(0);
			GL.vertexAttribPointer(0, 2, GL.FLOAT, false, 0, 0);
			GL.drawArrays(GL.TRIANGLES, 0, 6);
		});	
	},

	ClearFramebuffer : function (color)
	{
		GL.clearColor(color[0], color[1], color[2], color[3]);
		GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
	},

	_canvas : null,

};

// Drawing

