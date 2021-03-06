GuiWindow = function (position, size, layout, skin)
{
	// public

	this.position = position;
	this.size = size;

	this.layout = layout;
	this.skin = skin;

	this.visible = true;
	this.title = "window";
	this.autoSize = false;
	this.resizable = false;
	this.drawTitlebar = true;
	this.dockTo = null;

	this._dockedBy = null;

	this.minimumSize = vec2.fromValues(128.0, 16.0);

	this.drawSelf = function (gui)
	{
		gui.label("drawSelf() not implemented");
	};

	this.onClose = null;

	this.onActivate = null;
	this.onDisactivate = null;

	this.onShow = null;
	this.onHide = null;
	
	// private

	this._attached = false;

	this._dragging = false;
	this._dragAnchor = vec2.fromValues(0.0, 0.0);

	this._resizing = false;
	this._resizeAnchor = vec2.fromValues(0.0, 0.0);

	this.deltaTime = 0.0;
	this.time = 0.0;
};

GuiWindow.extend(
{
	
});

GuiWindow.prototype.extend(
{

	// public

	show: function ()
	{
		this.visible = true;

		if (!this._attached)
		{
			Gui.attachWindow(this);
			this._attached = true;
		}

		if(this.onShow)
		{
			this.onShow();
		}
	},

	hide: function ()
	{
		this.visible = false;

		if(this.onHide)
		{
			this.onHide();
		}
	},

	close: function ()
	{
		if (this._attached)
		{
			Gui.detachWindow(this);
			this._attached = false;
		}
	},

});