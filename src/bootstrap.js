var GL = null;
var Renderer = new Renderer();
var Shader = new Shader();
var Application = new Application();

document.getElementById('gl-canvas').width = window.innerWidth
document.getElementById('gl-canvas').height = window.innerHeight

var ResourceLoader = new ResourceLoader({
	"test image": "test.jpg",
	"text": "text.txt",
	"my_json_file": "testjson.json"
}, function( resName, progress, final) {
	console.log("Resource '" + resName + "' loaded: " + progress + "/" + final)
}, function ()
{
	console.log("Resources Loaded.");
	Application.run(60);
});