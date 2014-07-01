Shader = function (vertexSource, fragmentSource)
{
	if (vertexSource == undefined || fragmentSource == undefined)
	{
		debugger;
	}

	this._program = GL.createProgram();
	var vertexShader = this._CreateShader(vertexSource, GL.VERTEX_SHADER);
	if (!vertexShader)
	{
		return null;
	}

	var fragmentShader = this._CreateShader(fragmentSource, GL.FRAGMENT_SHADER);
	if (!fragmentShader)
	{
		return null;
	}

	GL.attachShader(this._program, vertexShader);
	GL.attachShader(this._program, fragmentShader);
	GL.linkProgram(this._program);

	GL.deleteShader(vertexShader);
	GL.deleteShader(fragmentShader);

	if (!GL.getProgramParameter(this._program, GL.LINK_STATUS))
	{
		alert("failed to link program: " + GL.getProgramInfoLog(this._program));
	}

	var attributesCount = GL.getProgramParameter(this._program, GL.ACTIVE_ATTRIBUTES);
	for (var i = 0; i < attributesCount; i++)
	{
		var name = GL.getActiveAttrib(this._program, i).name;
		this[name] = GL.getAttribLocation(this._program, name);
	}

	var uniformsCount = GL.getProgramParameter(this._program, GL.ACTIVE_UNIFORMS);
	for (var i = 0; i < uniformsCount; i++)
	{
		var uniform = GL.getActiveUniform(this._program, i);
		this[uniform.name] = GL.getUniformLocation(this._program, uniform.name);
	}
};

Shader.extend(
{
	
	setActiveProgram: function (program)
	{
		Shader._ActiveProgram = program;
		GL.useProgram(program._program);
	},

	setUniformInt: function (uniform, value)
	{
		GL.uniform1i(Shader._ActiveProgram[uniform], value);
	},

	setUniformVec2: function (uniform, vector)
	{
		GL.uniform2fv(Shader._ActiveProgram[uniform], vector);
	},

	setUniformVec3: function (uniform, vector)
	{
		GL.uniform3fv(Shader._ActiveProgram[uniform], vector);
	},

	setUniformMat3: function (uniform, matrix)
	{
		GL.uniformMatrix3fv(Shader._ActiveProgram[uniform], GL.FALSE, matrix);
	},

	setUniformMat4: function (uniform, matrix, transpose)
	{
		if(transpose == undefined)
		{
			transpose = false;
		}

		GL.uniformMatrix4fv(Shader._ActiveProgram[uniform], transpose ? GL.TRUE : GL.FALSE, matrix);
	},
	
	_ActiveProgram: null,

});

Shader.prototype.extend(
{

	_CreateShader: function (source, type)
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
	}
	
});

