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

	dispatchQueue: function ()
	{
		for (var i = 0; i < this._enqueued.length; i++)
		{
			this._enqueued.renderer.renderSelf(modelMatrix);
		}

		this._enqueued = [];
	},

	flushQueue: function ()
	{
		this._enqueued = [];
	},

});