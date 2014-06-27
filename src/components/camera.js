include([ "editor/components/camera", "frustum" ], function ()
{

	Camera = function (width, height, fov, near, far)
	{
		this.name = "Camera";
		this.type = "camera";

		this.width = width;
		this.height = height;
		this.fov = fov;
		this.near = near;
		this.far = far;
	};

	Camera.prototype = new Component();

	Camera.extend(
	{
		
	});

	Camera.prototype.extend(
	{

		setActive: function ()
		{
			Renderer.setActiveCamera(this);
		},

		getProjectionMatrix: function ()
		{
		   return this._CreateProjectionMatrix(this.width, this.height, this.fov, this.near, this.far);
		},

		getViewMatrix: function ()
		{
			var transform = this.gameObject.getComponent("transform");
			return this._CreateViewMatrix(transform.position, transform.orientation);
		},

		getViewProjectionMatrix: function ()
		{
			var cameraMatrix = mat4.create();
			mat4.multiply(cameraMatrix, this.getProjectionMatrix(), this.getViewMatrix());
			return cameraMatrix;
		},

		getFrustum: function ()
		{
			return new Frustum(this.getViewProjectionMatrix());
		},

		unproject: function (vertex)
		{
			var projection = this.getProjectionMatrix();
			var view = this.getViewMatrix();

			// inv(P * V)
			var viewProjection = mat4.create();
			mat4.multiply(viewProjection, projection, view);
			var inverseViewProjection = mat4.create();
			if(!mat4.invert(inverseViewProjection, viewProjection))
			{
				return null;
			}

			var tmp = vec4.fromValues(vertex[0], vertex[1], vertex[2], 1.0);
			tmp[0] = (tmp[0] / this.width) * 2.0 - 1.0;
			tmp[1] = (tmp[1] / this.height) * 2.0 - 1.0;
			tmp[2] = tmp[2] * 2.0 - 1.0;

			var result = vec4.create();
			vec4.transformMat4(result, tmp, inverseViewProjection);
			result[0] /= result[3];
			result[1] /= result[3];
			result[2] /= result[3];

			return result;
		},

		_CreateProjectionMatrix: function (width, height, fov, near, far)
		{
			var matrix = mat4.create();
			mat4.perspective(matrix, fov, width / height, near, far);
			return matrix;
		},

		_CreateViewMatrix: function (position, rotation)
		{
			var rotationMatrix = mat4.create();
			mat4.fromQuat(rotationMatrix, rotation);
			mat4.invert(rotation, rotation);

			var translationMatrix = mat4.create();
			mat4.translate(translationMatrix, translationMatrix, position);
			mat4.invert(translationMatrix, translationMatrix);

			var viewMatrix = mat4.create();
			mat4.multiply(viewMatrix, rotationMatrix, translationMatrix);
			return viewMatrix;
		}

	});

});
