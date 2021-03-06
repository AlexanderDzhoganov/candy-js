include(
[
	"ray",
	"scenegraph",
	"component",
	"gameobject",
	"serialization",
	"mesh",
	"tests/headers",
	"components/headers",
	"math/headers",
	"gl/headers",
	"gui/headers",
	"inputcontroller",
	"octree",
	"quadtree",
]);

var Application = function()
{
	this.running = true;
	this.terrain = null;
	this.cube = null;
	this.sceneGraph = null;

	this.renderGui = false;

	this.init();
};

Application.extend({
	
});

Application.prototype.extend(
{

	init: function ()
	{
		console.log("Application.init()");

		InputController = new InputController();	
		Renderer = new Renderer();
		Gui = new Gui();

		InputController.add(InputController.keys.G, InputController.modes.DOWN, function (key)
		{
		 	this.renderGui = !this.renderGui;
		}.bind(this));

		console.log(GL.getExtension('WEBGL_draw_buffers'));

		this.sceneGraph = new SceneGraph();

		var grid = new GameObject("Grid");
		grid.addComponent(new GridRenderer(-100.0, -100.0, 100.0, 100.0));
		this.sceneGraph.insert(grid);

		var testProgram = new Shader(ResourceLoader.getContent("skin_dq_vertex"), ResourceLoader.getContent("diffuse_fragment"));
		var testMesh = new Mesh("lerpz");

		var lerpz = new GameObject("Lerpz");
		lerpz.addComponent(new MeshRenderer());
		lerpz.getComponent("renderer").setMesh(testMesh);
		lerpz.getComponent("renderer").disableCulling = true;
		lerpz.getComponent("animationController").playbackSpeed = 1.3;
		lerpz.animationController.setAnimation("walk", 0, 40);
		lerpz.animationController.setAnimation("idle", 300, 500);
		lerpz.animationController.playAnimation("idle");

		for(var q = 0; q < testMesh.submeshes.length; q++)
		{
			var submesh = testMesh.submeshes[q];
			var material = new Material(submesh.material);
			material.setProgram(testProgram);

			var texture = new Texture("lerpz_diffuse");
			texture.setWrap(Texture.WRAP_REPEAT);
			material.addTexture("diffuse", texture);
			lerpz.renderer.materials.push(material);
		}

		lerpz.transform.position = vec3.fromValues(30, 0, 0);
		lerpz.transform.setOrientationEuler(0.0, 90.0, 0.0);
		this.sceneGraph.insert(lerpz);

		var levelMesh = new Mesh("de_dust2");
		var levelProgram = new Shader(ResourceLoader.getContent("show_normals_vertex"), ResourceLoader.getContent("show_normals_fragment"));

		var levelObject = new GameObject("Level");
		levelObject.addComponent(new MeshRenderer());
		levelObject.getComponent("renderer").setMesh(levelMesh);
		levelObject.addComponent(new OctreeFrustumCullingProvider());
		levelObject.addComponent(new NavMeshCollider());
		levelObject.navMeshCollider.recalculate();

		levelObject.renderer.drawNavMesh = true;

		for(var q = 0; q < levelMesh.submeshes.length; q++)
		{
			var submesh = levelMesh.submeshes[q];
			var material = new Material(submesh.material);
			material.setProgram(levelProgram);

			var texture = new Texture(submesh.material);
			texture.setWrap(Texture.WRAP_REPEAT);
			material.addTexture("diffuse", texture);
			levelObject.renderer.materials.push(material);
		}

	 	this.sceneGraph.insert(levelObject);

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

		var time = 0.0;
		this.player = this._createPlayer(vec3.fromValues(0.0, 4.0, 8.0), lerpz, levelObject);

		var frameStatsWindow = this._createWindow("Frame stats", vec2.fromValues(0, 0), vec2.fromValues(420.0, 100.0), new GuiLayout(), new GuiSkin());
		frameStatsWindow.autoSize = true;
		frameStatsWindow.resizable = false;

		frameStatsWindow.drawSelf = function (gui)
		{
			gui.label("tris: " + Renderer.frameStats.numberOfTrianglesDrawn);
			gui.label("lines: " + Renderer.frameStats.numberOfLinesDrawn);
			gui.label("average fps: " + this.averageFps);
		}.bind(this);

		frameStatsWindow.show();
	},

	fixedUpdate: function (deltaTime)
	{

	},

	update: function (deltaTime)
	{
		this.sceneGraph.update(deltaTime);
	},

	render: function ()
	{
		this.sceneGraph.render();
		Renderer.debug.renderSelf();
	},

	run: function (tickRate)
	{
		var timeUntilNextTick = 1.0 / tickRate,
		previousTime = 0.0;
		
		var frameCounter = 0;
		var timeAccum = 0.0;
		this.averageFps = 0;

		var doFrame = function (time)
		{
			time /= 1000.0;
			var dt = time - previousTime;
			timeAccum += dt;
			frameCounter++;

			if(timeAccum >= 1.0)
			{
				this.averageFps = frameCounter;
				frameCounter = 0;
				timeAccum = 0.0;
			}

			previousTime = time;

			timeUntilNextTick -= dt;
			if (timeUntilNextTick <= 0.0)
			{
				this.fixedUpdate(dt);
				timeUntilNextTick = 1.0 / tickRate + timeUntilNextTick;
			}

			this.render();

			Renderer.doFrame();

			this.update(dt);

			if(this.renderGui)
			{
				Gui.renderSelf();
			}

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

	_createPlayer: function(position, link, level)
	{
		var newPlayer = new GameObject("Third Person Controller");
		newPlayer.addComponent(new ThirdPersonController());
		newPlayer.getComponent("script").link = link;
		newPlayer.getComponent("script").navMeshLink = level;
		newPlayer.addComponent(new Camera(Renderer.screenWidth, Renderer.screenHeight, 120.0, 1, 1000.0));
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