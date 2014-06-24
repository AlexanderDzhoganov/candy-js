var Component = function ()
{
	
	this.gameObject = null;
	this.name = "Component";
	this.type = "component";

};

Component.extend(
{
	
});

Component.prototype.extend(
{

	_attachToGameObject: function (gameObject)
	{
		this.gameObject = gameObject;
	},

});