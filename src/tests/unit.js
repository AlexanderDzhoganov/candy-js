expect = function (real, expected)
{
	if(real != expected)
	{
		console.log("Failed! - expected " + expected.toString() + " but got " + real.toString());
	}
	else
	{
		//console.log("Success! - expected " + expected.toString() + " and got " + real.toString());
	}
};

UnitTest = function()
{
	this.tests = [];
};

UnitTest.extend(
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
			this.tests[i].run();
		}
	},

})