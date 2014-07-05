include([], function ()
{

	Mesh = function (name)
	{
		this.animationUseDualQuaternions = false;
		this.navMesh = null;
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

			var animated = false;
			var animationDualQuats = false;
			var hasNavmesh = false;

			var flags = lines[0].split(':')[1].split(' ');
			for(var i = 0; i < flags.length; i++)
			{
				var flag = flags[i].trim();
				if(flag == "animated")
				{
					animated = true;
				}
				else if (flag == "anim-store-dq")
				{
					animationDualQuats = true;
				}
				else if (flag == "navmesh")
				{
					hasNavmesh = true;
				}
			}

			if (animationDualQuats)
			{
				this.animationUseDualQuaternions = true;
			}

			var navMeshVertices = [];
			var navMeshIndices = [];

			var submeshes = [];
			var newSubmesh = function (vertexCount, indexCount, materialName)
			{
				var submesh =
				{
					material: materialName,
					vertices: null,
					indices: new Uint16Array(indexCount),
					vertexBuffer: GL.createBuffer(),
					indexBuffer: GL.createBuffer(),
					primitiveType: Renderer.PRIMITIVE_TYPE.INDEXED_TRIANGLES,
					vertexFormat: Renderer.VERTEX_FORMAT.PPPNNNTT,
				};

				if(animated)
				{
					submesh.vertexFormat = Renderer.VERTEX_FORMAT.PPPNNNTTIIIIWWWW;
					submesh.vertices = new Float32Array(vertexCount * 16);
				}
				else
				{
					submesh.vertices = new Float32Array(vertexCount * 8);
				}

				return submesh;
			}.bind(this);

			var currentSubmesh = null;
			var vertexCursor = 0;
			var indexCursor = 0;

			var animationFrames = [];
			var numberOfJoints = 0;
			var currentAnimationFrame = null;

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
					var vertexComponents = 8;
					if(animated)
					{
						vertexComponents = 16;
					}

					for(var p = 1; p < vertexComponents + 1; p++)
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
				else if (components[0] == 'a')
				{
					numberOfJoints = parseInt(components[3]);
				}
				else if (components[0] == 'f')
				{
					if(currentAnimationFrame != null)
					{
						animationFrames.push(currentAnimationFrame);
					}

					currentAnimationFrame = [];
				}
				else if (components[0] == 'mat4')
				{
					var matrix = mat4.create();
					
					for(var q = 0; q < 16; q++)
					{
						matrix[q] = parseFloat(components[1 + q]);
					}

					currentAnimationFrame.push(matrix);
				}
				else if (components[0] == 'dq')
				{
					var dq =
					[
						quat.fromValues(parseFloat(components[1]), parseFloat(components[2]), parseFloat(components[3]), parseFloat(components[4])),
						quat.fromValues(parseFloat(components[5]), parseFloat(components[6]), parseFloat(components[7]), parseFloat(components[8]))
					];

					currentAnimationFrame.push(dq);
				}
				else if (components[0] == 'nmv')
				{
					navMeshVertices.push(parseFloat(components[1])); 
					navMeshVertices.push(parseFloat(components[2]));
					navMeshVertices.push(parseFloat(components[3]));
				}
				else if (components[0] == 'nmi')
				{
					for (var idx = 1; idx < components.length - 1; idx++)
					{
						navMeshIndices.push(parseInt(components[idx])); 
					}
				}
			}

			if (currentSubmesh)
			{
				submeshes.push(currentSubmesh);
			}

			for (var i = 0; i < submeshes.length; i++)
			{
				submeshes[i].animationFrames = animationFrames;
			}
			this.animationFrames = animationFrames;
			this.animated = animated;

			if (hasNavmesh)
			{
				this.navMesh = { vertices: new Float32Array(navMeshVertices), indices: new Uint16Array(navMeshIndices) };
			}

			return submeshes;
		},

	});

});