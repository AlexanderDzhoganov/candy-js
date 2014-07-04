include([ "math/headers" ], function ()
{

	Transform = function ()
	{
		this.name = "Transform";
		this.type = "transform";

		this.position = vec3.create();
		this.orientation = quat.create();
		this.orientationEuler = vec3.create();
	};

	Transform.prototype = new Component();

	Transform.extend(
	{
		
		lookAt: function (eye, center, upVector)
		{
			var lookAtMatrix = mat4.create();
			mat4.lookAt(lookAtMatrix, eye, center, upVector);

			var m3 = mat3.create();
			mat3.fromMat4(m3, lookAtMatrix);

			var orientation = quat.create();
			quat.fromMat3(orientation, m3);
			return orientation;
		},

	});

	Transform.prototype.extend(
	{

		getModelMatrix: function ()
		{
			var model = mat4.create();
			mat4.fromRotationTranslation(model, this.orientation, this.position);
			return model;
		},

		setOrientationEuler: function (x, y, z)
		{
			var xQuat = quat.create();
			quat.rotateX(xQuat, xQuat, x * 0.0174532925);
			var yQuat = quat.create();
			quat.rotateY(yQuat, yQuat, y * 0.0174532925);
			var zQuat = quat.create();
			quat.rotateZ(zQuat, zQuat, z * 0.0174532925);

			this.orientation = quat.create();
			quat.multiply(this.orientation, this.orientation, xQuat);
			quat.multiply(this.orientation, this.orientation, yQuat);
			quat.multiply(this.orientation, this.orientation, zQuat);
		},

	});

});
