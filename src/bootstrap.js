var ResourceLoader = new ResourceLoader(
{
	"heightmap": "resources/images/heightmap.png",
	"cursor": "resources/images/cursor.png",
	"grass": "resources/images/grass.png",
	"terrain_vertex": "resources/shaders/terrain.vs",
	"terrain_fragment": "resources/shaders/terrain.fs",
	"gui_vertex": "resources/shaders/gui.vs",
	"gui_fragment": "resources/shaders/gui.fs",
	"gui_quad_vertex": "resources/shaders/gui_quad.vs",
	"gui_quad_fragment": "resources/shaders/gui_quad.fs",
}, function (resName, progress, final)
{
	// update progress bar
}, function ()
{
	console.log("Resources Loaded.");
	document.getElementById('gl-canvas').width = window.innerWidth;
	document.getElementById('gl-canvas').height = window.innerHeight;
	InputController = new InputController();	

	// Tests
	// InputController.addGlobal( InputController.modes.DOWN, function( key ) {
	// 	console.log(key);
	// });

	// InputController.addCombo( [InputController.keys.CTRL, InputController.keys.A], function() {
	// 	console.log("Select all");
	// });

	Renderer = new Renderer();
	Shader = new Shader();
	Gui = new Gui();
	Application = new Application();
	Application.run(60);
});