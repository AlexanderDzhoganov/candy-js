var InputController = function()
{
	this.disableExternalKeyEvents = true;

	this.listeners = {"keydown": {}, "keyup": {}};

	this.listenersOnce = {"keydown": {},"keyup": {}};

	this.allListeners = {"keydown": [], "keyup": []};

	this.listenersCombo = [];

	this.keyPressStack = [];

	window.addEventListener("keydown", this._keyAction.bind(this), true);

	window.addEventListener("keyup", this._keyAction.bind(this), true);

	this.modes = {DOWN: "keydown", UP: "keyup"};

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
		F12: 123,
		LEFTBRACKET: 219,
		RIGHTBRACKET: 221,
		SEMICOLON: 186,
		QUOTES: 222,
		BACKSLASH: 220,
		COMMA: 188,
		DOT: 190,
		SLASH: 191,
		ACCENT: 192,
		MINUS: 189,
		EQUAL: 187
	};

	this.normalKeys = [];
    this.normalKeys[192] = "`";
    this.normalKeys[189] = "-";
    this.normalKeys[187] = "=";
    this.normalKeys[219] = "[";
    this.normalKeys[221] = "]";
    this.normalKeys[220] = "\\";
    this.normalKeys[186] = ";";
    this.normalKeys[222] = "'";
    this.normalKeys[188] = ",";
    this.normalKeys[190] = ".";
    this.normalKeys[191] = "/";

	this.shiftKeys = [];
    this.shiftKeys[192] = "~";
    this.shiftKeys[49] = "!";
    this.shiftKeys[50] = "@";
    this.shiftKeys[51] = "#";
    this.shiftKeys[52] = "$";
    this.shiftKeys[53] = "%";
    this.shiftKeys[54] = "^";
    this.shiftKeys[55] = "&";
    this.shiftKeys[56] = "*";
    this.shiftKeys[57] = "(";
    this.shiftKeys[48] = ")";
    this.shiftKeys[189] = "_";
    this.shiftKeys[187] = "+";
    this.shiftKeys[219] = "{";
    this.shiftKeys[221] = "}";
    this.shiftKeys[220] = "|";
    this.shiftKeys[186] = ":";
    this.shiftKeys[222] = "\"";
    this.shiftKeys[188] = "<";
    this.shiftKeys[190] = ">";
    this.shiftKeys[191] = "?";
    this.shiftKeys[32] = " ";
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

		if(mode === "keydown" || mode === "keyup")
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

	addCombo: function( keys, listenerFunc ) {
		this.listenersCombo.push({
			"listener": listenerFunc,
			"key1": keys[0],
			"key2": keys[1],
			"key3": keys[2]
		});
	},

	removeCombo: function( listenerFunc ) {
		for( var i = 0; i < this.listenersCombo.length; i++ ) {
			if( this.listenersCombo[i].listener.toString() == listenerFunc.toString()) {
				this.listenersCombo.splice(i, 1);
			}
		}
	},

	addGlobal: function( mode, listenerFunc ) {
		if(mode === "keydown" || mode === "keyup")
		{
			this.allListeners[mode].push(listenerFunc);
		}
		else
		{
			console.error("No such key event mode: " + mode);
		}
	},

	removeGlobal: function( listenerFunc, mode ) {
		this.allListeners[mode].forEach(function(func, ind)
		{
			if(func.toString() == listenerFunc.toString())
			{
				this.allListeners[mode].splice( ind, 1 );
			}
		}.bind(this));
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

		if(mode === "keydown" || mode === "keyup")
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
	},

	// _getCharFromCode: function( code ) {
	// 	var keyCode = null;

	// 	this.keys.forEach(function( key, val ) {
	// 		if( val === code ) keyCode = key;
	// 	});

	// 	return keyCode;
	// },

	_keyAction: function( e ) {
		var keyCode = e.keyCode,
			addToStack = true,
			returnKey;

		if (this.disableExternalKeyEvents) {
			e.preventDefault();
		}

		if( e.type == "keydown" ) {
			for( var i = 0; i < this.keyPressStack.length; i++ ) {
				if( this.keyPressStack[i] == keyCode ) {
					addToStack = false;
				}
			}

			if( addToStack ) {
				this.keyPressStack.push(keyCode);
			}

			if( this.keyPressStack.length >= 2 ) {
				for( var i = 0; i < this.listenersCombo.length; i++ ) {
					if( this.listenersCombo[i].key1 == this.keyPressStack[0] && this.listenersCombo[i].key2 == this.keyPressStack[1] ) {
						if( this.listenersCombo[i].key3 ) {
							if( this.keyPressStack.length >= 3 && this.listenersCombo[i].key3 == this.keyPressStack[2] ) {
								this.listenersCombo[i].listener();
								return;
							}
						} else {
							this.listenersCombo[i].listener();
							return;
						}
					}
				}
			}
		}

		if( e.shiftKey ) {
	        if ( keyCode >= 65 && keyCode <= 90 ) {
	            returnKey = String.fromCharCode(keyCode);
	        } else {
	            returnKey = this.shiftKeys[keyCode];
	        }
	    } else {
	        if ( keyCode >= 65 && keyCode <= 90 ) {
	            returnKey = String.fromCharCode(keyCode).toLowerCase();
	        } else {
	        	if( this.normalKeys[keyCode] ) {
	        		returnKey = this.normalKeys[keyCode];
            	} else {
            		returnKey = String.fromCharCode(keyCode);
            	}

	        }
	    }

	    if( ( keyCode >= 65 && keyCode <= 90 ) || this.shiftKeys[keyCode] ) {
			this.allListeners[e.type].forEach(function(func) {
				func( returnKey );
			});
		}

		if (this.listeners[e.type][keyCode])
		{
			this.listeners[e.type][keyCode].forEach(function(func) {
				func( returnKey );
			});
		}

		if (this.listenersOnce[e.type][keyCode])
		{
			this.listenersOnce[e.type][keyCode].forEach(function(func)
			{
				func( returnKey );
			});

			this.listenersOnce[e.type][keyCode] = [];
		}

		if( e.type == "keyup" ) {
			for( var i = 0; i < this.keyPressStack.length; i++ ) {
				if( this.keyPressStack[i] == keyCode ) {
					this.keyPressStack.splice(i, 1);
				}
			}
		}
	}
});