var DebugRenderer = function ()
{
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

	clear: function ()
	{
		this._lineVertices = [];
		this._lineIndices = [];
	},

	renderSelf: function ()
	{
		GL.disable(GL.DEPTH_TEST);

		GL.bindBuffer(GL.ARRAY_BUFFER, this._lineVertexBuffer);
		GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this._lineVertices), GL.STREAM_DRAW);

		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this._lineIndexBuffer);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._lineIndices), GL.STREAM_DRAW);

		Shader.setActiveProgram(this._material.program);
		Shader.setUniformVec3("wireframeColor", vec3.fromValues(1, 0, 0));
		Shader.setUniformMat4("model", mat4.create());

		GL.disable(GL.DEPTH_TEST);

		Renderer.drawIndexedLines(this._lineIndices.length, Renderer.VERTEX_FORMAT.PPP);

		//this._lineVertices = [];
		//this._lineIndices = [];

		GL.bindBuffer(GL.ARRAY_BUFFER, null);
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, null);
	},

});