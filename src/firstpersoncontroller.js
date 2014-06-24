var FirstPersonController = function () 
{
	this.name = "FirstPersonController";
	this.type = "script";

	this.yaw = 0.0;
	this.pitch = 0.0;
	this.roll = 0.0;
	this.upVector = vec3.create(0.0, 1.0, 0.0);

	this.moveSpeed = 5.0;
	this._Movement = vec3.create();
};

FirstPersonController.prototype = new Component();

FirstPersonController.extend(
{
	
});

FirstPersonController.prototype.extend(
{

	onInit: function ()
	{
		//this.position = vec3.fromValues(0, 0.5, -2);
		// Not recommended if there's more than one instance of FIRSTPERSONCONTROLLER
		window.addEventListener("keydown", this.handleKeydown.bind(this), false);
		window.addEventListener("keyup", this.handleKeyup.bind(this), false);

	//	document.body.onclick = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;

		/*document.onmousemove = function(e)
		{
			var dx = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
			var dy = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

			this.yaw += dx * 0.001;
			this.pitch += dy * 0.001;
		}.bind(this);*/
	},
		
	onUpdate: function (deltaTime)
	{
		var transform = this.gameObject.getComponent("transform");

		var orientation = quat.create();
		quat.rotateX(orientation, orientation, this.pitch);
		quat.rotateY(orientation, orientation, this.yaw);
		quat.invert(orientation, orientation);

		var movement = vec3.create();
		vec3.transformQuat(movement, this._Movement, orientation);

		transform.position[0] += movement[0] * deltaTime * this.moveSpeed;
		transform.position[1] += movement[1] * deltaTime * this.moveSpeed;
		transform.position[2] += movement[2] * deltaTime * this.moveSpeed;

		transform.orientation = quat.create();
		quat.rotateX(transform.orientation, transform.orientation, this.pitch);
		quat.rotateY(transform.orientation, transform.orientation, this.yaw);
	},

	getConfigWindow: function ()
	{
		var config = new GuiWindow(vec2.fromValues(16.0, 16.0), vec2.fromValues(420.0, 100.0), new GuiLayout(), new GuiSkin());
		config.title = "FirstPersonController";
		config.autoSize = true;

		config.onClose = function()
		{
			config.visible = false;
			//this.Gui.detachWindow(testWindow);
		}.bind(this);

		config.drawTitlebar = false;

		config.drawSelf = function (gui)
		{
			gui.label("position: " + this.position[0].toFixed(2) + ", " + this.position[1].toFixed(2) + ", " + this.position[2].toFixed(2));
			gui.label("yaw: " + this.yaw.toFixed(2) + ", pitch: " + this.pitch.toFixed(2) + ", roll: " + this.roll.toFixed(2));
		}.bind(this);

		return config;
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