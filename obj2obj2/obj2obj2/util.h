#ifndef __UTIL_H
#define __UTIL_H

static int GetHashCodeForBytes(const char * bytes, int numBytes)
{
	unsigned long h = 0, g;
	for (int i = 0; i < numBytes; i++)
	{
		h = (h << 4) + bytes[i];
		if (g = h & 0xF0000000L) { h ^= g >> 24; }
		h &= ~g;
	}
	return h;
}

struct Vertex
{
	vec3 position;
	vec3 normal;
	vec2 uv;
};

static int GetVertexHash(const Vertex& vertex)
{
	return GetHashCodeForBytes((const char*)(&vertex), 32);
}

#endif
