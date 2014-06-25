var OBJMeshProvider = function (name)
{
	this.name = "OBJMeshProvider";
	this.type = "meshProvider";

	this.primitiveType = 'indexedTriangles';
	this.vertexFormat = 'PPPNNNTT';
	
	var objData = this._extractDataFromOBJ(ResourceLoader.getContent(name));

	var uniqueVertices = this._calculateUniqueVertices(objData.positions, objData.normals, objData.uvs, objData.faces);

	var result = this._prepareVerticesIndices(uniqueVertices, objData.faces);

	this.vertices = new Float32Array(result.vertices);
	this.indices = new Uint16Array(result.indices);

	console.log
	(
		"OBJMeshProvider: obj parsed - " +
		objData.positions.length + " positions, " +
		objData.normals.length + " normals, " +
		objData.uvs.length + " uvs, " +
		objData.faces.length + " faces, resulting in " +
		(this.vertices.length / 8) + " unique vertices and " +
		this.indices.length / 3 + " triangles"
	);


	this.vertexBuffer = GL.createBuffer();
	this.indexBuffer = GL.createBuffer();
	this._uploadVertexData();
	this.renderingLayer = RENDERING_LAYER.PERSPECTIVE;
};

OBJMeshProvider.prototype = new Component();

OBJMeshProvider.extend(
{

})

OBJMeshProvider.prototype.extend(
{

	dispose: function ()
	{
		GL.deleteBuffer(this.vertexBuffer);
		GL.deleteBuffer(this.indexBuffer);
	},

	onInit: function ()
	{
		if(!this.gameObject.getComponent("meshBoundsProvider"))
		{
			this.gameObject.addComponent(new MeshBoundsProvider());
		}

		var boundsProvider = this.gameObject.getComponent("meshBoundsProvider");
		boundsProvider.recalculateMinimumAABB();
	},

	_uploadVertexData: function ()
	{
		GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);
		GL.bufferData(GL.ARRAY_BUFFER, this.vertices, GL.STATIC_DRAW);

		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, this.indices, GL.STATIC_DRAW);
	},

	_extractDataFromOBJ: function (obj)
	{
		var lines = obj.split('\n');

		var positions = [];
		var normals = [];
		var uvs = [];
		var faces = [];

		for(var i = 0; i < lines.length; i++)
		{
			var line = lines[i];

			while(line.indexOf('  ') != -1)
			{
				line = line.replace('  ', ' ');
			}

			var components = line.trim().split(' ');

			if(components[0] == 'v')
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
			else if(components[0] == 'vn')
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
			else if(components[0] == 'vt')
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
			else if(components[0] == 'f')
			{
				if(components.length == 4)
				{
					// triangle
					faces.push
					([
						components[1],
						components[2],
						components[3]
					]);
				}
				else if(components.length == 5)
				{
					// quad
					faces.push
					([
						components[1],
						components[2],
						components[3]
					]);

					faces.push
					([
						components[1],
						components[3],
						components[4]
					]);
				}
			}
		}

		return { positions: positions, normals: normals, uvs: uvs, faces: faces };
	},

	_calculateUniqueVertices: function (positions, normals, uvs, faces)
	{
		var uniqueVertices = {};

		for(var i = 0; i < faces.length; i++)
		{
			var face = faces[i];
			var verts = [face[0], face[1], face[2]];

			for(var q = 0; q < verts.length; q++)
			{
				var vert = verts[q];
				if(vert in uniqueVertices)
				{
					continue;
				}

				var vertSplit = vert.split('/');

				var pidx = null;
				var nidx = null;
				var uvidx = null;

				if(vertSplit.length == 3)
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

				if(!normal || !nidx)
				{
					normal = this._calculateNormal(pidx, positions, faces);
				}

				var uv = uvs[uvidx];

				uniqueVertices[vert] =
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

		return uniqueVertices;
	},

	_prepareVerticesIndices: function (uniqueVertices, faces)
	{
		var hashToIndex = {};
		var interleavedVertices = [];

		var currentIndex = 0;
		for(var vertex in uniqueVertices)
		{
			if(typeof uniqueVertices[vertex] != 'object')
			{
				continue;
			}

			hashToIndex[vertex] = currentIndex++;
			var data = uniqueVertices[vertex];

			for(var i = 0; i < data.length; i++)
			{
				interleavedVertices.push(data[i]);
			}
		}

		var indices = [];
		for(var i = 0; i < faces.length; i++)
		{
			var face = faces[i];
			indices.push(hashToIndex[face[0]]);
			indices.push(hashToIndex[face[1]]);
			indices.push(hashToIndex[face[2]]);		
		}

		return { vertices: interleavedVertices, indices: indices };
	},

	_calculateNormal: function (positionIndex, positions, faces)
	{
		var resultNormal = vec3.create();

		var calculateNormal = function (v0, v1, v2)
		{
			var sideA = vec3.create();
			vec3.subtract(sideA, v0, v1);
			
			var sideB = vec3.create();
			vec3.subtract(sideB, v0, v2);

			var normal = vec3.create();
			vec3.cross(normal, sideA, sideB);
			vec3.normalize(normal, crossProduct);
			return crossProduct;
		};

		return resultNormal;
	},

})