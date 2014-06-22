var ResourceLoader = new ResourceLoader(
{
	"test image": "resources/images/test.jpg",
	"text": "text.txt",
	"my_json_file": "testjson.json",
	"heightmap": "heightmap.png",
	"cursor": "cursor.png",
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
	Application = new Application();
	Application.run(60);
});