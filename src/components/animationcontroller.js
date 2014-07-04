include([], function ()
{

	AnimationController = function ()
	{
		// public

		this.name = "AnimationController";
		this.type = "animationController";

		this.playbackSpeed = 1.0;
		this.loopAnimation = true;
		this.currentAnimation = "";
		this.isPlaying = false;

		// private

		this._fps = 30.0; // temp
		this._timeUntilNextFrame = 0.0;
		this._currentFrame = 0;
		this._currentEndFrame = 0;
		this._currentStartFrame = 0;
	};

	AnimationController.prototype = new Component();

	AnimationController.extend(
	{
		
	});

	AnimationController.prototype.extend(
	{

		onInit: function ()
		{
			var meshRenderer = this.gameObject.getComponent("renderer");

			if(meshRenderer == null)
			{
				return;
			}
			else
			{
				var mesh = meshRenderer.mesh;
				//debugger;
				this._currentEndFrame = mesh.animationFrames.length - 1;
			}
		},

		onUpdate: function (deltaTime)
		{
			if (!this.isPlaying) 
			{
				return;
			}

			this._timeUntilNextFrame -= deltaTime * this.playbackSpeed;

			if (this._timeUntilNextFrame <= 0.0)
			{
				this._currentFrame += 1;
				if (this._currentFrame > this._currentEndFrame)
				{
					if (this.loopAnimation)
					{
						this._currentFrame = this._currentStartFrame;
					}
					else
					{
						this._currentFrame = this._currentEndFrame;
						this.isPlaying = false;
					}
				}

				this._timeUntilNextFrame = 1.0 / this._fps;
			}
		},

		play: function (startFrame, endFrame)
		{
			this.isPlaying = true;

			this._currentStartFrame = startFrame;
			this._currentEndFrame = endFrame;

			this._timeUntilNextFrame = 1.0 / this._fps;

		},

		stop: function ()
		{
			this.isPlaying = false;
		},

		getCurrentFrameDualQuaternions: function ()
		{
			var meshRenderer = this.gameObject.getComponent("renderer");

			if(meshRenderer == null)
			{
				return;
			}

			var mesh = meshRenderer.mesh;

			var interpolatedDualQuats = [];

			var t = (1.0 / this._fps) - this._timeUntilNextFrame;

			var nextFrame = this._currentFrame + 1;

			if (this._currentFrame + 1 > this._currentEndFrame)
			{
				if (this.loopAnimation)
				{
					nextFrame = this._currentStartFrame;
				}
				else
				{
					nextFrame = this._currentFrame;
				}
			}

			for (var i = 0; i < mesh.animationFrames[this._currentFrame].length; i++)
			{
				var dqA = mesh.animationFrames[this._currentFrame][i];
				var dqB = mesh.animationFrames[nextFrame][i];

				var result = [ quat.create(), quat.create() ];
				quat.slerp(result[0], dqA[0], dqB[0], t);

				var dqA1 = quat.clone(dqA[1]);
				var dqB1 = quat.clone(dqB[1]);
				quat.scale(dqA1, dqA1, 1.0 - t);
				quat.scale(dqB1, dqB1, t);
				quat.add(result[1], dqA1, dqB1);

				interpolatedDualQuats.push(result);
			}
			
			return interpolatedDualQuats;
		},

		getCurrentFrameAnimationMatrices: function ()
		{
			var meshRenderer = this.gameObject.getComponent("renderer");
			var interpolatedMatrices = []; 

			if(meshRenderer == null)
			{
				return;
			}
			var mesh = meshRenderer.mesh;

			var t = 1.0 - this._timeUntilNextFrame;

			if(t > 1.0)
			{
				debugger;
			}
			else if(t < 0.0)
			{
				debugger;
			}

			var nextFrame = this._currentFrame + 1;

			if (this._currentFrame + 1 > this._currentEndFrame)
			{
				if (this.loopAnimation)
				{
					nextFrame = this._currentStartFrame;
				}
				else
				{
					nextFrame = this._currentFrame;
				}
			}

			for (var i = 0; i < mesh.animationFrames[this._currentFrame].length; i++)
			{
				interpolatedMatrices.push(mesh.animationFrames[this._currentFrame][i]);
			}

			return interpolatedMatrices;
		},

		
	});

});
