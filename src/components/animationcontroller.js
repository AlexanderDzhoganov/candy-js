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

			this._timeUntilNextFrame -= deltaTime;

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

		getCurrentFrameAnimationMatrices: function ()
		{
			var meshRenderer = this.gameObject.getComponent("renderer");
			var interpolatedMatrices = []; 

			if(meshRenderer == null)
			{
				return;
			}
			else
			{
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
					if(mesh.animationFrames[this._currentFrame][i].rotation != undefined)
					{
						var rotationA = quat.clone(mesh.animationFrames[this._currentFrame][i].rotation);
						var translationA = vec3.clone(mesh.animationFrames[this._currentFrame][i].translation);

						var rotationB = quat.clone(mesh.animationFrames[nextFrame][i].rotation);
						var translationB = vec3.clone(mesh.animationFrames[nextFrame][i].translation);

						var finalRotation = quat.create();
						quat.slerp(finalRotation, rotationA, rotationB, t);

						var finalTranslation = vec3.create();
						vec3.scale(translationA, translationA, 1.0 - t);
						vec3.scale(translationB, translationB, t);
						vec3.add(finalTranslation, translationA, translationB);

						var transformation = mat4.create();
						mat4.fromRotationTranslation(transformation, rotationA, translationA);
						interpolatedMatrices.push(transformation);
					}
					else
					{
						interpolatedMatrices.push(mesh.animationFrames[this._currentFrame][i]);
					}
				}

				return interpolatedMatrices;
			}
		},

		
	});

});
