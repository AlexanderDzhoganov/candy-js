include([ "shim", "resourceloader", "application" ], function ()
{
	ResourceLoader = new ResourceLoader(
	{
		// textures
		"heightmap": "resources/images/heightmap.png",
		"cursor": "resources/images/cursor.png",
		"grass": "resources/images/grass.png",
		"checker": "resources/images/checker.png",

		// meshes
		"mesh": "resources/meshes/teapot_lowres.obj",
		//"sponza": "resources/meshes/sponza/sponza.obj",

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
	},
	function (resName, progress, final)
	{
		// update progress bar
	},
	function ()
	{
		console.log("resources loaded");

		var styleSheet = document.createElement("link");
		styleSheet.type = "text/css";
		styleSheet.rel = "stylesheet";
		styleSheet.href = "main.css";
		document.getElementsByTagName("head")[0].appendChild(styleSheet);

		var canvas = document.createElement('canvas');
		canvas.id = "gl-canvas";
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		document.body.appendChild(canvas);
		
		Application = new Application();
		Application.run(120);
	});

});

