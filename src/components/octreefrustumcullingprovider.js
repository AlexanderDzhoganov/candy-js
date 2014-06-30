include([ "octree" ], function ()
{

	OctreeFrustumCullingProvider = function ()
	{
		// public

		this.name = "OctreeFrustumCullingProvider";
		this.type = "octreeFrustumCullingProvider";
		this.debugDrawOctrees = false;
		this.maxTrianglesPerLeaf = 65535;

		// private

		this._octree = [];
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

				this._octree = new Octree(bounds.meshAABB, this.maxTrianglesPerLeaf, mesh.submeshes);
			}
		},

		intersectFrustum: function (frustum)
		{
			return this._octree.intersectFrustum(frustum);
		},

	});

});