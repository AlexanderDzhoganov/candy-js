var FirstPersonController =
{

	Create : function ()
	{
		var controller =
		{

			yaw : 0.0,
			
			pitch : 0.0,
			
			roll : 0.0,

			upVector : vec3.create(0.0, 1.0, 0.0),

			position : vec3.create(0.0, 0.0, 0.0),

			moveSpeed : 1.0,

			initialize : function()
			{
				var controller = this;

				window.addEventListener("keypress", this.handleKeypress(this), false );

				document.body.onclick = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;

				document.onmousemove = function (e)
				{
					var dx = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
					var dy = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

					controller.yaw += dx * 0.001;
					controller.pitch += dy * 0.001;
				}
			},

			getCamera : function()
			{
				return this._Camera;
			},

			update : function(deltaTime)
			{
				alert(this.position[0] + " - " + this.position[1] + " - " + this.position[2]);

				var orientation = quat.create();
				quat.rotateX(orientation, orientation, this.pitch);
				quat.rotateY(orientation, orientation, this.yaw);
				quat.invert(orientation, orientation);

				var movement = vec3.create();
				vec3.transformQuat(movement, this._Movement, orientation);

				alert(deltaTime);

				this.position[0] += movement[0] * deltaTime * this.moveSpeed;
				this.position[1] += movement[1] * deltaTime * this.moveSpeed;
				this.position[2] += movement[2] * deltaTime * this.moveSpeed;

				this._Camera.position = this.position;

				this._Camera.orientation = quat.create();
				quat.rotateX(this._Camera.orientation, this._Camera.orientation, this.pitch);
				quat.rotateY(this._Camera.orientation, this._Camera.orientation, this.yaw);

			},

			handleKeypress : function(controller)
			{
				return function(event)
				{
					var keyCode = event.keyCode;

					if(keyCode == 97) // left
					{
						this._Movement[0] += 0.1;
					}
					else if(keyCode == 100) // right
					{
						this._Movement[0] -= 0.1;
					}
					else if(keyCode == 119) // up
					{
						this._Movement[2] += 0.1;
					}
					else if(keyCode == 115) // down
					{
						this._Movement[2] -= 0.1;
					}
				}
			},

			_Camera : Camera.Create(Renderer.screenWidth, Renderer.screenHeight, 45.0, 0.1, 100.0),

			_Movement : vec3.create(),

		};

		controller.initialize();

		return controller;
	},

};