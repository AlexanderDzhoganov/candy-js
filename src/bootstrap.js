var ResourceLoader = new ResourceLoader(
{
	// textures
	"heightmap": "resources/images/heightmap.png",
	"cursor": "resources/images/cursor.png",
	"grass": "resources/images/grass.png",
	"checker": "resources/images/checker.png",

	// meshes
	"mesh": "resources/meshes/heart.obj",

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
}, function (resName, progress, final)
{
	// update progress bar
}, function ()
{
	console.log("Resources Loaded.");
	document.getElementById('gl-canvas').width = window.innerWidth;
	document.getElementById('gl-canvas').height = window.innerHeight;
	
	InputController = new InputController();	
	Renderer = new Renderer();
	Shader = new Shader();
	Gui = new Gui();
	Application = new Application();
	Application.run(60);
});