var GuiInput = function ()
{
	this._mousePosition = vec2.create();
	this._cursor = new GuiCursor("cursor");
	this._mouseDown = false;
	this._mouseUp = false;
	this._keyBuffer = "";
	this._keyBufferMaxLength = 4096;
	this._caretIndex = 0;
	this._caretLineIndex = 0;
	this._enterDown = false;

	document.body.onclick = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;

	document.onmousedown = function ()
	{
		this._mouseDown = true;
		this._mouseUp = false;
	}.bind(this);

	document.onmouseup = function ()
	{
		this._mouseDown = false;
		this._mouseUp = true;
	}.bind(this);

	InputController.add(InputController.keys.BACKSPACE, InputController.modes.DOWN, function(key)
	{
	 	this._injectBackspace();
	}.bind(this));

	InputController.add(InputController.keys.ENTER, InputController.modes.DOWN, function(key)
	{
	 	this._injectEnter();
	 	this._enterDown = true;
	}.bind(this));

	InputController.add(InputController.keys.LEFTARROW, InputController.modes.DOWN, function(key)
	{
	 	this._injectLeft();
	}.bind(this));

	InputController.add(InputController.keys.RIGHTARROW, InputController.modes.DOWN, function(key)
	{
	 	this._injectRight();
	}.bind(this));

	InputController.add(InputController.keys.UPARROW, InputController.modes.DOWN, function(key)
	{
	 	this._injectUp();
	}.bind(this));

	InputController.add(InputController.keys.DOWNARROW, InputController.modes.DOWN, function(key)
	{
	 	this._injectDown();
	}.bind(this));

	InputController.addGlobal( InputController.modes.DOWN, function( key ) {

		this._injectChar(key);
	}.bind(this));

/*	window.addEventListener("keydown", function(e)
	{
		if (e.keyCode == 8)
		{
			e.preventDefault();
		}
		else if (e.keyCode == 13) // enter
		{
			e.preventDefault();
		}
	});

	window.addEventListener("keyup", function(e)
	{		
		if (e.keyCode == 8) // backspace
		{
			this._injectBackspace();
			e.preventDefault();
		}
		else if (e.keyCode == 13) // enter
		{
			this._injectenter();
			e.preventDefault();
		}
		else if (e.keyCode == 37) // left
		{
			this._injectLeft();
		}
		else if (e.keyCode == 39) // right
		{
			this._injectRight();
		}
		else if (e.keyCode == 38) // up
		{
			this._injectUp();
		}
		else if (e.keyCode == 40) // down
		{
			this._injectDown();
		}
		else
		{
			this._injectChar(e);
		}
	}.bind(this));*/
};

GuiInput.extend(
{
	
});

GuiInput.prototype.extend(
{
	// public

	setKeyBuffer: function (buffer, maxLength)
	{
		if(maxLength != undefined)
		{
			this._keyBufferMaxLength = maxLength;
		}

		this._keyBuffer = buffer;
	},

	getKeyBuffer: function ()
	{
		return this._keyBuffer;
	},

	getCursorPosition: function ()
	{
		return vec2.fromValues(this._cursor.position[0], Renderer.screenHeight - this._cursor.position[1] - this._cursor.size[1] * 0.5);
	},

	getCaret: function ()
	{
		return [ this._caretIndex, this._caretLineIndex ];
	},

	getCaretIndex: function ()
	{
		return this._caretIndex;
	},

	getCaretLineIndex: function ()
	{
		return this._caretLineIndex;
	},

	setCaret: function (caret)
	{
		this._caretIndex = caret[0];
		this._caretLineIndex = caret[1];
	},

	setCaretIndex: function (index)
	{
		this._caretIndex = index;
	},

	setCaretLineIndex: function (lineIndex)
	{
		this._caretLineIndex = lineIndex;
	},

	// private

	_injectBackspace: function ()
	{
		if(this._keyBuffer.indexOf('\n') != -1)
		{
			var lines = this._keyBuffer.split('\n');
			var line = lines[this._caretLineIndex];
			line = line.slice(0, this._caretIndex - 1) + line.slice(this._caretIndex, line.length);
			lines[this._caretLineIndex] = line;

			this._keyBuffer = "";
			for(var i = 0; i < lines.length; i++)
			{
				this._keyBuffer += lines[i] + '\n';
			}

			if(this._keyBuffer.length > 0)
			{
				this._caretIndex--;
			}
		}
		else
		{
			this._keyBuffer = this._keyBuffer.slice(0, this._caretIndex - 1) + this._keyBuffer.slice(this._caretIndex, this._keyBuffer.length);
			console.log(this._keyBuffer);
			if(this._keyBuffer.length > 0)
			{
				this._caretIndex--;
			}
		}
	},

	_injectEnter: function ()
	{
		if(this._keyBuffer.indexOf('\n') != -1)
		{
			var lines = this._keyBuffer.split('\n');
			var line = lines[this._caretLineIndex];
			line = line.slice(0, this._caretIndex) + '\n' + line.slice(this._caretIndex, line.length);
			lines[this._caretLineIndex] = line;
			this._caretLineIndex++;
			this._caretIndex = 0;

			this._keyBuffer = "";
			for(var i = 0; i < lines.length; i++)
			{
				this._keyBuffer += lines[i] + '\n';
			}
		}
		else
		{
			this._activeControlPosition = vec2.fromValues(0.0, 0.0);
			this._activeControlSize = vec2.fromValues(0.0, 0.0);
		}
	},

	_injectUp: function ()
	{
		if(this._keyBuffer.indexOf('\n') == -1)
		{
			return;
		}

		this._caretLineIndex--;
		if(this._caretLineIndex < 0)
		{
			this._caretLineIndex = 0;
		}
	},

	_injectDown: function ()
	{
		if(this._keyBuffer.indexOf('\n') == -1)
		{
			return;
		}

		this._caretLineIndex++;

		var numNewLines = this._keyBuffer.match(/\n/g).length;
		if(this._caretLineIndex > numNewLines)
		{
			this._caretLineIndex = numNewLines;
		}
	},

	_injectLeft: function ()
	{
		if(this._keyBuffer.indexOf('\n') != -1)
		{
			this._caretIndex--;
			if(this._caretIndex < 0)
			{
				var lines = this._keyBuffer.split('\n');
				if(this._caretLineIndex > 0)
				{
					this._caretIndex = lines[this._caretLineIndex].length + 1;
					this._caretLineIndex--;
				}
			}
		}
		else
		{
			this._caretIndex--;

			if(this._caretIndex < 0)
			{
				this._caretIndex = 0;
			}
		}			
	},

	_injectRight: function ()
	{
		if(this._keyBuffer.indexOf('\n') != -1)
		{
			this._caretIndex++;
			var lines = this._keyBuffer.split('\n');

			if(this._caretIndex > lines[this._caretLineIndex].length)
			{
				this._caretIndex = lines[this._caretLineIndex].length;

				if(this._caretLineIndex < lines.length)
				{
					this._caretLineIndex++;
					this._caretIndex = 0;
				}
			}
		}
		else
		{
			this._caretIndex++;
		}
	},

	_injectChar: function (e)
	{
		if(this._keyBuffer.length >= this._keyBufferMaxLength)
		{
			return;
		}

		if(this._keyBuffer.indexOf('\n') != -1)
		{
			var lines = this._keyBuffer.split('\n');
			var line = lines[this._caretLineIndex];
			line = line.slice(0, this._caretIndex) + e + line.slice(this._caretIndex, line.length);
			lines[this._caretLineIndex] = line;

			this._keyBuffer = "";
			for(var i = 0; i < lines.length; i++)
			{
				this._keyBuffer += lines[i] + '\n';
			}

			this._caretIndex++;
		}
		else
		{
			this._keyBuffer = this._keyBuffer.slice(0, this._caretIndex) + e + this._keyBuffer.slice(this._caretIndex, this._keyBuffer.length);
			this._caretIndex++;
		}
	},

});