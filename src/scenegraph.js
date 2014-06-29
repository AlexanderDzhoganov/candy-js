include ([ "aabb" ], function ()
{

	SceneGraph = function ()
	{
		this._SceneNodes = [];
	};

	SceneGraph.extend(
	{
		
	});

	SceneGraph.prototype.extend(
	{

		insert: function (sceneNode)
		{
			if (!sceneNode._ChildNodes)
			{
				sceneNode._ChildNodes = [];
			}

			if (!sceneNode._Render)
			{
				sceneNode._Render = function (parentModelMatrix)
				{
					if (!this.enabled)
					{
						return;
					}

					var transformComponent = this.getComponent("transform");
					var modelMatrix = transformComponent.getModelMatrix();

					mat4.multiply(modelMatrix, parentModelMatrix, modelMatrix);
					
					var rendererComponent = this.getComponent("renderer");
					if (rendererComponent && rendererComponent.enabled)
					{
						Renderer.renderQueue.enqueue(rendererComponent, modelMatrix);
						//rendererComponent.onRender(modelMatrix);
					}

					for (var i = 0; i < this._ChildNodes.length; i++)
					{
						this._ChildNodes._Render(modelMatrix);
					}
				}

				sceneNode._Update = function (deltaTime)
				{
					if (!this.enabled)
					{
						return;
					}
					
					var scriptComponent = this.getComponent("script");
					if (scriptComponent && scriptComponent.onUpdate && scriptComponent.enabled)
					{
						scriptComponent.onUpdate(deltaTime);
					}

					var animationComponent = this.getComponent("animationController");
					if (animationComponent && animationComponent.onUpdate && animationComponent.enabled)
					{
						animationComponent.onUpdate(deltaTime);
					}

					for (var i = 0; i < this._ChildNodes.length; i++)
					{
						this._ChildNodes._Update(deltaTime);
					}
				}

				sceneNode.addChild = function (childNode)
				{
					this._ChildNodes.push(childNode);
				}

				sceneNode.getChildren = function ()
				{
					return this._ChildNodes; 
				}
			}

			this._SceneNodes.push(sceneNode);
		},
			
		render: function ()
		{
			var modelMatrix = mat4.create();

			GL.enable(GL.CULL_FACE);
			GL.enable(GL.DEPTH_TEST);
			GL.disable(GL.BLEND);

			for (var i = 0; i < this._SceneNodes.length; i++)
			{
				this._SceneNodes[i]._Render(modelMatrix);
			}

			GL.disable(GL.CULL_FACE);
			GL.disable(GL.DEPTH_TEST);
			GL.enable(GL.BLEND);
			GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
		},

		update: function (deltaTime)
		{
			for (var i = 0; i < this._SceneNodes.length; i++)
			{
				if (this._SceneNodes[i].enabled)
				{
					this._SceneNodes[i]._Update(deltaTime);
				}
			}
		},

		intersectRay: function (ray)
		{
			var recursiveIntersect = function (gameObject, ray, parentModelMatrix)
			{
				if(!parentModelMatrix)
				{
					parentModelMatrix = mat4.create();
				}

				var model = gameObject.transform.getModelMatrix();
				mat4.multiply(model, parentModelMatrix, model);

				var boundsProvider = gameObject.meshBoundsProvider;

				if(boundsProvider)
				{
					for(var i = 0; i < gameObject.renderer.mesh.submeshes[i]; i++)
					{
						var aabb = AABB.transform(boundsProvider.aabbs[i], model);
						var result = aabb.intersectRay(ray);
						if(result.hit)
						{
							return gameObject;
						}	
					}
				}

				var children = gameObject.getChildren();
				for(var i = 0; i < children.length; i++)
				{
					var hit = recursiveIntersect(children[i], ray, model);
					if(hit)
					{
						return hit;
					}
				}

				return null;
			};

			for (var i = 0; i < this._SceneNodes.length; i++)
			{
				if (!this._SceneNodes[i].enabled)
				{
					continue;
				}

				var gameObject = this._SceneNodes[i];
				var hit = recursiveIntersect(gameObject, ray);
				if(hit)
				{
					return hit;
				}
			}

			return null;
		},

	});

});