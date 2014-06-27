include([ "plane" ]);

var Frustum = function (m)
{
	this.left   = new Plane(m[3] + m[0], m[7] + m[4], m[11] + m[8], m[15] + m[12]);
	this.right  = new Plane(m[3] - m[0], m[7] - m[4], m[11] - m[8], m[15] - m[12]);
	this.bottom = new Plane(m[3] + m[1], m[7] + m[5], m[11] + m[9], m[15] + m[13]);
	this.top    = new Plane(m[3] - m[1], m[7] - m[5], m[11] - m[9], m[15] - m[13]);
	this.near   = new Plane(m[3] + m[2], m[7] + m[6], m[11] + m[10], m[15] + m[14]);
	this.far    = new Plane(m[3] - m[2], m[7] - m[6], m[11] - m[10], m[15] - m[14]);

	this.planes = [ this.left, this.right, this.bottom, this.top, this.near, this.far ];
};

Frustum.extend({
	
	INTERSECT_RESULT:
	{
		INSIDE: 0,
		OUTSIDE: 1,
		INTERSECT: 2,
	},

});

Frustum.prototype.extend(
{

	transform: function (modelMatrix)
	{

	},

	intersectAABB: function (aabb)
	{
		var bottomLeft = vec3.create();
		vec3.subtract(bottomLeft, aabb.center, aabb.extents);

		var topRight = vec3.create();
		vec3.add(topRight, aabb.center, aabb.extents);

		var vertices =
		[
			vec3.fromValues(bottomLeft[0], bottomLeft[1], bottomLeft[2]),
			vec3.fromValues(bottomLeft[0],   topRight[1], bottomLeft[2]),
			vec3.fromValues(  topRight[0],   topRight[1], bottomLeft[2]),
			vec3.fromValues(  topRight[0], bottomLeft[1], bottomLeft[2]),
			vec3.fromValues(bottomLeft[0], bottomLeft[1],   topRight[2]),
			vec3.fromValues(bottomLeft[0],   topRight[1],   topRight[2]),
			vec3.fromValues(  topRight[0],   topRight[1],   topRight[2]),
			vec3.fromValues(  topRight[0], bottomLeft[1],   topRight[2]),
		];

		var outPoints = 0;
		var inPoints = 0;
		var result = Frustum.INTERSECT_RESULT.INSIDE;

		for(var i = 0; i < 6; i++)
		{
			var plane = this.planes[i];

			for(var q = 0; q < 8 && (inPoints == 0 || outPoints == 0); q++)
			{
				var vertex = vertices[q];
				if(plane.distanceTo(vertex) < 0)
				{
					outPoints++;
				}
				else
				{
					inPoints++;
				}
			}

			if(inPoints == 0)
			{
				return Frustum.INTERSECT_RESULT.OUTSIDE;
			}

			if(outPoints > 0)
			{
				result = Frustum.INTERSECT_RESULT.INTERSECT;
			}
		}

		return result;
	},

});