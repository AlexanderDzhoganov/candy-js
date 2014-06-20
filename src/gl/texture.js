var Texture =
{

	CreateFromURL : function (url, callback)
	{
		var texture = GL.createTexture();
		var image = new Image();
		
		image.onload = function()
		{
			GL.bindTexture(GL.TEXTURE_2D, texture);
			GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
			GL.generateMipmap(GL.TEXTURE_2D);
			GL.bindTexture(GL.TEXTURE_2D, null);
			callback();
		}

		image.src = url;
		return texture;
	}


};

