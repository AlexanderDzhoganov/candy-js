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
	Vec3 = 6,
	Vec4 = 7,
	Quaternion = 8,
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
	BinaryWriter(size_t size)
	{
		m_Data.resize(sizeof(uint32_t) + size);
		uint32_t header = 0xFF00FF00;
		WriteBytes((uint8_t*)&header, sizeof(uint32_t));
	}

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

inline void WriteProperty(BinaryArchive& archive, BinaryType type, const string& name)
{
	archive.WriteBytes((const uint8_t*)&type, sizeof(uint32_t));

	auto length = (uint32_t)name.size();
	archive.WriteBytes((const uint8_t*)&length, sizeof(uint32_t));
	archive.WriteBytes((const uint8_t*)name.c_str(), sizeof(uint8_t)* length);
}

// Uint32
inline void Serialize(BinaryArchive& archive, const string& name, uint32_t value)
{
	WriteProperty(archive, BinaryType::Uint32, name);
	archive.WriteBytes((const uint8_t*)&value, sizeof(uint32_t));
}

// Float32
inline void Serialize(BinaryArchive& archive, const string& name, float_t value)
{
	WriteProperty(archive, BinaryType::Float32, name);
	archive.WriteBytes((const uint8_t*)&value, sizeof(float_t));
}

// String
inline void Serialize(BinaryArchive& archive, const string& name, const string& value)
{
	WriteProperty(archive, BinaryType::String, name);

	auto length = (uint32_t)value.size();
	archive.WriteBytes((const uint8_t*)&length, sizeof(uint32_t));
	archive.WriteBytes((const uint8_t*)value.c_str(), sizeof(uint8_t)* length);
}

// Uint32Array
inline void Serialize(BinaryArchive& archive, const string& name, const vector<uint32_t>& value)
{
	WriteProperty(archive, BinaryType::Array, name);

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
	WriteProperty(archive, BinaryType::Array, name);

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
	WriteProperty(archive, BinaryType::Object, name);

	BinarySizeCalculator sizeCalculator;
	object.SerializeSelf(sizeCalculator);
	uint32_t size = (uint32_t)sizeCalculator.GetSize();
	archive.WriteBytes((const uint8_t*)&size, sizeof(uint32_t));

	object.SerializeSelf(archive);

	auto type = BinaryType::ObjectEnd;
	archive.WriteBytes((const uint8_t*)&type, sizeof(uint32_t));
}

// ObjectArray
template <typename T>
inline void Serialize(BinaryArchive& archive, const string& name, const vector<T>& objects)
{
	WriteProperty(archive, BinaryType::Array, name);

	auto itemType = BinaryType::Object;
	archive.WriteBytes((const uint8_t*)&itemType, sizeof(uint32_t));

	auto length = (uint32_t)objects.size();
	archive.WriteBytes((const uint8_t*)&length, sizeof(uint32_t));

	for (auto& object : objects)
	{
		BinarySizeCalculator sizeCalculator;
		object.SerializeSelf(sizeCalculator);
		uint32_t size = (uint32_t)sizeCalculator.GetSize();
		archive.WriteBytes((const uint8_t*)&size, sizeof(uint32_t));

		object.SerializeSelf(archive);
		auto end = BinaryType::ObjectEnd;
		archive.WriteBytes((const uint8_t*)&end, sizeof(uint32_t));
	}
}

#endif
