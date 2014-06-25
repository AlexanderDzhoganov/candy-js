var Transform = function ()
{

	this.name = "Transform";
	this.type = "transform";

	this.position = vec3.create();
	this.orientation = quat.create();

};

Transform.prototype = new Component();

Transform.extend(
{
	
});

Transform.prototype.extend(
{

	getModelMatrix: function ()
	{
		var model = mat4.create();
		mat4.fromRotationTranslation(model, this.orientation, this.position);
		return model;
	},

	createConfigWindow: function ()
	{
		var wnd = new GuiWindow(vec2.fromValues(0.0, 0.0), vec2.fromValues(400.0, 0.0), new GuiLayout(), new GuiSkin());
		wnd.autoSize = true;
		wnd.title = this.name;

		wnd.drawSelf = function (gui)
		{
			gui.label("Position");

			gui.beginHorizontalGroup();

			gui.label("x:");
			this.position[0] = gui.inputbox(this.position[0], 6);

			gui.label("y:");
			this.position[1] = gui.inputbox(this.position[1], 6);

			gui.label("z:");
			this.position[2] = gui.inputbox(this.position[2], 6);

			gui.endHorizontalGroup();

			gui.label("Rotation");

			var rotationsEuler = vec3.fromValues(0.0, 0.0, 0.0);

			gui.beginHorizontalGroup();

			gui.label("x:");
			rotationsEuler[0] = gui.inputbox(rotationsEuler[0], 6);

			gui.label("y:");
			rotationsEuler[1] = gui.inputbox(rotationsEuler[1], 6);

			gui.label("z:");
			rotationsEuler[2] = gui.inputbox(rotationsEuler[2], 6);

			gui.endHorizontalGroup();

			this.orientation = quat.create();
			quat.rotateX(this.orientation, this.orientation, rotationsEuler[0] * 0.0174532925);
			quat.rotateY(this.orientation, this.orientation, rotationsEuler[1] * 0.0174532925);
			quat.rotateZ(this.orientation, this.orientation, rotationsEuler[2] * 0.0174532925);

		}.bind(this);

		return wnd;
	},

});