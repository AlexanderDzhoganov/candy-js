var GridRenderer = function ()
{
	this.name = "GridRenderer";
	this.type = "renderer";

	var program = new Shader 
	(
		ResourceLoader.getContent("wireframe_vertex"),
		ResourceLoader.getContent("wireframe_fragment")
	);

	this.material = new Material("GridMaterial");
	this.material.program = program;

	this.vertices = [];
	this.indices = [];

	this.vertexBuffer = GL.createBuffer();
	this.indexBuffer = GL.createBuffer();

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
		Shader.setActiveProgram(this.material.program);
		Shader.setUniformVec3("wireframeColor", vec3.fromValues(0.2, 0.2, 0.2));
		Shader.setUniformMat4("model", worldModelMatrix);

		GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

		Renderer.drawIndexedLines(this.indices.length, Renderer.VERTEX_FORMAT.PPP);
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

		var step = 8.0;

		for(var x = xStart; x <= xEnd; x += step)
		{
			pushLine(x, y, zStart, x, y, zEnd);
		}

		for(var z = zStart; z <= zEnd; z += step)
		{
			pushLine(xStart, y, z, xEnd, y, z);
		}

		this.vertices = new Float32Array(vertices);
		this.indices = new Uint16Array(indices);

		GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);
		GL.bufferData(GL.ARRAY_BUFFER, this.vertices, GL.STATIC_DRAW);

		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, this.indices, GL.STATIC_DRAW);
	},

});