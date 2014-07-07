BinaryReader = function (data)
{
	this._data = new DataView(data);
	this._ptr = 0;

	this._endianess = true;

	var header = this._readUint32();
	if (header != 0xFF00FF00)
	{
		this._endianess = false;
	}
};

BinaryReader.extend(
{

	BINARY_TYPE: 
	{
		UINT32: 0,
		FLOAT32: 1,
		STRING: 2,
		OBJECT: 3,
		OBJECTEND: 4,
		ARRAY: 5,
		VEC3: 6,
		VEC4: 7,
		QUATERNION: 8,
	},

});

BinaryReader.prototype.extend(
{

	get: function ()
	{
		var prop = this._readProperty();
		if(prop.name != "obj2")
		{
			console.log("invalid obj2 declaration");
		}

		return prop.value;
	},

	_readProperty: function ()
	{
		var type = this._readUint32();

		if(type == BinaryReader.BINARY_TYPE.OBJECTEND)
		{
			return { type: BinaryReader.BINARY_TYPE.OBJECTEND, name: null, value: null };
		}

		var name = this._readString();
		var value = null;

		switch(type)
		{
		case BinaryReader.BINARY_TYPE.UINT32:
			value = this._readUint32();
			break;
		case BinaryReader.BINARY_TYPE.FLOAT32:
			value = this._readFloat32();
			break;
		case BinaryReader.BINARY_TYPE.STRING:
			value = this._readString();
			break;
		case BinaryReader.BINARY_TYPE.ARRAY:
			value = this._readArray();
			break;
		case BinaryReader.BINARY_TYPE.OBJECT:
			value = this._readObject();
			break;
		case BinaryReader.BINARY_TYPE.VEC3:
			value = this._readVec3();
			break;
		case BinaryReader.BINARY_TYPE.VEC4:
			value = this._readVec4();
			break;
		case BinaryReader.BINARY_TYPE.QUATERNION:
			value = this._readQuaternion();
			break;
		}

		return { type: type, name: name, value: value };
	},

	_readInt8: function ()
	{
		var value = this._data.getInt8(this._ptr, this._endianess);
		this._ptr += 1;
		return value;
	},

	_readUint32: function ()
	{
		var value = this._data.getUint32(this._ptr, this._endianess);
		this._ptr += 4;
		return value;
	},

	_readFloat32: function ()
	{
		var value = this._data.getFloat32(this._ptr, this._endianess);
		this._ptr += 4;
		return value;
	},

	_readString: function ()
	{
		var length = this._readUint32();
		var s = "";

		for (var i = 0; i < length; i++)
		{
			s += String.fromCharCode(this._readInt8());
		}

		return s;
	},

	_readValue: function (type)
	{
		var value = null;

		switch(type)
		{
		case BinaryReader.BINARY_TYPE.UINT32:
			value = this._readUint32();
			break;
		case BinaryReader.BINARY_TYPE.FLOAT32:
			value = this._readFloat32();
			break;
		case BinaryReader.BINARY_TYPE.STRING:
			value = this._readString();
			break;
		case BinaryReader.BINARY_TYPE.OBJECT:
			value = this._readObject();
			break;
		}

		return value;
	},

	_readArray: function (type)
	{
		var itemType = this._readUint32();
		var length = this._readUint32();

		var arr = [];

		for (var i = 0; i < length; i++)
		{
			arr.push(this._readValue(itemType));
		}

		return arr;
	},

	_readObject: function ()
	{
		var objectSize = this._readUint32();
		var object = {};

		var property = this._readProperty();

		while (property.type != BinaryReader.BINARY_TYPE.OBJECTEND)
		{
			object[property.name] = property.value;
			property = this._readProperty();
		}

		return object;
	},

	_readVec3: function ()
	{
		var x = this._data.getFloat32(this._ptr, true);
		var y = this._data.getFloat32(this._ptr, true);
		var z = this._data.getFloat32(this._ptr, true);

		this._ptr += 12;
		return vec3.fromValues(x, y, z);
	},

	_readVec4: function ()
	{
		var x = this._data.getFloat32(this._ptr, true);
		var y = this._data.getFloat32(this._ptr, true);
		var z = this._data.getFloat32(this._ptr, true);
		var w = this._data.getFloat32(this._ptr, true);

		this._ptr += 16;
		return vec4.fromValues(x, y, z, w);
	},

	_readQuaternion: function ()
	{
		var x = this._data.getFloat32(this._ptr, true);
		var y = this._data.getFloat32(this._ptr, true);
		var z = this._data.getFloat32(this._ptr, true);
		var w = this._data.getFloat32(this._ptr, true);

		this._ptr += 16;
		return quat.fromValues(x, y, z, w);
	},

});
