var GuiLayout = function ()
{
	// public
	this.fontFamily = "Courier New";
	this.fontSize = 12;

	this.margin = vec2.fromValues(8.0, 8.0);
	this.windowTopMargin = 8.0;
	this.windowHeaderSize = 20.0;
	this.windowCloseButtonSize = vec2.fromValues(12.0, 8.0);

	this.horizontalSeparatorMargin = 8.0;

	// private
	this._currentPosition = vec2.fromValues(0.0, 0.0);

	this._controlSizes = [];
	this._controlId = 0;

	this._horizontal = false;
	this._horizontalGroupHeights = [];
	this._horizontalGroupMaxHeight = 0.0;
	this._horizontalGroupId = 0;

	this._prepareLayout = false;
};

GuiLayout.extend(
{

});

GuiLayout.prototype.extend(
{

	beginPrepareLayout: function ()
	{
		// reset control sizes and id
		this._controlSizes = [];
		this._controlId = 0;

		// reset horizontal groups
		this._horizontal = false;
		this._horizontalGroupHeights = [];
		this._horizontalGroupMaxHeight = 0.0;
		this._horizontalGroupId = 0;

		this._prepareLayout = true;

		// reset cursor
		this._currentPosition = vec2.fromValues(this.margin[0], this.windowTopMargin + this.windowHeaderSize);
	},

	endPrepareLayout: function ()
	{
		this._prepareLayout = false;
	},

	beginLayout: function (wnd)
	{
		// reset control id
		this._controlId = 0;

		// reset horizontal group
		this._horizontal = false;
		this._horizontalGroupId = 0;
		this._horizontalGroupMaxHeight = 0.0;

		this._prepareLayout = false;

		// reset cursor
		this._currentPosition = vec2.fromValues(this.margin[0], this.windowTopMargin + this.windowHeaderSize);

		if(!wnd.drawTitlebar)
		{
			this._currentPosition[1] = this.windowTopMargin;
		}
	},

	endLayout: function ()
	{
	},

	beginHorizontalGroup: function ()
	{	
		// mark start of horizontal group, reset max height
		this._horizontal = true;
		this._horizontalGroupMaxHeight = 0.0;
	},

	endHorizontalGroup: function (wnd)
	{
		// move cursor past horizontal group
		this._currentPosition[0] = this.margin[0];
		this._currentPosition[1] += this._horizontalGroupMaxHeight + this.margin[1];

		// resize window to fit
		if(this._currentPosition[1] >= wnd.size[1] - this.margin[1] && wnd.autoSize)
		{	
			wnd.size[1] = this._currentPosition[1] + this.margin[1];
		}

		wnd.minimumSize[1] = this._currentPosition[1] + this.margin[1];

		// mark end of horizontal group
		this._horizontal = false;
		this._horizontalGroupHeights.push(this._horizontalGroupMaxHeight);
		this._horizontalGroupId++;
	},

	prepareControl: function (controlSize)
	{
		this._controlSizes.push(controlSize);
		
		if(controlSize[1] > this._horizontalGroupMaxHeight)
		{
			this._horizontalGroupMaxHeight = controlSize[1];
		}

		this._controlId++;
	},

	beginControl: function (wnd)
	{
		if(this._controlSizes.length <= this._controlId)
		{
			console.log("control sizes mismatch");
			return null;
		}

		var rect =
		{
			position: vec2.create(),
			size: this._controlSizes[this._controlId],
		};

		// set world position
		vec2.add(rect.position, wnd.position, this._currentPosition);

		// clip control to window
		if(rect.size[0] > wnd.size[0] - this.margin[0])
		{
			rect.size[0] = wnd.size[0] - this.margin[0] * 2.0;
		}

		// if in horizontal group
		if(this._horizontal)
		{
			// wrap controls if horizontal space is not enough
			if(this._currentPosition[0] + rect.size[0] >= wnd.size[0] - this.margin[0])
			{
				this._currentPosition[1] += this._horizontalGroupMaxHeight + this.margin[1];
				this._currentPosition[0] = this.margin[0];

				vec2.add(rect.position, wnd.position, this._currentPosition);
			}

			// increase horizontal group size if control is larger
			if(rect.size[1] > this._horizontalGroupMaxHeight)
			{
				this._horizontalGroupMaxHeight = rect.size[1];
			}

			// move cursor
			this._currentPosition[0] += rect.size[0] + this.margin[0];

			// center control vertically in horizontal group
			if(rect.size[1] < this._horizontalGroupHeights[this._horizontalGroupId])
			{
				rect.position[1] += (this._horizontalGroupHeights[this._horizontalGroupId] - rect.size[1]) * 0.5;
			}
		}
		else
		{
			// move cursor
			this._currentPosition[1] += rect.size[1] + this.margin[1];
			wnd.minimumSize[1] = this._currentPosition[1] + this.margin[1];
		}

		// resize window to fit controls
		if(this._currentPosition[1] >= wnd.size[1] - this.margin[1] && wnd.autoSize)
		{
			wnd.size[1] = this._currentPosition[1] + this.margin[1];
			wnd.minimumSize[1] = this._currentPosition[1] + this.margin[1];
		}

		this._controlId++;
		return rect;
	},

});