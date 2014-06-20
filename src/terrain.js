var Terrain =
{

	CreateFromHeightmap : function (data, size_x, size_y)
	{
		var vertexCount = size_x * size_y;
		var vertices = new Float32Array(vertexCount * 8);

		for (var x = 0; x < size_x; x++)
		{
			for (var y = 0; y < size_y; y++)
			{
				var vertexIndex = x + y * size_x;
				vertices[vertexIndex * 8 + 0] = x; // position_x
				vertices[vertexIndex * 8 + 1] = y; // position_y
				vertices[vertexIndex * 8 + 2] = data[vertexIndex] / 255; // position_z
				vertices[vertexIndex * 8 + 3] = 0; // normal_x
				vertices[vertexIndex * 8 + 4] = 1; // normal_y
				vertices[vertexIndex * 8 + 5] = 0; // normal_z
				vertices[vertexIndex * 8 + 6] = 0; // uv_s	
				vertices[vertexIndex * 8 + 7] = 0; // uv_t
			}
		}

		var indicesCount = (size_x * 2) * (size_y - 1) + (size_y - 2);
		var indices = new Uint16Array(indicesCount);

		var index = 0;
		for (var z = 0; z < size_y - 1; z++)
		{
			if (z % 2 == 0)
			{
				var x;
				for (x = 0; x < size_x; x++)
				{
					indices[index++] = x + (z * size_x);
					indices[index++] = x + (z * size_x) + size_x;
				}
				
				if(z != size_y - 2)
				{
					indices[index++] = --x + (z * size_x);
				}
			}
			else
			{
				var x;
				for (x = size_x - 1; x >= 0; x--)
				{
					indices[index++] = x + (z * size_x);
					indices[index++] = x + (z * size_x) + size_x;
				}

				if(z != size_y - 2)
				{
					indices[index++] = ++x + (z * size_x);
				}
			}
		}

		return {
			vertices: vertices,

			indices: indices,

			size_x: size_x,

			size_y: size_y,
		
			_vertexBuffer : null,

			_indexBuffer : null,

			renderSelf : function ()
			{
				if(!this._vertexBuffer)
				{
					this._vertexBuffer = GL.createBuffer();
					GL.bindBuffer(GL.ARRAY_BUFFER, this._vertexBuffer);
					GL.bufferData(GL.ARRAY_BUFFER, this.vertices, GL.STATIC_DRAW);

					this._indexBuffer = GL.createBuffer();
					GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
					GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, indices, GL.STATIC_DRAW);
				}
				else
				{
					GL.bindBuffer(GL.ARRAY_BUFFER, this._vertexBuffer);
					GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
				}

				Renderer.DrawIndexedTriangleStrip();
			}
		};
	},

}
