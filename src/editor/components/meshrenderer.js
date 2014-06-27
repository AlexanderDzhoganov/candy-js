MeshRenderer.prototype.extend(
{

	createConfigWindow: function ()
	{
		var wnd = new GuiWindow(vec2.fromValues(0.0, 0.0), vec2.fromValues(400.0, 0.0), new GuiLayout(), new GuiSkin());
		wnd.autoSize = true;
		wnd.title = this.name;

		wnd.drawSelf = function (gui)
		{
			gui.beginHorizontalGroup();
			gui.label("Wireframe");
			this.wireframe = gui.checkbox(this.wireframe);
			gui.endHorizontalGroup();

			gui.beginHorizontalGroup();
			gui.label("Draw bounding box");
			this.drawBounds = gui.checkbox(this.drawBounds);
			gui.endHorizontalGroup();
		}.bind(this);

		return wnd;
	},

});