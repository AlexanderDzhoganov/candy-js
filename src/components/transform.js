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
		return mat4.create();
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
			this.position[0] = gui.inputbox(this.position[0], 5);

			gui.label("y:");
			this.position[1] = gui.inputbox(this.position[1], 5);

			gui.label("z:");
			this.position[2] = gui.inputbox(this.position[2], 5);

			gui.endHorizontalGroup();

		}.bind(this);

		return wnd;
	},

});