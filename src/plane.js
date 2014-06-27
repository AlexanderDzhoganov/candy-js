Plane = function (a, b, c, d)
{
	this.abcd = new Float32Array([a, b, c, d]);
	this.normalize();
};

Plane.extend(
{

	halfspace: { NEGATIVE: -1, ON_PLANE: 0, POSITIVE: 1, },

});

Plane.prototype.extend(
{

	pointTest: function (point)
	{
		var d = this.distanceTo(point);
		return d < 0.0 ? Plane.NEGATIVE : (d > 0.0 ? Plane.POSITIVE : Plane.ON_PLANE); 
	},

	distanceTo: function (point)
	{
		return this.abcd[0] * point[0] + 
			   this.abcd[1] * point[1] + 
			   this.abcd[2] * point[2] +
			   	          this.abcd[3];
	},

	normalize: function ()
	{
		var magnitude = vec3.length(this.abcd);
		vec4.scale(this.abcd, this.abcd, 1.0 / magnitude);
	},

});
