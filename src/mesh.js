var SubMesh = function (name)
{
	var verts = [], vertNormals = [], textures = [], unpacked = {};
	
	var f = ResourceLoader.getContent(name); // read file

    unpacked.verts = [];
    unpacked.norms = [];
    unpacked.textures = [];
    unpacked.hashindices = {};
    unpacked.indices = [];
    unpacked.index = 0;
    // array of lines separated by the newline
    var lines = f.split('\n');
    var i;
    for (i = 0; i < lines.length; i++) {
      // if this is a vertex
      var line;
      if (lines[i].startsWith('v ')) {
        line = lines[i].slice(3).split(" ");
        verts.push(line[0]);
        verts.push(line[1]);
        verts.push(line[2]);
      } else if (lines[i].startsWith('vn')) {
        // if this is a vertex normal
        line = lines[i].slice(3).split(" ");
        vertNormals.push(line[0]);
        vertNormals.push(line[1]);
        vertNormals.push(line[2]);
      } else if (lines[i].startsWith('vt')) {
        // if this is a texture
        line = lines[i].slice(3).split(" ");
        textures.push(line[0]);
        textures.push(line[1]);
      } else if (lines[i].startsWith('f ')) {
        // if this is a face
        /*
        split this face into an array of Vertex groups
        for example:
           f 16/92/11 14/101/22 1/69/1
        becomes:
          ['16/92/11', '14/101/22', '1/69/1'];
        */
        line = lines[i].slice(2).split(" ");
        var quad = false;
        for (var j=0; j<line.length; j++){
            // Triangulating quads
            // quad: 'f v0/t0/vn0 v1/t1/vn1 v2/t2/vn2 v3/t3/vn3/'
            // corresponding triangles:
            //      'f v0/t0/vn0 v1/t1/vn1 v2/t2/vn2'
            //      'f v2/t2/vn2 v3/t3/vn3 v0/t0/vn0'
            if (j === 3 && !quad) {
                // add v2/t2/vn2 in again before continuing to 3
                j = 2;
                quad = true;
            }
            if (line[j] in unpacked.hashindices){
                unpacked.indices.push(unpacked.hashindices[line[j]]);
            }
            else{
                /*
                Each element of the face line array is a Vertex which has its
                attributes delimited by a forward slash. This will separate
                each attribute into another array:
                    '19/92/11'
                becomes:
                    Vertex = ['19', '92', '11'];
                where
                    Vertex[0] is the vertex index
                    Vertex[1] is the texture index
                    Vertex[2] is the normal index
                 Think of faces having Vertices which are comprised of the
                 attributes location (v), texture (vt), and normal (vn).
                 */
                var Vertex = line[ j ].split( '/' );
                /*
                 The verts, textures, and vertNormals arrays each contain a
                 flattend array of coordinates.

                 Because it gets confusing by referring to Vertex and then
                 vertex (both are different in my descriptions) I will explain
                 what's going on using the vertexNormals array:

                 Vertex[2] will contain the one-based index of the vertexNormals
                 section (vn). One is subtracted from this index number to play
                 nice with javascript's zero-based array indexing.

                 Because vertexNormal is a flattened array of x, y, z values,
                 simple pointer arithmetic is used to skip to the start of the
                 vertexNormal, then the offset is added to get the correct
                 component: +0 is x, +1 is y, +2 is z.

                 This same process is repeated for verts and textures.
                 */
                // vertex position
                unpacked.verts.push(verts[(Vertex[0] - 1) * 3 + 0]);
                unpacked.verts.push(verts[(Vertex[0] - 1) * 3 + 1]);
                unpacked.verts.push(verts[(Vertex[0] - 1) * 3 + 2]);
                // vertex textures
                unpacked.textures.push(textures[(Vertex[1] - 1) * 2 + 0]);
                unpacked.textures.push(textures[(Vertex[1] - 1) * 2 + 1]);
                // vertex normals
                unpacked.norms.push(vertNormals[(Vertex[2] - 1) * 3 + 0]);
                unpacked.norms.push(vertNormals[(Vertex[2] - 1) * 3 + 1]);
                unpacked.norms.push(vertNormals[(Vertex[2] - 1) * 3 + 2]);
                // add the newly created vertex to the list of indices
                unpacked.hashindices[line[j]] = unpacked.index;
                unpacked.indices.push(unpacked.index);
                // increment the counter
                unpacked.index += 1;
            }
            if (j === 3 && quad) {
                // add v0/t0/vn0 onto the second triangle
                unpacked.indices.push( unpacked.hashindices[line[0]]);
            }
        }
      }
    }

    var unpackedVertices = unpacked.verts;
    var unpackedNormals = unpacked.norms;
    var unpackedUVs = unpacked.textures;
    var unpackedIndices = unpacked.indices;

	this.vertices = new Float32Array(unpackedVertices);
	this.uvs = new Float32Array(unpackedUVs);
	this.normals = new Float32Array(unpackedNormals);
	this.indices = new Float32Array(unpackedIndices);
};

SubMesh.extend({

})

SubMesh.prototype.extend({

})