include([], function ()
{

	ThirdPersonController = function () 
	{
		this.name = "ThirdPersonController";
		this.type = "script";

		this.link = null;

		Gui.addMouseDeltaCallback(function (dx, dy)
		{
			if(this.link != null)
			{
				quat.rotateY(this.link.transform.orientation, this.link.transform.orientation, -dx * 0.0001);
			}
		}.bind(this));

		this._movement = vec3.create();
		InputController.add(InputController.keys.W, InputController.modes.DOWN, function (key)
		{
			this._movement[2] = 1;
			this.link.animationController.play();
		}.bind(this));

		InputController.add(InputController.keys.W, InputController.modes.UP, function (key)
		{
			this._movement[2] = 0;
			this.link.animationController.stop();
		}.bind(this));

	};

	ThirdPersonController.prototype = new Component();

	ThirdPersonController.extend(
	{
		
	});

	ThirdPersonController.prototype.extend(
	{

		onInit: function ()
		{
		},
			
		onUpdate: function (deltaTime)
		{
			if(this.link != null)
			{
				var movement = vec3.create();
				vec3.transformQuat(movement, this._movement, this.link.transform.orientation);
				vec3.scale(movement, movement, deltaTime  * 2.0);
				vec3.add(this.link.transform.position, this.link.transform.position, movement);

				var offset = vec3.fromValues(0, 4, -6);
				vec3.transformQuat(offset, offset, this.link.transform.orientation);

				vec3.add(this.gameObject.transform.position, this.link.transform.position, offset);

				var lookAtPoint = vec3.clone(this.link.transform.position);
				lookAtPoint[1] += this.link.meshBoundsProvider.meshAABB.extents[1] * 2.0;
				this.gameObject.transform.orientation = Transform.lookAt(this.gameObject.transform.position, lookAtPoint, vec3.fromValues(0.0, 1.0, 0.0));
			}
		},

	});

});