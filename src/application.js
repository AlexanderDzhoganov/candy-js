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
		this.sceneGraph.insert(Gui);

		//Gui.debugLayout = true;

		var layout = new GuiLayout();
		var skin = new GuiSkin();

		this._FirstPersonControllerConfigWindow = this._FirstPersonController.getConfigWindow();
		this._FirstPersonControllerConfigWindow.show();

		this._openResourceViewer();

		var testWindow = new GuiWindow(vec2.fromValues(512.0, 16.0), vec2.fromValues(420.0, 100.0), layout, skin);
		testWindow.title = "Test Window";
		testWindow.autoSize = true;
		testWindow.drawTitlebar = true;

		var testInput = "hello world";

		testWindow.onClose = function()
		{
			testWindow.close();
		}.bind(this);

		var testClicked = false;
		var testChecked1 = false;
		var testChecked2 = false;
		var testChecked3 = false;

		var testListboxItems = [ "apple", "orange", "banana" ];
		var testListboxSelectedIndex = null;

		testWindow.drawSelf = function (gui)
		{
			gui.label("hello world");

			gui.beginHorizontalGroup();

				gui.label("horizontal group");

				if(testClicked && gui.button("click me too"))
				{
					testClicked = false;
				}

				if(gui.button("click me"))
				{
					testClicked = true;
					console.log("click me");				
				}

			gui.endHorizontalGroup();

			gui.horizontalSeparator();

			gui.beginHorizontalGroup();

				if(gui.button("test"))
				{
					console.log("test");				
				}

				if(gui.button("1234"))
				{
					console.log("1234");				
				}

			gui.endHorizontalGroup();

			gui.beginHorizontalGroup();

				gui.label("test input");

				testInput = gui.inputbox(testInput, 32);
			
			gui.endHorizontalGroup();

			gui.beginHorizontalGroup();
			gui.label("image");
			gui.image("heightmap", 64, 64);
			gui.endHorizontalGroup();

			gui.beginHorizontalGroup();
			gui.label("cursor");
			gui.image("cursor");
			gui.endHorizontalGroup();

			gui.beginHorizontalGroup();
			gui.label("checkbox");
			testChecked1 = gui.checkbox(testChecked1);
			gui.endHorizontalGroup();

			gui.beginHorizontalGroup();
			gui.label("checkbox2");
			testChecked2 = gui.checkbox(testChecked2);
			gui.label("checkbox3");
			testChecked3 = gui.checkbox(testChecked3);
			gui.endHorizontalGroup();

			testListboxSelectedIndex = gui.listbox(testListboxItems, 140, 140, testListboxSelectedIndex);

		}.bind(this);

		testWindow.show();

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
		//this.sceneGraph.insert(this.terrain);
	},

	update: function(deltaTime)
	{
		this._FirstPersonController.update(deltaTime);
	},

	render: function()
	{
		this.sceneGraph.render();
	},

	run: function (tickRate)
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

	stop: function()
	{
		this.doStop = true;
	},

	doStop: false,

	_openResourceViewer: function ()
	{
		var resourceViewer = new GuiWindow(vec2.fromValues(16, 128), vec2.fromValues(410, 100.0), new GuiLayout(), new GuiSkin());
		resourceViewer.title = "Resource viewer";
		resourceViewer.autoSize = true;

		var resources = ResourceLoader.getResources();
		var resourceNames = [];
		var selectedResource = null;

		for(var key in resources)
		{
			if(resources[key].type == "image")
			{
				resourceNames.push(key);
			}
		}

		resourceViewer.drawSelf = function (gui)
		{
			gui.beginHorizontalGroup();

			selectedResource = gui.listbox(resourceNames, 140, 240, selectedResource);
			
			gui.image(resourceNames[selectedResource], 240, 240);

			gui.endHorizontalGroup();
		}.bind(this);

		resourceViewer.onClose = function ()
		{
			resourceViewer.visible = false;
		}.bind(this);

		resourceViewer.show();
	},

});