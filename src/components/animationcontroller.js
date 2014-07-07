include([], function ()
{

	AnimationController = function ()
	{
		// public

		this.name = "AnimationController";
		this.type = "animationController";

		this.playbackSpeed = 1.0;
		this.loopAnimation = true;
		this.isPlaying = false;
		this.namedAnimations = {};

		// private

		this._fps = 30.0; // temp
		this._timeUntilNextFrame = 0.0;
		this._nextFrameDuration = 0.0;

		this._currentAnimation = 0;
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
				this._currentEndFrame = mesh.animations[this._currentAnimation].framesCount;
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
				else if(this._currentFrame < this._currentStartFrame)
				{
					this._currentFrame = this._currentStartFrame;
				}

				this._timeUntilNextFrame = 1.0 / this._fps;
				this._nextFrameDuration = 1.0 / this._fps;
			}
		},

		setAnimation: function (name, startFrame, endFrame)
		{
			this.namedAnimations[name] = [startFrame, endFrame];
		},

		playAnimation: function (name)
		{
			this.isPlaying = true;
			this._currentStartFrame = this.namedAnimations[name][0];
			this._currentEndFrame = this.namedAnimations[name][1];
			this._timeUntilNextFrame = 0.5;
			this._nextFrameDuration = 0.5;
		},

		play: function (startFrame, endFrame)
		{
			this.isPlaying = true;

			if(startFrame != undefined && endFrame != undefined)
			{
				this._currentStartFrame = startFrame;
				this._currentEndFrame = endFrame;

				this._timeUntilNextFrame = 1.0 / this._fps;
			}
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

			var t = this._nextFrameDuration - this._timeUntilNextFrame;
			if(t < 0.0)
			{
				t = 0.0;
			}
			else if(t > 1.0)
			{
				t = 1.0;
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
			else if(this._currentFrame < this._currentStartFrame)
			{
				nextFrame = this._currentStartFrame;
			}
	
			var animation = mesh.animations[this._currentAnimation];
			var framesCount = animation.framesCount;
			var jointsCount = animation.jointsCount;
			var dataPtrCurrent = this._currentFrame * jointsCount * 8;
			var dataPtrNext = nextFrame * jointsCount * 8;

			for (var i = 0; i < jointsCount; i++)
			{	
				var dqA1x = animation.frameData[dataPtrCurrent++];
				var dqA1y = animation.frameData[dataPtrCurrent++];
				var dqA1z = animation.frameData[dataPtrCurrent++];
				var dqA1w = animation.frameData[dataPtrCurrent++];
				var dqA2x = animation.frameData[dataPtrCurrent++];
				var dqA2y = animation.frameData[dataPtrCurrent++];
				var dqA2z = animation.frameData[dataPtrCurrent++];
				var dqA2w = animation.frameData[dataPtrCurrent++];

				var dqB1x = animation.frameData[dataPtrNext++];
				var dqB1y = animation.frameData[dataPtrNext++];
				var dqB1z = animation.frameData[dataPtrNext++];
				var dqB1w = animation.frameData[dataPtrNext++];
				var dqB2x = animation.frameData[dataPtrNext++];
				var dqB2y = animation.frameData[dataPtrNext++];
				var dqB2z = animation.frameData[dataPtrNext++];
				var dqB2w = animation.frameData[dataPtrNext++];

				var dqA = 
				[
					quat.fromValues(dqA1x, dqA1y, dqA1z, dqA1w),
					quat.fromValues(dqA2x, dqA2y, dqA2z, dqA2w)
				];

				var dqB = 
				[
					quat.fromValues(dqB1x, dqB1y, dqB1z, dqB1w),
					quat.fromValues(dqB2x, dqB2y, dqB2z, dqB2w)
				];

				var result = [ quat.create(), quat.create() ];
				quat.slerp(result[0], dqA[0], dqB[0], t);

				var dqA1 = quat.clone(dqA[1]);
				var dqB1 = quat.clone(dqB[1]);
				quat.scale(dqA1, dqA1, 1.0 - t);
				quat.scale(dqB1, dqB1, t);
				quat.add(result[1], dqA1, dqB1);

				result[1] = dqA[1];
				quat.normalize(result[0], result[0]);

				interpolatedDualQuats.push(result);
			}
			
			return interpolatedDualQuats;
		},
		
	});

});
