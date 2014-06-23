var GuiSkin = function ()
{

	this.window =
	{

		backgroundColor: "#001204",

		header:
		{
			hovered: "#FFFFFF",
			normal: ["#E7E7E7", "#C7C7C7", "#E7E7E7"],
		},

		headerText:
		{
			hovered: "grey",
			normal: "black",
		},

		border:
		{
			hovered: "#FFFFFF",
			normal: "#C7C7C7",
		},

		closeButton:
		{
			clicked: "#440000",
			hovered: "#AA0000",
			normal: "#FF0000",
		},

		resizeButton:
		{
			clicked: "#440000",
			hovered: "#AA0000",
			normal: "#FF0000",
		},

	};

	this.horizontalSeparator =
	{

		lineColor:
		{
			normal: "#777777",
		},

		lineWidth: 1,

	};

	this.button =
	{

		background:
		{
			clicked: "#000000",
			hovered: "#777777",
			normal: ["#333333", "#555555", "#333333"],
		},

		border:
		{
			clicked: "#FFFFFF",
			hovered: "#FFFFFF",
			normal: "#FFFFFF",
		},

		borderThickness: 1,

		text:
		{
			clicked: "000000",
			hovered: "white",
			normal: "#CCCCCC",
		},

	};

	this.inputbox =
	{

		background:
		{
			clicked: "#000000",
			hovered: "#111111",
			normal: "#000000",
		},

		border:
		{
			clicked: "#FFFFFF",
			hovered: "#FFFFFF",
			normal: "#FFFFFF",
		},

		borderThickness: 1,

		text:
		{
			clicked: "white",
			hovered: "white",
			normal: "white",
		},

		editLine:
		{
			normal: "#EEEEEE",
		},

	};

	this.image =
	{

		border:
		{
			clicked: "#FFFFFF",
			hovered: "#FFFFFF",
			normal: "#FFFFFF",
		},

		notFoundBackground:
		{
			normal: "#AA0000",
		},
		
	};

	this.checkbox =
	{

		background:
		{
			clicked: "#000000",
			hovered: "#777777",
			normal: "#333333",
		},

		border:
		{
			clicked: "#FFFFFF",
			hovered: "#FFFFFF",
			normal: "#FFFFFF",
		},

		borderThickness: 1,

		checkmark:
		{
			clicked: "#FFFFFF",
			hovered: "#FFFFFF",
			normal: "#AA0000",
		},

	};

	this.listbox =
	{

		background:
		{
			clicked: "#222222",
			hovered: "#222222",
			normal: "#222222",
		},

		border:
		{
			clicked: "#FFFFFF",
			hovered: "#FFFFFF",
			normal: "#FFFFFF",
		},

		borderThickness: 1,

		itemBackground:
		{
			selected: "#E7E7E7",
			hovered: "#444444",
			normal: "#222222",
		},

		itemText:
		{
			selected: "#000000",
			hovered: "#CCCCCC",
			normal: "#CCCCCC",
		},

	};

};