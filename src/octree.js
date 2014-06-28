include([], function ()
{

	Octree = function (aabb, maxTrianglesPerLeaf, vertices, indices)
	{
		this.vertices = vertices;
		this.indices = indices;
		this.maxTrianglesPerLeaf = maxTrianglesPerLeaf;

		this.root =
		{
			aabb: aabb,
			indices: indices,
			children: []
		};

		var split = function (node)
		{
			if(node.indices.length / 3 <= this.maxTrianglesPerLeaf)
			{
				return;
			}

			this._splitNode(node);

			for(var i = 0; i < node.children.length; i++)
			{
				split(node.children[i]);
			}
		}.bind(this);

		split(this.root);
	};

	Octree.extend(
	{

	});

	Octree.prototype.extend(
	{

		intersectFrustum: function (frustum)
		{
			var indices = [];

			var intersect = function (node)
			{
				if(frustum.intersectAABB(node.aabb) == Frustum.INTERSECT_RESULT.OUTSIDE)
				{
					return;
				}

				if(node.indices)
				{
					indices = indices.concat(node.indices);
				}
				else
				{
					for(var i = 0; i < node.children.length; i++)
					{
						intersect(node.children[i]);
					}
				}
			}.bind(this);

			intersect(this.root);
			return indices;
		},

		_splitNode: function (node)
		{
			node.children = [];
			var childBounds = node.aabb.octreeSplit();

			for (var i = 0; i < childBounds.length; i++)
			{
				var visibleSet = this._splitIndices(node.indices, childBounds[i]);

				node.children.push
				({
					aabb: childBounds[i],
					indices: visibleSet,
					children: [],
				});
			}
			
			node.indices = null;
		},

		_splitIndices: function (indices, aabb)
		{
			var visibleSetIndices = [];

			var pushTriangle = function(tri)
			{
				visibleSetIndices.push(tri[0]);
				visibleSetIndices.push(tri[1]);
				visibleSetIndices.push(tri[2]);
			}.bind(this);

			for(var i = 0; i < indices.length; i += 3)
			{
				var triIndices = [ indices[i], indices[i + 1], indices[i + 2] ];

				if(triIndices[0] == triIndices[1] || triIndices[1] == triIndices[2] || triIndices[0] == triIndices[2])
				{
					// degenerate triangle, skip it
					continue;
				}

				for(var q = 0; q < 3; q++)
				{
					var index = triIndices[q];
					var vertex = vec3.fromValues
					(
						this.vertices[index * 8 + 0],
						this.vertices[index * 8 + 1],
						this.vertices[index * 8 + 2]
					);

					if(aabb.pointTest(vertex))
					{
						pushTriangle(triIndices);
						break;
					}
				}
			}

			if(visibleSetIndices.length > indices.length)
			{
				debugger;
			}
			return visibleSetIndices;
		},

	});

});