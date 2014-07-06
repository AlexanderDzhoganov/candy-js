Ray = function (origin, direction)
{
	this.origin = origin;
	this.direction = direction;
};

Ray.extend(
{
	
});

Ray.prototype.extend(
{

	transform: function (matrix)
	{
		return new Ray();
	},

	intersectTriangle: function (v0, v1, v2)
	{
		var u = vec3.create();
		vec3.subtract(u, v1, v0);

		var v = vec3.create();
		vec3.subtract(v, v2, v0);

		var n = vec3.create();
		vec3.cross(n, u, v);

		var w0 = vec3.create();
		vec3.subtract(w0, this.origin, v0);

		var a = -vec3.dot(n, w0);
		var b = vec3.dot(n, this.direction);

		if(Math.abs(b) < 1e-17)
		{
			return null;
		}

		var r = a / b;
		if (r < 0.0)
		{
			return null;
		}

		var intersectionPoint = vec3.create();
		vec3.scale(intersectionPoint, this.direction, r);
		vec3.add(intersectionPoint, intersectionPoint, this.origin);

		var uu = vec3.dot(u, u);
		var uv = vec3.dot(u, v);
		var vv = vec3.dot(v, v);

		var w = vec3.create();
		vec3.subtract(w, intersectionPoint, v0);

		var wu = vec3.dot(w, u);
		var wv = vec3.dot(w, v);
		var D = uv * uv - uu * vv;

		var s = (uv * wv - vv * wu) / D;
		if (s < 0.0 || s > 1.0)
		{
			return null;
		}

		var t = (uv * wu - uu * wv) / D;
		if (t < 0.0 || (s + t) > 1.0)
		{
			return null;
		}

		return intersectionPoint;
	},

});