var ImageLoader =
{

	LoadFromURL : function (url)
	{
		var index = this._Loaded.push({ url: 'url', loaded: false, image: null }) - 1;
		var image = new Image();
		
		image.onload = function()
		{
			this._Loaded[index].image = image;
			this._Loaded[index].loaded = true;
		}

		image.src = url;
		return index;
	},

	GetImage : function(index)
	{
		return this._Loaded[index];
	},

	GetPixels : function (index)
	{
		if(!this._Loaded[index].loaded)
		{
			return null;
		}

		var img = this._Loaded[index].image;
		var canvas = document.getElementById("dummy-canvas");
		canvas.width = img.width;
		canvas.height = img.height;
		var context = canvas.getContext('2d');

		context.drawImage(img, 0, 0, img.width, img.height);
		return context.getImageData(0, 0, canvas.width, canvas.height).data;
	},

	_Loaded : [],

};