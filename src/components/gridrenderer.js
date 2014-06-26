var GridRenderer = function ()
{
	this.name = "GridRenderer";
	this.type = "renderer";

	this.size = 4.0;
	this.lineColor = vec3.fromValues(0.2, 0.2, 0.2);

	var program = new Shader 
	(
		ResourceLoader.getContent("wireframe_vertex"),
		ResourceLoader.getContent("wireframe_fragment")
	);

	this._material = new Material("GridMaterial");
	this._material.program = program;

	this._vertices = [];
	this._indices = [];

	this._vertexBuffer = GL.createBuffer();
	this._indexBuffer = GL.createBuffer();

	this._setupMesh();
};

GridRenderer.prototype = new Component();

GridRenderer.extend(
{

});

GridRenderer.prototype.extend(
{

	onRender: function (worldModelMatrix)
	{
		Shader.setActiveProgram(this._material.program);
		Shader.setUniformVec3("wireframeColor", this.lineColor);
		Shader.setUniformMat4("model", worldModelMatrix);

		GL.bindBuffer(GL.ARRAY_BUFFER, this._vertexBuffer);
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this._indexBuffer);

		Renderer.drawIndexedLines(this._indices.length, Renderer.VERTEX_FORMAT.PPP);
	},

	_setupMesh: function ()
	{
		var vertices = [];
		var indices = [];
		var idx = 0;

		var pushLine = function (x0, y0, z0, x1, y1, z1)
		{
			vertices.push(x0);
			vertices.push(y0);
			vertices.push(z0);

			indices.push(idx++);

			vertices.push(x1);
			vertices.push(y1);
			vertices.push(z1);

			indices.push(idx++);
		}.bind(this);

		var xStart = -100.0;
		var xEnd = 100.0;

		var y = 0.0;
		var zStart = -100.0;
		var zEnd = 100.0;

		var step = this.size;

		for(var x = xStart; x <= xEnd; x += step)
		{
			pushLine(x, y, zStart, x, y, zEnd);
		}

		for(var z = zStart; z <= zEnd; z += step)
		{
			pushLine(xStart, y, z, xEnd, y, z);
		}

		this._vertices = new Float32Array(vertices);
		this._indices = new Uint16Array(indices);

		GL.bindBuffer(GL.ARRAY_BUFFER, this._vertexBuffer);
		GL.bufferData(GL.ARRAY_BUFFER, this._vertices, GL.STATIC_DRAW);

		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, this._indices, GL.STATIC_DRAW);
	},

});