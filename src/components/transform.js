var Transform = function ()
{

	this.name = "Transform";
	this.type = "transform";

	this.position = vec3.create();
	this.orientation = quat.create();

};

Transform.prototype = new Component();

Transform.extend(
{
	
});

Transform.prototype.extend(
{

	getModelMatrix: function ()
	{
		return mat4.create();
	},

});