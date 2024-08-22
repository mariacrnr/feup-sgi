import { CGFobject, CGFnurbsSurface, CGFnurbsObject } from '../lib/CGF.js';

/**
 * MyPatch
 * @constructor
 * @param scene - Reference to MyScene object
 * @param degreeU - Degree in U direction
 * @param degreeV - Degree in V direction
 * @param partsU - Number of Vertices in U direction
 * @param partsV - Number of Vertices in V direction
 * @param controlPoints - Control Points of the curve
 */
export class MyPatch {
	constructor(scene, degreeU, degreeV, partsU, partsV, controlPoints) {
        this.scene = scene;
        this.degreeU = degreeU;
        this.degreeV = degreeV;
        this.partsU = partsU;
        this.partsV = partsV;
        this.controlPoints = controlPoints;

        this.initBuffers();
	}

    initBuffers(){
        this.surface = new CGFnurbsSurface(this.degreeU, this.degreeV, this.controlPoints);
        this.patch = new CGFnurbsObject(this.scene, this.partsU, this.partsV, this.surface);
    }

    /**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the patch
	 * @param {Array} scale - Array of scale factors for s and t coordinates
	 */
	updateTexCoords(scale) {
        return null
    }

    display(){
        this.patch.display()
    }
}