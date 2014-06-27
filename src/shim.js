PointRectTest = function (point, position, size)
{
	if (point[0] > position[0] && point[0] < position[0] + size[0] && point[1] > position[1] && point[1] < position[1] + size[1])
	{
		return true;
	}

	return false;
}

/*void GetEulerAngles(Quaternion q, double& yaw, double& pitch, double& roll)
{
    const double w2 = q.w*q.w;
    const double x2 = q.x*q.x;
    const double y2 = q.y*q.y;
    const double z2 = q.z*q.z;
    const double unitLength = w2 + x2 + y2 + z2;    // Normalised == 1, otherwise correction divisor.
    const double abcd = q.w*q.x + q.y*q.z;
    const double eps = 1e-7;    // TODO: pick from your math lib instead of hardcoding.
    const double pi = 3.14159265358979323846;   // TODO: pick from your math lib instead of hardcoding.
    if (abcd > (0.5-eps)*unitLength)
    {
        yaw = 2 * atan2(q.y, q.w);
        pitch = pi;
        roll = 0;
    }
    else if (abcd < (-0.5+eps)*unitLength)
    {
        yaw = -2 * ::atan2(q.y, q.w);
        pitch = -pi;
        roll = 0;
    }
    else
    {
        const double adbc = q.w*q.z - q.x*q.y;
        const double acbd = q.w*q.y - q.x*q.z;
        yaw = ::atan2(2*adbc, 1 - 2*(z2+x2));
        pitch = ::asin(2*abcd/unitLength);
        roll = ::atan2(2*acbd, 1 - 2*(y2+x2));
    }
}*/

QuatToEuler = function (q)
{
	var w2 = q[3] * q[3];
	var x2 = q[0] * q[0];
	var y2 = q[1] * q[1];
	var z2 = q[2] * q[2];

	var unitLength = w2 + x2 + y2 + z2;
	var abcd = q[3] * q[0] + q[1] * q[2];
	var eps = 1e-7;
	var pi = Math.PI;

	var yaw = 0.0;
	var pitch = 0.0;
	var roll = 0.0;

	if (abcd > (0.5 - eps) * unitLength)
	{
		yaw = 2.0 * Math.atan2(q[1], q[3]);
		pitch = pi;
		roll = 0.0;
	}
	else if (abcd < (-0.5 + eps) * unitLength)
	{
		yaw = -2.0 * Math.atan2(q[1], q[3]);
		pitch = -pi;
		roll = 0.0;
	}
	else
	{
		var adbc = q[3] * q[2] - q[0] * q[1];
		var acbd = q[3] * q[1] - q[0] * q[2];
		yaw = Math.atan2(2.0 * adbc, 1.0 - 2.0 * (z2 + x2));
		pitch = Math.asin(2.0 * abcd / unitLength);
		roll = Math.atan2(2.0 * acbd, 1.0 - 2.0 * (y2 + x2));
	}

	return vec3.fromValues(yaw, pitch, roll);
};

Clamp = function (x, min, max)
{
	if (x < min)
	{
		x = min;
	}

	if (x > max)
	{
		x = max;
	}

	return x;
}

ptsToPixels = function ( pts ) {
	return pts * 1.333333;
}

// Automatic eXtend of object and override of existing ones
Object.extend = Object.prototype.extend = function (destination, props) 
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
			destination[prop] = props[prop];
		}
	}

	return destination;
};

Object.prototype.size = function ()
{
    var obj = this;
	var size = 0;
	var	key;
    for (key in obj)
    {
        if (obj.hasOwnProperty(key))
        {
        	size++;
        }
    }

    return size;
};

Object.prototype.forEach = function (func)
{
	var obj = this;
	var key;

	for (key in obj)
	{
		if (obj.hasOwnProperty(key))
		{
			func.call(null, key, obj[key]);
		}
	}
};

Object.prototype.first = function ()
{
	var obj = this;

	for (key in obj)
	{
		if (obj.hasOwnProperty(key))
		{
			return obj[key];
		}
	}
};

if (typeof String.prototype.startsWith !== 'function')
{
	String.prototype.startsWith = function (str)
	{
	  return this.slice(0, str.length) === str;
	};
}
  
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