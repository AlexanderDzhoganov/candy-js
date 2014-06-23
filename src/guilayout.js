var GuiLayout = function ()
{
	this.fontFamily = "Verdana";
	this.fontSize = 12;

	this.margin = vec2.fromValues(8.0, 8.0);
	this.windowTopMargin = 8.0;
	this.windowHeaderSize = 20.0;
	this.windowCloseButtonSize = vec2.fromValues(12.0, 8.0);

	this._windowPosition = vec2.fromValues(0.0, 0.0);
	this._windowSize = vec2.fromValues(0.0, 0.0);

	this._currentPosition = vec2.fromValues(0.0, 0.0);

	this._horizontal = false;
	this._horizontalLargestHeight = 0;

	this._controlSizes = [];
	this._controlId = 0;
	this._horizontalGroupHeights = [];
	this._inHorizontalGroup = false;
	this._horizontalGroupMaxHeight = 0.0;
	this._prepareLayout = false;
};

GuiLayout.extend(
{

});

GuiLayout.prototype.extend(
{
	beginPrepareLayout: function ()
	{
		this._controlId = 0;
		this._controlSizes = [];
		this._horizontalGroupHeights = [];
		this._inHorizontalGroup = false;
		this._horizontalGroupMaxHeight = 0.0;
		this._prepareLayout = true;
	},

	endPrepareLayout: function ()
	{
		this._prepareLayout = false;
	},

	beginLayout: function (wnd)
	{
		this._controlId = 0;
		this._windowPosition = wnd.position;
		this._windowSize = wnd.size;
		this._currentPosition = vec2.fromValues(this.margin[0], this.windowTopMargin + this.windowHeaderSize);
		this._horizontalGroupId = 0;
	},

	endLayout: function (wnd)
	{
		if(wnd.autoSize)
		{
			wnd.size = this.getAutoSizeWindowSize();
		}
	},

	beginHorizontalGroup: function ()
	{
		this._horizontal = true;
		this._horizontalGroupMaxHeight = 0.0;
	},

	endHorizontalGroup: function ()
	{
		this._currentPosition[0] = this.margin[0];
		this._currentPosition[1] += this._horizontalLargestHeight + this.margin[1];
		
		if(this._currentPosition[1] >= this._windowSize[1] - this.margin[1])
		{
			this._windowSize[1] = this._currentPosition[1] + this.margin[1];
		}

		this._horizontalLargestHeight = 0;
		this._horizontal = false;

		this._horizontalGroupHeights.push(this._horizontalGroupMaxHeight);
		this._horizontalGroupId++;
	},

	prepareControl: function (controlSize)
	{
		if(this._prepareLayout)
		{
			this._controlSizes.push(controlSize);
			this._addToHorizontalGroup(controlSize[1]);
			this._controlId++;
		}
	},

	beginControl: function ()
	{
		var controlSize = this._controlSizes[this._controlId];

		var rect =
		{
			position: vec2.create(),
			size: this._controlSizes[this._controlId],
		};

		vec2.add(rect.position, this._windowPosition, this._currentPosition);

		if(rect.size[0] > this._windowSize[0] - this.margin[0])
		{
			rect.size[0] = this._windowSize[0] - this.margin[0] * 2.0;
		}

		if(this._horizontal)
		{
			if(rect.size[1] > this._horizontalLargestHeight)
			{
				this._horizontalLargestHeight = rect.size[1];
			}

			if(this._currentPosition[0] + rect.size[0] >= this._windowSize[0] - this.margin[0])
			{
				this._currentPosition[1] += this._horizontalLargestHeight + this.margin[1];
				this._currentPosition[0] = this.margin[0];

				vec2.add(rect.position, this._windowPosition, this._currentPosition);
			}

			this._currentPosition[0] += rect.size[0] + this.margin[0];

			if(rect.size[1] < this._horizontalGroupHeights[this._horizontalGroupId])
			{
				rect.position[1] += (this._horizontalGroupHeights[this._horizontalGroupId] - rect.size[1]) * 0.5;
			}
		}
		else
		{
			this._currentPosition[1] += rect.size[1] + this.margin[1];
		}

		if(this._currentPosition[1] >= this._windowSize[1] - this.margin[1])
		{
			this._windowSize[1] = this._currentPosition[1] + this.margin[1];
		}

		this._controlId++;

		return rect;
	},

	endControl: function ()
	{
		this.controlId++;
	},

	getAutoSizeWindowSize: function ()
	{
		return this._windowSize;
	},

	_addToHorizontalGroup: function (controlHeight)
	{
		if(this.inHorizontalGroup)
		{
			if(controlHeight > this.horizontalGroupMaxHeight)
			{
				this.horizontalGroupMaxHeight = controlHeight;
			}
		}
	}

});