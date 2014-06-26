var expect = function (real, expected)
{
	if(real != expected)
	{
		console.log("failed - expected" + expected.toString() + "but got " + real.toString());
	}
	else
	{
		console.log("Succes! - expected" + expected.toString() + "and got " + real.toString());
	}
};

var UnitTest = function()
{
	this.tests = [];
};

OBJMeshProvider.extend(
{

})

UnitTest.prototype.extend(
{
	addTest: function (test) 
	{
		this.tests.push(test); 
	},

	runTests: function () 
	{ 
		for( var i = 0; i < this.tests.length; i++)
		{
			this.tests[i]();
		}
	},
})