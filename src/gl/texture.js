Texture = function (name)
{
	var image = ResourceLoader.getContent(name);

	if (!image)
	{
		console.error("No resource found with the name '" + name + "'");
		return;
	}

	this._texture = GL.createTexture();
	GL.bindTexture(GL.TEXTURE_2D, this._texture);
	GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);

	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE); 
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

	GL.generateMipmap(GL.TEXTURE_2D);
	GL.bindTexture(GL.TEXTURE_2D, null);
};

Texture.extend(
{
	
	WRAP_REPEAT: 0,
	WRAP_CLAMP_TO_EDGE: 1,

});

Texture.prototype.extend(
{

	dispose: function ()
	{
		GL.deleteTexture(this._texture);
	},

	setWrap: function (wrapMode)
	{
		GL.bindTexture(GL.TEXTURE_2D, this._texture);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, wrapMode == this.WRAP_REPEAT ? GL.REPEAT : GL.CLAMP_TO_EDGE); 
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, wrapMode == this.WRAP_REPEAT ? GL.REPEAT : GL.CLAMP_TO_EDGE);
		GL.bindTexture(GL.TEXTURE_2D, null);
	},

});