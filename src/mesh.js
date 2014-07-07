include([], function ()
{

	Mesh = function (name)
	{
		this.animationUseDualQuaternions = false;
		this.navMesh = null;

		var reader = new BinaryReader(ResourceLoader.getContent(name));
		var obj2 = reader.get();
		if(obj2.magic != 0xCADCFFFF)
		{
			console.log("failed to load \"" + name + "\", mesh has an invalid header");
			return;
		}

		this.animated = obj2.flags & Mesh.OBJ2FLAGS.ANIMATED;

		if(this.animated)
		{
			this.animations = obj2.animations;
		}

		var hasNavMesh = obj2.flags & Mesh.OBJ2FLAGS.CONTAINS_NAVMESH;
			
		var newSubmesh = function (materialName)
		{
			var submesh =
			{
				material: materialName,
				aabb: null,
				vertices: null,
				indices: null,
				vertexBuffer: GL.createBuffer(),
				indexBuffer: GL.createBuffer(),
				primitiveType: Renderer.PRIMITIVE_TYPE.INDEXED_TRIANGLES,
				vertexFormat: Renderer.VERTEX_FORMAT.PPPNNNTT,
			};

			if(this.animated)
			{
				submesh.vertexFormat = Renderer.VERTEX_FORMAT.PPPNNNTTIIIIWWWW;
			}

			return submesh;
		}.bind(this);

		this.submeshes = [];
		for (var i = 0; i < obj2.submeshes.length; i++)
		{
			var objSubmesh = obj2.submeshes[i];
			var submesh = newSubmesh(obj2.materials[objSubmesh.materialIndex].name);
			submesh.aabb = new AABB();
			submesh.aabb.origin = vec3.fromValues
			(
				objSubmesh.aabb[0],
				objSubmesh.aabb[1],
				objSubmesh.aabb[2]
			);

			submesh.aabb.extents = vec3.fromValues
			(
				objSubmesh.aabb[3],
				objSubmesh.aabb[4],
				objSubmesh.aabb[5]
			);

			submesh.vertices = new Float32Array(objSubmesh.vertices);
			submesh.indices = new Uint16Array(objSubmesh.indices);

			this.submeshes.push(submesh);
		}

		this._uploadVertexData();
	};

	Mesh.prototype = new Component();

	Mesh.extend(
	{

		OBJ2FLAGS: { ANIMATED: 1 << 0, CONTAINS_NAVMESH: 1 << 1, },

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

	});

});