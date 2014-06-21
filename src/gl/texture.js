var Texture = function( name )
{
	var image = ResourceLoader.getContent(name);

	if( !image ) {
		console.error("No resource found with the name '" + name + "'");
		return;
	}

	this._texture = GL.createTexture();

	GL.bindTexture(GL.TEXTURE_2D, this._texture);
	GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image );
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
	GL.generateMipmap(GL.TEXTURE_2D);
	GL.bindTexture(GL.TEXTURE_2D, null);

	return this._texture;
};

Texture.extend(
{
	
});

Texture.prototype.extend(
{
});