include([ "shim", "resourceloader", "application" ], function ()
{
	ResourceLoader = new ResourceLoader(
	{
		// textures
		"heightmap": "resources/images/heightmap.png",
		"cursor": "resources/images/cursor.png",
		"grass": "resources/images/grass.png",
		"checker": "resources/images/checker.png",
		"lerpz_diffuse": "resources/images/lerpz.png",
/*
		"sponza:floor1": "resources/images/sponza/floor_diffuse.png",
		"sponza:column_a1": "resources/images/sponza/column_a_diffuse.png",
		"sponza:ceiling1": "resources/images/sponza/ceiling.png",
		"sponza:vase_hanging1": "resources/images/sponza/vase_hanging.png",
		"sponza:vase_round1": "resources/images/sponza/vase_round.png",
		"sponza:column_b1": "resources/images/sponza/column_b.png",
		"sponza:Material__571": "resources/images/sponza/vase_plant.png",
		"sponza:leaf1": "resources/images/sponza/leaf.png",
		"sponza:Material__2981": "resources/images/sponza/lionshield.png",
		"sponza:arch1": "resources/images/sponza/arch.png",
		"sponza:bricks1": "resources/images/sponza/bricks.png",
		"sponza:Material__251": "resources/images/sponza/lion.png",
		"sponza:fabric_d1": "resources/images/sponza/fabric.png",
		"sponza:column_c1": "resources/images/sponza/column_c.png",
		"sponza:details1": "resources/images/sponza/details.png",
		//"sponza:Material__47": "resources/images/sponza/.png",
		"sponza:flagpole1": "resources/images/sponza/flagpole.png",
		"sponza:fabric_e1": "resources/images/sponza/fabric.png",
		"sponza:fabric_a1": "resources/images/sponza/fabric_blue.png",
		"sponza:fabric_g1": "resources/images/sponza/fabric_green.png",
		"sponza:fabric_f1": "resources/images/sponza/fabric.png",
		"sponza:fabric_c1": "resources/images/sponza/curtain.png",
		"sponza:chain1": "resources/images/sponza/chain.png",
		"sponza:vase1": "resources/images/sponza/vase.png",
		"sponza:roof1": "resources/images/sponza/roof.png",
*/
		// meshes
		//"mesh": "resources/meshes/teapot_lowres.obj",
		"sponza": "resources/meshes/sponza_fbx.obj2",
		//"city": "resources/meshes/city.obj2",
		"lerpz": "resources/meshes/lerpz_fixed_fbx.obj2",
		//"level": "resources/meshes/level_fbx.obj2",
		//"sibenik": "resources/meshes/sibenik.obj2",
		//"de_dust2": "resources/meshes/de_dust2_fbx.obj2",
		//"de_dust22": "resources/meshes/de_dust2/de_dust2.obj2",

		// shaders
		"terrain_vertex": "resources/shaders/terrain.vs",
		"terrain_fragment": "resources/shaders/terrain.fs",

		"gui_vertex": "resources/shaders/gui.vs",
		"gui_fragment": "resources/shaders/gui.fs",

		"gui_quad_vertex": "resources/shaders/gui_quad.vs",
		"gui_quad_fragment": "resources/shaders/gui_quad.fs",

		"diffuse_vertex": "resources/shaders/diffuse.vs",
		"diffuse_fragment": "resources/shaders/diffuse.fs",

		"show_normals_vertex": "resources/shaders/show_normals.vs",
		"show_normals_fragment": "resources/shaders/show_normals.fs",

		"wireframe_vertex": "resources/shaders/wireframe.vs",
		"wireframe_fragment": "resources/shaders/wireframe.fs",

		"skin_vertex": "resources/shaders/skin.vs",
		"skin_dq_vertex": "resources/shaders/dualquaternion_skin.vs"
		
	},
	function (resName, progress, final)
	{
		// update progress bar
	},
	function ()
	{
		console.log("resources loaded");

		var styleSheet = document.createElement("link");
		styleSheet.type = "text/css";
		styleSheet.rel = "stylesheet";
		styleSheet.href = "main.css";
		document.getElementsByTagName("head")[0].appendChild(styleSheet);

		var canvas = document.createElement('canvas');
		canvas.id = "gl-canvas";
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		document.body.appendChild(canvas);
		
		Application = new Application();
		Application.run(120);
	});

});

