var GuiWindow = function (position, size, backgroundColor, layout)
{
	this.position = position;
	this.size = size;
	this.backgroundColor = backgroundColor;
	this.layout = layout;
	this.title = "window";
	this.autoSize = false;

	this.dragging = false;
	this.dragAnchor = vec2.fromValues(0.0, 0.0);
};

GuiWindow.extend(
{
	
});

GuiWindow.prototype.extend(
{

	_renderSelf: function (context, cursor)
	{
		// draw background
		context.fillStyle = this.backgroundColor;
		context.fillRect(this.position[0], this.position[1], this.size[0], this.size[1]);

		// draw header
		if(cursor[0] >= this.position[0] && cursor[0] <= this.position[0] + this.size[0] && cursor[1] >= this.position[1] && cursor[1] <= this.position[1] + 16.0)
		{
			context.fillStyle = "#FFFFFF";
		}
		else
		{
			context.fillStyle = "#E7E7E7";
		}

		context.fillRect(this.position[0], this.position[1], this.size[0], 16.0);

		context.font="12px Verdana";
		context.fillStyle = 'black';
		context.fillText(this.title, this.position[0] + 2.0, this.position[1] + 12.0);

		// draw border
		context.strokeStyle = "#E7E7E7";
		context.lineWidth = 1;
		context.strokeRect(this.position[0], this.position[1], this.size[0], this.size[1]);
	},

	_calculateLabelSize: function (context, message, fontSize)
	{
		context.font = "Verdana " + fontSize + "px";
		var metrics = context.measureText(message);
		return vec2.fromValues(4.0 + metrics.width, fontSize + 4.0);
	},

	_drawLabel: function (context, message, fontSize, color, position)
	{
		context.font = "Verdana " + fontSize + "px";
		context.fillStyle = color;
		context.fillText(message, position[0], position[1] + fontSize);
	},

	_calculateButtonSize: function (context, label)
	{
		context.font = "Verdana 16px";
		context.fillStyle = 'grey';
		var metrics = context.measureText(label);
		return vec2.fromValues(metrics.width + 32.0, 24.0);
	},

	_drawButton: function (context, label, position, size, hovered, clicked)
	{ 
		if(clicked)
		{
			context.fillStyle = "#000000";
		}
		else if(hovered)
		{
			context.fillStyle = "#777777";
		}
		else
		{
			context.fillStyle = "#333333";
		}

		context.fillRect(position[0], position[1], size[0], size[1]);

		context.strokeStyle = "#FFFFFF";
		context.lineWidth = 1;
		context.strokeRect(position[0], position[1], size[0], size[1]);

		context.font = "Verdana 16px";
		context.fillStyle = '#CCCCCC';
		var metrics = context.measureText(label);
		context.fillText(label, position[0] + (size[0] - metrics.width) / 2, position[1] + 16);
		return size;
	},

});