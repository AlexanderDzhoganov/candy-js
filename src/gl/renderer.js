var GL = null;

var Renderer = 
{

	lightPos : vec3.create(),
	lightD : 0.0,

	screenWidth : 0,

	screenHeight : 0,

	Initialize : function ()
	{
		this._Canvas = document.getElementById("gl-canvas");
		GL = this._Canvas.getContext("experimental-webgl");
		
		this.screenWidth = this._Canvas.width;
		this.screenHeight = this._Canvas.height;

		GL.enable(GL.DEPTH_TEST);
		GL.enable(GL.CULL_FACE);
	},

	Update : function ()
	{
		this.ClearFramebuffer(vec4.fromValues(0, 0, 0, 1));

		this.lightPos[0] = Math.sin(this.lightD) * 3.0;
		this.lightPos[1] = 1;
		this.lightPos[2] = Math.cos(this.lightD) * 3.0;

		this.lightD += Math.random() * 0.01;

		this._ViewMatrix = this._ActiveCamera.getViewMatrix();
		this._InverseViewMatrix = this._ActiveCamera.getNormalMatrix();
		this._ViewProjectionMatrix = this._ActiveCamera.getViewProjectionMatrix();
	},

	SetViewport : function()
	{
		GL.viewport(0, 0, this._ActiveCamera.width, this._ActiveCamera.height);
	},

	SetActiveCamera : function(camera)
	{
		this._ActiveCamera = camera;
		this.SetViewport();
	},

	/*DrawFullscreenQuad : function ()
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
	},*/

	DrawIndexedTriangleStrip : function (indicesCount)
	{
		if(Shader._ActiveProgram)
		{
			Shader.SetUniformMat4("viewProjection", this._ViewProjectionMatrix);
		}

		GL.enableVertexAttribArray(Shader._ActiveProgram.position);
		GL.enableVertexAttribArray(Shader._ActiveProgram.normal);
		GL.enableVertexAttribArray(Shader._ActiveProgram.uvs);

		GL.vertexAttribPointer(Shader._ActiveProgram.position, 3, GL.FLOAT, false, 32, 0);
		GL.vertexAttribPointer(Shader._ActiveProgram.normal, 3, GL.FLOAT, false, 32, 12);
		GL.vertexAttribPointer(Shader._ActiveProgram.uvs, 2, GL.FLOAT, false, 32, 24);

		GL.drawElements(GL.TRIANGLE_STRIP, indicesCount, GL.UNSIGNED_SHORT, 0);
	},

	DrawIndexedTriangles : function (indicesCount)
	{
		if(Shader._ActiveProgram)
		{
			Shader.SetUniformMat4("viewProjection", this._ViewProjectionMatrix);
			Shader.SetUniformMat4("view", this._ViewMatrix);
			Shader.SetUniformMat4("inverseView", this._InverseViewMatrix);
			Shader.SetUniformVec3("lightPosition", this.lightPos)
		}

		GL.enableVertexAttribArray(Shader._ActiveProgram.position);
		GL.enableVertexAttribArray(Shader._ActiveProgram.normal);
		GL.enableVertexAttribArray(Shader._ActiveProgram.uvs);

		GL.vertexAttribPointer(Shader._ActiveProgram.position, 3, GL.FLOAT, false, 32, 0);
		GL.vertexAttribPointer(Shader._ActiveProgram.normal, 3, GL.FLOAT, false, 32, 12);
		GL.vertexAttribPointer(Shader._ActiveProgram.uvs, 2, GL.FLOAT, false, 32, 24);

		GL.drawElements(GL.TRIANGLES, indicesCount, GL.UNSIGNED_SHORT, 0);
	},

	ClearFramebuffer : function (color)
	{
		GL.clearColor(color[0], color[1], color[2], color[3]);
		GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
	},

	_Canvas : null,

	_ActiveCamera : null,

	_ViewProjectionMatrix : mat4.create(),

	_ViewMatrix : mat4.create(),

	_InverseViewMatrix : mat3.create(),

};

// Drawing

