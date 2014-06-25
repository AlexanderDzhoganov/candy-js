var Camera = function (width, height, fov, near, far)
{
	this.name = "Camera";
	this.type = "camera";

	this.width = width;
	this.height = height;
	this.fov = fov;
	this.near = near;
	this.far = far;
};

Camera.prototype = new Component();

Camera.extend(
{
	
});

Camera.prototype.extend(
{

	setActive: function ()
	{
		Renderer.setActiveCamera(this);
	},

	getProjectionMatrix: function ()
	{
	   return this._CreateProjectionMatrix(this.width, this.height, this.fov, this.near, this.far);
	},

	getViewMatrix: function ()
	{
		var transform = this.gameObject.getComponent("transform");
		return this._CreateViewMatrix(transform.position, transform.orientation);
	},

	getViewProjectionMatrix: function ()
	{
		var cameraMatrix = mat4.create();
		mat4.multiply(cameraMatrix, this.getProjectionMatrix(), this.getViewMatrix());
		return cameraMatrix;
	},

	getFrustum: function ()
	{
		return new Frustum(this.fov, this.width / this.height, this.near, this.far);
	},

	createConfigWindow: function ()
	{
		var wnd = new GuiWindow(vec2.fromValues(0.0, 0.0), vec2.fromValues(400.0, 0.0), new GuiLayout(), new GuiSkin());
		wnd.autoSize = true;
		wnd.title = this.name;

		wnd.drawSelf = function (gui)
		{

			gui.label("Field of view");
			this.fov = parseFloat(gui.inputbox(this.fov.toString(), 4));

		}.bind(this);

		return wnd;
	},

	_CreateProjectionMatrix: function (width, height, fov, near, far)
	{
		var matrix = mat4.create();
		mat4.perspective(matrix, fov, width / height, near, far);
		return matrix;
	},

	_CreateViewMatrix: function (position, rotation)
	{
		var rotationMatrix = mat4.create();
		mat4.fromQuat(rotationMatrix, rotation);
		mat4.invert(rotation, rotation);

		var translationMatrix = mat4.create();
		mat4.translate(translationMatrix, translationMatrix, position);

		var viewMatrix = mat4.create();
		mat4.multiply(viewMatrix, rotationMatrix, translationMatrix);
		return viewMatrix;
	}

});

