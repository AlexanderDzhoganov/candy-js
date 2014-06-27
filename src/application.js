include(
[
	"ray",
	"scenegraph",
	"component",
	"gameobject",
	"tests/headers",
	"components/headers",
	"math/headers",
	"gl/headers",
	"gui/headers",
	"inputcontroller",
]);

var Application = function()
{
	this.running = true;
	this.terrain = null;
	this.cube = null;
	this.sceneGraph = null;

	this.init();
};

Application.extend({
	
});

Application.prototype.extend(
{

	init: function ()
	{
		InputController = new InputController();	
		Renderer = new Renderer();
		Gui = new Gui();

		this.sceneGraph = new SceneGraph();

		var grid = new GameObject("Grid");
		grid.addComponent(new GridRenderer(-100.0, -100.0, 100.0, 100.0));
		this.sceneGraph.insert(grid);

		var testMaterial = new Material("test material");
		var testProgram = new Shader(ResourceLoader.getContent("show_normals_vertex"), ResourceLoader.getContent("show_normals_fragment"));

		testMaterial.setProgram(testProgram);
		var tex = new Texture("checker");
		tex.setWrap(Texture.REPEAT);
		testMaterial.addTexture("diffuse", tex);

		var testObject = new GameObject("testMesh");
		testObject.addComponent(new OBJMeshProvider("mesh", false));
		testObject.addComponent(new MeshRenderer());
		testObject.renderer.material = testMaterial;

		testObject.transform.position = vec3.fromValues(0, 0, 0);

		/*var unitTest = new UnitTest();
		unitTest.addTest(new AABBTests());
		unitTest.runTests();*/

		var gameObjectEditor = null;

		Gui.addMouseClickCallback(function (x, y)
		{
			var cameraPosition = Renderer._activeCamera.gameObject.transform.position;

			var nearPoint = Renderer._activeCamera.unproject(vec3.fromValues(x, y, 0.0));
			var farPoint = Renderer._activeCamera.unproject(vec3.fromValues(x, y, 1.0));

			var dir = vec3.create();
			vec3.subtract(dir, farPoint, nearPoint);
			vec3.normalize(dir, dir);

			var ray = new Ray(nearPoint, dir);
			var result = this.sceneGraph.intersectRay(ray);
				
			if(result != null)
			{
				if(gameObjectEditor)
				{
					gameObjectEditor.dispose();
					gameObjectEditor = null;
				}

				gameObjectEditor = new GameObjectEditor(result);
			}
			else
			{
				if(gameObjectEditor)
				{
					gameObjectEditor.dispose();
					gameObjectEditor = null;
				}
			}
		}.bind(this));

		testObject.addComponent(new AnimationController());

		var time = 0.0;
		testObject.animationController.setAnimate(function (gameObject, deltaTime)
		{
			time += deltaTime * 4.0;

			var orientation = quat.create();
			quat.rotateY(orientation, orientation, time * 0.0174532925);
			quat.normalize(orientation, orientation);
			gameObject.transform.orientation = orientation;
			gameObject.transform.orientationEuler[1] = time;

			while(gameObject.transform.orientationEuler[1] >= 360.0)
			{
				gameObject.transform.orientationEuler[1] -= 360.0;
			}
		});

		this.sceneGraph.insert(testObject);

		var player = this._createPlayer(vec3.fromValues(0.0, 0.0, 0.0));

		var frameStatsWindow = this._createWindow("Frame stats", vec2.fromValues(0, 0), vec2.fromValues(420.0, 100.0), new GuiLayout(), new GuiSkin());
		frameStatsWindow.autoSize = true;
		frameStatsWindow.resizable = false;

		frameStatsWindow.drawSelf = function (gui)
		{
			gui.label("tris: " + Renderer.frameStats.numberOfTrianglesDrawn);
			gui.label("lines: " + Renderer.frameStats.numberOfLinesDrawn);
		};

		frameStatsWindow.show();

		//Gui.debugLayout = true;

		/*this._openResourceViewer();
*/
		var testTextBoxWindow = this._createWindow("TextBox test", vec2.fromValues(0, 0), vec2.fromValues(420.0, 100.0), new GuiLayout(), new GuiSkin());

		var multiLineText = "hello world,\nthis is some multiline text\n123456";

		var testShowButton = false;
		var testSpinTires = false;

		testTextBoxWindow.drawSelf = function (gui)
		{
			multiLineText = gui.textbox(multiLineText, 64, 16, false);
			gui.button("nothing");

			gui.dropdownmenu("MAIN MENU", {
				"stuff1": {
					"substuff1": function()
					{
						multiLineText = "SUCH GUI\nMUCH FUNCTIONALITY";
					},
					"substuff2": function()
					{
						setInterval(function() {
							testSpinTires = testSpinTires ? false : true;
						}, 500);
					},
					"substuff3": {
						"subsubstuff1": function() {
							console.log("spintires");
						},
						"SPINTIRES": function() {
							console.log("SPINTIRES");
						}
					}
				},
				stuff2: function() {
					testShowButton = testShowButton ? false : true;
				}
			});

			if ( testShowButton ) {
				gui.button("WHY AM I HERE")
			}

			if ( testSpinTires ) {
				gui.beginHorizontalGroup();
				gui.button("SPINTIRES!");
				gui.button("SPINTIRES!");
				gui.button("SPINTIRES!");
				gui.endHorizontalGroup();
			}
		}.bind(this);

		testTextBoxWindow.show();
/*
		var testWindow = this._createWindow("test window", vec2.fromValues(0, 0), vec2.fromValues(420.0, 100.0), new GuiLayout(), new GuiSkin());

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

			if (gui.button("click me"))
			{
				testClicked = true;
				console.log("click me");				
			}

			if (testClicked && gui.button("click me too"))
			{
				testClicked = false;
			}

			gui.endHorizontalGroup();

			gui.horizontalSeparator();

			gui.beginHorizontalGroup();

			if (gui.button("test"))
			{
				console.log("test");				
			}

			if (gui.button("1234"))
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

		Gui.bringToFront(testTextBoxWindow);

		var terrainGameObject = this._createTerrain();*/
	},

	update: function (deltaTime)
	{
		this.sceneGraph.update(deltaTime);
	},

	render: function ()
	{
		this.sceneGraph.render();
		Renderer.debug.renderSelf();
		Gui.renderSelf();
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
			if (timeUntilNextTick <= 0.0)
			{
				this.update(dt);
				timeUntilNextTick = 1.0 / tickRate + timeUntilNextTick;
			}

			Renderer.beginFrame();
			this.render();
			if (!this.doStop)
			{
				window.requestAnimationFrame(doFrame);
			}
		}.bind(this);

		window.requestAnimationFrame(doFrame);
	},

	_createWindow: function (title, position, size, layout, skin) // assumes true for autoSize, draw title bar and resizing;
	{
		var newWindow = new GuiWindow(position, size, layout, skin);
		newWindow.title = title;
		newWindow.autoSize = true;
		newWindow.drawTitlebar = true;
		newWindow.resizable = true;

		return newWindow;
	},

	_createPlayer: function(position)
	{
		var newPlayer = new GameObject("FPS Controller");
		newPlayer.addComponent(new FirstPersonController());
		newPlayer.addComponent(new Camera(Renderer.screenWidth, Renderer.screenHeight, 120.0, 0.1, 100.0));
		newPlayer.getComponent("camera").setActive();
		newPlayer.getComponent("transform").position = position;
		this.sceneGraph.insert(newPlayer);

		return newPlayer
	},

	_createTerrain:  function ()
	{
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
				data[x+y*size_x] = pixels[x * 4 + 4 * y * size_x];
			}
		}

		var vertSource = ResourceLoader.getContent("terrain_vertex");
		var fragSource = ResourceLoader.getContent("terrain_fragment");
		var program = new Shader(vertSource, fragSource);

		var material = new Material("TerrainMaterial");
		material.setProgram(program);
		material.addTexture("diffuse", new Texture("grass"));

		var newterrainGameObject = new GameObject("terrain01");
		newterrainGameObject.addComponent(new TerrainMeshProvider(data, size_x, size_y));
		newterrainGameObject.addComponent(new MeshRenderer());
		newterrainGameObject.getComponent("renderer").material = material;

		this.sceneGraph.insert(newterrainGameObject);
	},

	_openResourceViewer: function ()
	{
		var resourceViewer = new GuiWindow(vec2.fromValues(16, 128), vec2.fromValues(410, 100.0), new GuiLayout(), new GuiSkin());
		resourceViewer.title = "Resource viewer";
		resourceViewer.autoSize = true;

		var resources = ResourceLoader.getResources();
		var resourceArray = [];

		for(var key in resources)
		{
			if (resources[key].type == 'image')
			{
				resourceArray.push(resources[key]);
			}
		}

		var selectedResource = null;

		resourceViewer.drawSelf = function (gui)
		{
			gui.beginHorizontalGroup();

			selectedResource = gui.listbox(resourceArray, 140, 240, selectedResource);
			
			if (selectedResource != undefined)
			{
				if (resourceArray[selectedResource])
				{
					gui.image(resourceArray[selectedResource].name, 240, 240);
				}
			}
			else
			{
				gui.image("notfound", 240, 240);
			}

			gui.endHorizontalGroup();
		}.bind(this);

		resourceViewer.onClose = function ()
		{
			resourceViewer.visible = false;
		}.bind(this);

		resourceViewer.show();
	},

});