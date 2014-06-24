var GuiControlRenderer = function (guiInput, context)
{
	this._input = guiInput;
	this._context = context;

	this._activeWindow = null;
	this._activeControlPosition = vec2.fromValues(0.0, 0.0);
	this._activeControlSize = vec2.fromValues(0.0, 0.0);

	this._previousTime = 0.0;
};

GuiControlRenderer.extend(
{
	
});

GuiControlRenderer.prototype.extend(
{

	_beginControl: function (wnd)
	{
		var rect = wnd.layout.beginControl(wnd);

		if(Gui.debugLayout)
		{
			this.debugLayoutLastRect = rect;
		}

		this._context.save();
		this._context.beginPath();
		this._context.rect(rect.position[0], rect.position[1], rect.size[0], rect.size[1]);
		this._context.clip();

		var relativeMousePosition = vec2.create();
		vec2.subtract(relativeMousePosition, Gui.cursorPosition, rect.position);

		var hovered = PointRectTest(Gui.cursorPosition, rect.position, rect.size) && this._activeWindow == wnd;
		var clicked = hovered && this._input._mouseDown;

		if(wnd._resizing || wnd._dragging)
		{
			hovered = false;
			clicked = false;
		}

		if (clicked)
		{
			this._activeControlPosition = rect.position;
			this._activeControlSize = rect.size;
			this._input._mouseDown = false;
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
			hovered: hovered,
			clicked: clicked,
			active: active,
			state: state,
			relativeMousePosition: relativeMousePosition,
			mousePosition: Gui.cursorPosition,
			caretIndex: this._input._caretIndex,
			caretLineIndex: this._input._caretLineIndex,

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
					this._input._keyBuffer = input;
					this._input._caretIndex = wnd._calculateInputBoxCaretIndex(this._context, input, control);
				}

				if(this._input._caretIndex > input.length + 1)
				{
					this._input._caretIndex = input.length + 1;
				}

				wnd._drawInputBox(this._context, input, control);

				this._endControl(wnd);

				if (control.active)
				{
					var newInput = this._input._keyBuffer;

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

				if (control.clicked)
				{
					this._input._keyBuffer = input;
					var carets = wnd._calculateTextBoxCaretIndex(this._context, input, rows, cols, control);
					this._input._caretIndex = carets[0];
					this._input._caretLineIndex = carets[1];
				}

				wnd._drawTextBox(this._context, input, rows, cols, control);
				this._endControl(wnd);

				if(control.active)
				{
					var newInput = this._input._keyBuffer;
					return newInput;
				}

				return input;
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

});