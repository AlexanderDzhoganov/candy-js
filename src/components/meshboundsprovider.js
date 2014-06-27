include ( [ "aabb" ] );

var MeshBoundsProvider = function ()
{
	// public

	this.name = "MeshBoundsProvider";
	this.type = "meshBoundsProvider";

	this.aabb = new AABB();
	this.boundingSphereRadius = 0.0;
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
		GL.deleteBuffer(this.vertexBuffer);
		GL.deleteBuffer(this.indexBuffer);
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
		var meshProvider = this.gameObject.getComponent("meshProvider");
		if (!meshProvider)
		{
			console.log("MeshBoundsProvider: cannot recalculate AABB as no meshProvider is present on the gameobject");
			return;
		}

		for (var i = 0; i < meshProvider.submeshes.length; i++)
		{
			var subMesh = meshProvider.submeshes[i];

			if (subMesh.vertexFormat != Renderer.VERTEX_FORMAT.PPPNNNTT)
			{
				console.log("MeshBoundsProvider: invalid vertex format, only 'PPPNNNTT' supported");
				return;
			}

			var vertices = subMesh.vertices;

			var min = vec3.fromValues(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
			var max = vec3.fromValues(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);

			for (var i = 0; i < vertices.length / 8; i++)
			{
				var position = vec3.fromValues
				(
					vertices[i * 8 + 0],
					vertices[i * 8 + 1],
					vertices[i * 8 + 2]
				);

				if (position[0] < min[0])
				{
					min[0] = position[0];
				}

				if (position[0] > max[0])
				{
					max[0] = position[0];
				}

				if (position[1] < min[1])
				{
					min[1] = position[1];
				}

				if (position[1] > max[1])
				{
					max[1] = position[1];
				}

				if (position[2] < min[2])
				{
					min[2] = position[2];
				}

				if (position[2] > max[2])
				{
					max[2] = position[2];
				}
			}

			var diff = vec3.create();
			vec3.subtract(diff, max, min);
			vec3.scale(diff, diff, 0.5);
			vec3.add(this.aabb.center, min, diff);
			this.aabb.extents = diff;

			this.boundingSphereRadius = vec3.length(this.aabb.extents);
			break;
		}

		this.createAABBMesh();
		return this.aabb;
	},

	createAABBMesh: function ()
	{
		var vertices = [];

		var pushVertex = function (x, y, z)
		{
			vertices.push(x);
			vertices.push(y);
			vertices.push(z);
		};

		var topLeft = vec3.create();
		vec3.subtract(topLeft, this.aabb.center, this.aabb.extents);

		var bottomRight = vec3.create();
		vec3.add(bottomRight, this.aabb.center, this.aabb.extents);

		pushVertex(topLeft[0], topLeft[1], topLeft[2]);
		pushVertex(topLeft[0], bottomRight[1], topLeft[2]);
		pushVertex(bottomRight[0], bottomRight[1], topLeft[2]);
		pushVertex(bottomRight[0], topLeft[1], topLeft[2]);

		pushVertex(topLeft[0], topLeft[1], bottomRight[2]);
		pushVertex(topLeft[0], bottomRight[1], bottomRight[2]);
		pushVertex(bottomRight[0], bottomRight[1], bottomRight[2]);
		pushVertex(bottomRight[0], topLeft[1], bottomRight[2]);

		var indices = 
		[
			0, 1, 1, 2, 2, 3, 3, 0, // back
			4, 5, 5, 6, 6, 7, 7, 4, // front
			0, 4, 1, 5, 2, 6, 3, 7 // sides
		];

		this.vertices = new Float32Array(vertices);
		this.indices = new Uint16Array(indices);

		this.vertexBuffer = GL.createBuffer();
		this.indexBuffer = GL.createBuffer();

		GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);
		GL.bufferData(GL.ARRAY_BUFFER, this.vertices, GL.STATIC_DRAW);

		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, this.indices, GL.STATIC_DRAW);
	},

});