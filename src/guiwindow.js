var GuiWindow = function (position, size, layout, skin)
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

	this.minimumSize = vec2.fromValues(128.0, 16.0);

	this.drawSelf = function (gui) { gui.label("!!! implement drawSelf for this window !!!"); };
	this.onClose = null;

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

	show: function ()
	{
		this.visible = true;

		if(!this._attached)
		{
			Gui.attachWindow(this);
			this._attached = true;
		}
	},

	hide: function ()
	{
		this.visible = false;
	},

	close: function ()
	{
		if(this._attached)
		{
			Gui.detachWindow(this);
			this._attached = false;
		}
	},

	_renderSelf: function (context, cursor, deltaTime, windowHovered, headerHovered, closeButtonHovered, resizeHovered)
	{
		this.deltaTime = deltaTime;
		this.time += deltaTime;
		context.font = this.layout.fontSize + "px " + this.layout.fontFamily;

		// draw background
		this._drawRect(context, this.skin.window.backgroundColor, { position: this.position, size: this.size });

		if(this.drawTitlebar)
		{
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
		}

		// draw close button
		if (this.onClose && this.drawTitlebar)
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

		if(this.resizable)
		{
			var v0 = vec2.fromValues(this.position[0] + this.size[0] - this.layout.margin[0], this.position[1] + this.size[1]);
			var v1 = vec2.fromValues(this.position[0] + this.size[0], this.position[1] + this.size[1]);
			var v2 = vec2.fromValues(this.position[0] + this.size[0], this.position[1] + this.size[1] - this.layout.margin[0]);

			if(resizeHovered)
			{
				this._drawTriangle(context, this.skin.window.resizeButton.hovered, v0, v1, v2);
			}
			else
			{
				this._drawTriangle(context, this.skin.window.resizeButton.normal, v0, v1, v2);
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

	// Horizontal separator
	_calculateHorizontalSeparatorSize: function (context)
	{
		return vec2.fromValues(this.size[0] - this.layout.margin[0] * 2.0, this.layout.horizontalSeparatorMargin * 2.0);
	},

	_drawHorizontalSeparator: function (context, rect)
	{
		var lineY = rect.position[1] + rect.size[1] * 0.5 - this.layout.margin[1] * 0.25;
		this._drawLine(context, this.skin.horizontalSeparator.lineColor.normal, this.layout.margin[0] + rect.position[0], lineY, rect.position[0] + rect.size[0] - this.layout.margin[0] * 2.0, lineY);
	},

	// Label
	_calculateLabelSize: function (context, message)
	{
		var metrics = context.measureText(message);
		return vec2.fromValues(4.0 + metrics.width, this.layout.fontSize + 4.0);
	},

	_drawLabel: function (context, message, color, position)
	{
		context.fillStyle = color;
		context.fillText(message, position[0] + 2.0, position[1] + this.layout.fontSize);
	},

	// Button
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
	},

	// InputBox
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
			context.translate(0.5, 0.5); // we do anti-antialiasing so our line is pretty
			context.moveTo(rect.position[0] + this.layout.margin[0] * 1.5 + metrics.width, rect.position[1] + 5);
			context.lineTo(rect.position[0] + this.layout.margin[0] * 1.5 + metrics.width, rect.position[1] + 16 + this.layout.margin[1] - 5);
			context.stroke();
		}
	},

	// Image
	_calculateImageSize: function (context, image, width, height)
	{
		if(width && height)
		{
			return vec2.fromValues(width, height);
		}

		if(!image)
		{
			return vec2.fromValues(128.0, 128.0);
		}

		return vec2.fromValues(image.width, image.height);
	},

	_drawImage: function (context, image, rect)
	{
		if(image)
		{
			// draw image
			context.drawImage(image, 0, 0, image.width, image.height, rect.position[0], rect.position[1], rect.size[0], rect.size[1]);
		}
		else
		{
			this._drawRect(context, this.skin.image.notFoundBackground.normal, rect);
			this._drawText(context, "Image not found", this.skin.button.text.normal, vec2.fromValues(rect.position[0], rect.position[1] + this.layout.fontSize));
		}

		// draw border
		context.strokeStyle = this.skin.image.border.normal;
		context.lineWidth = this.skin.image.borderThickness;
		context.strokeRect(rect.position[0], rect.position[1], rect.size[0], rect.size[1]);
	},

	// Checkbox
	_calculateCheckBoxSize: function (context)
	{
		return vec2.fromValues(16.0, 16.0);
	},

	_drawCheckBox: function (context, checked, rect, state)
	{
		// background
		this._drawRect(context, this.skin.checkbox.background[state], rect);

		// border
		this._strokeRect(context, this.skin.checkbox.border[state], rect, this.skin.button.borderThickness);

		if(checked)
		{
			this._drawRect(context, this.skin.checkbox.checkmark[state], { position: vec2.fromValues(rect.position[0] + 4.0, rect.position[1] + 4.0), size: vec2.fromValues(8.0, 8.0)});
		}
	},

	// Listbox
	_calculateListBoxSize: function (context, width, height)
	{
		return vec2.fromValues(width, height);
	},

	_drawListBox: function (context, items, selectedIndex, hoveredIndex, control)
	{
		// background
		this._drawRect(context, this.skin.listbox.background[control.state], control.rect);

		// border
		this._strokeRect(context, this.skin.listbox.border[control.state], control.rect, this.skin.button.borderThickness);

		var step = this.layout.fontSize + 4.0;
		for(var i = 0; i < items.length; i++)
		{
			var y = i * step;
			var itemRect = { position: vec2.fromValues(control.rect.position[0] + 1.0, control.rect.position[1] + y + 1.0), size: vec2.fromValues(control.rect.size[0] - 2.0, this.layout.fontSize + 4.0)};

			var itemState = "normal";
			if(hoveredIndex == i)
			{
				itemState = "hovered";
			}

			if(selectedIndex == i)
			{
				itemState = "selected";
			}

			this._drawRect(context, this.skin.listbox.itemBackground[itemState], itemRect);

			var label = null;

			if(items[i].toString)
			{
				label = items[i].toString();
			}
			else
			{
				label = items[i];
			}

			this._drawText(context, items[i], this.skin.listbox.itemText[itemState], vec2.fromValues(itemRect.position[0] + 4.0, itemRect.position[1] + this.layout.fontSize));
		}
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

	_drawLine: function (context, style, x0, y0, x1, y1, width)
	{
		context.strokeStyle = this._getStyle(context, style, vec2.fromValues(x0, y0), vec2.fromValues(x1, y1));
		context.beginPath();
		context.lineWidth = width;
		context.translate(0.5, 0.5); // we do anti-antialiasing so our line is pretty
		context.moveTo(x0, y0);
		context.lineTo(x1, y1);
		context.stroke();
	},

	_drawTriangle: function (context, style, a, b, c)
	{
		context.fillStyle = this._getStyle(context, style, vec2.fromValues(a[0], a[1]), vec2.fromValues(c[0], c[1]));

		context.beginPath();
		context.moveTo(a[0], a[1]);
		context.lineTo(b[0], b[1]);
		context.lineTo(c[0], c[1]);
		context.closePath();
		context.fill();
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