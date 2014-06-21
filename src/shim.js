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

String.capitalize = function (string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

/* Coding conventions examples
    var APPLICATION; // Class

    var Application; // Class initialization

    var application; // Member of a function/method; Var declaration always happens at beginning of scope

    this.application // Properties of a class

    APPLICATION.FPS // Class constants

    APPLICATION.getVersion() // Class static methods

    window.CONST_PI // Global constants

    getViewportHeight: // Class methods

    function() // function without params

    function( foo, bar ) // function with params

    getViewportHeight: function( foo, bar ) // full method declaration

    var APPLICATION = function() // class constructor

    APPLICATION.fn = new BASE() // APPLICATION extends BASE; BASE is considered abstract Class

    APPLICATION.x({}) // Static members of Class

    APPLICATION.fn.x({}) // Non-static members of Class

    Avoid that = this; self = this;etc.; instead use bind/call/apply

    Wrap classes into (function() {})();

    firstpersoncontroller.js // filenames
*/