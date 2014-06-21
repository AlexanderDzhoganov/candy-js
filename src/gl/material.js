var Material = function(name)
{
    this._Name = name;
    this._Program = null;
    this._Textures = [];
};

Material.extend(
{
    
});

Material.prototype.extend(
{

    getName: function()
    {
	    return this._Name;
    },

    getProgram: function()
    {
	    return this._Program;
    },

    getTextures: function()
    {
	    return this._Textures;
    }
    
});