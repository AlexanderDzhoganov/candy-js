var AABB = function ()
{
	this.center = vec3.create();
	this.extents = vec3.create();
};

AABB.extend(
{
	
	fromVertices: function (vertices, stride)
	{
		if (stride == undefined)
		{
			stride = 3;
		}

		var min = vec3.fromValues(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
		var max = vec3.fromValues(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);

		for(var i = 0; i < vertices.length / stride; i++)
		{
			var position = vec3.fromValues
			(
				vertices[i * stride + 0],
				vertices[i * stride + 1],
				vertices[i * stride + 2]
			);

			if (position[0] < min[0])
			{
				min[0] = position[0];
			}

			if (position[0] > max[0])
			{
				max[0] = position[0];
			}

			if (position[1] < min[1])
			{
				min[1] = position[1];
			}

			if (position[1] > max[1])
			{
				max[1] = position[1];
			}

			if (position[2] < min[2])
			{
				min[2] = position[2];
			}

			if (position[2] > max[2])
			{
				max[2] = position[2];
			}
		}

		var diff = vec3.create();
		vec3.subtract(diff, max, min);
		vec3.scale(diff, diff, 0.5);
		var center = vec3.create();
		vec3.add(center, min, diff);
		var extents = diff;

		var aabb = new AABB();
		aabb.center = center;
		aabb.extents = extents;
		return aabb;
	},

	transform: function (aabb, matrix)
	{
		var vertices = [];

		var pushVertex = function (v0, v1, v2)
		{
			var vertex = vec4.fromValues(v0, v1, v2, 1.0);
			vec4.transformMat4(vertex, vertex, matrix);
			vertices.push(vertex[0]);
			vertices.push(vertex[1]);
			vertices.push(vertex[2]);
		}.bind(this);

		var topLeft = vec3.create();
		vec3.subtract(topLeft, aabb.center, aabb.extents);

		var bottomRight = vec3.create();
		vec3.add(bottomRight, aabb.center, aabb.extents);

		pushVertex(topLeft[0], topLeft[1], topLeft[2]);
		pushVertex(topLeft[0], bottomRight[1], topLeft[2]);
		pushVertex(bottomRight[0], topLeft[1], topLeft[2]);
		pushVertex(bottomRight[0], bottomRight[1], topLeft[2]);

		pushVertex(topLeft[0], topLeft[1], bottomRight[2]);
		pushVertex(topLeft[0], bottomRight[1], bottomRight[2]);
		pushVertex(bottomRight[0], topLeft[1], bottomRight[2]);
		pushVertex(bottomRight[0], bottomRight[1], bottomRight[2]);

		return AABB.fromVertices(vertices, 3);
	},

});

AABB.prototype.extend(
{

	/*intersectRay: function (ray)
	{
		//acquire bbox min and max bounds
		var vmin = vec3.create();
		var vmax = vec3.create();
		
		vec3.subtract(vmin, this.center, this.extents);
		vec3.add(vmax, this.center, this.extents);

		var T_nearDist = vec3.create();
		var T_farDist = vec3.create(); // vectors to hold the T-values for every direction
		var t_near = Number.MIN_VALUE; // limits as defined; 
		var t_far = Number.MAX_VALUE;

		for (var i = 0; i < 3; i++)
		{ 
			//we test slabs in every direction
			if (ray.direction[i] == 0.0)
			{
				// ray parallel to planes in this direction
				if ((ray.origin[i] < vmin[i]) || (ray.origin[i] > vmax[i]))
				{
					return { hit: false, nearDistance: 0.0 }; // parallel AND outside box : no intersection possible
				}
			}
			else
			{
				// ray not parallel to planes in this direction
				T_nearDist[i] = (vmin[i] - ray.origin[i]) / ray.direction[i];
				T_farDist[i] = (vmax[i] - ray.origin[i]) / ray.direction[i];

				if(T_nearDist[i] > T_farDist[i])
				{
					var temp = vec3.clone(T_farDist);
					vec3.copy(T_farDist, T_nearDist);
					vec3.copy(T_nearDist, temp);
				}

				// we want T_nearDist to hold values for intersection with near plane
				if (T_nearDist[i] > t_near)
				{
					t_near = T_nearDist[i];
				}

				if (T_farDist[i] < t_far)
				{
					t_far = T_farDist[i];
				}

				if ((t_near > t_far) || (t_far < 0))
				{
					return { hit: false, nearDistance: 0.0 };
				}
			}
		}

		return { hit: true, nearDistance: vec3.length(T_nearDist) };
	},*/

	octreeSplit: function ()
	{
		var vmin = vec3.create();
		var vmax = vec3.create();

		var topLeft = vec3.clone(this.extents);
		topLeft[0] *= -1.0;
		vec3.scale(topLeft, topLeft, 0.5)

		var topLeft2 = vec3.clone(this.extents);
		topLeft2[0] *= -1.0;
		topLeft2[2] *= -1.0;
		vec3.scale(topLeft2, topLeft2, 0.5)

		var topLeft3 = vec3.clone(this.extents);
		topLeft3[2] *= -1.0;
		vec3.scale(topLeft3, topLeft3, 0.5)

		var childrenAABB = [];

		for (var i = 0; i < 8; i++)
		{
			childrenAABB.push(new AABB());
		}

		var childExtents = vec3.create();
		vec3.scale(childExtents, this.extents, 0.5);

		vec3.subtract(childrenAABB[0].center, this.center, childExtents);
		childrenAABB[0].extents = childExtents;

		vec3.add(childrenAABB[1].center, this.center, childExtents);
		childrenAABB[1].extents = childExtents;

		vec3.subtract(childrenAABB[2].center, this.center, topLeft);
		childrenAABB[2].extents = childExtents;
		
		vec3.add(childrenAABB[3].center, this.center, topLeft);
		childrenAABB[3].extents = childExtents;

		vec3.subtract(childrenAABB[4].center, this.center, topLeft2);
		childrenAABB[4].extents = childExtents;

		vec3.add(childrenAABB[5].center, this.center, topLeft2);
		childrenAABB[5].extents = childExtents;

		vec3.subtract(childrenAABB[6].center, this.center, topLeft3);
		childrenAABB[6].extents = childExtents;

		vec3.add(childrenAABB[7].center, this.center, topLeft3);
		childrenAABB[7].extents = childExtents;

		return childrenAABB;
	},

	intersectRay: function (ray)
	{
		var max = function (a, b)
		{
			return Math.max(a, b);
		}

		var min = function (a, b)
		{
			return Math.min(a, b);
		}

		var lb = vec3.create();
		var rt = vec3.create();
		
		vec3.subtract(lb, this.center, this.extents);
		vec3.add(rt, this.center, this.extents);

		var dirFrac = vec3.fromValues(1.0 / ray.direction[0], 1.0 / ray.direction[1], 1.0 / ray.direction[2]);

		var t = 0.0;
		var t1 = (lb[0] - ray.origin[0]) * dirFrac[0];
		var t2 = (rt[0] - ray.origin[0]) * dirFrac[0];
		var t3 = (lb[1] - ray.origin[1]) * dirFrac[1];
		var t4 = (rt[1] - ray.origin[1]) * dirFrac[1];
		var t5 = (lb[2] - ray.origin[2]) * dirFrac[2];
		var t6 = (rt[2] - ray.origin[2]) * dirFrac[2];

		var tmin = max(max(min(t1, t2), min(t3, t4)), min(t5, t6));
		var tmax = min(min(max(t1, t2), max(t3, t4)), max(t5, t6));

		// if tmax < 0, ray (line) is intersecting AABB, but whole AABB is behing us
		if (tmax < 0)
		{
			t = tmax;
			return { hit: false, nearDistance: t };
		}

		// if tmin > tmax, ray doesn't intersect AABB
		if (tmin > tmax)
		{
			t = tmax;
			return { hit: false, nearDistance: t };
		}

		t = tmin;
		return { hit: true, nearDistance: t };
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