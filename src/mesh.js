include([], function ()
{

	Mesh = function (name)
	{
		this.animationUseDualQuaternions = false;
		this.navMesh = null;
		this.submeshes = this._extractDataFromOBJ2Binary(ResourceLoader.getContent(name)); 
		this._uploadVertexData();
	};

	Mesh.prototype = new Component();

	Mesh.extend(
	{
		OBJ2FLAGS: { ANIMATED: 1 << 0, CONTAINS_NAVMESH: 1 << 1, }
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

		_extractDataFromOBJ2Binary: function (obj)
		{
			var data = new DataView(obj);
			data._ptr = 0;
			data.endianess = false;

			data.readFloat32 = function ()
			{
				var f = this.getFloat32(this._ptr, this.endianess);
				this._ptr += 4;
				return f;
			};

			data.readUint32 = function ()
			{
				var u = this.getUint32(this._ptr, this.endianess);
				this._ptr += 4;
				return u;
			};

			data.readString = function ()
			{
				var len = this.getUint32(this._ptr, this.endianess);
				this._ptr += 4;

				var s = "";
				for (var i = 0; i < len; i++)
				{
					s += String.fromCharCode(this.getInt8(this._ptr + i, this.endianess));
				}

				this._ptr += 256;
				return s;
			};

			var magic = data.readUint32();

			if (magic != 0xCADCFFFF)
			{
				if(magic != 0xFFFFDCCA)
				{
					console.log("Invalid header, probobly not a binary obj2 (obj2b).");
					return;	
				}
				else
				{
					data.endianess = true;	
				}
			}

			var version = 1000;

			if (version > data.readUint32())
			{
				console.log("File version mismatch! File version: " + uint32[1] + " // Reader version: " + version);
				return;
			}

			var flags = data.readUint32();

			var animated = flags & Mesh.OBJ2FLAGS.ANIMATED;
			var hasNavMesh = flags & Mesh.OBJ2FLAGS.CONTAINS_NAVMESH;
				
 			var materials = [];
 			var materialsCount = data.readUint32();

			for (var i = 0; i < materialsCount; i++)
			{
				materials.push(data.readString());
			}

			var submeshes = [];
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

				if(animated)
				{
					submesh.vertexFormat = Renderer.VERTEX_FORMAT.PPPNNNTTIIIIWWWW;
				}

				return submesh;
			}.bind(this);

			var submeshesCount = data.readUint32(); 

			for (var i = 0; i < submeshesCount; i++)
			{
				var materialIdx = data.readUint32();
				
				var submeshMaterial = materials[materialIdx];

				var submesh = newSubmesh(submeshMaterial);

				var centerX = data.readFloat32();
				var centerY = data.readFloat32();
				var centerZ = data.readFloat32();
				
				var extentsX = data.readFloat32();
				var extentsY = data.readFloat32();
				var extentsZ = data.readFloat32();

				var aabb = new AABB();
				aabb.center = vec3.fromValues(centerX, centerY, centerZ);
				aabb.extents = vec3.fromValues(extentsX, extentsY, extentsZ);
				submesh.aabb = aabb;

				var vertexCount = data.readUint32();
				var vertexComponentCount = data.readUint32();

				submesh.vertices = new Float32Array(vertexCount * vertexComponentCount);
				for (var q = 0; q < vertexCount * vertexComponentCount; q++)
				{
					submesh.vertices[q] = data.readFloat32();
				}

				var indicesCount = data.readUint32();
				submesh.indices = new Uint16Array(indicesCount);

				for (var q = 0; q < indicesCount; q++)
				{
					submesh.indices[q] = data.readUint32();
				}

				submeshes.push(submesh);
			}

			var jointsCount = data.readUint32();
			var animationsCount = data.readUint32();

			var animations = [];

			for (var i = 0; i < animationsCount; i++)
			{
				var animationName = data.readString();

				var animJointsCount = data.readUint32();

				if (jointsCount != animJointsCount)
				{
					console.log("Warning: jointsCount != animJointsCount !");
				}

				var framesCount = data.readUint32();
				var animationFrames = [];

				for (var frame = 0; frame < framesCount; frame++)
				{
					var animationFrame = [];

					for (var joint = 0; joint < jointsCount; joint++)
					{
						var q1_x = data.readFloat32();
						var q1_y = data.readFloat32();
						var q1_z = data.readFloat32();
						var q1_w = data.readFloat32();
						var q2_x = data.readFloat32();
						var q2_y = data.readFloat32();
						var q2_z = data.readFloat32();
						var q2_w = data.readFloat32();

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

			if (animated)
			{
				this.animated = true;
				this.animationFrames = animations[0];
				for (var i = 0; i < submeshes.length; i++)
				{
					submeshes[i].animationFrames = animations[0];
				}	
			}
			else
			{
				this.animated = false;
			}

			return submeshes;
		},

	});

});