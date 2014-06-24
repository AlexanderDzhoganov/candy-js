var Material = function (vertexSource, fragmentSource, textureName)
{
	var vertexSource = vertexSource;//
	fragmentSource = fragmentSource; //Shader.GetSourceFromHTMLElement("fragment-shader");
	this.program = Shader.CreateProgram(vertexSource, fragmentSource);
	this.texture = new Texture(textureName);
};

Material.extend(
{
	
});

Material.prototype.extend(
{

});