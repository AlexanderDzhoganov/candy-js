var Gui = function ()
{
	// public

	this.debugLayout = false;
	this.renderingLayer = RENDERING_LAYER.GUI;
	this.zOrder = 1;

	// private

	this._createCanvas();
	this._createProgram();
	this._createTexture();

	this._windows = [];

	this._activeWindow = null;
	this._activeControlPosition = vec2.fromValues(0.0, 0.0);
	this._activeControlSize = vec2.fromValues(0.0, 0.0);

	this._input = new GuiInput();
	this._controls = new GuiControl(this._input, this._context);

	this._previousTime = 0.0;
};

Gui.extend(
{
	
});

Gui.prototype.extend(
{
	// public

	attachWindow: function (window)
	{
		this._windows.push(window);
		window.visible = true;
	},

	detachWindow: function (window)
	{
		var remove = function (arr, item)
		{
			var i;
			while ((i = arr.indexOf(item)) !== -1)
			{
				arr.splice(i, 1);
			}
		}

		remove(this._windows, window);
		window.visible = false;
	},

	bringToFront: function (wnd)
	{
		if (wnd == this._windows[this._windows.length - 1])
		{
			return;
		}

		this.detachWindow(wnd);
		this.attachWindow(wnd);
	},

	renderSelf: function ()
	{
		this._drawCanvas();

		Shader.setActiveProgram(this._program);
		GL.bindTexture(GL.TEXTURE_2D, this._texture);
		GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, this._canvas);
		Renderer.drawFullscreenQuad();

		this._input._cursor.renderSelf();
	},

	getModelMatrix: function ()
	{
		return mat4.create();
	},

	// private

	_drawWindow: function (wnd, deltaTime)
	{
		var active = this._activeWindow == wnd;

		var windowHovered = active;

		var headerHovered = active && wnd.drawTitlebar && PointRectTest
		(
			this._input.getCursorPosition(),
			wnd.position,
			vec2.fromValues(wnd.size[0], wnd.layout.windowHeaderSize)
		);

		var closeButtonHovered = active && PointRectTest
		(
			this._input.getCursorPosition(),
			vec2.fromValues(wnd.position[0] + wnd.size[0] - wnd.layout.windowCloseButtonSize[0] - wnd.layout.margin[0], wnd.position[1]),
			wnd.layout.windowCloseButtonSize
		);

		var resizeButtonHovered = active && wnd.resizable && PointRectTest
		(
			this._input.getCursorPosition(),
			vec2.fromValues(wnd.position[0] + wnd.size[0] - wnd.layout.margin[0], wnd.position[1] + wnd.size[1] - wnd.layout.margin[0]),
			vec2.fromValues(wnd.position[0] + wnd.size[0], wnd.position[1] + wnd.size[1])
		);

		if (closeButtonHovered && this._input._mouseDown)
		{
			if (wnd.onClose)
			{
				wnd.onClose();
			}
		}

		if (active && this._input._mouseDown)
		{
			this.bringToFront(wnd);
		}

		if (active && headerHovered && this._input._mouseDown && !wnd._dragging)
		{
			wnd._dragging = true;
			if(wnd.dockTo)
			{
				wnd.dockTo._dockedBy = null;
			}

			wnd.dockTo = null;
			vec2.subtract(wnd._dragAnchor, wnd.position, this._input.getCursorPosition());
		}

		if(active && resizeButtonHovered && this._input._mouseDown && !wnd._resizing)
		{
			wnd._resizing = true;
			var corner = vec2.create();
			vec2.add(corner, wnd.position, wnd.size);
			vec2.subtract(wnd._resizeAnchor, corner, this._input.getCursorPosition());
		}

		GuiRenderer.drawWindow(this._context, wnd, this._input.getCursorPosition(), deltaTime, windowHovered, headerHovered, closeButtonHovered, resizeButtonHovered);

		this._controls.drawControls(wnd, deltaTime);
	},

	_drawCanvas: function ()
	{
		this._context.clearRect(0, 0, Renderer.screenWidth, Renderer.screenHeight);

		var time = (new Date).getTime();
		var deltaTime = (time - this._previousTime) / 1000.0;
		this._previousTime = time;

		this._activeWindow = null;

		for (var i = 0; i < this._windows.length; i++)
		{
			var wnd = this._windows[i];
			if (!wnd.visible)
			{
				continue;
			}

			if (wnd._dragging)
			{
				this._activeWindow = wnd;
				break;
			}

			if(wnd._resizing)
			{
				this._activeWindow = wnd;
				break;
			}

			if (PointRectTest(this._input.getCursorPosition(), wnd.position, wnd.size))
			{
				if(this._activeWindow && this._activeWindow.onDeactivate)
				{
					this._activeWindow.onDeactivate();
				}

				this._activeWindow = wnd;

				if(this._activeWindow.onActivate)
				{
					this._activeWindow.onActivate();
				}
			}
		}

		// apply dragging
		if (this._activeWindow && this._activeWindow._dragging && this._input._mouseDown)
		{
			vec2.add(this._activeWindow.position, this._input.getCursorPosition(), this._activeWindow._dragAnchor);
			this._activeWindow.position[0] = Clamp(this._activeWindow.position[0], 0.0, Renderer.screenWidth - this._activeWindow.size[0]);
			this._activeWindow.position[1] = Clamp(this._activeWindow.position[1], 0.0, Renderer.screenHeight - this._activeWindow.size[1]);
		}
		else if(this._activeWindow)
		{
			if(this._activeWindow._dragging)
			{
				this._activeWindow._dragging = false;

				for (var i = 0; i < this._windows.length; i++)
				{
					var other = this._windows[i];

					if(this._activeWindow == other)
					{
						continue;
					}

					var dockPosition = vec2.fromValues(other.position[0], other.position[1] + other.size[1] - 16.0);
					if(PointRectTest(this._input.getCursorPosition(), dockPosition, vec2.fromValues(other.size[0], 16.0)))
					{
						if(other._dockedBy)
						{
							continue;
						}

						this._activeWindow.dockTo = other;
						other._dockedBy = this._activeWindow;
						break;
					}
				}
			}
		}

		// apply resizing
		if(this._activeWindow && this._activeWindow._resizing && this._input._mouseDown)
		{
			var corner = vec2.create();
			vec2.add(corner, this._activeWindow._resizeAnchor, this._input.getCursorPosition());
			var size = vec2.create();
			vec2.subtract(size, corner, this._activeWindow.position);
			this._activeWindow.size = size;

			if(this._activeWindow.size[0] < this._activeWindow.minimumSize[0])
			{
				this._activeWindow.size[0] = this._activeWindow.minimumSize[0];
			}
			if(this._activeWindow.size[1] < this._activeWindow.minimumSize[1])
			{
				this._activeWindow.size[1] = this._activeWindow.minimumSize[1];
			}
		}
		else if(this._activeWindow)
		{
			this._activeWindow._resizing = false;
		}

		// resolve docking
		for (var i = 0; i < this._windows.length; i++)
		{
			var wnd = this._windows[i];

			if(wnd.dockTo)
			{
				wnd.position = vec2.fromValues(wnd.dockTo.position[0], wnd.dockTo.position[1] + wnd.dockTo.size[1]);
				wnd.size[0] = wnd.dockTo.size[0];
			}
		}

		for(var i = 0; i < this._windows.length; i++)
		{
			var wnd = this._windows[i];
			if(!wnd.visible)
			{
				continue;
			}

			this._drawWindow(wnd, deltaTime);
		}
	},

	_createTexture: function ()
	{
		this._texture = GL.createTexture();
		GL.bindTexture(GL.TEXTURE_2D, this._texture);
		GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE); 
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
		return this._texture;
	},

	_createCanvas: function ()
	{
		this._canvas = document.createElement('canvas');
		document.body.appendChild(this._canvas);
		this._canvas.width = Renderer.screenWidth;
		this._canvas.height = Renderer.screenHeight;
		this._canvas.style.display = "none";
		this._context = this._canvas.getContext('2d');
	},

	_createProgram: function ()
	{
		var vertexSource = ResourceLoader.getContent("gui_vertex");
		var fragmentSource = ResourceLoader.getContent("gui_fragment");
		this._program = new Shader(vertexSource, fragmentSource);
	},

});