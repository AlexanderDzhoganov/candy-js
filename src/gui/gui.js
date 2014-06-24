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

	this.windows = [];

	this._input = new GuiInput();
	this._renderer = new GuiControlRenderer(this._input, this._context);
};

Gui.extend(
{
	
});

Gui.prototype.extend(
{

	attachWindow: function (window)
	{
		this.windows.push(window);
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

		remove(this.windows, window);
		window.visible = false;
	},

	bringToFront: function (wnd)
	{
		if (wnd == this.windows[this.windows.length - 1])
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

	_drawWindow: function (wnd, deltaTime)
	{
		var windowHovered = this._activeWindow == wnd;

		var headerHovered = this._activeWindow == wnd && wnd.drawTitlebar && PointRectTest
		(
			this.cursorPosition,
			wnd.position,
			vec2.fromValues(wnd.size[0], wnd.layout.windowHeaderSize)
		);

		var closeButtonHovered = this._activeWindow == wnd && PointRectTest
		(
			this.cursorPosition,
			vec2.fromValues(wnd.position[0] + wnd.size[0] - wnd.layout.windowCloseButtonSize[0] - wnd.layout.margin[0], wnd.position[1]),
			wnd.layout.windowCloseButtonSize
		);

		var resizeButtonHovered = this._activeWindow == wnd && wnd.resizable && PointRectTest
		(
			this.cursorPosition,
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

		if (this._activeWindow == wnd && this._input._mouseDown)
		{
			this.bringToFront(wnd);
		}

		if (this._activeWindow == wnd && headerHovered && this._input._mouseDown && !wnd._dragging)
		{
			wnd._dragging = true;
			vec2.subtract(wnd._dragAnchor, wnd.position, this.cursorPosition);
		}
		else if (this._activeWindow == wnd && wnd._dragging && this._input._mouseDown)
		{
			vec2.add(wnd.position, this.cursorPosition, wnd._dragAnchor);
			wnd.position[0] = Clamp(wnd.position[0], 0.0, Renderer.screenWidth - wnd.size[0]);
			wnd.position[1] = Clamp(wnd.position[1], 0.0, Renderer.screenHeight - wnd.size[1]);
		}
		else
		{
			wnd._dragging = false;
		}

		if(this._activeWindow == wnd && resizeButtonHovered && this._input._mouseDown && !wnd._resizing)
		{
			wnd._resizing = true;
			var corner = vec2.create();
			vec2.add(corner, wnd.position, wnd.size);
			vec2.subtract(wnd._resizeAnchor, corner, this.cursorPosition);
		}
		else if(this._activeWindow == wnd && wnd._resizing && this._input._mouseDown)
		{
			var corner = vec2.create();
			vec2.add(corner, wnd._resizeAnchor, this.cursorPosition);
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

		wnd._renderSelf(this._context, this.cursorPosition, deltaTime, windowHovered, headerHovered, closeButtonHovered, resizeButtonHovered);

		wnd.layout.beginPrepareLayout();
		this._renderer._calculateControlSizes(wnd);
		wnd.layout.endPrepareLayout();

		wnd.layout.beginLayout(wnd);
		this._renderer._drawControls(wnd, deltaTime);
		wnd.layout.endLayout(wnd);
	},

	_drawCanvas: function ()
	{
		this._context.clearRect(0, 0, Renderer.screenWidth, Renderer.screenHeight);

		this.cursorPosition = vec2.fromValues(this._input._cursor.position[0], Renderer.screenHeight - this._input._cursor.position[1] - this._input._cursor.size[1] * 0.5);

		var time = (new Date).getTime();
		var deltaTime = (time - this._previousTime) / 1000.0;
		this._previousTime = time;

		this._activeWindow = null;

		for (var i = 0; i < this.windows.length; i++)
		{
			var wnd = this.windows[i];
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

			if (PointRectTest(this.cursorPosition, wnd.position, wnd.size))
			{
				this._activeWindow = wnd;
			}
		}

		for(var i = 0; i < this.windows.length; i++)
		{
			var wnd = this.windows[i];
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
		var vertexSource = Shader.GetSourceFromHTMLElement("gui-vertex-shader");
		var fragmentSource = Shader.GetSourceFromHTMLElement("gui-fragment-shader");
		this._program = Shader.CreateProgram(vertexSource, fragmentSource);
	},

});