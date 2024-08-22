import { MyCylinder } from '../components/MyCylinder.js';
import { CGFappearance } from '../../lib/CGF.js';
/**
* MyPiece
* @method constructor
 * @param id - Component's id
*/
export class MyPiece {
    constructor(scene, id, color, tileId) {
        this.scene = scene;
        this.id = id;
        this.piece = new MyCylinder(scene, id, 1.5, 1.5, 2, 20, 30);
        this.color = color;
        this.tileId = tileId;
        this.createMaterial(color);
        this.selected = false;
        this.isTopKing = false;
        this.animation = null;
        this.x = null;
        this.y = null;
        this.kingMate = null;
    }

    setKingMate (pieceID) {
        this.kingMate = pieceID;
    }

    removeKing () {
        this.kingMate = null;
        this.isTopKing = false;
        this.material.setEmission(...this.parseColor(this.color));
        this.material.setAmbient(...this.parseColor(this.color));
        this.material.setDiffuse(...this.parseColor(this.color));
        this.material.setSpecular(...this.parseColor(this.color));
        this.material.setShininess(10.0);
    }

    setPlayedOnce() {
        this.playedOnce = true;
    }

    unsetPlayedOnce() {
        this.playedOnce = false;
    }

    addTile(tileId) {
        this.tileId = tileId;
    }

    removeTile() {
        this.tileId = null;
    }

    parseColor(color) {
        switch (color) {
            case "white":
                return [1, 1, 1, 0.8];
            case "black":
                return [0, 0, 0, 1];
            case "pink":
                return [1, 0, 0, 0.8];
            case 'emission':
                return [0, 0, 0, 1];
            case 'ambient':
                return [0.1, 0.1, 0.1, 1];
            default:
                return [1, 1, 1, 1];
        }
    }

    createMaterial(color) {
        this.material = new CGFappearance(this.scene);
        this.material.setEmission(...this.parseColor('emission'));
        this.material.setAmbient(...this.parseColor('ambient'));
        if (this.isTopKing && !this.selected) {
            this.material.setDiffuse(...this.parseColor('white'));
            this.material.setSpecular(...this.parseColor('white'));
        }
        else {
            this.material.setDiffuse(...this.parseColor(color));
            this.material.setSpecular(...this.parseColor(color));
        }
        this.material.setShininess(10.0);
    }


    setCoodinates(x, y) {
        this.x = x;
        this.y = y;
    }

    setTopKing() {
        this.isTopKing = true;
        this.createMaterial("white");
    }

    display() {

        this.scene.registerForPick(this.id, this)

        if(this.selected) this.createMaterial("pink");
        else this.createMaterial(this.color);

        var transfMatrix = mat4.create();
        this.scene.pushMatrix();

        if (this.isTopKing) {
            this.scene.multMatrix(mat4.translate(transfMatrix, transfMatrix, [this.x,this.y, 2]));
            if (!this.selected) {
                if (this.color === 'white') this.material.setTexture(this.piece.kingTextureWhite);
                else this.material.setTexture(this.piece.kingTextureBlack);
                this.material.setTextureWrap('REPEAT', 'REPEAT');
            }
        }
        else this.scene.multMatrix(mat4.translate(transfMatrix, transfMatrix, [this.x,this.y, 0]));
        
        this.material.apply();

        if(this.animation != null)
            this.animation.apply();
        this.piece.display();

        this.scene.popMatrix();

        this.scene.clearPickRegistration();
    }
}