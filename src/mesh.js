include([], function ()
{

	Mesh = function (name)
	{
		this.animationUseDualQuaternions = false;
		this.navMesh = null;
		this.submeshes = this._extractDataFromOBJ2Binary(ResourceLoader.getContent(name)); //this._extractDataFromOBJ2(ResourceLoader.getContent(name));
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
			debugger;
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
			debugger;
			return submeshes;
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