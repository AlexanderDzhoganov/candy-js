var SceneGraph =
{

	Create : function()
	{
		return {

			Insert : function(sceneNode)
			{
				if(!this._VerifySceneNodeType(sceneNode))
				{
					return;
				}

				if(!sceneNode._ChildNodes)
				{
					sceneNode._ChildNodes = [];
				}

				if(!sceneNode._Render)
				{
					sceneNode._Render = function(parentModelMatrix)
					{
						this.RenderSelf();
						var modelMatrix = mat4.create();
						mat4.multiply(modelMatrix, parentModelMatrix, this.GetModelMatrix());

						for(var i = 0; i < this._ChildNodes.length; i++)
						{
							this._ChildNodes._Render(modelMatrix);
						}
					}
				}
			},

			Render : function()
			{
				var modelMatrix = mat4.create();

				for(var i = 0; i < this._SceneNodes.length; i++)
				{
					this._SceneNodes[i].Render(modelMatrix);
				}
			},

			_VerifySceneNodeType : function(sceneNode)
			{
				if(!sceneNode.GetModelMatrix)
				{
					Console.Log("invalid scene node type, GetModelMatrix() not found");
					return false;
				}

				return true;
			}

			_SceneNodes : [],

		};
	},

};