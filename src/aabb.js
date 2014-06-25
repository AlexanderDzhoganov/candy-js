var AABB = function ()
{

	this.center = vec3.create();
	this.extents = vec3.create();

};

AABB.extend(
{
	
});

AABB.prototype.extend(
{

	intersectRay: function (ray)
	{

	},

	// expands the AABB to fit another AABB
	expandToFit: function (aabb)
	{
		var thisTopLeft = vec3.create();
		vec3.subtract(this.center, this.extents);

		var thisBottomRight = vec3.create();
		vec3.add(this.center, this.extents);

		var otherTopLeft = vec3.create();
		vec3.subtract(aabb.center, aabb.extents);

		var otherBottomRight = vec3.create();
		vec3.add(aabb.center, aabb.extents);

		var max = function (x, y)
		{
			return vec3.fromValues(Math.max(x[0], y[0]), Math.max(x[1], y[1]), Math.max(x[2], y[2]));
		}

		var min = function (x, y)
		{
			return vec3.fromValues(Math.min(x[0], y[0]), Math.min(x[1], y[1]), Math.min(x[2], y[2]));
		}

		var resultTopLeft = min(thisTopLeft, otherTopLeft);
		var resultBottomRight = max(thisBottomRight, otherBottomRight); 

		vec3.subtract(this.extents, resultBottomRight, resultTopLeft);
		vec3.scale(this.extents, this.extents, 0.5);

		vec3.add(this.center, resultTopLeft, this.extents);
	},

});