var Gui = function ()
{
	this.renderingLayer = RENDERING_LAYER.GUI;
	this.zOrder = 1;

	this._createCanvas();
	this._createProgram();
	this._createTexture();

	this.windows = [];

	this._mousePosition = vec2.create();
	this._cursor = new Cursor("cursor");
	this.mouseDown = false;
	this.mouseUp = false;

	this.activeWindow = null;

	document.onmousedown = function ()
	{
		this.mouseDown = true;
		this.mouseUp = false;
	}.bind(this);

	document.onmouseup = function ()
	{
		this.mouseDown = false;
		this.mouseUp = true;
	}.bind(this);

	this.previousTime = 0.0;
	this.activeControlPosition = vec2.fromValues(0.0, 0.0);
	this.activeControlSize = vec2.fromValues(0.0, 0.0);

	this.keyBuffer = "";
	window.addEventListener("keydown", function(e)
	{
		if(e.keyCode == 8)
		{
			e.preventDefault();
		}
	});

	window.addEventListener("keyup", function(e)
	{		
		if(e.keyCode == 8)
		{
			this.keyBuffer = this.keyBuffer.slice(0, this.keyBuffer.length - 1);
			e.preventDefault();
		}
		else if(e.keyCode == 13)
		{
			this.activeControlPosition = vec2.fromValues(0.0, 0.0);
			this.activeControlSize = vec2.fromValues(0.0, 0.0);
		}
		else
		{
			this.keyBuffer += String.fromCharCode(e.which).toLowerCase();
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
   			while((i = arr.indexOf(item)) !== -1)
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
		if(wnd == this.windows[this.windows.length - 1])
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

	_beginLayout: function (wnd)
	{
		this.controlId = 0;
		wnd.layout.beginLayout(wnd.position, wnd.size, this.horizontalGroupHeights);
	},

	_endLayout: function (wnd)
	{
		wnd.layout.endLayout();

		if(wnd.autoSize)
		{
			wnd.size = wnd.layout.getAutoSizeWindowSize();
		}
	},

	_beginControl: function (wnd)
	{
		var controlSize = this.controlSizes[this.controlId];
		var rect = wnd.layout.beginControl(controlSize);

		this._context.save();
		this._context.beginPath();
		this._context.rect(rect.position[0], rect.position[1], rect.size[0], rect.size[1]);
		this._context.clip();

		var hovered = PointRectTest(this.cursorPosition, rect.position, rect.size);
		var clicked = hovered && this.mouseDown;

		if(clicked)
		{
			this.activeControlPosition = rect.position;
			this.activeControlSize = rect.size;
			this.mouseDown = false;
		}

		var active =
			this.activeControlPosition[0] == rect.position[0] &&
			this.activeControlPosition[1] == rect.position[1] &&
			this.activeControlSize[0] == rect.size[0] &&
			this.activeControlSize[1] == rect.size[1];

		return {
			rect: rect,
			hovered: hovered,
			clicked: clicked,
			active: active,
		};
	},

	_endControl: function ()
	{
		var id = this.controlId;
		this._context.restore();
		this.controlId++;
		return id;
	},

	_calculateControlSizes: function (wnd)
	{
		this.controlSizes = [];
		this.horizontalGroupHeights = [];
		var inHorizontalGroup = false;
		var horizontalGroupMaxHeight = 0.0;

		var addToHorizontalGroup = function (controlHeight)
		{
			if(inHorizontalGroup)
			{
				if(controlHeight > horizontalGroupMaxHeight)
				{
					horizontalGroupMaxHeight = controlHeight;
				}
			}
		}

		wnd.drawSelf(
		{

			beginHorizontalGroup: function ()
			{
				inHorizontalGroup = true;
				horizontalGroupMaxHeight = 0.0;
			}.bind(this),

			endHorizontalGroup: function ()
			{
				this.horizontalGroupHeights.push(horizontalGroupMaxHeight);
				inHorizontalGroup = false;
			}.bind(this),

			label: function (message)
			{
				var controlSize = wnd._calculateLabelSize(this._context, message);
				this.controlSizes.push(controlSize);
				addToHorizontalGroup(controlSize[1]);
			}.bind(this),

			button: function (label)
			{
				var controlSize = wnd._calculateButtonSize(this._context, label);
				this.controlSizes.push(controlSize);
				addToHorizontalGroup(controlSize[1]);
				return false;
			}.bind(this),

			inputbox: function (input, maxLength)
			{
				var controlSize = wnd._calculateInputBoxSize(this._context, maxLength);
				this.controlSizes.push(controlSize);
				addToHorizontalGroup(controlSize[1]);
				return input;
			}.bind(this),

			textbox: function (input, rows, cols, readonly)
			{
				var controlSize = wnd._calculateTextBoxSize(this._context, rows, cols);
				this.controlSizes.push(controlSize);
				addToHorizontalGroup(controlSize[1]);
				return input;
			}.bind(this),

			image: function (resourceName)
			{
				var image = ResourceLoader.getContent(resourceName);
				var controlSize = wnd._calculateImageSize(this._context, image);
				this.controlSizes.push(controlSize);
				addToHorizontalGroup(controlSize[1]);
			}.bind(this),

			checkbox: function (state)
			{
				var controlSize = wnd._calculateCheckBoxSize(this._context);
				this.controlSizes.push(controlSize);
				addToHorizontalGroup(controlSize[1]);
			}.bind(this),

		});
	},

	_drawControls: function (wnd, deltaTime)
	{
		this._calculateControlSizes(wnd);
		this._beginLayout(wnd);

		wnd.drawSelf(
		{

			beginHorizontalGroup: function ()
			{
				wnd.layout.beginHorizontalGroup();
			}.bind(this),

			endHorizontalGroup: function ()
			{
				wnd.layout.endHorizontalGroup();
			}.bind(this),

			label: function (message)
			{
				var control = this._beginControl(wnd);
				wnd._drawLabel(this._context, message, "white", control.rect.position);
				this._endControl();
			}.bind(this),

			button: function (label)
			{
				var control = this._beginControl(wnd);
				wnd._drawButton(this._context, label, control.rect.position, control.rect.size, control.hovered, control.clicked);
				this._endControl();

				if(control.clicked)
				{
					return true;
				}

				return false;
			}.bind(this),

			inputbox: function (input, maxLength)
			{
				var control = this._beginControl(wnd);

				if(control.clicked)
				{
					this.keyBuffer = input;
				}

				wnd._drawInputBox(this._context, input, control.rect.position, control.rect.size, control.hovered, control.clicked, control.active);
				this._endControl();

				if(control.active)
				{
					var newInput = this.keyBuffer;

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

				if(control.active)
				{
					this.keyBuffer = input;
				}

				wnd._drawTextBox(this._context, input, rows, cols, control.rect.position, control.rect.size, control.hovererd, control.clicked, active);
				this._endControl();
			}.bind(this),

			image: function (resourceName)
			{
				var control = this._beginControl(wnd);
				var image = ResourceLoader.getContent(resourceName);
				wnd._drawImage(this._context, image, control.rect.position, control.rect.size);
				this._endControl();
			}.bind(this),

		});

		this._endLayout(wnd);
	},

	_drawWindow: function (wnd, deltaTime)
	{
		var headerHovered = PointRectTest
		(
			this.cursorPosition,
			wnd.position,
			vec2.fromValues(wnd.size[0], wnd.layout.windowHeaderSize)
		);

		var closeButtonHovered = PointRectTest
		(
			this.cursorPosition,
			vec2.fromValues(wnd.position[0] + wnd.size[0] - wnd.layout.windowCloseButtonSize[0] - wnd.layout.margin[0], wnd.position[1]),
			wnd.layout.windowCloseButtonSize
		);

		if(closeButtonHovered && this.mouseDown)
		{
			if(wnd.onClose)
			{
				wnd.onClose();
			}
		}

		if(this.activeWindow == wnd && this.mouseDown)
		{
			this.bringToFront(wnd);
		}

		if(this.activeWindow == wnd && headerHovered && this.mouseDown && !wnd.dragging)
		{
			wnd.dragging = true;
			vec2.subtract(wnd.dragAnchor, wnd.position, this.cursorPosition);
		}
		else if(wnd.dragging && this.mouseDown)
		{
			vec2.add(wnd.position, this.cursorPosition, wnd.dragAnchor);
			wnd.position[0] = Clamp(wnd.position[0], 0.0, Renderer.screenWidth - wnd.size[0]);
			wnd.position[1] = Clamp(wnd.position[1], 0.0, Renderer.screenHeight - wnd.size[1]);
		}
		else
		{
			wnd.dragging = false;
		}

		wnd._renderSelf(this._context, this.cursorPosition, deltaTime);

		this._drawControls(wnd, deltaTime);
	},

	_drawCanvas: function ()
	{
		this._context.clearRect(0, 0, Renderer.screenWidth, Renderer.screenHeight);
		this.cursorPosition = vec2.fromValues(this._cursor.position[0], Renderer.screenHeight - this._cursor.position[1] - this._cursor.size[1] * 0.5);

		var time = (new Date).getTime();
		var deltaTime = (time - this.previousTime) / 1000.0;
		this.previousTime = time;

		this.activeWindow = null;

		for(var i = 0; i < this.windows.length; i++)
		{
			var wnd = this.windows[i];
			if(!wnd.visible)
			{
				continue;
			}

			var mouseOver = PointRectTest
			(
				this.cursorPosition,
				wnd.position,
				wnd.size
			);

			if(mouseOver)
			{
				this.activeWindow = wnd;
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