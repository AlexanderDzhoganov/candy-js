var MATERIAL = function( name ) {
    this._Name = name;
    this._Program = null;
    this._Textures = [];
};

MATERIAL.extend({
    
});

MATERIAL.prototype.extend({
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