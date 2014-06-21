var GL = null;
var Renderer = new Renderer();
var Shader = new Shader();
var Application = new Application();

// var urls = ["test.jpg", "hello.txt"]; // iamges (jpg, png, etc...), text (string), binary (Uint8Array)

var urls = {
	"test": "test.jpg",
	"text": "text.txt"
}

document.getElementById('gl-canvas').width = window.innerWidth
document.getElementById('gl-canvas').height = window.innerHeight

function step( progress, end ) {
	console.log()
}

function finish() {
	Application.run(60);
}

var ResourceLoader = new ResourceLoader(urls, step, finish);