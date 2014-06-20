// Camera related functions

var Camera = 
{

	Create : function (width, height, fov, near, far)
	{
		return {

			position : vec3.create(),
			orientation : quat.create(),
			width : width,
			height : height,
			fov : fov,
			near : near,
			far : far,

			getProjectionMatrix : function()
			{
				return Camera._CreateProjectionMatrix(this.width, this.height, this.fov, this.near, this.far);
			},

			getViewMatrix : function()
			{
				return Camera._CreateViewMatrix(this.position, this.orientation);
			},

			getNormalMatrix : function()
			{
				var rotationMatrix = mat4.create();
				mat4.fromQuat(rotationMatrix, this.orientation);
				mat4.invert(rotationMatrix, rotationMatrix);
				mat4.transpose(rotationMatrix, rotationMatrix);
				return rotationMatrix;
			},

			getViewProjectionMatrix : function()
			{
				var cameraMatrix = mat4.create();
				mat4.multiply(cameraMatrix, this.getProjectionMatrix(), this.getViewMatrix());
				return cameraMatrix;
			},

		};
	},

	_CreateProjectionMatrix : function (width, height, fov, near, far)
	{
		var matrix = mat4.create();
		mat4.identity(matrix);
		mat4.perspective(matrix, fov, width / height, near, far);
		return matrix;
	},

	_CreateViewMatrix : function (position, rotation)
	{
		var rotationMatrix = mat4.create();
		mat4.fromQuat(rotationMatrix, rotation);
		mat4.invert(rotation, rotation);

		var translationMatrix = mat4.create();
		mat4.translate(translationMatrix, translationMatrix, position);

		var viewMatrix = mat4.create();
		mat4.multiply(viewMatrix, rotationMatrix, translationMatrix);
		return viewMatrix;
	},

};

