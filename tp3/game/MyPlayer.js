/**
* MyPlayer
* @method constructor
*/
export class MyPlayer {
    constructor(color, name, camera) {
        this.color = color;
        this.name = name;
        this.points = 0;
        this.camera = camera;
    }

    addPoints(points) {
        this.points = points;
    }
}