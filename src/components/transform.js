include([], function ()
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
		
	});

	Transform.prototype.extend(
	{

		getModelMatrix: function ()
		{
			var model = mat4.create();
			mat4.fromRotationTranslation(model, this.orientation, this.position);
			return model;
		},

	});

});
