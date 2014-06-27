include([ "editor/components/animationcontroller" ]);

var AnimationController = function ()
{
	this.name = "AnimationController";
	this.type = "animationController";

	this.animations = [];	
};

AnimationController.prototype = new Component();

AnimationController.extend(
{
	
});

AnimationController.prototype.extend(
{

	onUpdate: function (deltaTime)
	{
		for (var i = 0; i < this.animations.length; i++)
		{
			this.animations[i](this.gameObject, deltaTime);
		}
	},

	setAnimate: function (callback)
	{
		this.animations.push(callback);
	},

});