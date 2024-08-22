import { CGFobject } from '../lib/CGF.js';
/**
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of triangle in X
 * @param y - Scale of triangle in Y
 */
export class MyTriangle extends CGFobject {
	constructor(scene, id, x1, x2, x3, y1, y2, y3, z1, z2, z3) {
		super(scene);
		this.x1 = x1;
		this.x2 = x2;
		this.x3 = x3;
		this.y1 = y1;
		this.y2 = y2;
		this.y3 = y3;
		this.z1 = z1;
		this.z2 = z2;
		this.z3 = z3;

		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [
			this.x1, this.y1, this.z1,	//0
			this.x2, this.y2, this.z2,	//1
			this.x3, this.y3, this.z3,	//2
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			2, 1, 0,
		];

		//Facing Z positive
		this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];
		
		// Distance calculation between vertices
		this.a = Math.sqrt(Math.pow(this.x2 - this.x1, 2) + Math.pow(this.y2 - this.y1, 2));

		this.b = Math.sqrt(Math.pow(this.x3 - this.x2, 2) + Math.pow(this.y3- this.y2, 2));

		this.c = Math.sqrt(Math.pow(this.x1 - this.x3, 2) + Math.pow(this.y1 - this.y3, 2));
		
		// Internal angle calculation for α
		this.cosAlph = (Math.pow(this.a, 2) - Math.pow(this.b, 2) + Math.pow(this.c, 2)) / (2 * this.a * this.c);
		this.sinAlph = Math.sqrt(1 - Math.pow(this.cosAlph, 2));

		/*
		Texture coords (s,t)
		+----------> s
        |
        |
		|
		v
        t
        */
		this.texCoords = [
			0, 0,
			this.a, 0,
			this.c*this.cosAlph, this.c*this.sinAlph
		]
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} scale - Array of scale factors for s and t coordinates
	 */
	updateTexCoords(scale) {
		var s = scale[0]; 
		var t = scale[1];

		this.texCoords = [
			0, 0,
			this.a / s, 0,
			this.c*this.cosAlph / s, this.c*this.sinAlph / t
		];
		this.updateTexCoordsGLBuffers();
	}
}

