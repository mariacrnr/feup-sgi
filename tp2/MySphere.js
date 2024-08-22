import {CGFobject} from '../lib/CGF.js';
/**
 * MySphere
 * @constructor
 * @param  scene - MyScene object
 * @param  slices - number of slices around Y axis
 * @param  stacks - number of stacks along Y axis, from the center to the poles (half of sphere)
 */
export class MySphere extends CGFobject {
  constructor(scene, id, radius, slices, stacks) {
    super(scene);
    this.radius = radius;
    this.stacks = stacks;
    this.slices = slices;

    this.initBuffers();
  }


  computeStackAngles(){
    var phi = 0;
    var phiInc = 2 * Math.PI / this.stacks;
    var stackAngles = [];

    for (let latitude = 0; latitude <= this.stacks; latitude++) {
        stackAngles.push(Math.sin(phi),  Math.cos(phi))
        phi += phiInc;
    }

    return stackAngles;
  }

  computeSliceAngles(){
    var theta = 0;
    var thetaInc = (2 * Math.PI) / this.slices;
    var sliceAngles = [];

    for (let longitude = 0; longitude <= this.slices; longitude++) {
        sliceAngles.push(Math.sin(theta), Math.cos(theta))
        theta += thetaInc;
    }

    return sliceAngles;
  }

  /**
   * @method initBuffers
   * Initializes the sphere buffers
   */
  initBuffers() {
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    var stackAngles = this.computeStackAngles();
    var sliceAngles = this.computeSliceAngles();

    var latVertices = this.slices + 1;

    // build an all-around stack at a time, starting on "north pole" and proceeding "south"
    var k = 0;
    for (let latitude = 0; latitude <= this.stacks; latitude++) {

      var sinPhi = stackAngles[k];
      var cosPhi = stackAngles[k+1];

      var xy = this.radius * cosPhi;
      var z = this.radius * sinPhi;

      // in each stack, build all the slices around, starting on longitude 0
      var m = 0;
      for (let longitude = 0; longitude <= this.slices; longitude++) {

        var sinTheta = sliceAngles[m];
        var cosTheta = sliceAngles[m+1];

        // vertices
        var x = xy * cosTheta;
        var y = xy * sinTheta;
        this.vertices.push(x, y, z);

        // indices
        if (latitude < this.stacks && longitude < this.slices) {
          var current = latitude * latVertices + longitude;
          var next = current + latVertices;
          // pushing two triangles using indices from this round (current, current+1)
          // and the ones directly south (next, next+1)
          // (i.e. one full round of slices ahead)
          
          this.indices.push( current + 1, current, next);
          this.indices.push( current + 1, next, next +1);
        }

        // normals
        this.normals.push(x / this.radius, y / this.radius, z / this.radius);

        // texture
        var s = longitude / this.slices;
        var t = latitude / this.stacks;
        this.texCoords.push(s,t);

        m += 2;
      }

      k += 2;
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  }

  /**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} scale - Array of scale factors for s and t coordinates
	 */
	updateTexCoords(scale) {
    return null
  }
}
