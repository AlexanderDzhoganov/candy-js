include([ "octree" ], function ()
{

	OctreeMeshProvider = function ()
	{
		this.name = "OctreeMeshProvider";
		this.type = "octreeMeshProvider";

		this.octrees = [];

		this.debugDrawOctrees = false;
	};

	OctreeMeshProvider.prototype = new Component();

	OctreeMeshProvider.extend(
	{

	});

	OctreeMeshProvider.prototype.extend(
	{

		onInit: function ()
		{
			var mesh = this.gameObject.meshProvider;
			var bounds = this.gameObject.meshBoundsProvider;

			if(mesh && bounds)
			{
				if(bounds.aabbs.length < mesh.submeshes.length)
				{
					bounds.recalculateMinimumAABB();
				}

				for(var i = 0; i < mesh.submeshes.length; i++)
				{
					this.octrees.push
					(
						new Octree(bounds.aabbs[i], 4200, mesh.submeshes[i].vertices, mesh.submeshes[i].indices)
					);
				}
			}
		},

		intersectFrustum: function (frustum, subMeshIndex)
		{
			//debugger;
			var result =  this.octrees[subMeshIndex].intersectFrustum(frustum);
			return result;
		},

	});

});