var Application = function()
{
	this.running = true;
	this.terrain = null;
	this.cube = null;
	this.sceneGraph = null;
	this._FirstPersonController = null;

	this.init();
};

Application.extend({
	
});

Application.prototype.extend(
{

	init: function ()
	{
		this._FirstPersonController = new FirstPersonController();
		this._FirstPersonController.position = vec3.fromValues(-128, -16, -128);
		
		Renderer.setActiveCamera(this._FirstPersonController._Camera);

		this.sceneGraph = new SceneGraph();

		this.Gui = new Gui();
		var testLayout = new GuiLayout();

		var testWindow = new GuiWindow(vec2.fromValues(16.0, 16.0), vec2.fromValues(320.0, 160.0), "#222222", testLayout);
		testWindow.title = "test window";
		testWindow.autoSize = true;

		testWindow.drawSelf = function (gui)
		{
			gui.label("hello world", 16);

			gui.beginHorizontalGroup();

			gui.label("horizontal group", 16);

			gui.button("click me", function()
			{
				console.log("clicked");
			});

			gui.endHorizontalGroup();

			gui.beginHorizontalGroup();

			gui.button("click me too", function()
			{
				console.log("clicked 2");
			});

			gui.button("blabla", function()
			{
				console.log("clicked 2");
			});

			gui.endHorizontalGroup();
		};

		this.Gui.attachWindow(testWindow);

		this.sceneGraph.insert(this.Gui);

		// initialize terrain
		var heightmap = ResourceLoader.getContent("heightmap");
		var pixels = ImageLoader.GetPixels(heightmap);
		var size_x = heightmap.width;
		var size_y = heightmap.height;

		var data = new Uint8Array(size_x * size_y);

		for(var x = 0; x < size_x; x++)
		{
			for(var y = 0; y < size_y; y++)
			{
				data[x+y*size_x] = pixels[x*4+4*y*size_x];
			}
		}

		this.terrain = new Terrain(data, size_x, size_y);
		this.terrain.uploadVertexData();
		this.sceneGraph.insert(this.terrain);
	},

	update : function(deltaTime)
	{
		this._FirstPersonController.update(deltaTime);
	},

	render : function()
	{
		this.sceneGraph.render();
	},

	run : function (tickRate)
	{
		var timeUntilNextTick = 1.0 / tickRate,
		previousTime = 0.0;

		var doFrame = function(time)
		{
			time /= 1000.0;
			var dt = time - previousTime;
			previousTime = time;

			timeUntilNextTick -= dt;
			if(timeUntilNextTick <= 0.0)
			{
				this.update(dt);
				timeUntilNextTick = 1.0 / tickRate + timeUntilNextTick;
			}

			Renderer.beginFrame();
			this.render();
			if(!this.doStop)
			{
				window.requestAnimationFrame(doFrame);
			}
		}.bind(this);

		window.requestAnimationFrame(doFrame);
	},

	stop : function()
	{
		this.doStop = true;
	},

	doStop: false,

});