include([], function ()
{

	MeshRenderer = function ()
	{
		this.name = "MeshRenderer";
		this.type = "renderer";
		this.materials = [];
		this.mesh = null;

		this.drawBounds = false;
		this.wireframe = false;

		this.disableCulling = false;
	};

	MeshRenderer.prototype = new Component();

	MeshRenderer.extend(
	{

		getWireframeProgram: function ()
		{
			if (MeshRenderer._wireframeProgram == null)
			{
				MeshRenderer._wireframeProgram = new Shader 
				(
					ResourceLoader.getContent("wireframe_vertex"),
					ResourceLoader.getContent("wireframe_fragment")
				);
			}

			return MeshRenderer._wireframeProgram;
		},	

		_wireframeProgram: null,

	});

	MeshRenderer.prototype.extend(
	{

		onInit: function ()
		{
		},

		setMesh: function (mesh)
		{
			this.mesh = mesh;

			if (this.gameObject.getComponent("meshBoundsProvider"))
			{
				this.gameObject.removeComponent("meshBoundsProvider");
			}

			this.gameObject.addComponent(new MeshBoundsProvider());
			var boundsProvider = this.gameObject.getComponent("meshBoundsProvider");
			boundsProvider.recalculateMinimumAABB();

			if(this.mesh.animated)
			{
				if (this.gameObject.getComponent("animationController"))
				{
					this.gameObject.removeComponent("animationController");
				}

				this.gameObject.addComponent(new AnimationController());
				var animationController = this.gameObject.getComponent("animationController");
			}
		},

		onRender: function (worldModelMatrix)
		{                                                                 
			if (this.materials.length == 0)
			{
				return;
			}

			if(this.mesh == null)
			{
				return;
			}

			var octreeMeshProvider = this.gameObject.octreeFrustumCullingProvider;
			var boundsProvider = this.gameObject.meshBoundsProvider;
			var frustum = Renderer._activeCamera.getFrustum();

			if (!this.disableCulling && frustum.intersectAABB(boundsProvider.meshAABB) == Frustum.INTERSECT_RESULT.OUTSIDE)
			{
				return;
			}

			var visibleSet = null;

			if(octreeMeshProvider)
			{
				visibleSet = octreeMeshProvider.intersectFrustum(frustum);
			}

			for (var i = 0; i < this.mesh.submeshes.length; i++)
			{
				var submesh = this.mesh.submeshes[i];
				var indicesCount = submesh.indices.length;
				var culled = false;

				if(!this.disableCulling && this._isCulled(i, frustum))
				{
					culled = true;
				}
				else if(!this.disableCulling && visibleSet != null)
				{
					if(visibleSet[i].length == 0)
					{
						culled = true;
					}
					else
					{
						GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, submesh.indexBuffer);
						GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(visibleSet[i]), GL.STREAM_DRAW);
						indicesCount = visibleSet[i].length;	
					}
				}

				if(culled)
				{
					continue;
				}

				this._setupMaterial(i);

				if (this.wireframe)
				{
					Shader.setActiveProgram(MeshRenderer.getWireframeProgram());
					Shader.setUniformVec3("wireframeColor", vec3.fromValues(0, 0.2, 1));
					Shader.setUniformMat4("model", worldModelMatrix);
					this._drawWireframeSubmesh(this.mesh.submeshes[i]);
				}
				else
				{
					Shader.setUniformMat4("model", worldModelMatrix);

					if (this.mesh.animated)
					{
						if(this.mesh.animationUseDualQuaternions)
						{
							var dualQuats = this.gameObject.animationController.getCurrentFrameDualQuaternions();
							for (var q = 0; q < dualQuats.length; q++)
							{
								var loc = GL.getUniformLocation(Shader._ActiveProgram._program, "DQn[" + q + "]");
								GL.uniform4fv(loc, dualQuats[q][0]);

								var loc2 = GL.getUniformLocation(Shader._ActiveProgram._program, "DQd[" + q + "]");
								GL.uniform4fv(loc2, dualQuats[q][1]);
							}
						}
						else
						{
							var animationMatrices = this.gameObject.animationController.getCurrentFrameAnimationMatrices();
							for (var m = 0; m < animationMatrices.length; m++)
							{
								var loc = GL.getUniformLocation(Shader._ActiveProgram._program, "boneMatrices[" + m + "]");
								GL.uniformMatrix4fv(loc, GL.FALSE, animationMatrices[m]);
							}
						}
					}

					this._drawSubmesh(submesh, indicesCount);
				}
			}

			if (this.drawBounds)
			{
				this._drawBounds(worldModelMatrix);
			}
		},

		_isCulled: function (index, frustum)
		{
			var boundsProvider = this.gameObject.getComponent("meshBoundsProvider");
			return frustum.intersectAABB(boundsProvider.aabbs[index]) == Frustum.INTERSECT_RESULT.OUTSIDE;
		},

		_setupMaterial: function (subMeshIndex)
		{
			var material = this.materials[subMeshIndex];
			var program = material.program;

			Shader.setActiveProgram(program);

			var index = 0;
			for (var name in material.textures)
			{
				if (!material.textures.hasOwnProperty(name))
				{
					continue;
				}

				if (program[name] == undefined)
				{
					GL.activeTexture(GL.TEXTURE0 + index);
					GL.bindTexture(GL.TEXTURE_2D, null);
					continue;
				}


				Shader.setUniformInt(name, index);
				GL.activeTexture(GL.TEXTURE0 + index);
				GL.bindTexture(GL.TEXTURE_2D, material.textures[name]._texture);
				index++;
			}
		},

		_drawSubmesh: function (subMesh, indicesCount)
		{
			GL.bindBuffer(GL.ARRAY_BUFFER, subMesh.vertexBuffer);
			GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, subMesh.indexBuffer);

			if (subMesh.primitiveType == Renderer.PRIMITIVE_TYPE.INDEXED_TRIANGLE_STRIP)
			{
				Renderer.drawIndexedTriangleStrip(indicesCount, subMesh.vertexFormat);
			}
			else if (subMesh.primitiveType == Renderer.PRIMITIVE_TYPE.INDEXED_TRIANGLES)
			{
				Renderer.drawIndexedTriangles(indicesCount, subMesh.vertexFormat);	
			}
		},

		_drawWireframeSubmesh: function (subMesh)
		{
			var indices = subMesh.indices;
			var lineIndices = [];

			for (var i = 0; i < indices.length / 3; i++)
			{
				var v0 = indices[3 * i + 0];
				var v1 = indices[3 * i + 1];
				var v2 = indices[3 * i + 2];

				lineIndices = lineIndices.concat([v0, v1, v1, v2, v2, v0]);
			}

			var lineIndexBuffer = GL.createBuffer();

			GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, lineIndexBuffer);
			GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(lineIndices), GL.STATIC_DRAW);

			GL.bindBuffer(GL.ARRAY_BUFFER, subMesh.vertexBuffer);

			Renderer.drawIndexedLines(lineIndices.length, Renderer.VERTEX_FORMAT.PPPXXXXX);
		},

		_drawBounds: function (worldModelMatrix)
		{
			var boundsProvider = this.gameObject.getComponent("meshBoundsProvider");
			if (!boundsProvider)
			{
				console.log("MeshRenderer: drawBounds set but no meshBoundsProvider on the gameobject");
				return;
			}

			for(var i = 0; i < this.mesh.submeshes.length; i++)
			{
				var aabb = AABB.transform(boundsProvider.aabbs[i], worldModelMatrix);
				Renderer.debug.drawAABB(aabb.center, aabb.extents);
			}
		},

	});

});