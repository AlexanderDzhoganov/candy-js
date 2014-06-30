#ifndef __FBX_WRAPPER
#define __FBX_WRAPPER

class NonCopyable
{

	public:
	NonCopyable() = default;
	NonCopyable(const NonCopyable&) = delete;
	NonCopyable& operator=(const NonCopyable&) = delete;

};

class NonMovable
{

	public:
	NonMovable() = default;
	NonMovable(NonMovable&&) = delete;
	NonMovable& operator=(NonMovable&&) = delete;

};

namespace FbxWrapper
{
	template <class T>
	class ManagedObject
	{

		public:

		ManagedObject(T* object) : m_Object(object) {}

		ManagedObject(const ManagedObject&) = delete;

		ManagedObject(ManagedObject&& rhs)
		{
			if (&rhs != this)
			{
				if (m_Object != nullptr)
				{
					m_Object->Destroy();
					m_Object = nullptr;
				}

				m_Object = rhs.m_Object;
				rhs.m_Object = nullptr;
			}
		}

		ManagedObject& operator=(ManagedObject&& rhs)
		{
			if (&rhs != this)
			{
				if (m_Object != nullptr)
				{
					m_Object->Destroy();
					m_Object = nullptr;
				}

				m_Object = rhs.m_Object;
				rhs.m_Object = nullptr;
			}
		}

		virtual ~ManagedObject()
		{
			if (m_Object != nullptr)
			{
				m_Object->Destroy();
			}
		}

		T* operator -> () const { return m_Object; }
		T* get() const { return m_Object; }

		void destroy()
		{
			if (m_Object != nullptr)
			{
				m_Object->Destroy();
				m_Object = nullptr;
			}
		}

		private:
		T* m_Object;

	};

	class WFbxManager : public ManagedObject<FbxManager>
	{
		public:
		WFbxManager() : ManagedObject(FbxManager::Create()) {}
	};

	class WFbxIOSettings : public ManagedObject<FbxIOSettings>
	{
		public:
		WFbxIOSettings(const WFbxManager& manager) : ManagedObject(FbxIOSettings::Create(manager.get(), IOSROOT)) {}
	};

	class WFbxImporter : public ManagedObject<FbxImporter>
	{
		public:
		WFbxImporter(const WFbxManager& manager) : ManagedObject(FbxImporter::Create(manager.get(), "")) {}
	};

	class WFbxScene : public ManagedObject<FbxScene>
	{
		public:
		WFbxScene(const WFbxManager& manager, const char* sceneName = "Scene") : ManagedObject(FbxScene::Create(manager.get(), sceneName)) {}
		WFbxScene(const WFbxScene&) = delete;
		WFbxScene(WFbxScene&& scene) : ManagedObject(scene.get()) {};
	};

	class WFbxMesh : public ManagedObject<FbxMesh>
	{
		public:
		WFbxMesh(FbxMesh* mesh) : ManagedObject(mesh){}
	};
}
#endif