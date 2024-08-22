import {CGFobject} from '../../lib/CGF.js';
/**
 * MyTorus
 * @constructor
 * @param  scene - MyScene object
 * @param  slices - number of slices around Y axis
 * @param  loops - number of loops along Z axis, from the center to the poles (half of sphere)
 * @param  outer - the outer radius of the sphere
 * @param  inner - how thick the torus is
 * @param  arc - how much of the arc is complete
 */
export class MyTorus extends CGFobject {
    constructor(scene, id, inner, outer, slices, loops) {
        super(scene);
        this.inner = inner;
        this.outer = outer;
        this.slices = slices;
        this.loops = loops;

        this.initBuffers();
    }

    /**
     * @method initBuffers
     * Initializes the torus buffers
     */
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
        this.uvs = [];

        for ( let j = 0; j <= this.slices; j ++ ) {

            for ( let i = 0; i <= this.loops; i ++ ) {

                //angles
                const loop_angle = i / this.loops* Math.PI * 2;
                const slice_angle = j / this.slices * Math.PI * 2;

                //cos & sin
                const cos_slices = Math.cos(slice_angle);
                const cos_loops = Math.cos(loop_angle);
                const sin_slices = Math.sin(slice_angle);
                const sin_loops = Math.sin(loop_angle);
        
                this.vertices.push((this.outer + this.inner * cos_slices) * cos_loops);
                this.vertices.push((this.outer + this.inner * cos_slices) * sin_loops);
                this.vertices.push(this.inner * sin_slices);

                this.normals.push(cos_slices * cos_loops);
                this.normals.push(cos_slices * sin_loops);
                this.normals.push(sin_slices);

                this.texCoords.push(i / this.loops);
                this.texCoords.push(j / this.slices);

            }

        }

        for ( let i = 0; i < this.slices; i ++ ) {
            let v1 = i * (this.loops + 1);
            let v2 = v1 + (this.loops + 1);
            for( let j = 0; j < this.loops; j ++ ) {
                this.indices.push(v1);
                this.indices.push(v1 + 1);
                this.indices.push(v2);
        
                this.indices.push(v2);
                this.indices.push(v1 + 1);
                this.indices.push(v2 + 1);
        
                v1 += 1;
                v2 += 1;
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