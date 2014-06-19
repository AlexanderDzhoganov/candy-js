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

			var data = new Uint8Array(size_x * size_y);

			for(var x = 0; x < size_x; x++)
			{
				for(var y = 0; y < size_y; y++)
				{
					data[x+y*size_x] = pixels[x*4+y*size_x];
				}
			}

			var terrain = Terrain.CreateFromHeightmap(data, size_x, size_y);
			Renderer.DrawIndexedTriangleStrip(terrain.vertices, terrain.indices);

		});
	},

	Update : function()
	{
	},

	Run : function (tickRate)
	{
		Renderer.Initialize();
		Application.Initialize();

		var timeForTick = 1.0 / tickRate;
		var nextTick = (new Date).getTime() + timeForTick;

		var doFrame = function()
		{
			var time = (new Date).getTime();

			if(time >= nextTick)
			{
				Application.Update();
				nextTick += timeForTick;
			}

			Renderer.Update();
			window.requestAnimationFrame(doFrame);
		};

		window.requestAnimationFrame(doFrame);
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