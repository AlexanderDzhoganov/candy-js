var GuiWindow = function (position, size, layout, skin)
{
	this.position = position;
	this.size = size;

	this.layout = layout;
	this.skin = skin;

	this.title = "window";
	this.autoSize = false;

	this.dragging = false;
	this.dragAnchor = vec2.fromValues(0.0, 0.0);

	this.deltaTime = 0.0;
};

GuiWindow.extend(
{
	
});

GuiWindow.prototype.extend(
{

	_renderSelf: function (context, cursor, deltaTime)
	{
		this.deltaTime = deltaTime;
		// draw background
		context.fillStyle = this.skin.window.backgroundColor;
		context.fillRect(this.position[0], this.position[1], this.size[0], this.size[1]);

		var headerHovered = cursor[0] >= this.position[0] && cursor[0] <= this.position[0] + this.size[0] && cursor[1] >= this.position[1] && cursor[1] <= this.position[1] + 16.0;

		// draw header
		if(headerHovered)
		{
			context.fillStyle = this.skin.window.header.hovered;
		}
		else
		{
			context.fillStyle = this.skin.window.header.normal;
		}

		context.fillRect(this.position[0], this.position[1], this.size[0], 16.0);

		context.font = this.layout.fontSize + "px " + this.layout.fontFamily;

		if(headerHovered)
		{
			context.fillStyle = this.skin.window.headerText.hovered;
		}
		else
		{
			context.fillStyle = this.skin.window.headerText.normal;
		}

		context.fillText(this.title, this.position[0] + 2.0, this.position[1] + 12.0);

		// draw border
		if(cursor[0] >= this.position[0] && cursor[0] <= this.position[0] + this.size[0] && cursor[1] >= this.position[1] && cursor[1] <= this.position[1] + this.size[1])
		{
			context.strokeStyle = this.skin.window.header.hovered;
		}
		else
		{
			context.strokeStyle = this.skin.window.header.normal;
		}

		context.lineWidth = 1;
		context.strokeRect(this.position[0], this.position[1], this.size[0], this.size[1]);
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

	_drawButton: function (context, label, position, size, hovered, clicked)
	{ 
		if(clicked)
		{
			context.fillStyle = this.skin.button.background.clicked;
			context.strokeStyle = this.skin.button.border.clicked;
		}
		else if(hovered)
		{
			context.fillStyle = this.skin.button.background.hovered;
			context.strokeStyle = this.skin.button.border.hovered;
		}
		else
		{
			context.fillStyle = this.skin.button.background.normal;
			context.strokeStyle = this.skin.button.border.normal;
		}

		context.fillRect(position[0], position[1], size[0], size[1]);
		context.lineWidth = this.skin.button.borderThickness;
		context.strokeRect(position[0], position[1], size[0], size[1]);

		if(clicked)
		{
			context.fillStyle = this.skin.button.text.clicked;
		}
		else if(hovered)
		{
			context.fillStyle = this.skin.button.text.hovered;
		}
		else
		{
			context.fillStyle = this.skin.button.text.normal;
		}

		var metrics = context.measureText(label);
		context.fillText(label, position[0] + (size[0] - metrics.width) / 2, position[1] + 16);
		return size;
	},

	_calculateInputBoxSize: function (context, maxLength)
	{
		return vec2.fromValues(maxLength * 6 + 32.0, 24.0);
	},

	_drawInputBox: function (context, input, position, size, hovered, clicked)
	{
		if(clicked)
		{
			context.fillStyle = this.skin.inputbox.background.clicked;
			context.strokeStyle = this.skin.inputbox.border.clicked;
		}
		else if(hovered)
		{
			context.fillStyle = this.skin.inputbox.background.hovered;
			context.strokeStyle = this.skin.inputbox.border.hovered;
		}
		else
		{
			context.fillStyle = this.skin.inputbox.background.normal;
			context.strokeStyle = this.skin.inputbox.border.normal;
		}

		context.fillRect(position[0], position[1], size[0], size[1]);
		context.lineWidth = this.skin.inputbox.borderThickness;
		context.strokeRect(position[0], position[1], size[0], size[1]);

		if(clicked)
		{
			context.fillStyle = this.skin.inputbox.text.clicked;
		}
		else if(hovered)
		{
			context.fillStyle = this.skin.inputbox.text.hovered;
		}
		else
		{
			context.fillStyle = this.skin.inputbox.text.normal;
		}

		var metrics = context.measureText(input);
		context.fillText(input, position[0] + this.layout.margin[0], position[1] + 16);

		return size;
	},

});