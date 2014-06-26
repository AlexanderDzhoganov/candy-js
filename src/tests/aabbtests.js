var AABBTests = function ()
{

	var test1 = function()
	{
		var aabb = new AABB();
		aabb.center = vec3.fromValues(0, 0, 0);
		aabb.extents = vec3.fromValues(1, 1, 1);
		var ray = new Ray(vec3.fromValues( 0, 0, -2), vec3.fromValues(0, 0, 1));
		
		var result = aabb.intersectRay(ray);
		expect (result.hit, true);
	};

	var test2 = function()
	{
		var aabb = new AABB();
		aabb.center = vec3.fromValues(0, 0, 0);
		aabb.extents = vec3.fromValues(1, 1, 1);
		var ray = new Ray(vec3.fromValues( 0, 0, 2), vec3.fromValues(0, 0, 1));
		
		var result = aabb.intersectRay(ray);
		expect ( result.hit, false);
	};

	var test3 = function()
	{
		var aabb = new AABB();
		aabb.center = vec3.fromValues(0, 0, 0);
		aabb.extents = vec3.fromValues(1, 1, 1);
		var ray = new Ray(vec3.fromValues( 0, 0, 0.5), vec3.fromValues(0, 0, 1));
		
		var result = aabb.intersectRay(ray);
		expect (result.hit, true);
	};

	var test4 = function()
	{
		var aabb = new AABB();
		aabb.center = vec3.fromValues(0, 0, 0);
		aabb.extents = vec3.fromValues(1, 1, 1);
		var ray = new Ray(vec3.fromValues( 0, 0, 0.5), vec3.fromValues(0, 0, 1));

		var result = aabb.intersectRay(ray);
		expect (result.hit, true);	

		aabb.center[0] = 999999.0;
		var resultX = aabb.intersectRay(ray);
		expect(resultX.hit, false);
		aabb.center[0] = 0.0;

		aabb.center[1] = 999999.0;
		var resultY = aabb.intersectRay(ray);
		expect(resultX.hit, false);
		aabb.center[1] = 0.0;

		aabb.center[2] = 999999.0;
		var resultZ = aabb.intersectRay(ray);
		expect(resultX.hit, false);
		aabb.center[2] = 0.0;
	};

	this.run = function ()
	{
		test1();
		test2();
		test3();
		test4();
	};

}

