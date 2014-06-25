var MeshRenderer = function ()
{
	this.name = "MeshRenderer";
	this.type = "renderer";
	this.material = null;

	this.drawBounds = false;
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

		var material = this.material;
		var program = this.material.program;
		Shader.ActiveProgram(program);

		var index = 0;
		for(var name in material.textures)
		{
			if (!material.textures.hasOwnProperty(name))
			{
				continue;
			}

			if(program[name] == undefined)
			{
				console.log("no uniform sampler2D for texture \"" + name + "\"");
				continue;
			}

			Shader.SetUniformInt(name, index);
			GL.activeTexture(GL.TEXTURE0 + index);
			GL.bindTexture(GL.TEXTURE_2D, material.textures[name]._texture);
			index++;
		}

		GL.bindBuffer(GL.ARRAY_BUFFER, meshProvider.vertexBuffer);
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, meshProvider.indexBuffer);

		if(meshProvider.primitiveType == 'indexedTriangleStrip')
		{
			Renderer.drawIndexedTriangleStrip(meshProvider.indices.length, meshProvider.vertexFormat);
		}
		else if(meshProvider.primitiveType == 'indexedTriangles')
		{
			Renderer.drawIndexedTriangles(meshProvider.indices.length, meshProvider.vertexFormat);	
		}

		if(this.drawBounds)
		{
			var boundsProvider = this.gameObject.getComponent("meshBoundsProvider");
			if(!boundsProvider)
			{
				console.log("MeshRenderer: drawBounds set but no meshBoundsProvider on the gameobject");
				return;
			}

			GL.bindBuffer(GL.ARRAY_BUFFER, boundsProvider.vertexBuffer);
			GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, boundsProvider.indexBuffer);

			Renderer.drawIndexedLines(boundsProvider.indices.length);
		}
	},

});