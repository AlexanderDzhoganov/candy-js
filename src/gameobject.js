var GameObject = function (name)
{

	this.name = name;
	this.enabled = true;

	this._components =
	{

		"transform": new Transform(),

	};

};

GameObject.extend(
{
	
});

GameObject.prototype.extend(
{

	addComponent: function (component)
	{
		if(this._components[component.type])
		{
			console.log("addComponent error: component already exists on object");
			return;
		}

		component.gameObject = this;

		if(component.onInit)
		{
			component.onInit();
		}

		this._components[component.type] = component;
	},

	removeComponent: function (componentType)
	{
		var component = this._components[componentType];
		this._components[componentType] = null;
		component.gameObject = null;
		return component;
	},

	getComponent: function (componentType)
	{
		return this._components[componentType];
	},

	getComponents: function ()
	{
		return this._components;
	},

});