include([ "octree" ], function ()
{

	OctreeFrustumCullingProvider = function ()
	{
		this.name = "OctreeFrustumCullingProvider";
		this.type = "octreeFrustumCullingProvider";

		this.octrees = [];
		this.debugDrawOctrees = false;
	};

	OctreeFrustumCullingProvider.prototype = new Component();

	OctreeFrustumCullingProvider.extend(
	{

	});

	OctreeFrustumCullingProvider.prototype.extend(
	{

		onInit: function ()
		{
			var mesh = this.gameObject.renderer.mesh;
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
						new Octree(bounds.aabbs[i], 3000, mesh.submeshes[i].vertices, mesh.submeshes[i].indices)
					);
				}
			}
		},

		intersectFrustum: function (frustum, subMeshIndex)
		{
			return this.octrees[subMeshIndex].intersectFrustum(frustum);
		},

	});

});