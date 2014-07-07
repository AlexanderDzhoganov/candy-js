DebugRenderer = function ()
{
	this.disableClear = true;

	this._lineVertices = [];
	this._lineIndices = [];

	this._lineVertexBuffer = GL.createBuffer();
	this._lineIndexBuffer = GL.createBuffer();

	var program = new Shader 
	(
		ResourceLoader.getContent("wireframe_vertex"),
		ResourceLoader.getContent("wireframe_fragment")
	);

	this._material = new Material("GridMaterial");
	this._material.program = program;

	InputController.add(InputController.keys.C, InputController.modes.DOWN, function (key)
	{
	 	this.clear();
	}.bind(this));

	this.useDepth = true;
	InputController.add(InputController.keys.Z, InputController.modes.DOWN, function (key)
	{
	 	this.useDepth = !this.useDepth;
	}.bind(this));
};

DebugRenderer.extend(
{
	
});

DebugRenderer.prototype.extend(
{

	dispose: function ()
	{
		GL.deleteBuffer(this._lineIndexBuffer);
		GL.deleteBuffer(this._lineVertexBuffer);
	},

	drawLine: function (start, end)
	{
		var pushVertex = function (v)
		{
			this._lineVertices.push(v[0]);
			this._lineVertices.push(v[1]);
			this._lineVertices.push(v[2]);
		}.bind(this);

		pushVertex(start);
		pushVertex(end);

		this._lineIndices.push((this._lineVertices.length / 3) - 2);
		this._lineIndices.push((this._lineVertices.length / 3) - 1);
	},

	drawAABB: function (center, extents)
	{
		var pushVertex = function (x0, y0, z0)
		{
			this._lineVertices.push(x0);
			this._lineVertices.push(y0);
			this._lineVertices.push(z0);
		}.bind(this);

		var index = this._lineVertices.length / 3;

		var topLeft = vec3.create();
		vec3.subtract(topLeft, center, extents);

		var bottomRight = vec3.create();
		vec3.add(bottomRight, center, extents);

		pushVertex(topLeft[0], topLeft[1], topLeft[2]);
		pushVertex(topLeft[0], bottomRight[1], topLeft[2]);
		pushVertex(bottomRight[0], bottomRight[1], topLeft[2]);
		pushVertex(bottomRight[0], topLeft[1], topLeft[2]);

		pushVertex(topLeft[0], topLeft[1], bottomRight[2]);
		pushVertex(topLeft[0], bottomRight[1], bottomRight[2]);
		pushVertex(bottomRight[0], bottomRight[1], bottomRight[2]);
		pushVertex(bottomRight[0], topLeft[1], bottomRight[2]);

		var indices = 
		[
			index + 0, index + 1, index + 1, index + 2, index + 2, index + 3, index + 3, index + 0, // back
			index + 4, index + 5, index + 5, index + 6, index + 6, index + 7, index + 7, index + 4, // front
			index + 0, index + 4, index + 1, index + 5, index + 2, index +6, index + 3, index + 7 // sides
		];

		for(var i = 0; i < indices.length; i++)
		{
			this._lineIndices.push(indices[i]);
		}
	},

	drawCube: function (center, sideSize)
	{
		this.drawAABB(center, vec3.fromValues(sideSize * 0.5, sideSize * 0.5, sideSize * 0.5));
	},

	clear: function ()
	{
		this._lineVertices = [];
		this._lineIndices = [];
	},

	renderSelf: function ()
	{
		if(this.useDepth)
		{
			GL.enable(GL.DEPTH_TEST);
		}
		else
		{
			GL.disable(GL.DEPTH_TEST);
		}
		//GL.enable(GL.DEPTH_TEST);

		GL.bindBuffer(GL.ARRAY_BUFFER, this._lineVertexBuffer);
		GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this._lineVertices), GL.STREAM_DRAW);

		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this._lineIndexBuffer);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._lineIndices), GL.STREAM_DRAW);

		Shader.setActiveProgram(this._material.program);
		
		Shader.setUniformVec3("wireframeColor", vec3.fromValues(1, 0, 0));
		Shader.setUniformMat4("model", mat4.create());

		//GL.disable(GL.DEPTH_TEST);

		Renderer.drawIndexedLines(this._lineIndices.length, Renderer.VERTEX_FORMAT.PPP);

		if(!this.disableClear)
		{
			this._lineVertices = [];
			this._lineIndices = [];
		}
		
		GL.bindBuffer(GL.ARRAY_BUFFER, null);
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, null);

		GL.enable(GL.DEPTH_TEST);
	},

});