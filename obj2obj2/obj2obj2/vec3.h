#ifndef __vec3_H
#define __vec3_H

#include <math.h>
#include <ostream>
#include <iomanip>

struct vec3
{
	union
	{
		struct { float x, y, z; };
		float components[3];
	};

	vec3() {}
	vec3(float _x, float _y, float _z) { set(_x, _y, _z); }
	void set(float _x, float _y, float _z)
	{
		x = _x;
		y = _y;
		z = _z;
	}
	void makeZero(void)
	{
		x = y = z = 0.0;
	}
	inline float length(void) const
	{
		return sqrt(x * x + y * y + z * z);
	}
	inline float lengthSqr(void) const
	{
		return (x * x + y * y + z * z);
	}
	void scale(float multiplier)
	{
		x *= multiplier;
		y *= multiplier;
		z *= multiplier;
	}
	void operator *= (float multiplier)
	{
		scale(multiplier);
	}
	void operator += (const vec3& rhs)
	{
		x += rhs.x;
		y += rhs.y;
		z += rhs.z;
	}
	void operator /= (float divider)
	{
		scale(1.0 / divider);
	}
	void normalize(void)
	{
		float multiplier = 1.0f / length();
		scale(multiplier);
	}
	void setLength(float newLength)
	{
		scale(newLength / length());
	}

	inline float& operator[] (int index)
	{
		return components[index];
	}
	inline const float& operator[] (int index) const
	{
		return components[index];
	}

	int maxDimension() const
	{
		int bi = 0;
		float maxD = fabs(x);
		if (fabs(y) > maxD) { maxD = fabs(y); bi = 1.f; }
		if (fabs(z) > maxD) { maxD = fabs(z); bi = 2.f; }
		return bi;
	}
};
vec3 min (const vec3& lhs, const vec3& rhs)
{
	return vec3 (std::min(lhs.x, rhs.x), std::min(lhs.y, rhs.y), std::min(lhs.z, rhs.z));
}

vec3 max(const vec3& lhs, const vec3& rhs)
{
	return vec3(std::max(lhs.x, rhs.x), std::max(lhs.y, rhs.y), std::max(lhs.z, rhs.z));
}

inline vec3 operator + (const vec3& a, const vec3& b)
{
	return vec3(a.x + b.x, a.y + b.y, a.z + b.z);
}

inline vec3 operator - (const vec3& a, const vec3& b)
{
	return vec3(a.x - b.x, a.y - b.y, a.z - b.z);
}

inline vec3 operator - (const vec3& a)
{
	return vec3(-a.x, -a.y, -a.z);
}

/// dot product
inline float operator * (const vec3& a, const vec3& b)
{
	return a.x * b.x + a.y * b.y + a.z * b.z;
}
/// dot product (functional form, to make it more explicit):
inline float dot(const vec3& a, const vec3& b)
{
	return a.x * b.x + a.y * b.y + a.z * b.z;
}
/// cross product
inline vec3 operator ^ (const vec3& a, const vec3& b)
{
	return vec3(
		a.y * b.z - a.z * b.y,
		a.z * b.x - a.x * b.z,
		a.x * b.y - a.y * b.x
		);
}

inline vec3 operator * (const vec3& a, float multiplier)
{
	return vec3(a.x * multiplier, a.y * multiplier, a.z * multiplier);
}
inline vec3 operator * (float multiplier, const vec3& a)
{
	return vec3(a.x * multiplier, a.y * multiplier, a.z * multiplier);
}
inline vec3 operator / (const vec3& a, float divider)
{
	float multiplier = 1.0 / divider;
	return vec3(a.x * multiplier, a.y * multiplier, a.z * multiplier);
}

inline vec3 normalize(const vec3& vec)
{
	float multiplier = 1.0f / vec.length();
	return vec * multiplier;
}

inline vec3 reflect(const vec3& ray, const vec3& norm)
{
	vec3 result = ray - 2.f * dot(ray, norm) * norm;
	result.normalize();
	return result;
}

inline vec3 faceforward(const vec3& ray, const vec3& norm)
{
	if (dot(ray, norm) < 0) return norm;
	else return -norm;
}

inline vec3 project(const vec3& v, int a, int b, int c)
{
	vec3 result;
	result[a] = v[0];
	result[b] = v[1];
	result[c] = v[2];
	return result;
}


inline vec3 unproject(const vec3& v, int a, int b, int c)
{
	vec3 result;
	result[0] = v[a];
	result[1] = v[b];
	result[2] = v[c];
	return result;
}

/// given an unit vec3 a, create an orhonormed system (a, b, c). Code is deterministic.
inline void orthonormedSystem(const vec3& a, vec3& b, vec3& c)
{
	vec3 temp = vec3(1, 0, 0);
	if (fabs(dot(a, temp)) > 0.99)
	{
		temp = vec3(0, 1, 0);
		if (fabs(dot(a, temp)) > 0.99)
			temp = vec3(0, 0, 1);
	}
	b = a ^ temp;
	b.normalize();
	c = a ^ b;
	c.normalize();
}

inline vec3 refract(const vec3& i, const vec3& n, float ior)
{
	float NdotI = float(dot(i, n));
	float k = 1 - (ior * ior) * (1 - NdotI * NdotI);
	if (k < 0)
		return vec3(0, 0, 0);
	return ior * i - (ior * NdotI + sqrt(k)) * n;
}
#endif 
