#ifndef __OBJ2_SCENE
#define __OBJ2_SCENE

enum class SceneNodeType
{
	Transform = 0,
	Mesh = 1,

	//To do
	//camera node and all other node tyoes
};

enum class VertexAttributeType
{
	Position = 0,
	Normal = 1,
	UVs = 2,
};

class SceneNode
{
	public:
	SceneNode() = default;
	SceneNode(const SceneNode&) = delete;

	virtual SceneNodeType GetType() const = 0;
	
	virtual ~SceneNode() {}
	
	SceneNode(SceneNode&& node)
	{
		m_Children = move(node.m_Children);
	}

	const vector<unique_ptr<SceneNode>>& GetChildren() const { return m_Children; }

	void AddChild(unique_ptr<SceneNode> node) { m_Children.push_back(move(node)); }

	void RemoveChild(size_t idx)
	{
		vector<unique_ptr<SceneNode>> newChildren;
		newChildren.reserve(m_Children.size());

		for (auto i = 0u; i < m_Children.size(); i++)
		{
			if (i == idx) continue;
			newChildren.push_back(move(m_Children[i]));
		}

		m_Children = move(newChildren);
	}

	private:
	vector<unique_ptr<SceneNode>> m_Children;
};

class Scene
{
	public:

	const unique_ptr<SceneNode>& GetRoot() const { return m_Root; }

	private:
	unique_ptr<SceneNode> m_Root = nullptr;
};

class Transform : public SceneNode
{

	public:
	SceneNodeType GetType() const override { return SceneNodeType::Transform; }

	const mat4& GetTRS() const { return m_TRS; }
	void SetTRS(const mat4& TRS) { m_TRS = TRS; }

	private:
	mat4 m_TRS;

};

struct VertexAttribute
{
	string name;
	size_t size;
};

class SubMesh
{
	vector<VertexAttribute> vertexAttributes;
	vector<float> vertices;
	vector<size_t> indices;
	string material;
	AABB aabb;
};

class Mesh : public SceneNode
{
	public:
	Mesh() {}

	Mesh(const Mesh&) = delete;

	Mesh(Mesh&& m)
	{
		m_Submeshes = move(m.m_Submeshes);
	}
	
	SceneNodeType GetType() const override { return SceneNodeType::Mesh; }

	private:
	vector<SubMesh> m_Submeshes;

};



#endif