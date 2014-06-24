var MeshRenderer = function ()
{
	this.name = "MeshRenderer";
	this.type = "renderer";
	this.material = null;
};

MeshRenderer.prototype = new Component();

MeshRenderer.extend(
{
	
});

MeshRenderer.prototype.extend(
{

	renderSelf: function ()
	{
		if(!this.material)
		{
			return;
		}

		var meshProvider = this.gameObject.getComponent("meshProvider");
		if(!meshProvider)
		{
			return;
		}

		Shader.ActiveProgram(this.material.program);
		this.material.texture.bind();

		GL.bindBuffer(GL.ARRAY_BUFFER, meshProvider.vertexBuffer);
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, meshProvider.indexBuffer);

		if(meshProvider.primitiveType == 'indexedTriangleStrip')
		{
			Renderer.drawIndexedTriangleStrip(meshProvider.indices.length);
		}
		else if(meshProvider.primitiveType == 'indexedTriangles')
		{
			Renderer.drawIndexedTriangles(meshProvider.indices.length);	
		}
	},

});