import { MyAnimation } from './MyAnimation.js';

/**
 * MyKeyframeAnimation
 * @constructor
 */
export class MyKeyframeAnimation extends MyAnimation{
	constructor(scene) {
        super(scene);
        this.currentMatrix = mat4.create();
        this.keyframes = []
        this.visible = false;
        this.currentIndex = 1;
        this.start = 0;
        this.end = 0;
	}

    getKeyframe(instant){
        return this.keyframes.find(keyframe => {return keyframe.instant === instant});
    }

    getKeyframeBounds(instant){
        let lowerBound = Math.max(...this.keyframes.filter(keyframe => keyframe.instant <= instant).map(keyframe => keyframe.instant))
        let upperBound = Math.min(...this.keyframes.filter(keyframe => keyframe.instant > instant).map(keyframe => keyframe.instant))

        return [this.getKeyframe(lowerBound), this.getKeyframe(upperBound)]
    }

    computeMatrix(transformations){
        let matrix = mat4.create();

        mat4.translate(matrix, matrix, transformations["translation"]);
        mat4.rotateZ(matrix, matrix, transformations["rotation"][2]);
        mat4.rotateY(matrix, matrix, transformations["rotation"][1]);
        mat4.rotateX(matrix, matrix, transformations["rotation"][0]);
        mat4.scale(matrix, matrix, transformations["scale"]);

        return matrix;
    }

    interpolate(M1, M2, inc){
        let interpolatedM = [], translation = [], rotation = [], scale = [];

        vec3.lerp(translation, M1.translation, M2.translation, inc);
        vec3.lerp(rotation, M1.rotation, M2.rotation, inc);
        vec3.lerp(scale, M1.scale, M2.scale, inc);

        interpolatedM["translation"] = vec3.fromValues(...translation);
        interpolatedM["rotation"] = vec3.fromValues(...rotation);
        interpolatedM["scale"] = vec3.fromValues(...scale);

        return interpolatedM;
    }

    addKeyframe(keyframe){
        this.keyframes.push(keyframe);

        if(this.keyframes.length == 1)
            this.start = this.keyframes[0]["instant"];

        this.end = keyframe["instant"];
    }

    update(t){

        if(t < this.start){
            this.visible = false;
        }
        else if (t == this.start){
            this.visible = true;
            this.currentMatrix = this.computeMatrix[this.keyframes[0]["transformations"]];
        }
        else if(t > this.start && t < this.end){
            this.visible = true;

            let bounds = this.getKeyframeBounds(t);
            let delta = (t - bounds[0]["instant"]) / (bounds[1]["instant"] - bounds[0]["instant"]);
            let interpolatedM = this.interpolate(bounds[0]["transformations"], bounds[1]["transformations"], delta);

            this.currentMatrix = this.computeMatrix(interpolatedM);
        }
        else if(t >= this.end){
            this.visible = true;
            this.currentMatrix = this.computeMatrix(this.keyframes[this.keyframes.length - 1]["transformations"]);
        }
        
        return this.currentMatrix;
    }

    isVisible(){
        return this.visible;
    }

    apply(){
        this.scene.multMatrix(this.currentMatrix)
    }
}