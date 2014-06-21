var FULLSCREEN_QUAD_VERTICES =
[
	-1.0, -1.0,
	1.0, -1.0,
	1.0, 1.0,
	-1.0, 1.0
];

var FULLSCREEN_QUAD_INDICES =
[
	0, 1, 2,
	0, 2, 3
];

var Renderer = function()
{
	this.lightPos = vec3.create();
	this.lightD = 0.0;
	this.screenWidth = 0;
	this.screenHeight = 0;
	this._Canvas = null;
	this._activeCamera = null;
	this._ViewProjectionMatrix = mat4.create();
	this._ViewMatrix = mat4.create();
	this._InverseModelViewMatrix = mat3.create();

	this._Canvas = document.getElementById("gl-canvas");
	GL = this._Canvas.getContext("experimental-webgl");

	this.screenWidth = window.innerWidth;
	this.screenHeight = window.innerHeight ;

	GL.enable(GL.DEPTH_TEST);
	GL.enable(GL.CULL_FACE);

	this.fullscreenQuad =
	{
		vertices: new Float32Array(FULLSCREEN_QUAD_VERTICES),
		indices: new Float32Array(FULLSCREEN_QUAD_INDICES),
		vertexBuffer: GL.createBuffer(),
		indexBuffer: GL.createBuffer(),
	};

	GL.bindBuffer(GL.ARRAY_BUFFER, this.fullscreenQuad.vertexBuffer);
	GL.bufferData(GL.ARRAY_BUFFER, this.fullscreenQuad.vertices, GL.STATIC_DRAW);

	GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.fullscreenQuad.indexBuffer);
	GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, this.fullscreenQuad.indices, GL.STATIC_DRAW);

	this.init();
};

Renderer.extend(
{
	
});

Renderer.prototype.extend(
{
	
	init: function ()
	{
		
	},
		
	beginFrame: function ()
	{
		this.clearFramebuffer(vec4.fromValues(0, 0, 0, 1));

		this.lightPos[0] = Math.sin(this.lightD) * 3.0;
		this.lightPos[1] = 1;
		this.lightPos[2] = Math.cos(this.lightD) * 3.0;

		this.lightD += Math.random() * 0.01;

		this._ViewMatrix = this._activeCamera.getViewMatrix();

		var inverseView = mat4.create();
		mat4.invert(inverseView, this._ViewMatrix);
		mat4.transpose(inverseView, inverseView);

		this._InverseModelViewMatrix = inverseView;
		this._ViewProjectionMatrix = this._activeCamera.getViewProjectionMatrix();
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
		
	drawIndexedTriangleStrip: function (indicesCount)
	{
		if (Shader._ActiveProgram)
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
		
	drawIndexedTriangles: function (indicesCount)
	{
		if (Shader._ActiveProgram)
		{
			Shader.SetUniformMat4("viewProjection", this._ViewProjectionMatrix);
			Shader.SetUniformMat4("model", mat4.create());
			Shader.SetUniformMat4("view", this._ViewMatrix);
			Shader.SetUniformMat4("inverseModelView", this._InverseModelViewMatrix);
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

	drawFullscreenQuad: function ()
	{
		GL.enableVertexAttribArray(Shader._ActiveProgram.position);
		GL.vertexAttribPointer(Shader._ActiveProgram.position, 2, GL.FLOAT, false, 8, 0);
		GL.bindBuffer(GL.ARRAY_BUFFER, this.fullscreenQuad.vertexBuffer);
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.fullscreenQuad.indexBuffer);
		GL.drawElements(GL.TRIANGLES, 6, GL.UNSIGNED_SHORT, 0);
	},
		
	clearFramebuffer: function (color)
	{
		GL.clearColor(color[0], color[1], color[2], color[3]);
		GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
	}

});