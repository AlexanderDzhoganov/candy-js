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
			var newX = parseFloat(gui.inputbox(this.position[0].toString(), 5));
			this.position[0] = newX == newX ? newX : this.position[0];

			gui.label("y:");
			var newY = parseFloat(gui.inputbox(this.position[1].toString(), 5));
			this.position[1] = newY == newY ? newY : this.position[1];

			gui.label("z:");
			var newZ = parseFloat(gui.inputbox(this.position[2].toString(), 5));
			this.position[2] = newZ == newZ ? newY : this.position[2];

			gui.endHorizontalGroup();

			

		}.bind(this);

		return wnd;
	},

});