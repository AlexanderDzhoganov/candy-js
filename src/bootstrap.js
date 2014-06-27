include(
[

	"shim",
	"math/headers",
	"gl/headers",
	"gui/headers",
	"resourceloader",
	"inputcontroller",
	"application",

], function ()
{

	console.log("starting up");

	ResourceLoader = new ResourceLoader(
	{
		// textures
		"heightmap": "resources/images/heightmap.png",
		"cursor": "resources/images/cursor.png",
		"grass": "resources/images/grass.png",
		"checker": "resources/images/checker.png",

		// meshes
		"mesh": "resources/meshes/teapot_lowres.obj",

		// shaders
		"terrain_vertex": "resources/shaders/terrain.vs",
		"terrain_fragment": "resources/shaders/terrain.fs",
		"gui_vertex": "resources/shaders/gui.vs",
		"gui_fragment": "resources/shaders/gui.fs",
		"gui_quad_vertex": "resources/shaders/gui_quad.vs",
		"gui_quad_fragment": "resources/shaders/gui_quad.fs",
		"diffuse_vertex": "resources/shaders/diffuse.vs",
		"diffuse_fragment": "resources/shaders/diffuse.fs",
		"show_normals_vertex": "resources/shaders/show_normals.vs",
		"show_normals_fragment": "resources/shaders/show_normals.fs",
		"wireframe_vertex": "resources/shaders/wireframe.vs",
		"wireframe_fragment": "resources/shaders/wireframe.fs",
	}, function (resName, progress, final)
	{
		// update progress bar
	}, function ()
	{
		console.log("Resources Loaded.");

		var ss = document.createElement("link");
		ss.type = "text/css";
		ss.rel = "stylesheet";
		ss.href = "main.css";
		document.getElementsByTagName("head")[0].appendChild(ss);

		var canvas = document.createElement('canvas');
		canvas.id = "gl-canvas";
		document.body.appendChild(canvas);

		document.getElementById('gl-canvas').width = window.innerWidth;
		document.getElementById('gl-canvas').height = window.innerHeight;
		
		InputController = new InputController();	
		Renderer = new Renderer();
		Gui = new Gui();
		Application = new Application();
		Application.run(60);
	});

});

