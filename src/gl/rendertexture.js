var RenderTexture = function (width, height, depth)
{
	this._framebuffer = new Framebuffer(width, height);
	this._framebuffer.bind();
	
	this._framebuffer.addColorAttachment();

	if(depth)
	{
		this._framebuffer.addDepthAttachment();
	}
};

RenderTexture.extend(
{

	activeRT: null,

	setActive: function (renderTexture)
	{
		renderTexture.setActive();
		RenderTexture.activeRT = renderTexture;
	},

});

RenderTexture.prototype.extend(
{

	setActive: function ()
	{
		this._framebuffer.bind();
	},

	getColorTexture: function ()
	{
		return this._framebuffer._attachments[0];
	},

	getDepthTexture: function ()
	{
		return this._framebuffer._attachments[1];
	},

	getSize: function ()
	{
		return [ this._framebuffer._width, this._framebuffer._height ];
	},

});
