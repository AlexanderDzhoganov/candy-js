var ImageLoader = function ()
{

};

ImageLoader.extend(
{
	
});

ImageLoader.prototype.extend(
{

	LoadFromURL : function (url, callback)
	{
		var image = new Image();

		image.onload = function()
		{
			callback(image);
		}

		image.src = url;
	},

	GetPixels : function (img)
	{
		var canvas = document.getElementById("dummy-canvas");
		canvas.width = img.width;
		canvas.height = img.height;
		var context = canvas.getContext('2d');
		context.drawImage(img, 0, 0, img.width, img.height);
		
		return context.getImageData(0, 0, canvas.width, canvas.height).data;
	},

});