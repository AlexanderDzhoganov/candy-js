OctreeMeshProvider.prototype.extend(
{

	createConfigWindow: function ()
	{
		var wnd = new GuiWindow(vec2.fromValues(0.0, 0.0), vec2.fromValues(400.0, 0.0), new GuiLayout(), new GuiSkin());
		wnd.autoSize = true;
		wnd.title = this.name;

		wnd.drawSelf = function (gui)
		{
			gui.beginHorizontalGroup();

			gui.label("Draw debug");

			this.debugDrawOctrees = gui.checkbox(this.debugDrawOctrees);

			gui.endHorizontalGroup();
		}.bind(this);

		return wnd;
	},

});