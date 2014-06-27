Camera.prototype.extend(
{

	createConfigWindow: function ()
	{
		var wnd = new GuiWindow(vec2.fromValues(0.0, 0.0), vec2.fromValues(400.0, 0.0), new GuiLayout(), new GuiSkin());
		wnd.autoSize = true;
		wnd.title = this.name;

		wnd.drawSelf = function (gui)
		{

			gui.label("Field of view");
			this.fov = parseFloat(gui.inputbox(this.fov.toString(), 3));

		}.bind(this);

		return wnd;
	},

});