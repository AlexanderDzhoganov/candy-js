include([], function ()
{

	Octree = function (boundingBox, maxTrianglesPerLeaf, vertices, indices)
	{
		this.vertices = vertices;
		this.indices = indices;
		this.root = { aabb: boundingBox, indices: indices, children: [] };
	};

	Octree.extend(
	{

	});

	Octree.prototype.extend(
	{

		splitNode: function (node)
		{
			var newNodes = [];
			var newAABBs = node.aabb.splitOctree();

			for (var i = 0; i < 8; i++)
			{
				newNodes.push(
				{
					aabb: newAABBs[i],
					indices: indices,
					children: [],
				});
			}
		},

	});

});