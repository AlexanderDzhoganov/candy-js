#ifndef __SERIALIZATION_H
#define __SERIALIZATION_H

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

template <typename T>
inline void SerializeObject(BinaryArchive& archive, const T& item)
{
	item.SerializeSelf(archive);
}

template <typename T>
inline void SerializeObjectVector(BinaryArchive& archive, const vector<T>& vec)
{
	auto size = (uint32_t)vec.size();
	archive.WriteBytes((const uint8_t*)&size, sizeof(uint32_t));

	for (auto& item : vec)
	{
		item.SerializeSelf(archive);
	}
}

template <typename T>
inline void Serialize(BinaryArchive& archive, const T& item)
{
	archive.WriteBytes((const uint8_t*)&item, sizeof(T));
}

template <typename T>
inline void Serialize(BinaryArchive& archive, const vector<T>& vec)
{
	auto size = (uint32_t)vec.size();
	archive.WriteBytes((const uint8_t*)&size, sizeof(uint32_t));

	for (auto& item : vec)
	{
		archive.WriteBytes((const uint8_t*)&item, sizeof(T));
	}
}

template <>
inline void Serialize(BinaryArchive& archive, const string& s)
{
	auto length = (uint32_t)s.size();
	archive.WriteBytes((const uint8_t*)&length, sizeof(uint32_t));
	archive.WriteBytes((const uint8_t*)s.c_str(), sizeof(uint8_t) * length);
}

#endif
