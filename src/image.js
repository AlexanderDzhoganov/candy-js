var ImageLoader = 
{

    GetPixels : function (img)
    {
		var canvas = document.getElementById("dummy-canvas");
		canvas.width = img.width;
		canvas.height = img.height;
		var context = canvas.getContext('2d');
		context.drawImage(img, 0, 0, img.width, img.height);
		
		return context.getImageData(0, 0, canvas.width, canvas.height).data;
    },

};
