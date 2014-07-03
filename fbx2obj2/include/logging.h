#ifndef __LOGGING_H
#define __LOGGING_H

#define LOG(s, ...) Log(__FUNCTION__, s, __VA_ARGS__)

template<typename... Args>
void Log(const char* sender, const char* s, Args... args)
{
	Log::Instance().LogMessage(sender, xs(s, args...));
}

void xs(string& result, const char* s);

template<typename T, typename... Args>
inline void xs(string& result, const char* s, T value, Args... args)
{
	while (*s)
	{
		if (*s == '%')
		{
			if (*(s + 1) == '%')
			{
				++s;
			}
			else
			{
				stringstream stream;
				stream << value;
				result += stream.str();
				xs(result, s + 1, args...); // call even when *s == 0 to detect extra arguments
				return;
			}
		}
		result += *s++;
	}
	throw logic_error("extra arguments provided to printf");
}

template<typename... Args>
inline string xs(const char* s, Args... args)
{
	string buf;
	xs(buf, s, args...);
	return buf;
}

inline void xs(string& result, const char* s)
{
	while (*s)
	{
		if (*s == '%')
		{
			if (*(s + 1) == '%')
			{
				++s;
			}
			else
			{
				throw runtime_error("invalid format string: missing arguments");
			}
		}

		result += *s++;
	}
}

inline std::vector<std::string> split(const std::string &s, char delim)
{
	std::stringstream ss(s);
	std::string item;
	std::vector<std::string> elems;
	while (std::getline(ss, item, delim))
	{
		elems.push_back(item);
	}	
	return elems;
}

class Log
{

	public:
	Log()
	{
		m_DispatchThread = make_unique<thread>(bind(&Log::DispatchThread, this));
	}

	void Deinitialize()
	{
		m_Deinitialize = true;
		while (m_Deinitialize) {}
		m_DispatchThread->join();
		m_DispatchThread = nullptr;
	}

	void LogMessage(const string& sender, const string& message)
	{
		unique_lock<mutex> _(m_QueueMutex);
		auto formatted = FormatMessage(sender, message);
		m_Queue.push_back(formatted);
		m_History.push_back(formatted);
		m_QueueInsert.notify_all();
	}

	static Log& Instance()
	{
		static Log instance;
		return instance;
	}

	private:
	string FormatMessage(const string& sender, const string& message)
	{
		return xs("%:: %", split(sender, ':')[0], message);
	}

	void DispatchThread()
	{
		for (;;)
		{
			std::unique_lock<std::mutex> _(m_QueueMutex);

			m_QueueInsert.wait(_, [this] () { return !m_Queue.empty(); });

			for (auto& item : m_Queue)
			{
				cout << item << endl;
			}

			m_Queue.clear();

			if (m_Deinitialize)
			{
				m_Deinitialize = false;
				return;
			}
		}
	}

	bool m_Deinitialize = false;
	mutex m_QueueMutex;
	condition_variable m_QueueInsert;
	vector<string> m_Queue;
	vector<string> m_History;
	unique_ptr<thread> m_DispatchThread;

};

#endif
