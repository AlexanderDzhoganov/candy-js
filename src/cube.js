var Cube = 
{

	Create : function()
	{
		var v =
		[
			-0.5, -0.5,  0.5, 0.0, 0.0, 0.0, 0.0, 0.0,
			 0.5, -0.5,  0.5, 0.0, 0.0, 0.0, 0.0, 0.0,
			 0.5,  0.5,  0.5, 0.0, 0.0, 0.0, 0.0, 0.0,
			-0.5,  0.5,  0.5, 0.0, 0.0, 0.0, 0.0, 0.0,
			-0.5, -0.5, -0.5, 0.0, 0.0, 0.0, 0.0, 0.0,
			 0.5, -0.5, -0.5, 0.0, 0.0, 0.0, 0.0, 0.0,
			 0.5,  0.5, -0.5, 0.0, 0.0, 0.0, 0.0, 0.0,
			-0.5,  0.5, -0.5, 0.0, 0.0, 0.0, 0.0, 0.0
		];

		var vertices = new Float32Array(v);

		var i =
		[
			0, 1, 2, 0, 2, 3, // front
			4, 6, 5, 4, 7, 6, // back
			4, 0, 7, 0, 3, 7, // left
			1, 5, 6, 1, 6, 2, // right
			3, 6, 7, 3, 2, 6, // top
			0, 4, 5, 0, 5, 1, // bottom
		];

		var indices = new Uint16Array(i);

		return {

			vertices: vertices,

			indices: indices,
		
			_vertexBuffer : GL.createBuffer(),

			_indexBuffer : GL.createBuffer(),

			uploadVertexData : function ()
			{
				GL.bindBuffer(GL.ARRAY_BUFFER, this._vertexBuffer);
				GL.bufferData(GL.ARRAY_BUFFER, this.vertices, GL.STATIC_DRAW);

				GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
				GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, this.indices, GL.STATIC_DRAW);
			},

			renderSelf : function ()
			{
				GL.bindBuffer(GL.ARRAY_BUFFER, this._vertexBuffer);
				GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
				Renderer.DrawIndexedTriangles(indices.length);
			},

			dispose : function()
			{
				GL.deleteBuffer(this._vertexBuffer);
				GL.deleteBuffer(this._indexBuffer);
			},

		};
	},

};