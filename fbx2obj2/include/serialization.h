#ifndef __SERIALIZATION_H
#define __SERIALIZATION_H

#define SERIALIZATION_DEF void SerializeSelf(BinaryArchive& ar) const
#define PROPERTY(prop) Serialize(ar, #prop, prop)

enum class BinaryType
{
	Uint32 = 0,
	Float32 = 1,
	String = 2,
	Object = 3,
	ObjectEnd = 4,
	Array = 5,
};

class BinaryArchive
{
	public:
	virtual void WriteBytes(const uint8_t* item, size_t size) = 0;
};

class BinarySizeCalculator : public BinaryArchive
{
	
	public:
	void WriteBytes(const uint8_t* item, size_t size)
	{
		m_Size += size;
	}

	size_t GetSize()
	{
		return m_Size;
	}

	private:
	size_t m_Size = 0;

};

class BinaryWriter : public BinaryArchive
{

	public:
	BinaryWriter(size_t size) { m_Data.resize(size); }

	const vector<uint8_t>& GetData() const
	{
		return m_Data;
	}

	void WriteBytes(const uint8_t* item, size_t size)
	{
		memcpy(&(m_Data[m_DataPtr]), item, size);
		m_DataPtr += size;
	}

	private:
	vector<uint8_t> m_Data;
	size_t m_DataPtr = 0;

};

inline void SerializePropertyName(BinaryArchive& archive, const string& propertyName)
{
	auto length = (uint32_t)propertyName.size();
	archive.WriteBytes((const uint8_t*)&length, sizeof(uint32_t));
	archive.WriteBytes((const uint8_t*)propertyName.c_str(), sizeof(uint8_t) * length);
}

// Uint32
inline void Serialize(BinaryArchive& archive, const string& name, uint32_t value)
{
	auto type = BinaryType::Uint32;
	archive.WriteBytes((const uint8_t*)&type, sizeof(uint32_t));
	SerializePropertyName(archive, name);

	archive.WriteBytes((const uint8_t*)&value, sizeof(uint32_t));
}

// Float32
inline void Serialize(BinaryArchive& archive, const string& name, float_t value)
{
	auto type = BinaryType::Float32;
	archive.WriteBytes((const uint8_t*)&type, sizeof(uint32_t));
	SerializePropertyName(archive, name);

	archive.WriteBytes((const uint8_t*)&value, sizeof(float_t));
}

// String
inline void Serialize(BinaryArchive& archive, const string& name, const string& value)
{
	auto type = BinaryType::String;
	archive.WriteBytes((const uint8_t*)&type, sizeof(uint32_t));
	SerializePropertyName(archive, name);

	auto length = (uint32_t)value.size();
	archive.WriteBytes((const uint8_t*)&length, sizeof(uint32_t));
	archive.WriteBytes((const uint8_t*)value.c_str(), sizeof(uint8_t)* length);
}

// Uint32Array
inline void Serialize(BinaryArchive& archive, const string& name, const vector<uint32_t>& value)
{
	auto type = BinaryType::Array;
	archive.WriteBytes((const uint8_t*)&type, sizeof(uint32_t));

	SerializePropertyName(archive, name);

	auto itemType = BinaryType::Uint32;
	archive.WriteBytes((const uint8_t*)&itemType, sizeof(uint32_t));

	auto length = (uint32_t)value.size();
	archive.WriteBytes((const uint8_t*)&length, sizeof(uint32_t));

	for (auto& item : value)
	{
		archive.WriteBytes((const uint8_t*)&item, sizeof(uint32_t));
	}
}

// Float32Array
inline void Serialize(BinaryArchive& archive, const string& name, const vector<float_t>& value)
{
	auto type = BinaryType::Array;
	archive.WriteBytes((const uint8_t*)&type, sizeof(uint32_t));

	SerializePropertyName(archive, name);

	auto itemType = BinaryType::Float32;
	archive.WriteBytes((const uint8_t*)&itemType, sizeof(uint32_t));

	auto length = (uint32_t)value.size();
	archive.WriteBytes((const uint8_t*)&length, sizeof(uint32_t));

	for (auto& item : value)
	{
		archive.WriteBytes((const uint8_t*)&item, sizeof(float_t));
	}
}

// Object
template <typename T>
inline void Serialize(BinaryArchive& archive, const string& name, const T& object)
{
	auto type = BinaryType::Object;
	archive.WriteBytes((const uint8_t*)&type, sizeof(uint32_t));
	SerializePropertyName(archive, name);

	object.SerializeSelf(archive);

	type = BinaryType::ObjectEnd;
	archive.WriteBytes((const uint8_t*)&type, sizeof(uint32_t));
}

// ObjectArray
template <typename T>
inline void Serialize(BinaryArchive& archive, const string& name, const vector<T>& objects)
{
	auto type = BinaryType::Array;
	archive.WriteBytes((const uint8_t*)&type, sizeof(uint32_t));

	SerializePropertyName(archive, name);

	auto itemType = BinaryType::Object;
	archive.WriteBytes((const uint8_t*)&itemType, sizeof(uint32_t));

	auto length = (uint32_t)objects.size();
	archive.WriteBytes((const uint8_t*)&length, sizeof(uint32_t));

	for (auto& object : objects)
	{
		object.SerializeSelf(archive);
		auto end = BinaryType::ObjectEnd;
		archive.WriteBytes((const uint8_t*)&end, sizeof(uint32_t));
	}
}

#endif
