var SHADER = function() {
    this._ActiveProgram = null;
};

SHADER.extend({
    
});

SHADER.prototype.extend({
    GetSourceFromHTMLElement: function(elementId)
    {
	var element = document.getElementById(elementId);
	return element.innerHTML;
    },
    CreateProgram: function(vertexSource, fragmentSource)
    {
	var program = GL.createProgram();
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

	GL.attachShader(program, vertexShader);
	GL.attachShader(program, fragmentShader);
	GL.linkProgram(program);

	if (!GL.getProgramParameter(program, GL.LINK_STATUS))
	{
	    alert("failed to link program: " + GL.getProgramInfoLog(program));
	}

	var attributesCount = GL.getProgramParameter(program, GL.ACTIVE_ATTRIBUTES);
	for (var i = 0; i < attributesCount; i++)
	{
	    var name = GL.getActiveAttrib(program, i).name;
	    program[name] = GL.getAttribLocation(program, name);
	}

	var uniformsCount = GL.getProgramParameter(program, GL.ACTIVE_UNIFORMS);
	for (var i = 0; i < uniformsCount; i++)
	{
	    var name = GL.getActiveUniform(program, i).name;
	    program[name] = GL.getUniformLocation(program, name);
	}

	return program;
    },
    ActiveProgram: function(program)
    {
	this._ActiveProgram = program;
	GL.useProgram(program);
    },
    SetUniformVec3: function(uniform, vector)
    {
	GL.uniform3fv(this._ActiveProgram[uniform], vector);
    },
    SetUniformMat3: function(uniform, matrix)
    {
	GL.uniformMatrix3fv(this._ActiveProgram[uniform], GL.FALSE, matrix);
    },
    SetUniformMat4: function(uniform, matrix)
    {
	GL.uniformMatrix4fv(this._ActiveProgram[uniform], GL.FALSE, matrix);
    },
    _CreateShader: function(source, type)
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

