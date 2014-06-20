var Application = 
{

	terrain : null,
	cube : null,

	Initialize : function()
	{
		var vertexSource = Shader.GetSourceFromHTMLElement("vertex-shader");
		var fragmentSource = Shader.GetSourceFromHTMLElement("fragment-shader");

		var program = Shader.CreateProgram(vertexSource, fragmentSource);

		program.position = GL.getAttribLocation(program, "position");
		program.normal = GL.getAttribLocation(program, "normal");
		program.uvs = GL.getAttribLocation(program, "uvs");

		Shader.ActiveProgram(program);
		Shader.SetUniformMat4("viewProjection", Renderer._ActiveCamera.getViewProjectionMatrix());
		Shader.SetUniformMat4("model", mat4.create());
		Shader.SetUniformMat3("inverseView", mat3.create());

		// initialize terrain
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

			self.cube = Cube.Create();
			self.cube.uploadVertexData();
		});
	},

	Update : function()
	{

	},

	Render : function()
	{
		if(self.cube)
		{
			self.cube.renderSelf();
		}

		if(self.terrain)
		{
			self.terrain.renderSelf();
		}
	},

	Run : function (tickRate)
	{
		window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

		Renderer.Initialize();
		Application.Initialize();

		var timeForTick = 1.0 / tickRate;
		var nextTick = (new Date).getTime() + timeForTick;

		var doFrame = function(time)
		{
			var time = (new Date).getTime();

			if(time >= nextTick)
			{
				Application.Update();
				nextTick += timeForTick;
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

	_interval : null,

}