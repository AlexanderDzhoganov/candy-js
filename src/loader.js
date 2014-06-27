include = function (scripts, onload)
{
	var _include = function (scripts, onload)
	{
		if(scripts.length == 0)
		{
			if(onload)
			{
				onload();
			}
			return;
		}

		var script = scripts.pop();
		Loader.loadScript(script, function ()
		{
			_include(scripts, onload);
		}.bind(this));
	}

	scripts.reverse();
	_include(scripts, onload);
};

Loader = function ()
{
	this.scriptsRoot = 'src/';

	var pathConcat = function (pathA, pathB)
	{
		var sep = '';
		if(pathA[pathA.length - 1] != '/')
		{
			sep = '/';
		}

		return pathA + sep + pathB;
	};

	this.loadScript = function (path, onload)
	{
		if(this._loaded[path])
		{
			onload();
			return;
		}

		var fullPath = pathConcat(this.scriptsRoot, path + ".js");

		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.async = false;
		script.defer = true;
		script.src = fullPath;

		script.onload = function ()
		{
			console.log("included " + fullPath);
			onload();
		}.bind(this);

		script.onerror = function ()
		{
			console.log("failed to load" + fullPath);
			onload();
		}.bind(this);

		document.body.appendChild(script);

		this._loaded[path] = true;
	}

	this._loaded = {};

};

Loader = new Loader();