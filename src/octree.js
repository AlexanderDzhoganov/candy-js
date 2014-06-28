include([], function ()
{

	Octree = function (aabb, maxTrianglesPerLeaf, vertices, indices)
	{
		this.vertices = vertices;
		this.indices = indices;
		this.maxTrianglesPerLeaf = maxTrianglesPerLeaf;

		var convertedIndices = []; //because input is in Uint16 format !;

		for (var i = 0; i < indices.length; i++)
		{
			convertedIndices.push(indices[i]);
		}

		this.root =
		{
			aabb: aabb,
			indices: convertedIndices,
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

			//Renderer.debug.drawAABB(node.aabb.center, node.aabb.extents);

			for (var i = 0; i < childBounds.length; i++)
			{
				var visibleSet = this._splitIndices(node.indices, childBounds[i]);

				//Renderer.debug.drawAABB(childBounds[i].center, childBounds[i].extents);

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

			var pushTriangle = function (tri)
			{
				visibleSetIndices.push(tri[0]);
				visibleSetIndices.push(tri[1]);
				visibleSetIndices.push(tri[2]);
			}.bind(this);
			
			if(Math.floor(indices.length / 3.0) != indices.length / 3.0)
			{
				debugger;
			}

			for(var i = 0; i < indices.length / 3; i++)
			{
				var triIndices =
				[
					indices[i * 3 + 0], 
					indices[i * 3 + 1], 
					indices[i * 3 + 2] 
				];

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