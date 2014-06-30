include([], function ()
{

	Octree = function (aabb, maxTrianglesPerLeaf, submeshes)
	{
		this._submeshes = [];

		for (var i = 0; i < submeshes.length; i++)
		{
			var convertedIndices = [];

			for (var q = 0; q < submeshes[i].indices.length; q++)
			{
				convertedIndices.push(submeshes[i].indices[q]);
			}

			this._submeshes.push(
			{
				material: submeshes[i].material,
				vertices: submeshes[i].vertices,
				indices: convertedIndices,
			});
		}

		this._maxTrianglesPerLeaf = maxTrianglesPerLeaf;

		this._root =
		{
			aabb: aabb,
			indexSets: [],
			children: null
		};

		for (var i = 0; i < this._submeshes.length; i++)
		{
			this._root.indexSets.push(this._submeshes[i].indices);
		}

		var split = function (node)
		{
			var indicesCount = 0;
			for (var i = 0; i < node.indexSets.length; i++)
			{
				indicesCount += node.indexSets[i].length;
			}

			if (indicesCount / 3 <= this._maxTrianglesPerLeaf)
			{
				return;
			}

			this._splitNode(node);

			for (var i = 0; i < node.children.length; i++)
			{
				split(node.children[i]);
			}
		}.bind(this);

		split(this._root);
	};

	Octree.extend(
	{

	});

	Octree.prototype.extend(
	{

		intersectFrustum: function (frustum)
		{
			var indexSets = [];

			for (var i = 0; i < this._submeshes.length; i++)
			{
				indexSets.push([]);
			}

			var intersect = function (node)
			{
				if (frustum.intersectAABB(node.aabb) == Frustum.INTERSECT_RESULT.OUTSIDE)
				{
					return;
				}

				if (node.indexSets)
				{
					for (var i = 0; i < this._submeshes.length; i++)
					{
						indexSets[i] = indexSets[i].concat(node.indexSets[i]);
					}
				}
				else
				{
					for(var i = 0; i < node.children.length; i++)
					{
						intersect(node.children[i]);
					}
				}
			}.bind(this);

			intersect(this._root);
			return indexSets;
		},

		_splitNode: function (node)
		{
			node.children = [];
			var childBounds = node.aabb.octreeSplit();

			for (var i = 0; i < childBounds.length; i++)
			{
				var visibleSet = this._splitIndices(node.indexSets, childBounds[i]);

				node.children.push
				({
					aabb: childBounds[i],
					indexSets: visibleSet,
					children: [],
				});
			}
			
			node.indexSets = null;
		},

		_splitIndices: function (indexSets, aabb)
		{
			var visibleSets = [];

			for (var s = 0; s < indexSets.length; s++)
			{
				var indices = indexSets[s];
				var visibleSetIndices = [];

				var pushTriangle = function (tri)
				{
					visibleSetIndices.push(tri[0]);
					visibleSetIndices.push(tri[1]);
					visibleSetIndices.push(tri[2]);
				}.bind(this);
				
				if (Math.floor(indices.length / 3.0) != indices.length / 3.0)
				{
					debugger;
				}

				for (var i = 0; i < indices.length / 3; i++)
				{
					var triIndices =
					[
						indices[i * 3 + 0], 
						indices[i * 3 + 1], 
						indices[i * 3 + 2] 
					];

					if (triIndices[0] == triIndices[1] || triIndices[1] == triIndices[2] || triIndices[0] == triIndices[2])
					{
						// degenerate triangle, skip it
						continue;
					}

					for (var q = 0; q < 3; q++)
					{
						var index = triIndices[q];
						var vertex = vec3.fromValues
						(
							this._submeshes[s].vertices[index * 8 + 0],
							this._submeshes[s].vertices[index * 8 + 1],
							this._submeshes[s].vertices[index * 8 + 2]
						);

						if(aabb.pointTest(vertex))
						{
							pushTriangle(triIndices);
							break;
						}
					}
				}

				if (visibleSetIndices.length > indices.length)
				{
					debugger;
				}

				visibleSets.push(visibleSetIndices);
			}
			
			return visibleSets;
		},

	});

});