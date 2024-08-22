import { MyAnimation } from './MyAnimation.js';

/**
 * MyPiecesAnimation
 * @constructor
 */
export class MyPiecesAnimation extends MyAnimation{
	constructor(scene, pieces, eatPiece, animTime, type) {
        super(scene);
        console.log(this.scene)
        this.currentMatrix = mat4.create();
        this.keyframes = []
        this.visible = false;
        this.currentIndex = 1;
        this.start = 0;
        this.end = 0;
        this.pieces = pieces;
        this.eatPiece = eatPiece; 
        this.position = null;
        this.type = type;
        this.collided = false;

        this.ANIM_TIME = animTime;
	}

    updateInMove(value){
        if(this.type == 'PIECE') this.scene.gameOrchestrator.animator.inMove = value;
        else if (this.type == 'KING') this.scene.gameOrchestrator.animator.inMoveKing = value;
        else if (this.type == 'EAT') this.scene.gameOrchestrator.animator.inMoveEat = value;
    }

    translationAnimation(start, from, to){
        console.log("translationAnimation", start, from, to);
        const keyframe = [], keyframe1 = [];
        keyframe["instant"] = start;
        keyframe["position"] = vec3.fromValues(...from);
        this.addKeyframe(keyframe);

        keyframe1["instant"] = start + this.ANIM_TIME;
        keyframe1["position"] = vec3.fromValues(...to);
        this.addKeyframe(keyframe1);
    }

    archAnimation(start, from, to){
        const keyframe = [], keyframe2 = [];
        let keyframe1 = [], height = 0;

        keyframe["instant"] = start;
        keyframe["position"] = vec3.fromValues(...from);
        this.addKeyframe(keyframe);

        for(let i = 2; i < 6; i++){
            keyframe1["instant"] = start + (i-1) * this.ANIM_TIME/7;

            if(i == 3 || i == 5) height = 5;
            else if(i == 4) height = 7;
            else height = 3;

            keyframe1["position"] = vec3.fromValues(...[(i-1) * to[0]/7, (i-1) * to[1]/7, height]);
            this.addKeyframe(keyframe1);

            keyframe1 = [];
        }

        keyframe2["instant"] = start + this.ANIM_TIME;
        keyframe2["position"] = vec3.fromValues(...to);
        this.addKeyframe(keyframe2);
    }

    checkCollisions(){
        const distance = Math.sqrt(Math.pow(this.position[0][0] - this.eatPiece.from[0], 2) + Math.pow(this.position[0][1] - this.eatPiece.from[1], 2));
        if(distance < (this.pieces[0].piece.base)*2) return true;
        else return false;
    }

    getKeyframe(instant){
        return this.keyframes.find(keyframe => {return keyframe.instant === instant});
    }

    getKeyframeBounds(instant){
        let lowerBound = Math.max(...this.keyframes.filter(keyframe => keyframe.instant <= instant).map(keyframe => keyframe.instant))
        let upperBound = Math.min(...this.keyframes.filter(keyframe => keyframe.instant > instant).map(keyframe => keyframe.instant))

        return [this.getKeyframe(lowerBound), this.getKeyframe(upperBound)]
    }

    interpolate(V1, V2, inc){

        let translation = [];
        let matrix = mat4.create();

        vec3.lerp(translation, V1, V2, inc);

        let auxPosition = [];
        for(let i = 0; i < this.pieces.length; i++)
            auxPosition.push([this.pieces[i].x + translation[0], this.pieces[i].y + translation[1]]);
        this.position = auxPosition;

        mat4.translate(matrix, matrix, translation);

        return matrix;
    }

    computeMatrix(translation){
        let matrix = mat4.create();
        mat4.translate(matrix, matrix, translation);
        return matrix;
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
            if(this.type != 'KING') this.updateInMove(false);
        }
        else if (t == this.start){
            this.visible = true;
            this.updateInMove(true);
            this.currentMatrix = this.computeMatrix(this.keyframes[0]["position"]);
        }
        else if(t > this.start && t < this.end){
            this.visible = true;
            this.updateInMove(true);

            let bounds = this.getKeyframeBounds(t);
            let delta = (t - bounds[0]["instant"]) / (bounds[1]["instant"] - bounds[0]["instant"]);
            this.interpolated = this.interpolate(bounds[0]["position"], bounds[1]["position"], delta);

            this.currentMatrix = this.interpolated;

            if(this.eatPiece != null && this.checkCollisions() && !this.collided){
                this.collided = true;

                for(let i = 0; i < this.eatPiece.piece.length; i++){
                    console.log('PIECE',this.eatPiece.piece)
                    console.log('TO', this.eatPiece.to)
                    const EAT_ANIM_TIME = 2;

                    this.scene.eatAnimation[i] = new MyPiecesAnimation(this.scene, this.eatPiece.piece[i], null, EAT_ANIM_TIME, 'EAT');

                    const from = [0, 0, 0];
                    const to = [this.eatPiece.to[i][0] - this.eatPiece.from[0], this.eatPiece.to[i][1] - this.eatPiece.from[1], 0];
                    this.scene.eatAnimation[i].archAnimation(t, from, to);

                    if(this.type == 'PIECE') this.ANIM_TIME += EAT_ANIM_TIME;

                    this.eatPiece.piece[i].animation = this.scene.eatAnimation[i];
                }
            }
        }
        else if(t == this.end){
            this.visible = true;
            this.updateInMove(true);
            this.currentMatrix = this.computeMatrix(this.keyframes[this.keyframes.length - 1]["position"]);
        }
        else {
            this.visible = true;
            this.updateInMove(false);
            this.collided = false;
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