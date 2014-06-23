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

	this._activeWindow = null;
	this._activeControlPosition = vec2.fromValues(0.0, 0.0);
	this._activeControlSize = vec2.fromValues(0.0, 0.0);

	this._previousTime = 0.0;

	this._mousePosition = vec2.create();
	this._cursor = new Cursor("cursor");
	this._mouseDown = false;
	this._mouseUp = false;

	this._keyBuffer = "";

	document.body.onclick = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;

	document.onmousedown = function ()
	{
		this._mouseDown = true;
		this._mouseUp = false;
	}.bind(this);

	document.onmouseup = function ()
	{
		this._mouseDown = false;
		this._mouseUp = true;
	}.bind(this);

	window.addEventListener("keydown", function(e)
	{
		if (e.keyCode == 8)
		{
			e.preventDefault();
		}
	});

	window.addEventListener("keyup", function(e)
	{		
		if (e.keyCode == 8)
		{
			this._keyBuffer = this._keyBuffer.slice(0, this._keyBuffer.length - 1);
			e.preventDefault();
		}
		else if (e.keyCode == 13)
		{
			this._activeControlPosition = vec2.fromValues(0.0, 0.0);
			this._activeControlSize = vec2.fromValues(0.0, 0.0);
		}
		else
		{
			this._keyBuffer += String.fromCharCode(e.which).toLowerCase();
		}
	}.bind(this));
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

		this._context.clearRect(0, 0, Renderer.screenWidth, Renderer.screenHeight);
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

		this._cursor.renderSelf();
	},

	getModelMatrix: function ()
	{
		return mat4.create();
	},

	_beginControl: function (wnd)
	{
		var rect = wnd.layout.beginControl(wnd);

		if(this.debugLayout)
		{
			this.debugLayoutLastRect = rect;
		}

		this._context.save();
		this._context.beginPath();
		this._context.rect(rect.position[0], rect.position[1], rect.size[0], rect.size[1]);
		this._context.clip();

		var relativeMousePosition = vec2.create();
		vec2.subtract(relativeMousePosition, this.cursorPosition, rect.position);

		var hovered = PointRectTest(this.cursorPosition, rect.position, rect.size) && this._activeWindow == wnd;
		var clicked = hovered && this._mouseDown;

		if (clicked)
		{
			this._activeControlPosition = rect.position;
			this._activeControlSize = rect.size;
			this._mouseDown = false;
		}

		var state = "normal";

		if (hovered)
		{
			state = "hovered";
		}

		if (clicked)
		{
			state = "clicked";
		}

		var active =
			this._activeControlPosition[0] == rect.position[0] &&
			this._activeControlPosition[1] == rect.position[1] &&
			this._activeControlSize[0] == rect.size[0] &&
			this._activeControlSize[1] == rect.size[1];

		return {
			rect: rect,
			relativeMousePosition: relativeMousePosition,
			hovered: hovered,
			clicked: clicked,
			active: active,
			state: state,
		};
	},

	_endControl: function (wnd)
	{
		wnd.layout.endControl();
		this._context.restore();

		if(this.debugLayout)
		{
			var rect = this.debugLayoutLastRect;
			this._context.strokeStyle = 'green';
			this._context.strokeRect(rect.position[0], rect.position[1], rect.size[0], rect.size[1]);
		}
	},

	_calculateControlSizes: function (wnd)
	{
		wnd.drawSelf(
		{

			beginHorizontalGroup: function ()
			{
				wnd.layout.beginHorizontalGroup();
			}.bind(this),

			endHorizontalGroup: function ()
			{
				wnd.layout.endHorizontalGroup(wnd);
			}.bind(this),

			horizontalSeparator: function ()
			{
				wnd.layout.prepareControl(wnd._calculateHorizontalSeparatorSize(this._context));
			}.bind(this),

			label: function (message)
			{
				wnd.layout.prepareControl(wnd._calculateLabelSize(this._context, message));
			}.bind(this),

			button: function (label)
			{
				wnd.layout.prepareControl(wnd._calculateButtonSize(this._context, label));
				return false;
			}.bind(this),

			inputbox: function (input, maxLength)
			{
				wnd.layout.prepareControl(wnd._calculateInputBoxSize(this._context, maxLength));
				return input;
			}.bind(this),

			textbox: function (input, rows, cols, readonly)
			{
				wnd.layout.prepareControl(wnd._calculateTextBoxSize(this._context, rows, cols));
				return input;
			}.bind(this),

			image: function (resourceName, width, height)
			{
				wnd.layout.prepareControl(wnd._calculateImageSize(this._context, ResourceLoader.getContent(resourceName), width, height));
			}.bind(this),

			checkbox: function (checked)
			{
				wnd.layout.prepareControl(wnd._calculateCheckBoxSize(this._context));
				return checked;
			}.bind(this),

			listbox: function (items, width, height, selectedIndex)
			{
				wnd.layout.prepareControl(wnd._calculateListBoxSize(this._context, width, height));
				return selectedIndex;
			}.bind(this),

		});
	},

	_drawControls: function (wnd, deltaTime)
	{
		wnd.drawSelf(
		{

			beginHorizontalGroup: function ()
			{
				wnd.layout.beginHorizontalGroup();
			}.bind(this),

			endHorizontalGroup: function ()
			{
				wnd.layout.endHorizontalGroup(wnd);
			}.bind(this),

			horizontalSeparator: function ()
			{
				var control = this._beginControl(wnd);
				wnd._drawHorizontalSeparator(this._context, control.rect);
				this._endControl(wnd);
			}.bind(this),

			label: function (message)
			{
				var control = this._beginControl(wnd);
				wnd._drawLabel(this._context, message, "white", control.rect.position);
				this._endControl(wnd);
			}.bind(this),

			button: function (label)
			{
				var control = this._beginControl(wnd);
				wnd._drawButton(this._context, label, control.rect, control.state);
				this._endControl(wnd);

				if (control.clicked)
				{
					return true;
				}

				return false;
			}.bind(this),

			inputbox: function (input, maxLength)
			{
				var control = this._beginControl(wnd);

				if (control.clicked)
				{
					this._keyBuffer = input;
				}

				wnd._drawInputBox(this._context, input, control.rect, control.state, control.active);
				this._endControl(wnd);

				if (control.active)
				{
					var newInput = this._keyBuffer;

					if(newInput.length > maxLength)
					{
						newInput = newInput.slice(0, maxLength);
					}

					return newInput;
				}

				return input;
			}.bind(this),

			textbox: function (input, rows, cols, readonly)
			{
				var control = this._beginControl(wnd);

				if (control.active)
				{
					this._keyBuffer = input;
				}

				wnd._drawTextBox(this._context, input, rows, cols, control.rect, control.state, control.active);

				this._endControl(wnd);
			}.bind(this),

			image: function (resourceName, width, height)
			{
				var control = this._beginControl(wnd);
				var image = ResourceLoader.getContent(resourceName);
				wnd._drawImage(this._context, image, control.rect);
				this._endControl(wnd);
			}.bind(this),

			checkbox: function (checked)
			{
				var control = this._beginControl(wnd);
				wnd._drawCheckBox(this._context, checked, control.rect, control.state);
				this._endControl(wnd);

				if (control.clicked)
				{
					return !checked;
				}

				return checked;
			}.bind(this),

			listbox: function (items, width, height, selectedIndex)
			{
				var control = this._beginControl(wnd);

				var hoveredItem = null;

				if(control.hovered)
				{
					hoveredItem = Math.floor((control.relativeMousePosition[1] - 8.0) / wnd.layout.fontSize);

					if(control.clicked)
					{
						selectedIndex = hoveredItem;

						if(selectedIndex >= items.length)
						{
							selectedIndex = null;
						}
					}

					if(hoveredItem >= items.length)
					{
						hoveredItem = null;
					}
				}

				wnd._drawListBox(this._context, items, selectedIndex, hoveredItem, control);
				this._endControl(wnd);

				return selectedIndex;
			}.bind(this),

		});
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

		var resizeButtonHovered = this._activeWindow == wnd && PointRectTest
		(
			this.cursorPosition,
			vec2.fromValues(wnd.position[0] + wnd.size[0] - wnd.layout.margin[0], wnd.position[1] + wnd.size[1] - wnd.layout.margin[0]),
			vec2.fromValues(wnd.position[0] + wnd.size[0], wnd.position[1] + wnd.size[1])
		);

		if (closeButtonHovered && this._mouseDown)
		{
			if (wnd.onClose)
			{
				wnd.onClose();
			}
		}

		if (this._activeWindow == wnd && this._mouseDown)
		{
			this.bringToFront(wnd);
		}

		if (this._activeWindow == wnd && headerHovered && this._mouseDown && !wnd._dragging)
		{
			wnd._dragging = true;
			vec2.subtract(wnd._dragAnchor, wnd.position, this.cursorPosition);
		}
		else if (this._activeWindow == wnd && wnd._dragging && this._mouseDown)
		{
			vec2.add(wnd.position, this.cursorPosition, wnd._dragAnchor);
			wnd.position[0] = Clamp(wnd.position[0], 0.0, Renderer.screenWidth - wnd.size[0]);
			wnd.position[1] = Clamp(wnd.position[1], 0.0, Renderer.screenHeight - wnd.size[1]);
		}
		else
		{
			wnd._dragging = false;
		}

		if(this._activeWindow == wnd && resizeButtonHovered && this._mouseDown && !wnd._resizing)
		{
			wnd._resizing = true;
			var corner = vec2.create();
			vec2.add(corner, wnd.position, wnd.size);
			vec2.subtract(wnd._resizeAnchor, corner, this.cursorPosition);
		}
		else if(this._activeWindow == wnd && wnd._resizing && this._mouseDown)
		{
			var corner = vec2.create();
			vec2.add(corner, wnd._resizeAnchor, this.cursorPosition);
			var size = vec2.create();
			vec2.subtract(size, corner, wnd.position);
			wnd.size = size;
		}
		else
		{
			wnd._resizing = false;
		}

		wnd._renderSelf(this._context, this.cursorPosition, deltaTime, windowHovered, headerHovered, closeButtonHovered, resizeButtonHovered);

		wnd.layout.beginPrepareLayout();
		this._calculateControlSizes(wnd);
		wnd.layout.endPrepareLayout();

		wnd.layout.beginLayout(wnd);
		this._drawControls(wnd, deltaTime);
		wnd.layout.endLayout(wnd);
	},

	_drawCanvas: function ()
	{
		this._context.clearRect(0, 0, Renderer.screenWidth, Renderer.screenHeight);
		this.cursorPosition = vec2.fromValues(this._cursor.position[0], Renderer.screenHeight - this._cursor.position[1] - this._cursor.size[1] * 0.5);

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