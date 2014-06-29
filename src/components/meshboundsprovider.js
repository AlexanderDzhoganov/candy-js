include ([ "aabb" ], function ()
{

	MeshBoundsProvider = function ()
	{
		// public

		this.name = "MeshBoundsProvider";
		this.type = "meshBoundsProvider";

		this.aabbs = [];
	};

	MeshBoundsProvider.prototype = new Component();

	MeshBoundsProvider.extend(
	{
		
	});

	MeshBoundsProvider.prototype.extend(
	{

		// public

		dispose: function ()
		{
		},

		onInit: function ()
		{
		},

		getMinimumAABB: function ()
		{
			return this.aabb;
		},

		recalculateMinimumAABB: function ()
		{
			var renderer = this.gameObject.getComponent("renderer");
			if (!renderer)
			{
				console.log("MeshBoundsProvider: cannot recalculate AABB as no renderer is present on the gameobject");
				return;
			}

			var mesh = renderer.mesh;

			for (var q = 0; q < mesh.submeshes.length; q++)
			{
				var subMesh = mesh.submeshes[q];

				if (subMesh.vertexFormat != Renderer.VERTEX_FORMAT.PPPNNNTT)
				{
					console.log("MeshBoundsProvider: invalid vertex format, only 'PPPNNNTT' supported");
					return;
				}

				var vertices = subMesh.vertices;

				var aabb = null;

				if(subMesh.aabb != undefined)
				{
					aabb = subMesh.aabb;
				}
				else
				{	
					aabb = AABB.fromVertices(vertices);
				}

				this.aabbs.push(aabb);
			}
		},

	});

});