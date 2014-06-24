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
	//InputController = new InputController();	

	// Tests
	/*InputController.add( InputController.keys.A, InputController.modes.DOWN, function() {
		console.log("left");
	});

	InputController.add( InputController.keys.D, InputController.modes.UP, function() {
		console.log("right");
	});

	InputController.once( InputController.keys.Q, InputController.modes.DOWN, function() {
		console.log("Q");
	});	

	InputController.add( InputController.keys.W, InputController.modes.DOWN, function() {
		console.log("up");
	});

	InputController.once( InputController.keys.S, InputController.modes.UP, function() {
		console.log("down");
	});

	InputController.remove( InputController.keys.W, InputController.modes.DOWN, function() {
		console.log("up");
	});*/

	Renderer = new Renderer();
	Shader = new Shader();
	Gui = new Gui();
	Application = new Application();
	Application.run(60);
});