Renderer = function ()
{
	this.screenWidth = 0;
	this.screenHeight = 0;
	this._Canvas = null;
	this._activeCamera = null;
	this._ViewProjectionMatrix = mat4.create();
	this._ViewMatrix = mat4.create();
	this._InverseModelViewMatrix = mat3.create();

	this._Canvas = document.getElementById("gl-canvas");
	GL = this._Canvas.getContext("experimental-webgl");
	
	this.debug = new DebugRenderer();
	this.renderQueue = new RenderQueue();

	this.screenWidth = window.innerWidth;
	this.screenHeight = window.innerHeight;

	this.frameStats =
	{
		frameTime: 0.0,
		averageFramesPerSecond: 0.0,
		numberOfLinesDrawn: 0,
		numberOfTrianglesDrawn: 0,
	};
};

Renderer.prototype.extend(
{

	VERTEX_FORMAT: 
	{
		PPP: 0,
		PPPTT: 1,
		PPPNNN: 2,
		PPPNNNTT: 3,
		PPPXXXXX: 4,
	},

	PRIMITIVE_TYPE:
	{
		LINES: 0,
		INDEXED_LINES: 1,
		TRIANGLES: 2,
		INDEXED_TRIANGLES: 3,
		INDEXED_TRIANGLE_STRIP: 4,
	},

	doDepthPrepass: function ()
	{
		
	},
		
	doFrame: function ()
	{
		this.clearFramebuffer(vec4.fromValues(0, 0, 0, 1));

		this._ViewMatrix = this._activeCamera.getViewMatrix();

		var inverseView = mat4.create();
		mat4.invert(inverseView, this._ViewMatrix);
		mat4.transpose(inverseView, inverseView);

		this._InverseModelViewMatrix = inverseView;
		this._ViewProjectionMatrix = this._activeCamera.getViewProjectionMatrix();

		this.frameStats.numberOfLinesDrawn = 0;
		this.frameStats.numberOfTrianglesDrawn = 0;

		this.renderQueue.dispatchQueue(true);
	},
		
	setViewport: function ()
	{
		GL.viewport(0, 0, this._activeCamera.width, this._activeCamera.height);
	},
		
	setActiveCamera: function (camera)
	{
		this._activeCamera = camera;
		this.setViewport();
	},
		
	setActiveMaterial: function (material)
	{
		Shader.SetActiveProgram(material.getProgram());

		var textures = material.getTextures();
		for (var i = 0; i < textures.length; i++)
		{
			GL.activeTexture(GL.TEXTURE0 + i);
			GL.bindTexture(GL.TEXTURE_2D, textures[i]);
		}
	},
		
	drawIndexedTriangleStrip: function (indicesCount, vertexFormat)
	{
		this._setupUniforms();
		this._setupVertexPointers(vertexFormat);
		GL.drawElements(GL.TRIANGLE_STRIP, indicesCount, GL.UNSIGNED_SHORT, 0);
		this.frameStats.numberOfTrianglesDrawn += indicesCount / 2;
	},

	drawTriangles: function (count, vertexFormat)
	{
		this._setupUniforms();
		this._setupVertexPointers(vertexFormat);
		GL.drawArrays(GL.TRIANGLES, 0, count);

		this.frameStats.numberOfTrianglesDrawn += count / 3;
	},
		
	drawIndexedTriangles: function (indicesCount, vertexFormat)
	{
		this._setupUniforms();
		this._setupVertexPointers(vertexFormat);
		GL.drawElements(GL.TRIANGLES, indicesCount, GL.UNSIGNED_SHORT, 0);
		this.frameStats.numberOfTrianglesDrawn += indicesCount / 3;
	},

	drawFullscreenQuad: function ()
	{	
		if (!this.fullscreenQuadVertexBuffer)
		{
			var FULLSCREEN_QUAD_VERTICES =
			[
				-1.0, -1.0, 0.0, 0.0,
				1.0, -1.0, 0.0, 0.0,
				1.0, 1.0, 0.0, 0.0, 
				-1.0, -1.0, 0.0, 0.0,
				1.0, 1.0, 0.0, 0.0, 
				-1.0, 1.0, 0.0, 0.0,
			];

			this.fullscreenQuadVertexBuffer = GL.createBuffer();
			GL.bindBuffer(GL.ARRAY_BUFFER, this.fullscreenQuadVertexBuffer);
			GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(FULLSCREEN_QUAD_VERTICES), GL.STATIC_DRAW);
		}

		if (Shader._ActiveProgram)
		{
			Shader.setUniformVec2("windowSize", vec2.fromValues(this.screenWidth, this.screenHeight));
		}

		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, null);
		GL.bindBuffer(GL.ARRAY_BUFFER, this.fullscreenQuadVertexBuffer);
		GL.enableVertexAttribArray(Shader._ActiveProgram.position);
		GL.vertexAttribPointer(0, 4, GL.FLOAT, false, 0, 0);

		GL.drawArrays(GL.TRIANGLES, 0, 6);
		this.frameStats.numberOfTrianglesDrawn += 2;
	},

	drawLines: function (count, vertexFormat)
	{
		if (vertexFormat == undefined)
		{
			vertexFormat = Renderer.VERTEX_FORMAT.PPP;
		}

		this._setupUniforms();
		this._setupVertexPointers(vertexFormat);

		GL.drawArrays(GL.LINES, 0, count);
		this.frameStats.numberOfLinesDrawn += count / 2;
	},

	drawIndexedLines: function (indicesCount, vertexFormat)
	{
		if (vertexFormat == undefined)
		{
			vertexFormat = Renderer.VERTEX_FORMAT.PPP;
		}

		this._setupUniforms();
		this._setupVertexPointers(vertexFormat);
		GL.drawElements(GL.LINES, indicesCount, GL.UNSIGNED_SHORT, 0);
		this.frameStats.numberOfLinesDrawn += indicesCount / 2;
	},

	_setupUniforms: function ()
	{
		if (Shader._ActiveProgram)
		{
			Shader.setUniformMat4("viewProjection", this._ViewProjectionMatrix);
			Shader.setUniformMat4("view", this._ViewMatrix);
			Shader.setUniformMat4("inverseModelView", this._InverseModelViewMatrix);
		}
	},

	_setupVertexPointers: function (vertexFormat)
	{
		GL.disableVertexAttribArray(0);
		GL.disableVertexAttribArray(1);
		GL.disableVertexAttribArray(2);
		GL.disableVertexAttribArray(3);

		if (vertexFormat == Renderer.VERTEX_FORMAT.PPPNNNTT)
		{
			if (Shader._ActiveProgram.position != undefined)
			{
				GL.enableVertexAttribArray(Shader._ActiveProgram.position);
				GL.vertexAttribPointer(Shader._ActiveProgram.position, 3, GL.FLOAT, false, 32, 0);
			}

			if (Shader._ActiveProgram.normal != undefined)
			{
				GL.enableVertexAttribArray(Shader._ActiveProgram.normal);
				GL.vertexAttribPointer(Shader._ActiveProgram.normal, 3, GL.FLOAT, false, 32, 12);
			}

			if (Shader._ActiveProgram.uvs != undefined)
			{
				GL.enableVertexAttribArray(Shader._ActiveProgram.uvs);
				GL.vertexAttribPointer(Shader._ActiveProgram.uvs, 2, GL.FLOAT, false, 32, 24);
			}
		}
		else if (vertexFormat == Renderer.VERTEX_FORMAT.PPPTT)
		{
			if (Shader._ActiveProgram.position != undefined)
			{
				GL.enableVertexAttribArray(Shader._ActiveProgram.position);
				GL.vertexAttribPointer(Shader._ActiveProgram.position, 3, GL.FLOAT, false, 20, 0);
			}

			if (Shader._ActiveProgram.uvs != undefined)
			{
				GL.enableVertexAttribArray(Shader._ActiveProgram.uvs);
				GL.vertexAttribPointer(Shader._ActiveProgram.uvs, 2, GL.FLOAT, false, 20, 12);
			}
		}
		else if (vertexFormat == Renderer.VERTEX_FORMAT.PPP)
		{
			if (Shader._ActiveProgram.position != undefined)
			{
				GL.enableVertexAttribArray(Shader._ActiveProgram.position);
				GL.vertexAttribPointer(Shader._ActiveProgram.position, 3, GL.FLOAT, false, 12, 0);
			}
		}
		else if (vertexFormat == Renderer.VERTEX_FORMAT.PPPXXXXX)
		{
			if (Shader._ActiveProgram.position != undefined)
			{
				GL.enableVertexAttribArray(Shader._ActiveProgram.position);
				GL.vertexAttribPointer(Shader._ActiveProgram.position, 3, GL.FLOAT, false, 32, 0);
			}
		}
		else
		{
			console.log("invalid vertex format - " + vertexFormat);
			return;
		}
	},
		
	clearFramebuffer: function (color)
	{
		GL.clearColor(color[0], color[1], color[2], color[3]);
		GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
	},

});