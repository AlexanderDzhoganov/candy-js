include ([ "image" ], function ()
{

	TerrainMeshProvider = function (data, size_x, size_y)
	{

		this.name = "TerrainMeshProvider";
		this.type = "meshProvider";

		var vertexCount = size_x * size_y;
		var vertices = new Float32Array(vertexCount * 8);

		for (var x = 0; x < size_x; x++)
		{
			for (var y = 0; y < size_y; y++)
			{
				var hL = data[(x - 1) + y * size_x] / 255.0;
				var hR = data[(x + 1) + y * size_x] / 255.0;
				var hD = data[x + (y - 1) * size_x] / 255.0;
				var hU = data[x + (y + 1) * size_x] / 255.0;

				var normal = vec3.create();
				if (hL && hR && hD && hU)
				{
					normal[0] = hL - hR;
					normal[1] = hD - hU;
					normal[2] = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
					vec3.normalize(normal, normal);
				}
				else
				{
					normal = vec3.fromValues(0, 1, 0);
				}
				
				var vertexIndex = x + y * size_x;
				vertices[vertexIndex * 8 + 0] = x; // position_x
				vertices[vertexIndex * 8 + 1] = 16 * (data[vertexIndex] / 255); // position_y
				vertices[vertexIndex * 8 + 2] = y; // position_z
				vertices[vertexIndex * 8 + 3] = normal[0]; // normal_x
				vertices[vertexIndex * 8 + 4] = normal[1]; // normal_y
				vertices[vertexIndex * 8 + 5] = normal[2]; // normal_z
				vertices[vertexIndex * 8 + 6] = x % 2; // uv_s	
				vertices[vertexIndex * 8 + 7] = y % 2; // uv_t
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

				if (z != size_y - 2)
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

				if (z != size_y - 2)
				{
					indices[index++] = ++x + (z * size_x);
				}
			}
		}

		this.size_x = size_x;
		this.size_y = size_y;

		this.submeshes =
		[
			{
				vertices: vertices,
				indices: indices,
				vertexBuffer: GL.createBuffer(),
				indexBuffer: GL.createBuffer(),
				primitiveType: Renderer.PRIMITIVE_TYPE.INDEXED_TRIANGLE_STRIP,
				vertexFormat: Renderer.VERTEX_FORMAT.PPPNNNTT,
			},
		];

		this._uploadVertexData();
	};

	TerrainMeshProvider.prototype = new Component();

	TerrainMeshProvider.extend(
	{
		
	});

	TerrainMeshProvider.prototype.extend(
	{

		dispose: function ()
		{
			for (var i = 0; i < this.submeshes.length; i++)
			{
				var subMesh = this.submeshes[i];

				GL.deleteBuffer(subMesh.vertexBuffer);
				GL.deleteBuffer(subMesh.indexBuffer);
			}
		},

		_uploadVertexData: function ()
		{
			for (var i = 0; i < this.submeshes.length; i++)
			{
				var subMesh = this.submeshes[i];

				GL.bindBuffer(GL.ARRAY_BUFFER, subMesh.vertexBuffer);
				GL.bufferData(GL.ARRAY_BUFFER, subMesh.vertices, GL.STATIC_DRAW);

				GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, subMesh.indexBuffer);
				GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, subMesh.indices, GL.STATIC_DRAW);
			}
		},

	});

});
