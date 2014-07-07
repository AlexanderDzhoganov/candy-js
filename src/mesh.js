include([], function ()
{

	Mesh = function (name)
	{
		this.animationUseDualQuaternions = false;
		this.navMesh = null;

		var reader = new BinaryReader(ResourceLoader.getContent(name));
		var obj2 = reader.get();

		this.animated = obj2.flags & Mesh.OBJ2FLAGS.ANIMATED;
		if(this.animated)
		{
			var animations = [];

			for (var i = 0; i < obj2.animations.length; i++)
			{
				var dataPtr = 0;
				var animationFrames = [];

				for (var frame = 0; frame < obj2.animations[i].framesCount; frame++)
				{
					var animationFrame = [];

					for (var joint = 0; joint < obj2.animations[i].jointsCount; joint++)
					{
						var q1_x = obj2.animations[i].frameData[dataPtr++];
						var q1_y = obj2.animations[i].frameData[dataPtr++];
						var q1_z = obj2.animations[i].frameData[dataPtr++];
						var q1_w = obj2.animations[i].frameData[dataPtr++];
						var q2_x = obj2.animations[i].frameData[dataPtr++];
						var q2_y = obj2.animations[i].frameData[dataPtr++];
						var q2_z = obj2.animations[i].frameData[dataPtr++];
						var q2_w = obj2.animations[i].frameData[dataPtr++];

						animationFrame.push
						([
							quat.fromValues(q1_x, q1_y, q1_z, q1_w),
							quat.fromValues(q2_x, q2_y, q2_z, q2_w)
						]);
					}

					animationFrames.push(animationFrame);
				}

				animations.push(animationFrames);
			}

			this.animationFrames = animations[0];
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
			var submesh = newSubmesh(obj2.materials[objSubmesh.materialIndex]);
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

			if(this.animated)
			{
				submesh.animationFrames = this.animationFrames;
			}

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