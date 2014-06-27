FirstPersonController.prototype.extend(
{

	getConfigWindow: function ()
	{
		var config = new GuiWindow(vec2.fromValues(16.0, 16.0), vec2.fromValues(420.0, 100.0), new GuiLayout(), new GuiSkin());
		config.title = "FirstPersonController";
		config.autoSize = true;

		config.onClose = function ()
		{
			config.visible = false;
			//this.Gui.detachWindow(testWindow);
		}.bind(this);

		config.drawTitlebar = false;

		config.drawSelf = function (gui)
		{
			gui.label("position: " + this.position[0].toFixed(2) + ", " + this.position[1].toFixed(2) + ", " + this.position[2].toFixed(2));
			gui.label("yaw: " + this.yaw.toFixed(2) + ", pitch: " + this.pitch.toFixed(2) + ", roll: " + this.roll.toFixed(2));
		}.bind(this);

		return config;
	},

});