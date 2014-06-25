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

	getWireframeProgram: function ()
	{
		if (MeshRenderer._wireframeProgram == null)
		{
			MeshRenderer._wireframeProgram = new Shader 
			(
				ResourceLoader.getContent("wireframe_vertex"),
				ResourceLoader.getContent("wireframe_fragment")
			);
		}

		return MeshRenderer._wireframeProgram;
	},	

	_wireframeProgram: null,

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

		if(this.wireframe)
		{
			for(var i = 0; i < meshProvider.submeshes.length; i++)
			{
				Shader.setActiveProgram(MeshRenderer.getWireframeProgram());
				Shader.setUniformVec3("wireframeColor", vec3.fromValues(0, 0.2, 1));
				Shader.setUniformMat4("model", worldModelMatrix);

				this._drawWireframeSubmesh(meshProvider.submeshes[i]);
			}
		}
		else
		{
			for(var i = 0; i < meshProvider.submeshes.length; i++)
			{
				this._setupMaterial();
				Shader.setUniformMat4("model", worldModelMatrix);
				this._drawSubmesh(meshProvider.submeshes[i]);
			}
		}

		if(this.drawBounds)
		{
			this._drawBounds(worldModelMatrix);
		}
	},

	createConfigWindow: function ()
	{
		var wnd = new GuiWindow(vec2.fromValues(0.0, 0.0), vec2.fromValues(400.0, 0.0), new GuiLayout(), new GuiSkin());
		wnd.autoSize = true;
		wnd.title = this.name;

		wnd.drawSelf = function (gui)
		{
			gui.beginHorizontalGroup();
			gui.label("Wireframe");
			this.wireframe = gui.checkbox(this.wireframe);
			gui.endHorizontalGroup();
		}.bind(this);

		return wnd;
	},

	_setupMaterial: function ()
	{
		var material = this.material;
		var program = this.material.program;

		Shader.setActiveProgram(program);

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

			Shader.setUniformInt(name, index);
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

	_drawBounds: function (worldModelMatrix)
	{
		var boundsProvider = this.gameObject.getComponent("meshBoundsProvider");
		if(!boundsProvider)
		{
			console.log("MeshRenderer: drawBounds set but no meshBoundsProvider on the gameobject");
			return;
		}

		Shader.setActiveProgram(MeshRenderer.getWireframeProgram());
		Shader.setUniformVec3("wireframeColor", vec3.fromValues(0, 1, 0));
		Shader.setUniformMat4("model", worldModelMatrix);

		GL.bindBuffer(GL.ARRAY_BUFFER, boundsProvider.vertexBuffer);
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, boundsProvider.indexBuffer);

		GL.disable(GL.DEPTH_TEST);

		Renderer.drawIndexedLines(boundsProvider.indices.length);

		GL.enable(GL.DEPTH_TEST);
	},

});