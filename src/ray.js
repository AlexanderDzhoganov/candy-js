var Ray = function (origin, direction)
{
	this.origin = origin;
	this.direction = direction;
};

Ray.extend(
{
	
});

Ray.prototype.extend(
{

	transform: function (matrix)
	{
		return new Ray();
	}

});