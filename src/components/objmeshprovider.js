var OBJMeshProvider = function (name)
{
	this.name = "OBJMeshProvider";
	this.type = "meshProvider";

	this.primitiveType = 'indexedTriangles';

	var verts = [], vertNormals = [], textures = [], unpacked = {};
	
	var obj = ResourceLoader.getContent(name); // read file
	var lines = obj.split('\n');

	var positions = [];
	var normals = [];
	var uvs = [];
	var faces = [];

	for(var i = 0; i < lines.length; i++)
	{
		var line = lines[i];
		var components = line.split(' ');

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
			faces.push
			([
				components[1],
				components[2],
				components[3]
			]);
		}
	}

	var uniqueVertices = {};
	var indices = [];

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

			var pidx = parseInt(vertSplit[0]) - 1;
			var nidx = parseInt(vertSplit[2]) - 1;
			var uvidx = parseInt(vertSplit[1]) - 1;

			uniqueVertices[vert] =
			[
				positions[pidx][0],
				positions[pidx][1],
				positions[pidx][2],
				normals[nidx][0],
				normals[nidx][1],
				normals[nidx][2],
				uvs[uvidx][0],
				uvs[uvidx][1]
			];
		}
	}

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

	this.vertices = new Float32Array(interleavedVertices);
	this.indices = new Uint16Array(indices);

	console.log
	(
		"obj parsed - " +
		positions.length + " positions, " +
		normals.length + " normals, " +
		uvs.length + " uvs, " +
		faces.length + " faces, resulting in " +
		(this.vertices.length / 8) + " unique vertices and " +
		this.indices.length / 3 + " triangles"
	);

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
		GL.deleteBuffer(this._vertexBuffer);
		GL.deleteBuffer(this._indexBuffer);
	},

	_uploadVertexData: function ()
	{
		if(!this.vertexBuffer)
		{
			this.vertexBuffer = GL.createBuffer();
			this.indexBuffer = GL.createBuffer();
		}

		GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);
		GL.bufferData(GL.ARRAY_BUFFER, this.vertices, GL.STATIC_DRAW);

		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, this.indices, GL.STATIC_DRAW);
	},

})