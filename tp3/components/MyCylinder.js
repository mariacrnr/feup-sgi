import {CGFobject, CGFtexture} from '../../lib/CGF.js';
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
        this.id = id;
        this.kingTextureBlack = new CGFtexture(this.scene, 'scenes/images/crown_black.png');
        this.kingTextureWhite = new CGFtexture(this.scene, 'scenes/images/crown_white.png');
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

        // top

        this.vertices.push(0, 0, this.height);
        this.normals.push(0, 0, 1);
        this.texCoords.push(0.5/Math.PI, 0.25);

        let center_top = this.vertices.length/3 - 1;
        for(let slice = 0; slice <= this.slices; slice++){
            let theta = 2*Math.PI*slice/this.slices;
            this.vertices.push(
                Math.cos(theta) * this.top,
                Math.sin(theta) * this.top,
                this.height
            );
            this.normals.push(0, 0, 1);
            this.texCoords.push(
                0.5/Math.PI + (0.5/Math.PI) * Math.cos(theta),
                0.25-0.25*Math.sin(theta)
            );
        }
        
        for (let slice = 0; slice < this.slices; slice++) {
            this.indices.push(
                center_top,
                center_top + 1 + slice,
                center_top + 2 + slice
            );
        }
        
        // bottom 

        this.vertices.push(0, 0, 0);
        this.normals.push(0, 0, -1);
        this.texCoords.push(1.5/Math.PI, 0.25);

        let center_bottom = this.vertices.length/3 - 1;
        for(let slice = 0; slice <= this.slices; slice++){
            let theta = 2*Math.PI*slice/this.slices;
            this.vertices.push(
                Math.cos(theta) * this.base,
                Math.sin(theta) * this.base,
                0
            );
            this.normals.push(0, 0, -1);
            this.texCoords.push(
                1.5/Math.PI + (0.5/Math.PI) * Math.cos(-theta),
                0.25-0.25*Math.sin(-theta)
            );
        }
        
        for (let slice = 0; slice < this.slices; slice++) {
            this.indices.push(
                center_bottom,
                center_bottom + 2 + slice,
                center_bottom + 1 + slice
            );
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