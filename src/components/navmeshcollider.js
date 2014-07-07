include([ "quadtree" ], function ()
{

	NavMeshCollider = function ()
	{
		// public

		this.name = "NavMeshCollider";
		this.type = "navMeshCollider";

		this.gridSize = 128;

		// private

		this._quadtree = null;
		this._navmesh = null;
		this._aabb = null;
	};

	NavMeshCollider.prototype = new Component();

	NavMeshCollider.extend(
	{

	});

	NavMeshCollider.prototype.extend(
	{

		onInit: function ()
		{
			var meshRenderer = this.gameObject.getComponent("renderer");
			if(meshRenderer == null)
			{
				return;
			}

			if(meshRenderer.mesh.navMesh != null)
			{
				this._navmesh = meshRenderer.mesh.navMesh;
			}
		},

		recalculate: function ()
		{
			if(this._navmesh == null)
			{
				return;
			}

			this._aabb = AABB.fromVertices(this._navmesh.vertices);
			this._quadtree = new Quadtree(this._aabb, 36, [{ material: "navmesh", vertices: this._navmesh.vertices, indices: this._navmesh.indices }]);
			console.log(this._quadtree);
		},

		raycast: function (ray)
		{
			return this._quadtree.intersectRay(ray);
		},

	});

});