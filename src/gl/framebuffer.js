var Framebuffer = function (width, height)
{
	this._framebuffer = GL.createFramebuffer();
	this._width = width;
	this._height = height;
	this._attachments = [];
};

Framebuffer.extend(
{

});

Framebuffer.prototype.extend(
{

	bind: function ()
	{
		GL.bindFramebuffer(GL.FRAMEBUFFER, this._framebuffer);
	},

	clear: function ()
	{
		GL.clearColor(1, 0, 1, 1);
		GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
	},

	addColorAttachment: function ()
	{
		var texture = GL.createTexture();
		GL.bindTexture(GL.TEXTURE_2D, texture);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
		GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, this._width, this._height, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
		GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, texture, 0);
	},

	addDepthAttachment: function ()
	{
		var depthTexture = GL.createTexture();
		GL.bindTexture(GL.TEXTURE_2D, depthTexture);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
		GL.texImage2D(GL.TEXTURE_2D, 0, GL.DEPTH_COMPONENT, this._width, this._height, 0, GL.DEPTH_COMPONENT, GL.UNSIGNED_SHORT, null);
		GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.TEXTURE_2D, depthTexture, 0);
	},

});