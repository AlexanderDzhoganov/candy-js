var Material = function (name)
{
	this.name = name;

	this.program = null;
	this.texture = null;
};

Material.extend(
{
	
});

Material.prototype.extend(
{

	setProgram: function (program)
	{
		this.program = program;
	},

	addTexture: function (texture)
	{
		this.texture = texture;
	},

});