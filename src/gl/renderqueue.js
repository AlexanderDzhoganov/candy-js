var RenderQueue = function ()
{

	this._enqueued = [];

};

RenderQueue.extend(
{

});

RenderQueue.prototype.extend(
{

	enqueue: function (renderer, modelMatrix)
	{
		this._enqueued.push(
		{
			renderer: renderer,
			modelMatrix: modelMatrix,
		});
	},

	dispatchQueue: function (doFlush)
	{
		for (var i = 0; i < this._enqueued.length; i++)
		{
			for (var q = 0; q < this._enqueued[i].renderer.mesh.submeshes.length; q++)
			{
				this._enqueued[i].renderer.onSetupMaterial(q);
				this._enqueued[i].renderer.onRender(q, this._enqueued[i].modelMatrix);
			}
		}

		if(doFlush)
		{
			this._enqueued = [];
		}
	},

	flushQueue: function ()
	{
		this._enqueued = [];
	},

});