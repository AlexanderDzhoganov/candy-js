var OBJMeshProvider = function (name)
{
	this.name = "OBJMeshProvider";
	this.type = "meshProvider";

	this.primitiveType = 'indexedTriangles';
	this.vertexFormat = 'PPPNNNTT';
	
	var obj = ResourceLoader.getContent(name); // read file
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
		"OBJMeshProvider: obj parsed - " +
		positions.length + " positions, " +
		normals.length + " normals, " +
		uvs.length + " uvs, " +
		faces.length + " faces, resulting in " +
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
		if(!this.gameObject.getComponent("boundsProvider"))
		{
			this.gameObject.addComponent(new BoundsProvider());
		}

		var boundsProvider = this.gameObject.getComponent("boundsProvider");
		boundsProvider.recalculateMinimumAABB();
	},

	_uploadVertexData: function ()
	{
		GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);
		GL.bufferData(GL.ARRAY_BUFFER, this.vertices, GL.STATIC_DRAW);

		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, this.indices, GL.STATIC_DRAW);
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