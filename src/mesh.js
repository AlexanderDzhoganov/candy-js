include([], function ()
{

	Mesh = function (name)
	{
		this.submeshes = this._extractDataFromOBJ2(ResourceLoader.getContent(name));
		this._uploadVertexData();
	};

	Mesh.prototype = new Component();

	Mesh.extend(
	{

	})

	Mesh.prototype.extend(
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

		_extractDataFromOBJ2: function (obj)
		{
			var lines = obj.split('\n');

			var submeshes = [];
			var newSubmesh = function (vertexCount, indexCount, materialName)
			{
				return {
					material: materialName,
					vertices: new Float32Array(vertexCount * 8),
					indices: new Uint16Array(indexCount),
					vertexBuffer: GL.createBuffer(),
					indexBuffer: GL.createBuffer(),
					primitiveType: Renderer.PRIMITIVE_TYPE.INDEXED_TRIANGLES,
					vertexFormat: Renderer.VERTEX_FORMAT.PPPNNNTT,
				};
			}.bind(this);

			var currentSubmesh = null;
			var vertexCursor = 0;
			var indexCursor = 0;

			for (var i = 0; i < lines.length; i++)
			{
				var line = lines[i];

				var components = line.split(' ');
				if (components[0] == 'm')
				{
					var materialName = components[1];
					var vertexCount = parseInt(components[2]);
					var indexCount = parseInt(components[3]);

					if (currentSubmesh)
					{
						submeshes.push(currentSubmesh);
					}

					currentSubmesh = newSubmesh(vertexCount, indexCount, materialName);
					vertexCursor = 0;
					indexCursor = 0;
				}
				else if (components[0] == 'vnt')
				{
					for(var p = 1; p < 9; p++)
					{
						currentSubmesh.vertices[vertexCursor++] = parseFloat(components[p]);
					}
				}
				else if (components[0] == 'i')
				{
					for(var p = 1; p < components.length; p++)
					{
						currentSubmesh.indices[indexCursor++] = parseInt(components[p]);
					}
				}
				else if (components[0] == 'aabb')
				{
					currentSubmesh.aabb = new AABB();

					for (var p = 1; p < 4; p++)
					{
						currentSubmesh.aabb.center[p - 1] = components[p];
					}
					for (var p = 4; p < 7; p++)
					{
						currentSubmesh.aabb.extents[p - 4] = components[p];
					}
				}
			}

			if (currentSubmesh)
			{
				submeshes.push(currentSubmesh);
			}

			return submeshes;
		},

	});

});