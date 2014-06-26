var Component = function ()
{
	this.gameObject = null;
	
	this.name = "Component";
	this.type = "component";
	this.enabled = true;

	this.onInit = null;
	this.dispose = function () {};

	this.onEnabled = null;
	this.onDisabled = null;

	this.onBecomeVisible = null;
	this.onBecomeInvisible = null;

	this.onPreRender = null;
	this.onPostRender = null;

	this.onUpdate = null;
	this.onFixedUpdate = null;
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