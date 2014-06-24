var GuiRenderer = 
{

	drawWindow: function (context, wnd, cursor, deltaTime, windowHovered, headerHovered, closeButtonHovered, resizeHovered)
	{
		wnd.deltaTime = deltaTime;
		wnd.time += deltaTime;

		context.font = wnd.layout.fontSize + "px " + wnd.layout.fontFamily;

		// draw background
		this._drawRect(context, wnd.skin.window.backgroundColor, { position: wnd.position, size: wnd.size });

		if(wnd.drawTitlebar)
		{
			var headerRect = { position: wnd.position, size: vec2.fromValues(wnd.size[0], wnd.layout.windowHeaderSize) };
			var headerTextPosition = vec2.fromValues(wnd.position[0] + 2.0, wnd.position[1] + wnd.layout.windowHeaderSize / 2.0 + wnd.layout.fontSize / 2.0);

			// draw header
			if (headerHovered)
			{
				this._drawRect(context, wnd.skin.window.header.hovered, headerRect);
				this._drawText(context, wnd.title, wnd.skin.window.headerText.hovered, headerTextPosition, wnd.layout.fontSize);
			}
			else
			{
				this._drawRect(context, wnd.skin.window.header.normal, headerRect);
				this._drawText(context, wnd.title, wnd.skin.window.headerText.normal, headerTextPosition, wnd.layout.fontSize);

			}
		}

		// draw close button
		if (wnd.onClose && wnd.drawTitlebar)
		{
			var closeButtonRect =
			{
				position: vec2.fromValues(wnd.position[0] + wnd.size[0] - wnd.layout.windowCloseButtonSize[0] - wnd.layout.margin[0], wnd.position[1]),
				size: wnd.layout.windowCloseButtonSize };

			if(closeButtonHovered)
			{
				this._drawRect(context, wnd.skin.window.closeButton.hovered, closeButtonRect);
			}
			else
			{
				this._drawRect(context, wnd.skin.window.closeButton.normal, closeButtonRect);
			}
		}

		if(this.resizable)
		{
			var v0 = vec2.fromValues(wnd.position[0] + wnd.size[0] - wnd.layout.margin[0], wnd.position[1] + wnd.size[1]);
			var v1 = vec2.fromValues(wnd.position[0] + wnd.size[0], wnd.position[1] + wnd.size[1]);
			var v2 = vec2.fromValues(wnd.position[0] + wnd.size[0], wnd.position[1] + wnd.size[1] - wnd.layout.margin[0]);

			if(resizeHovered)
			{
				this._drawTriangle(context, wnd.skin.window.resizeButton.hovered, v0, v1, v2);
			}
			else
			{
				this._drawTriangle(context, wnd.skin.window.resizeButton.normal, v0, v1, v2);
			}
		}

		// draw border
		if (windowHovered)
		{
			this._strokeRect(context, wnd.skin.window.border.hovered, { position: wnd.position, size: wnd.size }, 1);
		}
		else
		{
			this._strokeRect(context, wnd.skin.window.border.normal, { position: wnd.position, size: wnd.size }, 1);
		}
	},

	// Horizontal separator
	calculateHorizontalSeparatorSize: function (context, wnd)
	{
		return vec2.fromValues(wnd.size[0] - wnd.layout.margin[0] * 2.0, wnd.layout.horizontalSeparatorMargin * 2.0);
	},

	drawHorizontalSeparator: function (context, wnd, rect)
	{
		var lineY = rect.position[1] + rect.size[1] * 0.5 - wnd.layout.margin[1] * 0.25;
		this._drawLine(context, wnd.skin.horizontalSeparator.lineColor.normal, wnd.layout.margin[0] + rect.position[0], lineY, rect.position[0] + rect.size[0] - wnd.layout.margin[0] * 2.0, lineY);
	},

	// Label
	calculateLabelSize: function (context, wnd, message)
	{
		var metrics = context.measureText(message);
		return vec2.fromValues(4.0 + metrics.width, wnd.layout.fontSize + 4.0);
	},

	drawLabel: function (context, wnd, message, color, position)
	{
		context.fillStyle = color;
		context.fillText(message, position[0] + 2.0, position[1] + wnd.layout.fontSize);
	},

	// Button
	calculateButtonSize: function (context, wnd, label)
	{
		var metrics = context.measureText(label);
		return vec2.fromValues(metrics.width + 32.0, 24.0);
	},

	drawButton: function (context, wnd, label, rect, state)
	{ 
		var metrics = context.measureText(label);
		var textPosition = vec2.fromValues(rect.position[0] + (rect.size[0] - metrics.width) / 2, rect.position[1] + 16);

		// background
		this._drawRect(context, wnd.skin.button.background[state], rect);

		// border
		this._strokeRect(context, wnd.skin.button.border[state], rect, wnd.skin.button.borderThickness);

		// text
		this._drawText(context, label, wnd.skin.button.text[state], textPosition, wnd.layout.fontSize);
	},

	// InputBox
	calculateInputBoxSize: function (context, wnd, maxLength)
	{
		return vec2.fromValues(maxLength * 6 + 32.0, 24.0);
	},

	calculateInputBoxCaretIndex: function (context, wnd, input, control)
	{
		var textPosition = vec2.fromValues(control.rect.position[0] + wnd.layout.margin[0], control.rect.position[1] + 16);
		var cursorPosition = control.mousePosition;
		var difference = vec2.create();
		vec2.subtract(difference, cursorPosition, textPosition);

		var metrics = context.measureText(input);
		var xStep = metrics.width / input.length;
		var xDiff = difference[0] / xStep;
		return Math.floor(xDiff);
	},

	drawInputBox: function (context, wnd, input, control)
	{
		var textPosition = vec2.fromValues(control.rect.position[0] + wnd.layout.margin[0], control.rect.position[1] + 16);

		// background
		this._drawRect(context, wnd.skin.inputbox.background[control.state], control.rect);

		// border
		this._strokeRect(context, wnd.skin.inputbox.border[control.state], control.rect, wnd.skin.button.borderThickness);

		// text
		this._drawText(context, input, wnd.skin.inputbox.text[control.state], textPosition, wnd.layout.fontSize);

		var metrics = context.measureText(input);
		if (control.active)
		{
			var caretMetrics = context.measureText(input.slice(0, control.caret[0]));
			// edit line
			var lineColor = Math.floor(((wnd.time % 1.0)) * 255.0);
			context.strokeStyle = "rgb(" + lineColor + "," + lineColor + "," + lineColor + ")";
			context.beginPath();
			context.lineWidth = 1;
			context.translate(0.5, 0.5); // we do anti-antialiasing so our line is pretty
			context.moveTo(control.rect.position[0] + wnd.layout.margin[0] + caretMetrics.width, control.rect.position[1] + 5);
			context.lineTo(control.rect.position[0] + wnd.layout.margin[0] + caretMetrics.width, control.rect.position[1] + 16 + wnd.layout.margin[1] - 5);
			context.stroke();
		}
	},

	// Textbox
	calculateTextBoxSize: function (context, wnd, rows, cols)
	{
		return vec2.fromValues(rows * 4.0, cols * wnd.layout.fontSize);
	},

	calculateTextBoxCaretIndex: function (context, wnd, input, rows, cols, control)
	{
		var textPosition = vec2.fromValues(control.rect.position[0] + wnd.layout.margin[0], control.rect.position[1] + wnd.layout.margin[1] + wnd.layout.fontSize);
		var cursorPosition = control.mousePosition;
		var difference = vec2.create();
		vec2.subtract(difference, cursorPosition, textPosition);

		var index = Math.floor(difference[1] / (wnd.layout.fontSize + 2.0));
		var lines = input.split('\n');

		if(index >= lines.length)
		{
			index = lines.length - 1;
			return [ lines[index].length, index ];
		}
		else if(index < 0)
		{
			index = 0;
		}

		var line = lines[index];

		var metrics = context.measureText(line);
		var xStep = metrics.width / line.length;
		var xDiff = Math.floor(difference[0] / xStep);

		return [ xDiff, index ];
	},

	drawTextBox: function (context, wnd, input, rows, cols, control)
	{
		var rect = control.rect;
		var state = control.state;
		var caretIndex = control.caret[0];
		var caretLineIndex = control.caret[1];

		// background
		this._drawRect(context, wnd.skin.textbox.background[state], rect);

		// border
		this._strokeRect(context, wnd.skin.textbox.border[state], rect, wnd.skin.button.borderThickness);

		var lines = input.split("\n");

		context.translate(0.5, 0.5); // we do anti-antialiasing so our line is pretty

		for(var i = 0; i < lines.length; i++)
		{
			var line = lines[i];
			var y = 16.0 + i * (wnd.layout.fontSize + 2.0);
			this._drawText(context, line, wnd.skin.textbox.text[state], vec2.fromValues(rect.position[0] + wnd.layout.margin[0], rect.position[1] + wnd.layout.margin[1] + y), wnd.layout.fontSize);

			if (control.active && i == caretLineIndex)
			{
				var caretMetrics = context.measureText(line.slice(0, caretIndex));
				var caretY = (wnd.layout.fontSize + 2.0) * i;

				// edit line
				var lineColor = Math.floor(((wnd.time % 1.0)) * 255.0);
				context.strokeStyle = "rgb(" + lineColor + "," + lineColor + "," + lineColor + ")";
				context.beginPath();
				context.lineWidth = 1;
				context.moveTo(rect.position[0] + wnd.layout.margin[0] + caretMetrics.width, rect.position[1] + wnd.layout.margin[1] + 4.0 + caretY);
				context.lineTo(rect.position[0] + wnd.layout.margin[0] + caretMetrics.width, rect.position[1] + wnd.layout.fontSize + 4.0 + wnd.layout.margin[1] + caretY);
				context.stroke();
			}
		}
	},

	// Image
	calculateImageSize: function (context, wnd, image, width, height)
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

	drawImage: function (context, wnd, image, rect)
	{
		if(image)
		{
			// draw image
			context.drawImage(image, 0, 0, image.width, image.height, rect.position[0], rect.position[1], rect.size[0], rect.size[1]);
		}
		else
		{
			this._drawRect(context, wnd.skin.image.notFoundBackground.normal, rect);
			this._drawText(context, "Image not found", wnd.skin.button.text.normal, vec2.fromValues(rect.position[0], rect.position[1] + wnd.layout.fontSize), wnd.layout.fontSize);
		}

		// draw border
		context.strokeStyle = wnd.skin.image.border.normal;
		context.lineWidth = wnd.skin.image.borderThickness;
		context.strokeRect(rect.position[0], rect.position[1], rect.size[0], rect.size[1]);
	},

	// Checkbox
	calculateCheckBoxSize: function (context, wnd)
	{
		return vec2.fromValues(16.0, 16.0);
	},

	drawCheckBox: function (context, wnd, checked, rect, state)
	{
		// background
		this._drawRect(context, wnd.skin.checkbox.background[state], rect);

		// border
		this._strokeRect(context, wnd.skin.checkbox.border[state], rect, wnd.skin.button.borderThickness);

		if(checked)
		{
			this._drawRect(context, wnd.skin.checkbox.checkmark[state], { position: vec2.fromValues(rect.position[0] + 4.0, rect.position[1] + 4.0), size: vec2.fromValues(8.0, 8.0)});
		}
	},

	// Listbox
	calculateListBoxSize: function (context, wnd, width, height)
	{
		return vec2.fromValues(width, height);
	},

	drawListBox: function (context, wnd, items, selectedIndex, hoveredIndex, control)
	{
		// background
		this._drawRect(context, wnd.skin.listbox.background[control.state], control.rect);

		// border
		this._strokeRect(context, wnd.skin.listbox.border[control.state], control.rect, wnd.skin.button.borderThickness);

		var step = wnd.layout.fontSize + 4.0;
		for(var i = 0; i < items.length; i++)
		{
			var y = i * step;
			var itemRect = { position: vec2.fromValues(control.rect.position[0] + 1.0, control.rect.position[1] + y + 1.0), size: vec2.fromValues(control.rect.size[0] - 2.0, wnd.layout.fontSize + 4.0)};

			var itemState = "normal";
			if(hoveredIndex == i)
			{
				itemState = "hovered";
			}

			if(selectedIndex == i)
			{
				itemState = "selected";
			}

			this._drawRect(context, wnd.skin.listbox.itemBackground[itemState], itemRect);

			var label = null;

			if(items[i].toString)
			{
				label = items[i].toString();
			}
			else
			{
				label = items[i];
			}

			this._drawText(context, items[i], wnd.skin.listbox.itemText[itemState], vec2.fromValues(itemRect.position[0] + 4.0, itemRect.position[1] + wnd.layout.fontSize), wnd.layout.fontSize);
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

	_drawText: function (context, text, style, position, fontSize)
	{
		context.fillStyle = this._getStyle(context, style, position, vec2.fromValues(position[0], fontSize));
		context.fillText(text, position[0], position[1]);
	},

};