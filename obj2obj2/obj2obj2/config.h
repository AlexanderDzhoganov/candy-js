#ifndef __CONFIG_H
#define __CONFIG_H

#define CONFIG_KEY(KEY, EXPECTED_VAL) (Config::Instance().GetValue(KEY) == EXPECTED_VAL)
#define LOG_VERBOSE(s, ...) ((CONFIG_KEY("log", "verbose")) ? Log(__FUNCTION__, s, __VA_ARGS__) : 0)

class Config
{
	
	public:
	static Config& Instance()
	{
		static Config instance;
		return instance;
	}

	bool ParseCommandLine(int argc, char** argv)
	{
		if (argc == 1)
		{
			cout << "Usage:" << endl;
			cout << argv[0] << "key0=value0 key1=value1 etc.. input_filename" << endl;
			return false;
		}

		LOG("Parsing command-line");
		
		bool inputFilenameSet = false;

		vector<string> keyValuePairs;
		for (int i = 1; i < argc; i++)
		{
			keyValuePairs.emplace_back(argv[i]);
		}

		for (auto& keyValue : keyValuePairs)
		{
			if (keyValue[0] != '-' || keyValue[1] != '-')
			{
				if (inputFilenameSet)
				{
					LOG("Warning: More than one input file in command line arguments, only the first file will be used.", keyValue);
				}
				else
				{
					m_InputFilename = keyValue;
					inputFilenameSet = true;
				}

				continue;
			}

			if (keyValue.find('=') == -1)
			{
				m_CommandLine[keyValue.substr(2, keyValue.size() - 2)] = "true";
				continue;
			}

			auto splitKeyValue = split(keyValue, '=');
			auto key = splitKeyValue[0].substr(2, splitKeyValue[0].size() - 2);
			auto value = splitKeyValue[1];

			m_CommandLine[key] = value;
		}

		return true;
	}

	const string& GetValue(const string& key)
	{
		return m_CommandLine[key];
	}

	const string& GetInputFilename()
	{
		return m_InputFilename;
	}

	private:
	unordered_map<string, string> m_CommandLine;
	string m_InputFilename;

};

#endif
