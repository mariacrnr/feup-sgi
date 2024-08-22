import { MyPiecesAnimation } from "../animation/MyPiecesAnimation.js";


/**
* MyGame
* @method constructor
 * @param id - Component's id
*/
export class MyGameMove {
    constructor(scene, pieces, tileFrom, tileTo, player, eatPiece) {
        this.scene = scene,
        this.pieces = pieces;
        this.tileFrom = tileFrom;
        this.tileTo = tileTo;
        this.player = player;
        this.eatPiece = eatPiece;
        this.start = null;
        this.storage = [];
        this.becameKing = false;

        this.resolve =  null;
        this.reject = null;
    }

    animate() {
        if(this.eatPiece !== null) {
            for(let i = 0; i < this.eatPiece.to.length; i++){
                const offsetY = this.eatPiece.piece[i].color === 'black' ?  (9 - this.eatPiece.to[i].y + this.eatPiece.to[i].x ) * this.eatPiece.from.size : ( -3 - this.eatPiece.to[i].y + this.eatPiece.to[i].x)* this.eatPiece.from.size;
                const offsetX = (7 - this.eatPiece.to[i].y -  this.eatPiece.to[i].x ) * this.eatPiece.from.size;
                this.storage.push([...this.eatPiece.to[i].middle]);
                this.storage[i][1] +=  offsetY;
                this.storage[i][0] += offsetX;
            }
        }

        this.scene.piecesAnimation = new MyPiecesAnimation(this.scene, this.pieces, this.eatPiece !== null? 
                { piece: this.eatPiece.piece, from: this.eatPiece.from.middle, to: this.storage } : null, this.eatPiece !== null ? 1.5 : 0.8, 'PIECE');

        this.start = this.scene.time;

        const from = [0, 0, 0];
        const to = [this.tileTo.middle[0] - this.tileFrom.middle[0], this.tileTo.middle[1] - this.tileFrom.middle[1], 0];
        this.scene.piecesAnimation.translationAnimation(this.start, from, to);

        this.pieces.map(piece => piece.animation = this.scene.piecesAnimation);

        let self = this;
        return new Promise(function(resolve, reject){
            self.resolve = resolve;
            self.reject  = reject;
        });

    }

    animateKing(storagePiece, tile){
        // const offset = this.eatPiece.piece[i].color === 'white' ?  (9 + this.eatPiece.to[i].x) * this.eatPiece.from.size : ( -3 + this.eatPiece.to[i].x )* this.eatPiece.from.size;
        // STILL WORKING ON THIS
        console.log(tile, this.tileTo);
        console.log('piece', storagePiece);
        console.log('ANIMATING KING');
        const offsetX = storagePiece.color === 'black' ?  (-9 - tile.x + this.tileTo.y) * this.tileTo.size : (3 - tile.x + this.tileTo.y)* this.tileTo.size;
        const offsetY = storagePiece.color === 'black' ? (7 - this.tileTo.y) * this.tileTo.size : this.tileTo.y * this.tileTo.size;


        console.log('OFFSETS', offsetX, offsetY)
        
        this.scene.piecesAnimation = new MyPiecesAnimation(this.scene, [storagePiece], null, 2.0, 'KING');

        this.start = this.scene.time;

        const from = [0, 0, 0];
        const to = [(this.tileTo.middle[0] - tile.middle[0] + offsetX), (this.tileTo.middle[1] + 2 - tile.middle[1] + offsetY), 0];
        this.scene.piecesAnimation.archAnimation(this.start, from, to);

        storagePiece.animation = this.scene.piecesAnimation;

        let self = this;
        return new Promise(function(resolve, reject){
            self.resolve = resolve;
            self.reject  = reject;
        });
    }


    animateUndo() {
        console.log("animateUndo", this);
        if(this.eatPiece !== null) {
            for(let i = 0; i < this.eatPiece.to.length; i++){
                const offset = this.eatPiece.piece[i].color === 'white' ?  (9 + this.eatPiece.to[i].x) * this.eatPiece.from.size : ( -3 + this.eatPiece.to[i].x )* this.eatPiece.from.size;
                this.storage.push([...this.eatPiece.to[i].middle]);
                this.storage[i][0] +=  offset;
            }
        }

        this.scene.piecesAnimation = new MyPiecesAnimation(this.scene, this.pieces, this.eatPiece !== null? 
            { piece: this.eatPiece.piece, from: this.eatPiece.to.middle, to: this.storage } : null, this.eatPiece !== null ? 1.5 : 0.8, 'PIECE');

        this.start = this.scene.time;

        const from = [0, 0, 0];
        const to = [this.tileFrom.middle[0] - this.tileTo.middle[0], this.tileFrom.middle[1] - this.tileTo.middle[1], 0];
        this.scene.piecesAnimation.translationAnimation(this.start, from, to);

        this.pieces.map(piece => piece.animation = this.scene.piecesAnimation);

        let self = this;
        return new Promise(function(resolve, reject){
            self.resolve = resolve;
            self.reject  = reject;
        });
    }

    update(t){
        if(this.start == null) return 
        const timeElapsed = t - this.start;
        
        if(this.scene.piecesAnimation && timeElapsed >= this.scene.piecesAnimation.ANIM_TIME){
            let resolve = this.resolve;
            if(resolve !== null){
                resolve({});
                this.resolve = null;
                this.reject  = null;
            }
        }
    }
}