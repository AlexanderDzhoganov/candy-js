var Application = 
{

	Initialize : function()
	{

		// initializ terrain
		ImageLoader.LoadFromURL("heightmap.png", function(image)
		{
			var pixels = ImageLoader.GetPixels(image);
			var size_x = image.width;
			var size_y = image.height;

			

		});
	},

	Update : function()
	{

	},

	Run : function (tickRate)
	{
		Application.Initialize();
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

	_interval : null,

}