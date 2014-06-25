var Material = function (name)
{
	this.name = name;

	this.program = null;
	this.textures = {};
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

	addTexture: function (name, texture)
	{
		this.textures[name] = texture;
	},

});