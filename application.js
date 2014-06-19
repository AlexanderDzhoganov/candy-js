var Application = 
{

	Run : function (tickRate)
	{
		Renderer.Initialize();

		var timeForTick = 1.0 / tickRate;
		var nextTick = (new Date).getTime() + timeForTick;

		this._interval = setInterval(function()
		{
			var time = (new Date).getTime();

			if(time >= nextTick)
			{
				Application.Update();
				nextTick += timeForTick;
			}

			Renderer.Update();
		}, 0);
	},

	Stop : function()
	{
		if(this._interval)
		{
			clearInterval(this._interval);
		}
	},

	Update : function()
	{

	},

	_interval : null,

}