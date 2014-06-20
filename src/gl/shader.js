// Shader related functions

var Shader =
{

	GetSourceFromHTMLElement : function (elementId)
	{
		var element = document.getElementById(elementId);
		return element.innerHTML;
	},

	CreateProgram : function (vertexSource, fragmentSource)
	{
		var program = GL.createProgram();
		var vertexShader = this._CreateShader(vertexSource, GL.VERTEX_SHADER);
		if(!vertexShader)
		{
			return null;
		}

		var fragmentShader = this._CreateShader(fragmentSource, GL.FRAGMENT_SHADER);
		if(!fragmentShader)
		{
			return null;
		}

		GL.attachShader(program, vertexShader);
		GL.attachShader(program, fragmentShader);
		GL.linkProgram(program);

		if (!GL.getProgramParameter(program, GL.LINK_STATUS))
		{
			alert("failed to link program: " + GL.getProgramInfoLog(program));
		}

		return program;
	},

	ActiveProgram : function(program)
	{
		this._ActiveProgram = program;
		GL.useProgram(program);
	},

	SetUniformVec3 : function (uniform, vector)
	{
		var index = GL.getUniformLocation(this._ActiveProgram, uniform);
		GL.uniform3fv(index, vector);
	},

	SetUniformMat3 : function (uniform, matrix)
	{
		var index = GL.getUniformLocation(this._ActiveProgram, uniform);
		GL.uniformMatrix3fv(index, GL.FALSE, matrix);
	},

	SetUniformMat4 : function (uniform, matrix)
	{
		var index = GL.getUniformLocation(this._ActiveProgram, uniform);
		GL.uniformMatrix4fv(index, GL.FALSE, matrix);
	},

	_CreateShader : function (source, type)
	{
		var shader = GL.createShader(type);
		GL.shaderSource(shader, source);
		GL.compileShader(shader);

		if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS))
		{
			alert("shader failed to compile: " + GL.getShaderInfoLog(shader));
			return null;
		}

		return shader;
	},

	_ActiveProgram : null,

}

