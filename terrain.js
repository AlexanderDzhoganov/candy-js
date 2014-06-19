

function CreateTerrain(size_x, size_y)
{
	var terrain = {};
	terrain.size = { x = size_x; y = size_y; };
	terrain.data = new UInt8Array(size_x * size_y);
	return terrain;
}

function CreateTerrainMesh(terrain)
{
	var mesh = {};
}