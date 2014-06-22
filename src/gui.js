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

	document.onmousedown = function ()
	{
		this.mouseDown = true;
	}.bind(this);

	document.onmouseup = function ()
	{
		this.mouseDown = false;
	}.bind(this);
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

	_drawWindow: function (wnd, cursorPositionX, cursorPositionY)
	{
		wnd._renderSelf(this._context, vec2.fromValues(cursorPositionX, cursorPositionY));
		wnd.layout.beginLayout(wnd.position, wnd.size);

		var controlSize = vec2.fromValues(0.0, 0.0);

		wnd.drawSelf(
		{

			beginHorizontalGroup: function ()
			{
				wnd.layout.beginHorizontalGroup();
			},

			endHorizontalGroup: function ()
			{
				wnd.layout.endHorizontalGroup();
			},

			label: function (message)
			{
				var fontSize = 16;
				controlSize = wnd._calculateLabelSize(this._context, message, fontSize);
				var rect = wnd.layout.beginControl(controlSize);

				this._context.save();
				this._context.beginPath();
				this._context.rect(rect.position[0], rect.position[1], rect.size[0], rect.size[1]);
				this._context.clip();

				wnd._drawLabel(this._context, message, fontSize, "white", rect.position);

				this._context.restore();
			}.bind(this),

			button: function (label)
			{
				controlSize = wnd._calculateButtonSize(this._context, label);
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

			inputbox: function (text, onTextChanged)
			{
			},

		});

		wnd.layout.endLayout();

		if(wnd.autoSize)
		{
			wnd.size = wnd.layout.getAutoSizeWindowSize();
		}
	},

	_drawCanvas: function ()
	{
		var cursorPositionX = this._cursor.position[0];
		var cursorPositionY = Renderer.screenHeight - this._cursor.position[1] - this._cursor.size[1] * 0.5;

		for(var i = 0; i < this.windows.length; i++)
		{
			var wnd = this.windows[i];
			var headerHovered = cursorPositionX >= wnd.position[0] && cursorPositionX <= wnd.position[0] + wnd.size[0] && cursorPositionY >= wnd.position[1] && cursorPositionY <= wnd.position[1] + 16.0;

			if(headerHovered && this.mouseDown && !wnd.dragging)
			{
				wnd.dragging = true;
				vec2.subtract(wnd.dragAnchor, wnd.position, vec2.fromValues(cursorPositionX, cursorPositionY));
			}
			else if(wnd.dragging && this.mouseDown)
			{
				this._context.clearRect(0, 0, Renderer.screenWidth, Renderer.screenHeight);
				vec2.add(wnd.position, vec2.fromValues(cursorPositionX, cursorPositionY), wnd.dragAnchor);
			}
			else
			{
				wnd.dragging = false;
			}

			this._drawWindow(wnd, cursorPositionX, cursorPositionY);
		}
			
	},

});