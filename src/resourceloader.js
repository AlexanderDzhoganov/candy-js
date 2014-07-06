ResourceLoader = function (resources, step, callback)
{
	this.step = typeof(step) === "function" ? step : function () {};
	this.callback = typeof(callback) === "function" ? callback : function () {};

	this.resources = {};

	this.progress = 0;
	this.numElements = 0;

	this.xmlHttp = new XMLHttpRequest();
	this._loadResources( resources );
};

ResourceLoader.extend(
{
	EXT:
	{
		image: ["jpg", "png", "gif"],
		text: ["txt", "vs", "fs", "obj", "obj2"],
		json: ["json"],
		arrayBuffer: ["bin", "obj2b"],
	}
});

ResourceLoader.prototype.extend(
{
	getResource: function (name)
	{
		return this.resources[name];
	},

	getContent: function (name)
	{
		return this.resources[name] ? this.resources[name].content : null;
	},

	getResources: function ()
	{
		return this.resources;
	},

	_loadResources: function (resources)
	{
		var length = resources.size();

		resources.forEach(function (key, res)
		{
	   		var filename = res.split("/");
	   		var ext = res.split(".");

			this.resources[key] = 
			{
				"filename": filename[filename.length - 1],
				"path": res,
				"type": this._getFileType( ext[ext.length - 1] ),
				"content": null
			};
		}.bind(this));

		this.numElements = length;

		this._parseResources();
	},

	_getFileType: function (ext)
	{
		var type = null;

		ResourceLoader.EXT.forEach(function (key, val)
		{
			val.forEach(function (element, index)
			{
				if (element === ext)
				{
					type = key;
				}
			});
		});

		return type;
	},

	_parseResources: function ()
	{
		var elements = [];

		this.resources.forEach(function (k, v)
		{
			elements.push(k);
		});

		this._fetchResources(elements);
	},

	_fetchResources: function (elements)
	{
		var elementKey = elements[0];

		if (elementKey)
		{
			var elementObject = this.resources[elementKey];
			this.resources[elementKey].name = elementKey;

			this.resources[elementKey].toString = function ()
			{
				return this.name;
			};

			this.resources[elementKey].type = elementObject.type;

			if (elementObject.type == "image")
			{
				var img = new Image();

				img.onload = function ()
				{
					elements.shift();

					this.resources[elementKey].content = img;
					this._updateProgress( elementKey );
					this._fetchResources( elements );
				}.bind(this);

				img.src = elementObject.path;
			}
			else if (elementObject.type == "text")
			{
				this.xmlHttp.onreadystatechange = function ()
				{
					if (this.xmlHttp.readyState == 4 && this.xmlHttp.status == 200)
					{
						if(this.xmlHttp.responseType == "arraybuffer")
						{
							this.resources[elementKey].content = this.xmlHttp.response;
						}
						else
						{
							this.resources[elementKey].content = this.xmlHttp.responseText;
						}
						elements.shift();
						this._updateProgress(elementKey);
						this._fetchResources(elements);
					}
				}.bind(this);

				this.xmlHttp.open("GET", elementObject.path, true);
				this.xmlHttp.responseType = '';
				this.xmlHttp.send();
			}
			else if (elementObject.type == "json")
			{
				this.xmlHttp.onreadystatechange = function ()
				{
					if (this.xmlHttp.readyState == 4 && this.xmlHttp.status == 200)
					{
						this.resources[elementKey].content = JSON.parse(this.xmlHttp.responseText);
						elements.shift();
						this._updateProgress( elementKey );
						this._fetchResources( elements );
					}
				}.bind(this);

				this.xmlHttp.open("GET", elementObject.path, true);
				this.xmlHttp.responseType = '';
				this.xmlHttp.send();
			}
			else if (elementObject.type == "arrayBuffer")
			{
				this.xmlHttp.onreadystatechange = function ()
				{
					if (this.xmlHttp.readyState == 4 && this.xmlHttp.status == 200)
					{
						this.resources[elementKey].content = this.xmlHttp.response;	
						elements.shift();
						this._updateProgress( elementKey );
						this._fetchResources( elements );
					}
				}.bind(this);

				this.xmlHttp.open("GET", elementObject.path, true);
				this.xmlHttp.responseType = 'arraybuffer';
				this.xmlHttp.send();
			}
			else
			{
				console.error("Extension not supported for '" + elementObject.path + "'");
				elements.shift();
				this._updateProgress(elementKey, true);
				this._fetchResources(elements);
			}
		}
		else
		{
			this.callback();
		}
	},

	_updateProgress: function (resName, failed)
	{
		this.progress++;

		if (failed)
		{
			console.log("Resource '" + resName + "' not loaded: " + this.progress + "/" + this.numElements);
		}
		else
		{
			console.log("Resource '" + resName + "' loaded: " + this.progress + "/" + this.numElements);
		}

		this.step(resName, this.progress, this.numElements );
	}
});