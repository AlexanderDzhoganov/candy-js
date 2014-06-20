var Application = 
{

	terrain : null,
	cube : null,

	Initialize : function()
	{
		var vertexSource = Shader.GetSourceFromHTMLElement("vertex-shader");
		var fragmentSource = Shader.GetSourceFromHTMLElement("fragment-shader");

		var program = Shader.CreateProgram(vertexSource, fragmentSource);
		Shader.ActiveProgram(program);

		this._FirstPersonController = FirstPersonController.Create();
		this._FirstPersonController.position = vec3.fromValues(0, 0.1, -4.0);
		Renderer.SetActiveCamera(this._FirstPersonController.getCamera());

		self.cube = Cube.Create();
		self.cube.uploadVertexData();

		/*// initialize terrain
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

			//self.terrain = Terrain.CreateFromHeightmap(data, size_x, size_y);
			//self.terrain.uploadVertexData();

		});*/
	},

	Update : function(deltaTime)
	{
		this._FirstPersonController.update(deltaTime);
	},

	Render : function()
	{
		self.cube.renderSelf();
	},

	Run : function (tickRate)
	{
		window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

		Renderer.Initialize();
		Application.Initialize();

		var timeUntilNextTick = 1.0 / tickRate;
		var previousTime = 0.0;

		var doFrame = function(time)
		{
			time /= 1000.0;
			var dt = time - previousTime;
			previousTime = time;

			timeUntilNextTick -= dt;
			if(timeUntilNextTick <= 0.0)
			{
				Application.Update(dt);
				timeUntilNextTick = 1.0 / tickRate + timeUntilNextTick;
			}

			Renderer.Update();
			Application.Render();

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

	_FirstPersonController : null,

}