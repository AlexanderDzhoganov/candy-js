var MeshRenderer = function ()
{
	this.name = "MeshRenderer";
	this.type = "renderer";
	this.material = null;

	this.drawBounds = false;
	this.wireframe = false;
};

MeshRenderer.prototype = new Component();

MeshRenderer.extend(
{
	
});

MeshRenderer.prototype.extend(
{

	onRender: function (worldModelMatrix)
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

		this._setupMaterial();
		Shader.SetUniformMat4("model", worldModelMatrix);

		for(var i = 0; i < meshProvider.submeshes.length; i++)
		{
			if (this.wireframe) 
			{
				this._drawWireframeSubmesh(meshProvider.submeshes[i]);
			}
			else
			{
				this._drawSubmesh(meshProvider.submeshes[i]);
			}
		}

		if(this.drawBounds)
		{
			this._drawBounds();
		}
	},

	_setupMaterial: function ()
	{
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
	},

	_drawSubmesh: function (subMesh)
	{
		GL.bindBuffer(GL.ARRAY_BUFFER, subMesh.vertexBuffer);
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, subMesh.indexBuffer);

		if(subMesh.primitiveType == 'indexedTriangleStrip')
		{
			Renderer.drawIndexedTriangleStrip(subMesh.indices.length, subMesh.vertexFormat);
		}
		else if(subMesh.primitiveType == 'indexedTriangles')
		{
			Renderer.drawIndexedTriangles(subMesh.indices.length, subMesh.vertexFormat);	
		}
	},

	_drawWireframeSubmesh: function(subMesh)
	{
		var indices = subMesh.indices;
		var lineIndices = [];

		for (var i = 0; i < indices.length / 3; i++)
		{
			var v0 = indices[3 * i + 0];
			var v1 = indices[3 * i + 1];
			var v2 = indices[3 * i + 2];

			lineIndices = lineIndices.concat([v0, v1, v1, v2, v2, v0]);
		}

		var lineIndexBuffer = GL.createBuffer();

		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, lineIndexBuffer);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(lineIndices), GL.STREAM_DRAW);

		GL.bindBuffer(GL.ARRAY_BUFFER, subMesh.vertexBuffer);
		
		Renderer.drawIndexedLines(lineIndices.length, "PPPXXXXX");
	},

	_drawBounds: function ()
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
	},

});