var Gui = function ()
{
	this.renderingLayer = RENDERING_LAYER.GUI;
	this.zOrder = 1;

	this._canvas = document.createElement('canvas');
	document.body.appendChild(this._canvas);
	this._canvas.width = Renderer.screenWidth;
	this._canvas.height = Renderer.screenHeight;
	this._canvas.style.display = "none";

	this._context = this._canvas.getContext('2d');

	this._context.font="32px Georgia";
	this._context.fillStyle = 'grey';
	this._context.fillText("hello world", 100, 100);
	this._context.stroke();

	var vertexSource = Shader.GetSourceFromHTMLElement("gui-vertex-shader");
	var fragmentSource = Shader.GetSourceFromHTMLElement("gui-fragment-shader");

	this._program = Shader.CreateProgram(vertexSource, fragmentSource);

	this._texture = GL.createTexture();
	GL.bindTexture(GL.TEXTURE_2D, this._texture);
	GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE); 
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);

	this.windows = [];
	this._mousePosition = vec2.create();

	this._cursor = new Cursor("cursor");

	this.mouseDown = false;
	this.mouseUp = false;

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
		e.preventDefault();
	});

	window.addEventListener("keyup", function(e)
	{
		e.preventDefault();
		
		if(e.keyCode == 8)
		{
			this.keyBuffer = this.keyBuffer.slice(0, this.keyBuffer.length - 1);
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

	injectMousePosition: function (position)
	{
		this._mousePosition = position;
	},

	injectKey: function (keyCode)
	{

	},

	attachWindow: function (window)
	{
		this.windows.push(window);
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

	_drawWindow: function (deltaTime, wnd, cursorPositionX, cursorPositionY)
	{
		wnd._renderSelf(this._context, vec2.fromValues(cursorPositionX, cursorPositionY), deltaTime);
		wnd.layout.beginLayout(wnd.position, wnd.size);
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
				var controlSize = wnd._calculateLabelSize(this._context, message);
				var rect = wnd.layout.beginControl(controlSize);

				this._context.save();
				this._context.beginPath();
				this._context.rect(rect.position[0], rect.position[1], rect.size[0], rect.size[1]);
				this._context.clip();

				wnd._drawLabel(this._context, message, "white", rect.position);

				this._context.restore();
			}.bind(this),

			button: function (label)
			{
				var controlSize = wnd._calculateButtonSize(this._context, label);
				var rect = wnd.layout.beginControl(controlSize);

				this._context.save();
				this._context.beginPath();
				this._context.rect(rect.position[0], rect.position[1], rect.size[0], rect.size[1]);
				this._context.clip();

				var hovered = cursorPositionX >= rect.position[0] && cursorPositionX <= rect.position[0] + rect.size[0] && cursorPositionY >= rect.position[1] && cursorPositionY <= rect.position[1] + rect.size[1];
				var clicked = hovered && this.mouseDown;

				wnd._drawButton(this._context, label, rect.position, rect.size, hovered, clicked);
				this._context.restore();

				if(clicked)
				{
					this.mouseDown = false;
					return true;
				}

				return false;
			}.bind(this),

			inputbox: function (input, maxLength)
			{
				var controlSize = wnd._calculateInputBoxSize(this._context, maxLength);
				var rect = wnd.layout.beginControl(controlSize);

				this._context.save();
				this._context.beginPath();
				this._context.rect(rect.position[0], rect.position[1], rect.size[0], rect.size[1]);
				this._context.clip();

				var hovered = cursorPositionX >= rect.position[0] && cursorPositionX <= rect.position[0] + rect.size[0] && cursorPositionY >= rect.position[1] && cursorPositionY <= rect.position[1] + rect.size[1];
				var clicked = hovered && this.mouseDown;
				if(clicked)
				{
					this.activeControlPosition = rect.position;
					this.activeControlSize = rect.size;
					this.keyBuffer = input;
				}

				var active = this.activeControlPosition[0] == rect.position[0] && this.activeControlPosition[1] == rect.position[1] && this.activeControlSize[0] == rect.size[0] && this.activeControlSize[1] == rect.size[1];

				wnd._drawInputBox(this._context, input, rect.position, rect.size, hovered, clicked, active);
				this._context.restore();

				if(active)
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

		});

		wnd.layout.endLayout();

		if(wnd.autoSize)
		{
			wnd.size = wnd.layout.getAutoSizeWindowSize();
		}
	},

	_drawCanvas: function ()
	{
		this._context.clearRect(0, 0, Renderer.screenWidth, Renderer.screenHeight);
		
		var cursor = vec2.fromValues(this._cursor.position[0], Renderer.screenHeight - this._cursor.position[1] - this._cursor.size[1] * 0.5);

		var time = (new Date).getTime();
		var deltaTime = (time - this.previousTime) / 1000.0;
		this.previousTime = time;

		for(var i = 0; i < this.windows.length; i++)
		{
			var wnd = this.windows[i];
			if(!wnd.visible)
			{
				continue;
			}

			var headerHovered =
				cursor[0] >= wnd.position[0] &&
				cursor[0] <= wnd.position[0] + wnd.size[0] &&
				cursor[1] >= wnd.position[1] &&
				cursor[1] <= wnd.position[1] + wnd.layout.windowHeaderSize;

			var closeButtonHovered =
				cursor[0] >= wnd.position[0] + wnd.size[0] - wnd.layout.windowCloseButtonSize[0] &&
				cursor[0] <= wnd.position[0] + wnd.size[0] &&
				cursor[1] >= wnd.position[1] + wnd.layout.windowCloseButtonSize[1] / 2.0 &&
				cursor[1] <= wnd.position[1] + wnd.layout.windowCloseButtonSize[1] / 2.0 + wnd.layout.windowCloseButtonSize[1];

			if(closeButtonHovered && this.mouseDown)
			{
				if(wnd.onClose)
				{
					wnd.onClose();
				}
			}

			if(headerHovered && this.mouseDown && !wnd.dragging)
			{
				wnd.dragging = true;
				vec2.subtract(wnd.dragAnchor, wnd.position, vec2.fromValues(cursor[0], cursor[1]));
			}
			else if(wnd.dragging && this.mouseDown)
			{
				this._context.clearRect(0, 0, Renderer.screenWidth, Renderer.screenHeight);
				vec2.add(wnd.position, vec2.fromValues(cursor[0], cursor[1]), wnd.dragAnchor);
			}
			else
			{
				wnd.dragging = false;
			}

			this._drawWindow(deltaTime, wnd, cursor[0], cursor[1]);
		}
			
	},

});