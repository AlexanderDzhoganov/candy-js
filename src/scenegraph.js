var SceneGraph = function()
{
	this._SceneNodes = [];
};

SceneGraph.extend(
{
	
});

SceneGraph.prototype.extend(
{

	insert: function(sceneNode)
	{
		if (!this._verifySceneNodeType(sceneNode))
		{
			return;
		}

		if (!sceneNode._ChildNodes)
		{
			sceneNode._ChildNodes = [];
		}

		if (!sceneNode._Render)
		{
			sceneNode._Render = function (parentModelMatrix)
			{
				this.renderSelf();

				var modelMatrix = mat4.create();
				mat4.multiply(modelMatrix, parentModelMatrix, this.getModelMatrix());

				for (var i = 0; i < this._ChildNodes.length; i++)
				{
					this._ChildNodes._Render(modelMatrix);
				}
			}

			sceneNode.AddChild = function (childNode)
			{
				sceneNode._ChildNodes.push(childNode);
			}
		}

		this._SceneNodes.push(sceneNode);
	},
		
	render: function()
	{
		var modelMatrix = mat4.create();

		GL.enable(GL.CULL_FACE);
		GL.enable(GL.DEPTH_TEST);
		GL.disable(GL.BLEND);

		for (var i = 0; i < this._SceneNodes.length; i++)
		{	
			if(this._SceneNodes[i].renderingLayer == RENDERING_LAYER.PERSPECTIVE)
			{
					this._SceneNodes[i]._Render(modelMatrix);
			}
		}

		GL.disable(GL.CULL_FACE);
		GL.disable(GL.DEPTH_TEST);
		GL.enable(GL.BLEND); 
		GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);

		var list = [];
		for (var i = 0; i < this._SceneNodes.length; i++)
		{	
			if(this._SceneNodes[i].renderingLayer == RENDERING_LAYER.GUI)
			{
				list.push(this._SceneNodes[i]);
			}
		}

		list.sort(function(a, b)
		{
			return a.zOrder - b.zOrder;
		});

		for( var i = 0; i < list.length; i++)
		{
			list[i]._Render(modelMatrix);
		}
	},
		
	_verifySceneNodeType: function(sceneNode)
	{
		if (!sceneNode.getModelMatrix)
		{
			console.log("invalid scene node type, getModelMatrix() not found");
			return false;
		}

		return true;
	},

});