import { CGFtexture } from "../../lib/CGF.js";

export class MySpriteSheet {
    /**
     * Constructor
     * @param {XMLscene} scene 
     * @param {string} texture path to the texture
     * @param {int} sizeM number of rows
     * @param {int} sizeN number of columns
     */
    constructor(scene, texture, sizeM, sizeN) {
        this.scene = scene;

        this.texture = new CGFtexture(scene, texture);
        
        this.sizeM = sizeM;
        this.sizeN = sizeN;
        this.stepM = 1 / sizeM;
        this.stepN = 1 / sizeN;
    }

     /**
     * Set the current active shader to the sprite one
     */
     activateShader() {
        this.scene.setActiveShaderSimple(this.scene.textShader);
        this.texture.bind(0);
        this.scene.textShader.setUniformsValues({ stepM : this.stepM, stepN : this.stepN, uSampler: 0 });
    }

    /**
     * Sets the active sprite cell
     * @param {int} M row
     * @param {int} N column
     */
    activateCellMN(M, N) {
        this.scene.textShader.setUniformsValues({ M : M,  N : N });   
    }

    /**
     * Sets the active sprite cell
     * @param {int} p cell number
     */
    activateCellp(p) {
        this.activateCellMN(p % this.sizeM, Math.floor(p / this.sizeM));
    }
}