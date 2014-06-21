var Cube = function()
{
    var v =
    [
	    -0.5, -0.5,  0.5,  0.0,  0.0,  1.0, 0.0, 0.0, // front face
	     0.5, -0.5,  0.5,  0.0,  0.0,  1.0, 0.0, 0.0,
	     0.5,  0.5,  0.5,  0.0,  0.0,  1.0, 0.0, 0.0,
	    -0.5,  0.5,  0.5,  0.0,  0.0,  1.0, 0.0, 0.0,
	    -0.5, -0.5, -0.5,  0.0,  0.0, -1.0, 0.0, 0.0, // back face
	     0.5, -0.5, -0.5,  0.0,  0.0, -1.0, 0.0, 0.0,
	     0.5,  0.5, -0.5,  0.0,  0.0, -1.0, 0.0, 0.0,
	    -0.5,  0.5, -0.5,  0.0,  0.0, -1.0, 0.0, 0.0,
	    -0.5, -0.5, -0.5, -1.0,  0.0,  0.0, 0.0, 0.0, // left face
	    -0.5,  0.5, -0.5, -1.0,  0.0,  0.0, 0.0, 0.0,
	    -0.5,  0.5,  0.5, -1.0,  0.0,  0.0, 0.0, 0.0,
	    -0.5, -0.5,  0.5, -1.0,  0.0,  0.0, 0.0, 0.0,
	     0.5, -0.5, -0.5,  1.0,  0.0,  0.0, 0.0, 0.0, // right face
	     0.5,  0.5, -0.5,  1.0,  0.0,  0.0, 0.0, 0.0,
	     0.5,  0.5,  0.5,  1.0,  0.0,  0.0, 0.0, 0.0,
	     0.5, -0.5,  0.5,  1.0,  0.0,  0.0, 0.0, 0.0,
	    -0.5,  0.5, -0.5,  0.0,  1.0,  0.0, 0.0, 0.0, // top face
	     0.5,  0.5, -0.5,  0.0,  1.0,  0.0, 0.0, 0.0,
	     0.5,  0.5,  0.5,  0.0,  1.0,  0.0, 0.0, 0.0,
	    -0.5,  0.5,  0.5,  0.0,  1.0,  0.0, 0.0, 0.0,
	    -0.5, -0.5, -0.5,  0.0, -1.0,  0.0, 0.0, 0.0, // bottom face
	     0.5, -0.5, -0.5,  0.0, -1.0,  0.0, 0.0, 0.0,
	     0.5, -0.5,  0.5,  0.0, -1.0,  0.0, 0.0, 0.0,
	    -0.5, -0.5,  0.5,  0.0, -1.0,  0.0, 0.0, 0.0,
    ];

    this.vertices = new Float32Array(v);

    var i =
    [
	    0, 1, 2, 0, 2, 3, // front
	    4, 6, 5, 4, 7, 6, // back
	    8, 10, 9, 8, 11, 10, // left
	    12, 13, 14, 12, 14, 15, // right
	    16, 18, 17, 16, 19, 18, // top
	    20, 21, 22, 20, 22, 23, // bottom
    ];

    this.indices = new Uint16Array(i);

    this._vertexBuffer = GL.createBuffer();
    this._indexBuffer = GL.createBuffer();
};

Cube.extend(
{
    
});

Cube.prototype.extend(
{

    uploadVertexData: function()
    {
		GL.bindBuffer(GL.ARRAY_BUFFER, this._vertexBuffer);
		GL.bufferData(GL.ARRAY_BUFFER, this.vertices, GL.STATIC_DRAW);

		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, this.indices, GL.STATIC_DRAW);
    },

    renderSelf: function()
    {
		GL.bindBuffer(GL.ARRAY_BUFFER, this._vertexBuffer);
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
		Renderer.drawIndexedTriangles(this.indices.length);
    },

    dispose: function()
    {
		GL.deleteBuffer(this._vertexBuffer);
		GL.deleteBuffer(this._indexBuffer);
    },

    getModelMatrix: function()
    {
		return mat4.create();
    },
    
});