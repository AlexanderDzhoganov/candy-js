var PointRectTest = function (point, position, size)
{
	if(point[0] >= position[0] && point[0] <= position[0] + size[0] && point[1] >= position[1] && point[1] <= position[1] + size[1])
	{
		return true;
	}

	return false;
}

// Automatic eXtend of object and override of existing ones
Object.extend = Object.prototype.extend = function(destination, props) 
{
	if (props === undefined) 
	{
		props = destination;
		destination = this;
	}

	for (var prop in props) 
	{
		if (props.hasOwnProperty(prop)) 
	{
			destination[ prop ] = props[ prop ];
		}
	}

	return destination;
};

Object.prototype.size = function() {
    var obj = this,
		size = 0, 
    	key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }

    return size;
};

Object.prototype.forEach = function( func ) {
	var obj = this,
		key;

	for( key in obj ) {
		if (obj.hasOwnProperty(key)) {
			func.call( null, key, obj[key] );
		}
	}
};

Object.prototype.first = function() {
	var obj = this;

	for( key in obj ) {
		if (obj.hasOwnProperty(key)) {
			return obj[key];
		}
	}
};

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

/* Coding conventions examples
	var Application; // Class

	var Application; // Class initialization

	var application; // Member of a function/method; Var declaration always happens at beginning of scope

	this.application // Properties of a class

	Application.FPS // Class constants

	Application.getVersion() // Class static methods

	window.CONST_PI // Global constants

	getViewportHeight: // Class methods

	function () // function without params

	function (foo, bar) // function with params

	getViewportHeight: function (foo, bar) // full method declaration

	var Application = function () // class constructor

	Application.fn = new Base () // APPLICATION extends BASE; BASE is considered abstract Class

	Application.x({}) // Static members of Class

	Application.fn.x({}) // Non-static members of Class

	Avoid that = this; self = this;etc.; instead use bind/call/apply

	Wrap classes into (function () {})();

	firstpersoncontroller.js // filenames
*/