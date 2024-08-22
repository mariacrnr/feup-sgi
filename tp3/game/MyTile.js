import { MyRectangle } from "../components/MyRectangle.js";
import { CGFappearance } from '../../lib/CGF.js';
import * as utils from "./utils.js";

/**
* MyTile
* @method constructor
 * @param id - Component's id
*/
export class MyTile {
    constructor(scene, id, piece, color, offset, size = 5) {
        this.scene = scene;
        this.size = size;
        this.tileId = id;
        this.pieceId = piece;
        this.color = color;
        this.x = id[0];
        this.material = new CGFappearance(this.scene);
        this.y = utils.getNumber(id[1]) - 10;
        this.middle = [this.x * size + size / 2, this.y * size + size / 2];
        this.index = (id[1].charCodeAt(0) - 97) + (id[0] * offset[0]) + offset[1];
        this.tile = new MyRectangle(scene, id, (this.x * size), (this.x * size) + size, (this.y * size), (this.y * size) + size);
        this.selected = false;
        this.possibleMove = false;
    }

    removePiece(piece) {
        this.pieceId.splice(this.pieceId.indexOf(piece), 1);
    }

    addPiece(piece) {
        this.pieceId.push(piece);
    }

    parseColor(color) {
        switch (color) {
            case "white":
                return [1, 1, 0.6, 1];
            case "black":
                return [0.4, 0.2, 0, 1];
            case "pink":
                return [1, 0, 0, 0.1];
            case "green":
                return [0, 1, 1, 0.1];
            case 'emission':
                return [0, 0, 0, 1];
            default:
                return [0.5, 0.5, 0.5, 1];
        }
    }

    createMaterial(color) {
        this.material.setEmission(...this.parseColor('emission'));
        this.material.setAmbient(...this.parseColor('ambient'));
        this.material.setDiffuse(...this.parseColor(color));
        this.material.setSpecular(...this.parseColor(color));
        this.material.setShininess(10.0);
    }

    display() {

        this.scene.registerForPick(this.index, this)
        
        if(this.selected){
            this.createMaterial("pink");
        } else if (this.possibleMove) {
            this.createMaterial("green");
        } else {
            this.createMaterial(this.color);
        }

        this.material.apply();
        this.tile.display();

        this.scene.clearPickRegistration();
    }
}