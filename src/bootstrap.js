var GL = null;
var Renderer = new Renderer();
var Shader = new Shader();
var Application = new Application();

var urls = ["test.jpg", "hello.txt"]; // iamges (jpg, png, etc...), text (string), binary (Uint8Array)

document.getElementById('gl-canvas').width = window.innerWidth
document.getElementById('gl-canvas').height = window.innerHeight

// var ResourceLoader = new ResourceLoader(urls, function ()
// {
	Application.run(60);
// });