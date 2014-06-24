var ResourceLoader = new ResourceLoader(
{
	"test_image": "resources/images/test.jpg",
	"text": "text.txt",
	"my_json_file": "testjson.json",
	"heightmap": "heightmap.png",
	"cursor": "cursor.png",
	"grass": "grass.png",
	"terrain_vertex": "shaders/terrain.vs",
	"terrain_fragment": "shaders/terrain.fs",
	"gui_vertex": "shaders/gui.vs",
	"gui_fragment": "shaders/gui.fs",
	"gui_quad_vertex": "shaders/gui_quad.vs",
	"gui_quad_fragment": "shaders/gui_quad.fs",
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