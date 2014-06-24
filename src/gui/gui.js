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

		Shader.ActiveProgram(this._program);
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
			vec2.subtract(wnd._dragAnchor, wnd.position, this._input.getCursorPosition());
		}
		else if (active && wnd._dragging && this._input._mouseDown)
		{
			vec2.add(wnd.position, this._input.getCursorPosition(), wnd._dragAnchor);
			wnd.position[0] = Clamp(wnd.position[0], 0.0, Renderer.screenWidth - wnd.size[0]);
			wnd.position[1] = Clamp(wnd.position[1], 0.0, Renderer.screenHeight - wnd.size[1]);
		}
		else
		{
			wnd._dragging = false;
		}

		if(active && resizeButtonHovered && this._input._mouseDown && !wnd._resizing)
		{
			wnd._resizing = true;
			var corner = vec2.create();
			vec2.add(corner, wnd.position, wnd.size);
			vec2.subtract(wnd._resizeAnchor, corner, this._input.getCursorPosition());
		}
		else if(active && wnd._resizing && this._input._mouseDown)
		{
			var corner = vec2.create();
			vec2.add(corner, wnd._resizeAnchor, this._input.getCursorPosition());
			var size = vec2.create();
			vec2.subtract(size, corner, wnd.position);
			wnd.size = size;

			if(wnd.size[0] < wnd.minimumSize[0])
			{
				wnd.size[0] = wnd.minimumSize[0];
			}
			if(wnd.size[1] < wnd.minimumSize[1])
			{
				wnd.size[1] = wnd.minimumSize[1];
			}
		}
		else
		{
			wnd._resizing = false;
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
				this._activeWindow = wnd;
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
		this._program = Shader.CreateProgram(vertexSource, fragmentSource);
	},

});