var Material =
{

	Create : function(name)
	{
		return {

			getName: function()
			{
				return _Name;
			},

			getProgram: function()
			{
				return _Program;
			},

			getTextures: function()
			{
				return _Textures;
			},

			_Name: name,
			_Program: null,
			_Textures: [],

		};
	},

};