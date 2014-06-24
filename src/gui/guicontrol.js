var GuiControl = function (guiInput, context)
{
	this._input = guiInput;
	this._context = context;
};

GuiControl.extend(
{
	
});

GuiControl.prototype.extend(
{

	drawControls: function (wnd, deltaTime)
	{
		this._calculateControlSizes(wnd);
		this._drawControls(wnd, deltaTime);
	},

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
		vec2.subtract(relativeMousePosition, this._input.getCursorPosition(), rect.position);

		var hovered = PointRectTest(this._input.getCursorPosition(), rect.position, rect.size) && Gui._activeWindow == wnd;
		var clicked = hovered && this._input._mouseDown;

		if(wnd._resizing || wnd._dragging)
		{
			hovered = false;
			clicked = false;
		}

		if (clicked)
		{
			Gui._activeControlPosition = rect.position;
			Gui._activeControlSize = rect.size;
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
			Gui._activeControlPosition[0] == rect.position[0] &&
			Gui._activeControlPosition[1] == rect.position[1] &&
			Gui._activeControlSize[0] == rect.size[0] &&
			Gui._activeControlSize[1] == rect.size[1];

		return {

			rect: rect,
			hovered: hovered,
			clicked: clicked,
			active: active,
			state: state,
			relativeMousePosition: relativeMousePosition,
			mousePosition: this._input.getCursorPosition(),
			caret: this._input.getCaret(),

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
		wnd.layout.beginPrepareLayout();

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
				wnd.layout.prepareControl(GuiRenderer.calculateHorizontalSeparatorSize(this._context, wnd));
			}.bind(this),

			label: function (message)
			{
				wnd.layout.prepareControl(GuiRenderer.calculateLabelSize(this._context, wnd, message));
			}.bind(this),

			button: function (label)
			{
				wnd.layout.prepareControl(GuiRenderer.calculateButtonSize(this._context, wnd, label));
				return false;
			}.bind(this),

			inputbox: function (input, maxLength)
			{
				wnd.layout.prepareControl(GuiRenderer.calculateInputBoxSize(this._context, wnd, maxLength));
				return input;
			}.bind(this),

			textbox: function (input, rows, cols, readonly)
			{
				wnd.layout.prepareControl(GuiRenderer.calculateTextBoxSize(this._context, wnd, rows, cols));
				return input;
			}.bind(this),

			image: function (resourceName, width, height)
			{
				wnd.layout.prepareControl(GuiRenderer.calculateImageSize(this._context, wnd, ResourceLoader.getContent(resourceName), width, height));
			}.bind(this),

			checkbox: function (checked)
			{
				wnd.layout.prepareControl(GuiRenderer.calculateCheckBoxSize(this._context, wnd));
				return checked;
			}.bind(this),

			listbox: function (items, width, height, selectedIndex)
			{
				wnd.layout.prepareControl(GuiRenderer.calculateListBoxSize(this._context, wnd, width, height));
				return selectedIndex;
			}.bind(this),

		});

		wnd.layout.endPrepareLayout();
	},

	_drawControls: function (wnd, deltaTime)
	{
		wnd.layout.beginLayout(wnd);

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
				GuiRenderer.drawHorizontalSeparator(this._context, wnd, control.rect);
				this._endControl(wnd);
			}.bind(this),

			label: function (message)
			{
				var control = this._beginControl(wnd);
				GuiRenderer.drawLabel(this._context, wnd, message, "white", control.rect.position);
				this._endControl(wnd);
			}.bind(this),

			button: function (label)
			{
				var control = this._beginControl(wnd);
				GuiRenderer.drawButton(this._context, wnd, label, control.rect, control.state);
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
					var caretIndex = 0;

					this._input.setKeyBuffer(input);
					caretIndex = GuiRenderer.calculateInputBoxCaretIndex(this._context, wnd, input, control);

					if(caretIndex > input.length + 1)
					{
						caretIndex = input.length + 1;
					}

					this._input.setCaretIndex(caretIndex);
					control.caret[0] = caretIndex;
				}

				GuiRenderer.drawInputBox(this._context, wnd, input, control);

				this._endControl(wnd);

				if (control.active)
				{
					var newInput = this._input.getKeyBuffer();

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
					this._input.setKeyBuffer(input);
					control.caret = GuiRenderer.calculateTextBoxCaretIndex(this._context, wnd, input, rows, cols, control);
					this._input.setCaret(control.caret);
				}

				GuiRenderer.drawTextBox(this._context, wnd, input, rows, cols, control);
				this._endControl(wnd);

				if(control.active)
				{
					var newInput = this._input.getKeyBuffer();
					return newInput;
				}

				return input;
			}.bind(this),

			image: function (resourceName, width, height)
			{
				var control = this._beginControl(wnd);
				var image = ResourceLoader.getContent(resourceName);
				GuiRenderer.drawImage(this._context, wnd, image, control.rect);
				this._endControl(wnd);
			}.bind(this),

			checkbox: function (checked)
			{
				var control = this._beginControl(wnd);
				GuiRenderer.drawCheckBox(this._context, wnd, checked, control.rect, control.state);
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

				GuiRenderer.drawListBox(this._context, wnd, items, selectedIndex, hoveredItem, control);
				this._endControl(wnd);

				return selectedIndex;
			}.bind(this),

		});

		wnd.layout.endLayout(wnd);
	},

});