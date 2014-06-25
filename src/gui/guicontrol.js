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
		this.recalculate = false;
		var controlsCount = this._calculateControlSizes(wnd);
		this._interactControls(wnd, deltaTime);

		if(this.recalculate)
		{
			this._calculateControlSizes(wnd);
			this._interactControls(wnd, deltaTime);
		}

		this._drawControls(wnd, deltaTime);
	},

	_beginControl: function (wnd)
	{
		var rect = wnd.layout.beginControl(wnd);
		if(rect == null)
		{
			this.recalculate = true;
			return null;
		}

		if(Gui.debugLayout)
		{
			this.debugLayoutLastRect = rect;
		}

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
		
	},

	_calculateControlSizes: function (wnd)
	{
		var controlsCount = 0;
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
				controlsCount++;
			}.bind(this),

			label: function (message)
			{
				wnd.layout.prepareControl(GuiRenderer.calculateLabelSize(this._context, wnd, message));
				controlsCount++;
			}.bind(this),

			button: function (label)
			{
				wnd.layout.prepareControl(GuiRenderer.calculateButtonSize(this._context, wnd, label));
				controlsCount++;
				return false;
			}.bind(this),

			inputbox: function (input, maxLength)
			{
				wnd.layout.prepareControl(GuiRenderer.calculateInputBoxSize(this._context, wnd, maxLength));
				controlsCount++;
				return input;
			}.bind(this),

			textbox: function (input, rows, cols, readonly)
			{
				wnd.layout.prepareControl(GuiRenderer.calculateTextBoxSize(this._context, wnd, rows, cols));
				controlsCount++;
				return input;
			}.bind(this),

			image: function (resourceName, width, height)
			{
				wnd.layout.prepareControl(GuiRenderer.calculateImageSize(this._context, wnd, ResourceLoader.getContent(resourceName), width, height));
				controlsCount++;
			}.bind(this),

			checkbox: function (checked)
			{
				wnd.layout.prepareControl(GuiRenderer.calculateCheckBoxSize(this._context, wnd));
				controlsCount++;
				return checked;
			}.bind(this),

			listbox: function (items, width, height, selectedIndex)
			{
				wnd.layout.prepareControl(GuiRenderer.calculateListBoxSize(this._context, wnd, width, height));
				controlsCount++;
				return selectedIndex;
			}.bind(this),

		});

		wnd.layout.endPrepareLayout();
		return controlsCount;
	},

	_interactControls: function (wnd, deltaTime)
	{
		wnd.layout.beginLayout(wnd);

		this.controlList = [];

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
				if(control == null)
				{
					return;
				}

				this.controlList.push(['horizontalSeparator', control]);
				this._endControl(wnd);
			}.bind(this),

			label: function (message)
			{
				var control = this._beginControl(wnd);
				if(control == null)
				{
					return;
				}

				control.message = message;

				this.controlList.push(['label', control]);
				this._endControl(wnd);
			}.bind(this),

			button: function (label)
			{
				var control = this._beginControl(wnd);
				if(control == null)
				{
					return false;
				}
				
				this.controlList.push(['button', control]);
				this._endControl(wnd);

				control.label = label;

				if (control.clicked)
				{
					return true;
				}

				return false;
			}.bind(this),

			inputbox: function (input, maxLength)
			{
				var control = this._beginControl(wnd);
				if(control == null)
				{
					return input;
				}

				if (control.clicked)
				{
					this._input.setMultiline( false );
					this._input.setKeyBuffer(input.toString(), maxLength);
					var caretIndex = GuiRenderer.calculateInputBoxCaretIndex(this._context, wnd, this._input.getKeyBuffer(), control);

					if(caretIndex > input.length + 1)
					{
						caretIndex = input.length + 1;
					}

					this._input.setCaretIndex(caretIndex);
					control.caret[0] = caretIndex;
				}

				this._endControl(wnd);

				if(control.active)
				{
					control.input = this._input.getKeyBuffer();

					if(control.input.length > maxLength)
					{
						control.input = control.input.slice(0, maxLength);
						this._input.setKeyBuffer(control.input);
					}
				}
				else
				{
					control.input = input.toString().slice(0, maxLength);
				}

				control.maxLength = maxLength;
				this.controlList.push(['inputbox', control]);

				if (control.active && this._input._enterDown)
				{
					this._input._enterDown = false;

					Gui._activeControlPosition = vec2.create();
					Gui._activeControlSize = vec2.create();

					if(typeof input === 'number')
					{
						return parseFloat(this._input.getKeyBuffer());
					}

					return this._input.getKeyBuffer();
				}

				return input;
			}.bind(this),

			textbox: function (input, rows, cols, readonly)
			{
				var control = this._beginControl(wnd);
				if(control == null)
				{
					return input;
				}

				control.input = input;
				control.rows = rows;
				control.cols = cols;
				control.readonly = readonly;
				this.controlList.push(['textbox', control]);


				if (control.clicked)
				{
					this._input.setMultiline( true );
					this._input.setKeyBuffer(input);
					control.caret = GuiRenderer.calculateTextBoxCaretIndex(this._context, wnd, input, rows, cols, control);
					this._input.setCaret(control.caret);
				}

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
				if(control == null)
				{
					return;
				}
				
				control.resourceName = resourceName;
				control.width = width;
				control.height = height;
				control.image = ResourceLoader.getContent(resourceName);

				this.controlList.push(['image', control]);
				this._endControl(wnd);
			}.bind(this),

			checkbox: function (checked)
			{
				var control = this._beginControl(wnd);
				if(control == null)
				{
					return checked;
				}
				
				control.checked = checked;
				this.controlList.push(['checkbox', control]);
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
				if(control == null)
				{
					return selectedIndex;
				}
				
				control.items = items;
				control.width = width;
				control.height = height;
				control.selectedIndex = selectedIndex;
				var hoveredItem = null;

				if(control.hovered)
				{
					hoveredItem = Math.floor(control.relativeMousePosition[1] / ptsToPixels(wnd.layout.fontSize));

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

					control.hoveredItem = hoveredItem;
				}

				this.controlList.push(['listbox', control]);

				this._endControl(wnd);

				return selectedIndex;
			}.bind(this),

		});

		wnd.layout.endLayout(wnd);
	},

	_drawControls: function (wnd, deltaTime)
	{
		for(var i = 0; i < this.controlList.length; i++)
		{
			var type = this.controlList[i][0];
			var control = this.controlList[i][1];
			var rect = control.rect;

			this._context.save();
			this._context.beginPath();
			this._context.rect(rect.position[0], rect.position[1], rect.size[0], rect.size[1]);
			this._context.clip();

			if(type == 'horizontalSeparator')
			{
				GuiRenderer.drawHorizontalSeparator(this._context, wnd, control.rect);
			}
			else if(type == 'label')
			{
				GuiRenderer.drawLabel(this._context, wnd, control.message, "white", control);
			}
			else if(type == 'button')
			{
				GuiRenderer.drawButton(this._context, wnd, control.label, control);
			}
			else if(type == 'inputbox')
			{
				GuiRenderer.drawInputBox(this._context, wnd, control.input, control);
			}
			else if(type == 'textbox')
			{
				GuiRenderer.drawTextBox(this._context, wnd, control.input, control.rows, control.cols, control);
			}
			else if(type == 'image')
			{
				GuiRenderer.drawImage(this._context, wnd, control.image, control);
			}
			else if(type == 'checkbox')
			{
				GuiRenderer.drawCheckBox(this._context, wnd, control.checked, control);
			}
			else if(type == 'listbox')
			{
				GuiRenderer.drawListBox(this._context, wnd, control.items, control.selectedIndex, control.hoveredItem, control);
			}

			this._context.restore();

			if(this.debugLayout)
			{
				var rect = this.debugLayoutLastRect;
				this._context.strokeStyle = 'green';
				this._context.strokeRect(rect.position[0], rect.position[1], rect.size[0], rect.size[1]);
			}
		}
	},

});