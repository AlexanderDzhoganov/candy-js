var SceneGraph =
{

	Create : function()
	{
		return {

			insert: function(sceneNode)
			{
				if(!this._verifySceneNodeType(sceneNode))
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
						this.renderSelf();

						var modelMatrix = mat4.create();
						mat4.multiply(modelMatrix, parentModelMatrix, this.getModelMatrix());

						for(var i = 0; i < this._ChildNodes.length; i++)
						{
							this._ChildNodes._Render(modelMatrix);
						}
					}
				}

				this._SceneNodes.push(sceneNode);
			},

			render: function()
			{
				var modelMatrix = mat4.create();

				for(var i = 0; i < this._SceneNodes.length; i++)
				{
					this._SceneNodes[i]._Render(modelMatrix);
				}
			},

			_verifySceneNodeType : function(sceneNode)
			{
				if(!sceneNode.getModelMatrix)
				{
					console.log("invalid scene node type, getModelMatrix() not found");
					return false;
				}

				return true;
			},

			_SceneNodes : [],

		};
	},

};