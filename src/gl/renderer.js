var GL = null;

var Renderer = 
{

	Initialize : function ()
	{
		this._Canvas = document.getElementById("gl-canvas");

		GL = this._Canvas.getContext("experimental-webgl");
		GL.viewportWidth = this._Canvas.width;
		GL.viewportHeight = this._Canvas.height;
		GL.viewport(0, 0, GL.viewportWidth, GL.viewportHeight);
		this._ActiveCamera = Camera.Create(GL.viewportWidth, GL.viewportHeight, 45, 0.1, 100);
		this.ClearFramebuffer(vec4.fromValues(0, 0, 0, 1));
	},

	Update : function ()
	{
		this.ClearFramebuffer(vec4.fromValues(0, 0, 0, 1));
	},

	DrawFullscreenQuad : function ()
	{
		var texture = Texture.CreateFromURL("test.jpg", function()
		{
			var vertexSource = Shader.GetSourceFromHTMLElement("vertex-shader");
			var fragmentSource = Shader.GetSourceFromHTMLElement("fragment-shader");

			var program = Shader.CreateProgram(vertexSource, fragmentSource);
			if(program)
			{
				Shader.ActiveProgram(program);
				Shader.SetUniformMat4("viewProjection", mat4.create());
				Shader.SetUniformMat4("model", mat4.create());
				Shader.SetUniformMat3("inverseView", mat3.create())
			}

			GL.bindTexture(GL.TEXTURE_2D, texture);

			var buffer = GL.createBuffer();
			GL.bindBuffer(GL.ARRAY_BUFFER, buffer);
			GL.bufferData(GL.ARRAY_BUFFER, new Float32Array
			([
				-1.0, -1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
				 1.0, -1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0,
				 1.0,  1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0,
				-1.0, -1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
		   		 1.0,  1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0,
		   		-1.0,  1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0,

			]), GL.STATIC_DRAW);

			var position = GL.getAttribLocation(program, "position");
			var normal = GL.getAttribLocation(program, "normal");
			var uvs = GL.getAttribLocation(program, "uvs");

			GL.enableVertexAttribArray(position);
			GL.enableVertexAttribArray(normal);
			GL.enableVertexAttribArray(uvs);

			GL.vertexAttribPointer(position, 3, GL.FLOAT, false, 32, 0);
			GL.vertexAttribPointer(normal, 3, GL.FLOAT, false, 32, 12);
			GL.vertexAttribPointer(uvs, 2, GL.FLOAT, false, 32, 24);

			GL.drawArrays(GL.TRIANGLES, 0, 6);
		});	
	},

	DrawIndexedTriangleStrip : function (indicesCount)
	{
		GL.enableVertexAttribArray(Shader._ActiveProgram.position);
		GL.enableVertexAttribArray(Shader._ActiveProgram.normal);
		GL.enableVertexAttribArray(Shader._ActiveProgram.uvs);

		GL.vertexAttribPointer(Shader._ActiveProgram.position, 3, GL.FLOAT, false, 32, 0);
		GL.vertexAttribPointer(Shader._ActiveProgram.normal, 3, GL.FLOAT, false, 32, 12);
		GL.vertexAttribPointer(Shader._ActiveProgram.uvs, 2, GL.FLOAT, false, 32, 24);

		GL.drawElements(GL.TRIANGLE_STRIP, indicesCount, GL.UNSIGNED_SHORT, 0);
	},

	ClearFramebuffer : function (color)
	{
		GL.clearColor(color[0], color[1], color[2], color[3]);
		GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
	},

	_Canvas : null,
	_ActiveCamera : null,

};

// Drawing

