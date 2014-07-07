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
		OBJ2FLAGS: { ANIMATED: 1 << 0, CONTAINS_NAVMESH: 1 << 1, },

		getBinaryReader: function (obj)
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

			data.readFloat32Array = function ()
			{
				var result = [];

				var size = this.readUint32();
				for (var i = 0; i < size; i++)
				{
					result.push(this.readFloat32());
				}

				return result;
			};

			data.readUint32 = function ()
			{
				var u = this.getUint32(this._ptr, this.endianess);
				this._ptr += 4;
				return u;
			};

			data.readUint32Array = function ()
			{
				var result = [];

				var size = this.readUint32();
				for (var i = 0; i < size; i++)
				{
					result.push(this.readUint32());
				}

				return result;
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

				this._ptr += len;
				return s;
			};

			return data;
		},

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
			var data = Mesh.getBinaryReader(obj);

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

				var aabbArray = data.readFloat32Array();

				var aabb = new AABB();
				aabb.center = vec3.fromValues(aabbArray[0], aabbArray[1], aabbArray[2]);
				aabb.extents = vec3.fromValues(aabbArray[3], aabbArray[4], aabbArray[5]);
				submesh.aabb = aabb;

				var vertexComponentCount = data.readUint32();

				submesh.vertices = new Float32Array(data.readFloat32Array());
				submesh.indices = new Uint16Array(data.readUint32Array());

				submeshes.push(submesh);
			}

			var animationsCount = data.readUint32();

			var animations = [];

			for (var i = 0; i < animationsCount; i++)
			{
				var animationName = data.readString();

				var jointsCount = data.readUint32();
				var framesCount = data.readUint32();

				var animationFramesSize = data.readUint32();
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

			if(hasNavMesh)
			{
				var navMeshVertices = new Float32Array(data.readFloat32Array());
				var navMeshIndices = new Uint16Array(data.readUint32Array());
				this.navMesh = { vertices: navMeshVertices, indices: navMeshIndices };
			}
			else
			{
				this.navMesh = null;
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