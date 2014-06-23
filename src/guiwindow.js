var GuiWindow = function (position, size, layout, skin)
{
	this.position = position;
	this.size = size;

	this.layout = layout;
	this.skin = skin;

	this.title = "window";
	this.autoSize = false;
	this.onClose = null;

	this.visible = true;

	this.dragging = false;
	this.dragAnchor = vec2.fromValues(0.0, 0.0);

	this.deltaTime = 0.0;
	this.time = 0.0;
};

GuiWindow.extend(
{
	
});

GuiWindow.prototype.extend(
{

	_renderSelf: function (context, cursor, deltaTime, windowHovered, headerHovered, closeButtonHovered)
	{
		this.deltaTime = deltaTime;
		this.time += deltaTime;
		context.font = this.layout.fontSize + "px " + this.layout.fontFamily;

		// draw background
		this._drawRect(context, this.skin.window.backgroundColor, { position: this.position, size: this.size });

		var headerRect = { position: this.position, size: vec2.fromValues(this.size[0], this.layout.windowHeaderSize) };
		var headerTextPosition = vec2.fromValues(this.position[0] + 2.0, this.position[1] + this.layout.windowHeaderSize / 2.0 + this.layout.fontSize / 2.0);

		// draw header
		if (headerHovered)
		{
			this._drawRect(context, this.skin.window.header.hovered, headerRect);
			this._drawText(context, this.title, this.skin.window.headerText.hovered, headerTextPosition);
		}
		else
		{
			this._drawRect(context, this.skin.window.header.normal, headerRect);
			this._drawText(context, this.title, this.skin.window.headerText.normal, headerTextPosition);

		}

		// draw close button
		if (this.onClose)
		{
			var closeButtonRect =
			{
				position: vec2.fromValues(this.position[0] + this.size[0] - this.layout.windowCloseButtonSize[0] - this.layout.margin[0], this.position[1]),
				size: this.layout.windowCloseButtonSize };

			if(closeButtonHovered)
			{
				this._drawRect(context, this.skin.window.closeButton.hovered, closeButtonRect);
			}
			else
			{
				this._drawRect(context, this.skin.window.closeButton.normal, closeButtonRect);
			}
		}

		// draw border
		if (windowHovered)
		{
			this._strokeRect(context, this.skin.window.border.hovered, { position: this.position, size: this.size }, 1);
		}
		else
		{
			this._strokeRect(context, this.skin.window.border.normal, { position: this.position, size: this.size }, 1);
		}
	},

	_calculateLabelSize: function (context, message)
	{
		var metrics = context.measureText(message);
		return vec2.fromValues(4.0 + metrics.width, this.layout.fontSize + 4.0);
	},

	_drawLabel: function (context, message, color, position)
	{
		context.fillStyle = color;
		context.fillText(message, position[0], position[1] + this.layout.fontSize);
	},

	_calculateButtonSize: function (context, label)
	{
		var metrics = context.measureText(label);
		return vec2.fromValues(metrics.width + 32.0, 24.0);
	},

	_drawButton: function (context, label, rect, state)
	{ 
		var metrics = context.measureText(label);
		var textPosition = vec2.fromValues(rect.position[0] + (rect.size[0] - metrics.width) / 2, rect.position[1] + 16);

		// background
		this._drawRect(context, this.skin.button.background[state], rect);

		// border
		this._strokeRect(context, this.skin.button.border[state], rect, this.skin.button.borderThickness);

		// text
		this._drawText(context, label, this.skin.button.text[state], textPosition);

		return size;
	},

	_calculateInputBoxSize: function (context, maxLength)
	{
		return vec2.fromValues(maxLength * 6 + 32.0, 24.0);
	},

	_drawInputBox: function (context, input, rect, state, active)
	{
		var textPosition = vec2.fromValues(rect.position[0] + this.layout.margin[0], rect.position[1] + 16);

		// background
		this._drawRect(context, this.skin.inputbox.background[state], rect);

		// border
		this._strokeRect(context, this.skin.inputbox.border[state], rect, this.skin.button.borderThickness);

		// text
		this._drawText(context, input, this.skin.inputbox.text[state], textPosition);

		var metrics = context.measureText(input);
		if (active)
		{
			// edit line
			var lineColor = Math.floor(((this.time % 1.0)) * 255.0);
			context.strokeStyle = "rgb(" + lineColor + "," + lineColor + "," + lineColor + ")";
			context.beginPath();
			context.lineWidth = 1;
			context.moveTo(rect.position[0] + this.layout.margin[0] * 1.5 + metrics.width, rect.position[1] + 5);
			context.lineTo(rect.position[0] + this.layout.margin[0] * 1.5 + metrics.width, rect.position[1] + 16 + this.layout.margin[1] - 5);
			context.stroke();
		}

		return size;
	},

	_calculateImageSize: function (context, image)
	{
		return vec2.fromValues(image.width, image.height);
	},

	_drawImage: function (context, image, rect)
	{
		// draw image
		context.drawImage(image, rect.position[0], rect.position[1]);

		// draw border
		context.strokeStyle = this.skin.image.border.normal;
		context.lineWidth = this.skin.inputbox.borderThickness;
		context.strokeRect(rect.position[0], rect.position[1], rect.size[0], rect.size[1]);
		return vec2.fromValues(image.width, image.height);
	},

	_getStyle: function (context, style, position, size)
	{
		var fillStyle = null;

		if (typeof style == 'string')
		{
			fillStyle = style;
		}
		else
		{
			fillStyle = context.createLinearGradient(position[0], position[1], position[0], position[1] + size[1]);

			var step = 1.0 / style.length;
			for (var i = 0; i < style.length; i++)
			{
				fillStyle.addColorStop(i * step, style[i]);
			}
		}

		return fillStyle;
	},

	_drawRect: function (context, style, rect)
	{
		context.fillStyle = this._getStyle(context, style, rect.position, rect.size);
		context.fillRect(rect.position[0], rect.position[1], rect.size[0], rect.size[1]);
	},

	_strokeRect: function (context, style, rect, lineWidth)
	{
		context.lineWidth = lineWidth;
		context.strokeStyle = this._getStyle(context, style, rect.position, rect.size);
		context.strokeRect(rect.position[0], rect.position[1], rect.size[0], rect.size[1]);
	},

	_drawText: function (context, text, style, position)
	{
		context.fillStyle = this._getStyle(context, style, position, vec2.fromValues(position[0], this.layout.fontSize));
		context.fillText(text, position[0], position[1]);
	},

});