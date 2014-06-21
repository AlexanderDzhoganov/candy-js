var ResourceLoader = new ResourceLoader(
{
	"test image": "resources/images/test.jpg",
	"text": "text.txt",
	"my_json_file": "testjson.json",
	"heightmap": "heightmap.png",
}, function (resName, progress, final)
{
	// update progress bar
}, function ()
{
	console.log("Resources Loaded.");
	document.getElementById('gl-canvas').width = window.innerWidth
	document.getElementById('gl-canvas').height = window.innerHeight
	Renderer = new Renderer();
	Shader = new Shader();
	Application = new Application();
	Application.run(60);
});