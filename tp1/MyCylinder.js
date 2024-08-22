import {CGFobject} from '../lib/CGF.js';
/**
* MyCylinder
* @method constructor
 * @param scene - Reference to MyScene object
 * @param slices - number of divisions around the Y axis
*/
export class MyCylinder extends CGFobject {
    constructor(scene, id, base, top, height, slices, stacks) {
        super(scene);
        this.base = base;
        this.top = top;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;
        this.initBuffers();
    }

    /**
     * @method computeVertices
     * Computes the vertices of the base circle of the cylinder
     */
    computeVertices(){
        var alphaAngle = 2*Math.PI /this.slices;
        var angle = 0;

        var unitVertices = [];
        for(var slice = 0; slice <= this.slices; slice++){
            unitVertices.push(Math.cos(angle), Math.sin(angle), 0);
            angle += alphaAngle;
        }

        return unitVertices;
    }

    /**
    * @method initBuffers
    * Initializes the cylinder buffers
    */    
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        var unitVertices = this.computeVertices();
        var Nz = (this.base - this.top) / this.height;
        
        for (let stack = 0; stack <= this.stacks; stack++) {
            
            var z = stack * this.height / this.stacks;
            var radius = this.base + stack / this.stacks * (this.top - this.base); // radius of a section of the cylinder (for when top and bottom have different radius)
            var t = 1 - 0.5*stack / this.stacks; 

            var k = 0;
            for(var slice = 0; slice <= this.slices; slice++){

                var Nx = unitVertices[k];
                var Ny = unitVertices[k+1];
                
                this.vertices.push(Nx * radius, Ny * radius, z);

                var r = Math.sqrt(Nx*Nx + Ny*Ny + Nz*Nz);
                this.normals.push(Nx/r, Ny/r , Nz/r);

                this.texCoords.push(slice/this.slices, t);

                k+=3;
            }
        }

        for(let stack = 0; stack < this.stacks; stack++){
            for(let slice = 0; slice < this.slices; ++slice){
                var k1 = stack * (this.slices + 1) + slice;
                var k2 = (stack + 1) * (this.slices + 1) + slice;
                this.indices.push(k1, k2 + 1, k2);
                this.indices.push(k1, k1 + 1, k2 + 1);

            }
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