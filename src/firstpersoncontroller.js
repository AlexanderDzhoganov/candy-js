var FirstPersonController = function () 
{
	this.yaw = 0.0;
	this.pitch = 0.0;
	this.roll = 0.0;
	this.upVector = vec3.create(0.0, 1.0, 0.0);
	this.position = vec3.create(0.0, 0.0, 0.0);
	this.moveSpeed = 5.0;
	this._Camera = null;
	this._Movement = vec3.create();
	
	this.init();
};

FirstPersonController.extend(
{
	
});

FirstPersonController.prototype.extend(
{

	init: function ()
	{
		this._Camera = new Camera(Renderer.screenWidth, Renderer.screenHeight, 45.0, 0.1, 100.0);
		this.position = vec3.fromValues(0, 0.5, -2);

		// Not recommended if there's more than one instance of FIRSTPERSONCONTROLLER
		window.addEventListener("keydown", this.handleKeydown.bind(this), false);
		window.addEventListener("keyup", this.handleKeyup.bind(this), false);

		document.body.onclick = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;

		document.onmousemove = function(e)
		{
			var dx = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
			var dy = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

			this.yaw += dx * 0.001;
			this.pitch += dy * 0.001;
		}.bind(this);
	},
		
	update: function (deltaTime)
	{
		var orientation = quat.create();
		quat.rotateX(orientation, orientation, this.pitch);
		quat.rotateY(orientation, orientation, this.yaw);
		quat.invert(orientation, orientation);

		var movement = vec3.create();
		vec3.transformQuat(movement, this._Movement, orientation);

		this.position[0] += movement[0] * deltaTime * this.moveSpeed;
		this.position[1] += movement[1] * deltaTime * this.moveSpeed;
		this.position[2] += movement[2] * deltaTime * this.moveSpeed;

		this._Camera.position = this.position;
		this._Camera.orientation = quat.create();
		quat.rotateX(this._Camera.orientation, this._Camera.orientation, this.pitch);
		quat.rotateY(this._Camera.orientation, this._Camera.orientation, this.yaw);
	},
		
	handleKeydown: function ()
	{
		var keyCode = event.keyCode;

		if (keyCode == 65) // left
		{
			this._Movement[0] = 1;
		}
		else if (keyCode == 68) // right
		{
			this._Movement[0] = -1;
		}
		else if (keyCode == 87) // up
		{
			this._Movement[2] = 1;
		}
		else if (keyCode == 83) // down
		{
			this._Movement[2] = -1;
		}
	},

	handleKeyup: function ()
	{
		var keyCode = event.keyCode;

		if (keyCode == 65) // left
		{
			this._Movement[0] = 0.0;
		}
		else if (keyCode == 68) // right
		{
			this._Movement[0] = 0.0;
		}
		else if (keyCode == 87) // up
		{
			this._Movement[2] = 0.0;
		}
		else if (keyCode == 83) // down
		{
			this._Movement[2] = 0.0;
		}
	},

});