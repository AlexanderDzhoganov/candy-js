include([], function ()
{

	OBJMeshProvider = function (name, forceRecalculateNormals)
	{
		this.name = "OBJMeshProvider";
		this.type = "meshProvider";

		var objData = this._extractDataFromOBJ(ResourceLoader.getContent(name));

		this.submeshes = [];

		var addSubmesh = function (vertices, indices)
		{
			this.submeshes.push(
			{
				vertices: vertices,
				indices: indices,
				vertexBuffer: GL.createBuffer(),
				indexBuffer: GL.createBuffer(),
				primitiveType: Renderer.PRIMITIVE_TYPE.INDEXED_TRIANGLES,
				vertexFormat: Renderer.VERTEX_FORMAT.PPPNNNTT,
			});
		}.bind(this);

		var faceCount = 0;
		var verticesCount = 0;
		var indicesCount = 0;

		for (var i = 0; i < objData.materials.length; i++)
		{
		//	var name = objData.materials[i].name;
			faceCount += objData.materials[i].faces.length;

			var uniqueVertices = this._calculateUniqueVertices
			(
				objData.positions,
				objData.normals,
				objData.uvs,
				objData.materials[i].faces, 
				forceRecalculateNormals
			);

			var result = this._prepareVerticesIndices(uniqueVertices, objData.materials[i].faces);


			verticesCount += result.vertices.length / 8;
			indicesCount += result.indices.length / 3;

			if(result.vertices.length > 0)
			{
				var vertices = new Float32Array(result.vertices);
				var indices = new Uint16Array(result.indices);
				addSubmesh(vertices, indices);
			}
		}

		console.log
		(
			"OBJMeshProvider: \"" + name + "\" parsed - " +
			objData.positions.length + " positions, " +
			objData.normals.length + " normals, " +
			objData.uvs.length + " uvs, " +
			faceCount + " faces, resulting in " +
			verticesCount + " unique vertices and " +
			indicesCount + " triangles in " +
			this.submeshes.length + " submeshes"
		);
		
		this._uploadVertexData();
	};

	OBJMeshProvider.prototype = new Component();

	OBJMeshProvider.extend(
	{

	})

	OBJMeshProvider.prototype.extend(
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

		onInit: function ()
		{
			if (!this.gameObject.getComponent("meshBoundsProvider"))
			{
				this.gameObject.addComponent(new MeshBoundsProvider());
			}

			var boundsProvider = this.gameObject.getComponent("meshBoundsProvider");
			boundsProvider.recalculateMinimumAABB();
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

		_extractDataFromOBJ: function (obj)
		{
			var lines = obj.split('\n');

			var positions = [];
			var normals = [];
			var uvs = [];
			
			for (var i = 0; i < lines.length; i++)
			{
				var line = lines[i];

				while (line.indexOf('  ') != -1)
				{
					line = line.replace('  ', ' ');
				}

				var components = line.trim().split(' ');

				if (components[0] == 'v')
				{
					positions.push
					(
						vec3.fromValues
						(
							parseFloat(components[1]),
							parseFloat(components[2]),
							parseFloat(components[3])
						)
					);
				}
				else if (components[0] == 'vn')
				{
					normals.push
					(
						vec3.fromValues
						(
							parseFloat(components[1]),
							parseFloat(components[2]),
							parseFloat(components[3])
						)
					);
				}
				else if (components[0] == 'vt')
				{
					uvs.push
					(
						vec2.fromValues
						(
							parseFloat(components[1]),
							parseFloat(components[2])
						)
					);
				}
			}

			var materials = [ { name: "default", faces: [] } ];
			var current = 0;

			for (var i = 0; i < lines.length; i++)
			{
				var line = lines[i];

				while (line.indexOf('  ') != -1)
				{
					line = line.replace('  ', ' ');
				}

				var components = line.trim().split(' ');
			
				if (components[0] == 'f')
				{
					var numVertices = components.length - 1;

					for (var q = 0; q < numVertices - 2; q++) // works fine
					{
						materials[current].faces.push
						([
							components[1].split("/"),
							components[2 + q].split("/"),
							components[3 + q].split("/")
						]);
					}
				}
				else if (components[0].slice(0, 7) == "usemtl")
				{
					var material = components[1];

					currentMaterial = null;
					for (var m = 0; m < materials.length; m++)
					{
						if(materials[m].name == material)
						{
							currentMaterial = m;
						}
					}

					if(currentMaterial == null)
					{
						materials.push({ name: material, faces: [] });
					}
				}
			}

			return { positions: positions, normals: normals, uvs: uvs, materials: materials };
		},

		_calculateUniqueVertices: function (positions, normals, uvs, faces, forceRecalculateNormals)
		{
			var uniqueVertices = {};

			for (var i = 0; i < faces.length; i++)
			{
				var face = faces[i];
				var verts = [face[0], face[1], face[2]];

				for (var q = 0; q < verts.length; q++)
				{
					var vertSplit = verts[q];

					var vertHash = vertSplit[0] + '/' + vertSplit[1] + '/' + vertSplit[2];
					if (vertHash in uniqueVertices)
					{
						continue;
					}

					var pidx = null;
					var nidx = null;
					var uvidx = null;

					if (vertSplit.length == 3)
					{
						pidx = parseInt(vertSplit[0]) - 1;
						nidx = parseInt(vertSplit[2]) - 1;
						uvidx = parseInt(vertSplit[1]) - 1;
					}
					else
					{
						pidx = parseInt(vertSplit[0]) - 1;
						nidx = null;
						uvidx = parseInt(vertSplit[1]) - 1;
					}

					var position = positions[pidx];
					var normal = normals[nidx];

					if (!normal || !nidx || forceRecalculateNormals)
					{
						//normal = this._calculateNormal(pidx, positions, faces);
						normal = vec3.create();			

						var faceVertexIndex = pidx + 1;
						var faceSet = [];
						var facesFound = 0;

						for (var i = 0; i < faces.length && faceSet.length < 80; i++) // optimization
						{
							for (var q = 0; q < 3; q++)
							{
								var currentFaceVertex = faces[i][q][0];
								if (faceVertexIndex == currentFaceVertex)
								{
									faceSet.push(faces[i]);
									break;
								}
							}
						}

						for (var i = 0; i < faceSet.length; i++)
						{
							var v0_idx = parseInt(faceSet[i][0][0]) - 1;
							var v1_idx = parseInt(faceSet[i][1][0]) - 1;
							var v2_idx = parseInt(faceSet[i][2][0]) - 1;

							var v0 = positions[v0_idx];
							var v1 = positions[v1_idx];
							var v2 = positions[v2_idx];

							var sideA = vec3.create();
							vec3.subtract(sideA, v0, v1);
							
							var sideB = vec3.create();
							vec3.subtract(sideB, v0, v2);

							var crossNormal = vec3.create();
							vec3.cross(crossNormal, sideA, sideB);

							vec3.normalize(crossNormal, crossNormal);

							vec3.add(normal, crossNormal, normal);
						}

						vec3.scale(normal, normal, 1.0 / faceSet.length);
						vec3.normalize(normal, normal);
					}

					var uv = uvs[uvidx];

					uniqueVertices[vertHash] =
					[
						position[0],
						position[1],
						position[2],
						normal[0],
						normal[1],
						normal[2],
						uv[0],
						uv[1]
					];
				}
			}

			if(uniqueVertices.size() >= 65534)
			{
				console.log("SubMesh is too big!");
			}

			return uniqueVertices;
		},

		_prepareVerticesIndices: function (uniqueVertices, faces)
		{
			var hashToIndex = {};
			var interleavedVertices = [];

			var currentIndex = 0;
			for (var vertex in uniqueVertices)
			{
				if (typeof uniqueVertices[vertex] != 'object')
				{
					continue;
				}

				hashToIndex[vertex] = currentIndex++;

				var data = uniqueVertices[vertex];

				for (var i = 0; i < data.length; i++)
				{
					interleavedVertices.push(data[i]);
				}
			}

			var indices = [];
			for (var i = 0; i < faces.length; i++)
			{
				var face = faces[i];
				indices.push(hashToIndex[face[0][0] + '/' + face[0][1] + '/' + face[0][2]]);
				indices.push(hashToIndex[face[1][0] + '/' + face[1][1] + '/' + face[1][2]]);
				indices.push(hashToIndex[face[2][0] + '/' + face[2][1] + '/' + face[2][2]]);		
			}

			return { vertices: interleavedVertices, indices: indices };
		},

		_calculateNormal: function (positionIndex, positions, faces)
		{
			return resultNormal;
		},

	});

});