var AABBTests = function ()
{

	var test1 = function()
	{
		var aabb = new AABB();
		aabb.center = vec3.fromValues(0, 0, 0);
		aabb.extents = vec3.fromValues(1, 1, 1);
		var ray = new Ray(vec3.fromValues( 0, 0, -2), vec3.fromValues(0, 0, 1));
		
		var hit = aabb.intersectRay(ray);
		console.log(hit);
	};

	this.run = function ()
	{
		test1();
	};

}

