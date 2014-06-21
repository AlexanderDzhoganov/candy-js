var Camera = function (width, height, fov, near, far)
{

	this.position = vec3.create();
	this.orientation = quat.create();
	this.width = width;
	this.height = height;
	this.fov = fov;
	this.near = near;
	this.far = far;

};

Camera.extend(
{
	
});

Camera.prototype.extend(
{

	getProjectionMatrix: function ()
	{
	   return this._CreateProjectionMatrix(this.width, this.height, this.fov, this.near, this.far);
	},

	getViewMatrix: function ()
	{
	   return this._CreateViewMatrix(this.position, this.orientation);
	},

	getNormalMatrix: function ()
	{
		var viewMatrix = this.getViewMatrix();
		mat4.invert(viewMatrix, viewMatrix);
		mat4.transpose(viewMatrix, viewMatrix);
		return viewMatrix;
	},

	getViewProjectionMatrix: function ()
	{
		var cameraMatrix = mat4.create();
		mat4.multiply(cameraMatrix, this.getProjectionMatrix(), this.getViewMatrix());
		return cameraMatrix;
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

		var viewMatrix = mat4.create();
		mat4.multiply(viewMatrix, rotationMatrix, translationMatrix);
		return viewMatrix;
	}

});

