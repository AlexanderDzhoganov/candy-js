Transform.prototype.extend(
{

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

			gui.beginHorizontalGroup();

			gui.label("x:");
			this.orientationEuler[0] = gui.inputbox(this.orientationEuler[0], 6);

			gui.label("y:");
			this.orientationEuler[1] = gui.inputbox(this.orientationEuler[1], 6);

			gui.label("z:");
			this.orientationEuler[2] = gui.inputbox(this.orientationEuler[2], 6);

			gui.endHorizontalGroup();

			this.orientation = quat.create();
			quat.rotateX(this.orientation, this.orientation, this.orientationEuler[0] * 0.0174532925);
			quat.rotateY(this.orientation, this.orientation, this.orientationEuler[1] * 0.0174532925);
			quat.rotateZ(this.orientation, this.orientation, this.orientationEuler[2] * 0.0174532925);
			quat.normalize(this.orientation, this.orientation);

		}.bind(this);

		return wnd;
	},

});