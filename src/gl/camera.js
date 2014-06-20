// Camera related functions

var Camera = 
{

	Create : function (width, height, fov, near, far)
	{
		return {
			position : vec3.create(),
			rotation : quat.create(),
			width : width,
			height : height,
			fov : fov,
			near : near,
			far : far,

			GetProjectionMatrix : function()
			{
				return Camera._CreateProjectionMatrix(this.width, this.height, this.fov, this.near, this.far);
			},

			GetViewMatrix : function()
			{
				return Camera._CreateViewMatrix(this.position, this.rotation);
			},

			GetInverseViewMatrix : function()
			{
				var matrix = Camera._CreateViewMatrix(this.position, this.rotation);
				var inverse = mat4.create();
				mat4.invert(inverse, matrix); 
				return inverse;
			},

			GetViewProjectionMatrix : function()
			{
				var cameraMatrix = mat4.create();
				mat4.multiply(cameraMatrix, this.GetProjectionMatrix(), this.GetViewMatrix());
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
		var matrix = mat4.create();
		mat4.identity(matrix);
		mat4.fromRotationTranslation(matrix, rotation, position);
		return matrix;
	},

};

