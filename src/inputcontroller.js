var InputController = function()
{
	this.disableExternalKeyEvents = false;

	this.listeners = {"down": {}, "up": {}};

	this.listenersOnce = {"down": {},"up": {}};

	window.addEventListener("keydown", function(e)
	{
		var keyCode = e.keyCode;

		console.log(keyCode);

		if (this.disableExternalKeyEvents) {
			e.preventDefault();
		}

		if (this.listeners.down[keyCode])
		{
			this.listeners.down[keyCode].forEach(function(func) {
				func();
			});
		}

		if (this.listenersOnce.down[keyCode])
		{
			this.listenersOnce.down[keyCode].forEach(function(func)
			{
				func();
			});

			this.listenersOnce.down[keyCode] = [];
		}
	}.bind(this), true);

	window.addEventListener("keyup", function (e)
	{
		var keyCode = e.keyCode;

		if (this.disableExternalKeyEvents)
		{
			e.preventDefault();
		}

		if (this.listeners.up[keyCode])
		{
			this.listeners.up[keyCode].forEach(function(func)
			{
				func();
			});
		}

		if(this.listenersOnce.up[keyCode])
		{
			this.listenersOnce.up[keyCode].forEach(function(func)
			{
				func();
			});

			this.listenersOnce.up[keyCode] = [];
		}
	}.bind(this), true);

	this.modes =
	{
		DOWN: "down",
		UP: "up"
	};

	this.keys =
	{
		BACKSPACE: 8,
		TAB: 9,
		ENTER: 13,
		SHIFT: 16,
		CTRL: 17,
		ALT: 18,
		CAPSLOCK: 20,
		ESCAPE: 27,
		PAGEUP: 33,
		PAGEDOWN: 34,
		END: 35,
		HOME: 36,
		LEFTARROW: 37,
		UPARROW: 38,
		RIGHTARROW: 39,
		DOWNARROW: 40,
		INSERT: 45,
		DELETE: 46,
		ZERO: 48,
		ONE: 49,
		TWO: 50,
		THREE: 51,
		FOUR: 52,
		FIVE: 53,
		SIX: 54,
		SEVEN: 55,
		EIGHT: 56,
		NINE: 57,
		A: 65,
		B: 66,
		C: 67,
		D: 68,
		E: 69,
		F: 70,
		G: 71,
		H: 72,
		I: 73,
		J: 74,
		K: 75,
		L: 76,
		M: 77,
		N: 78,
		O: 79,
		P: 80,
		Q: 81,
		R: 82,
		S: 83,
		T: 84,
		U: 85,
		V: 86,
		W: 87,
		X: 88,
		Y: 89,
		Z: 90,
		NUM_0: 96,
		NUM_1: 97,
		NUM_2: 98,
		NUM_3: 99,
		NUM_4: 100,
		NUM_5: 101,
		NUM_6: 102,
		NUM_7: 103,
		NUM_8: 104,
		NUM_9: 105,
		NUM_MULTIPLY: 106,
		NUM_ADD: 107,
		NUM_SUBSTRACT: 109,
		NUM_DECIMAL: 110,
		NUM_DIVIDE: 111,
		F1: 112,
		F2: 113,
		F3: 114,
		F4: 115,
		F5: 116,
		F6: 117,
		F7: 118,
		F8: 119,
		F9: 120,
		F10: 121,
		F11: 122,
		F12: 123
	};
};

InputController.extend(
{	
});

InputController.prototype.extend(
{
	add: function(key, mode, listenerFunc)
	{
		if(!key)
		{
			console.error("Invalid key");
			return;
		}

		if(typeof listenerFunc != "function")
		{
			console.error("Listener is not a function");
			return;
		}

		if(mode === "down" || mode === "up")
		{
			if(!this.listeners[mode][key])
			{
				this.listeners[mode][key] = [listenerFunc];
			}
			else
			{
				this.listeners[mode][key].push(listenerFunc);
			}
		}
		else
		{
			console.error("No such key event mode: " + mode);
		}
	},

	once: function(key, mode, listenerFunc)
	{
		if(!key)
		{
			console.error("Invalid key");
			return;
		}

		if(typeof listenerFunc != "function")
		{
			console.error("Listener is not a function");
			return;
		}

		if(mode === "down" || mode === "up")
		{
			if(!this.listenersOnce[mode][key])
			{
				this.listenersOnce[mode][key] = [listenerFunc];
			}
			else
			{
				this.listenersOnce[mode][key].push(listenerFunc);
			}
		}
		else 
		{
			console.error("No such key event mode: " + mode);
		}
	},

	remove: function(key, mode, listenerFunc)
	{
		if(!key)
		{
			console.error("Invalid key");
			return;
		}

		if(typeof listenerFunc != "function")
		{
			console.error("Listener is not a function");
			return;
		}

		if(this.listeners[mode][key])
		{
			this.listeners[mode][key].forEach(function(func, ind)
			{
				if(func.toString() == listenerFunc.toString())
				{
					this.listeners[mode][key].splice( ind, 1 );
				}
			}.bind(this));
		}

		if(this.listenersOnce[mode][key])
		{
			this.listenersOnce[mode][key].forEach(function(func, ind)
			{
				if(func.toString() == listenerFunc.toString())
				{
					this.listenersOnce[mode][key].splice( ind, 1 );
				}
			}.bind(this));
		}
	}
});