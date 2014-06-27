var GameObjectEditor = function (gameObject)
{
	this._gameObject = gameObject;

	var lastDockWindow = null;

	this._window = new GuiWindow(vec2.fromValues(0.0, 0.0), vec2.fromValues(320.0, 0.0), new GuiLayout(), new GuiSkin());
	this._window.title = "GameObject";
	this._window.autoSize = true;
	this._window.show();

	lastDockWindow = this._window;

	this._window.drawSelf = function (gui)
	{
		gui.beginHorizontalGroup();

		gui.label("Enabled:");
		gameObject.enabled = gui.checkbox(gameObject.enabled);

		gui.endHorizontalGroup();

		gameObject.name = gui.inputbox(gameObject.name, 64);
	};

	this._componentsWindows = [];

	var components = gameObject.getComponents();

	for (var key in components)
	{
		if (components[key] instanceof Component);
		{
			if (components[key].createConfigWindow)
			{
				var wnd = components[key].createConfigWindow();
				wnd.dockTo = lastDockWindow;
				lastDockWindow._dockedBy = wnd;
				lastDockWindow = wnd;
				wnd.show();
				this._componentsWindows.push(wnd);
			}
		}
	}

};