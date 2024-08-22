/**
 * MyAnimator
 * @constructor
 */
export class MyAnimator {
	constructor(orchestrator) {
        this.orchestrator = orchestrator;
        this.game = orchestrator.game;

        this.active = false;
        this.move = 0;

        this.inMove = false;
        this.inMoveEat = false;
        this.inMoveKing = false;
	}

    isInAnyMove(){
        return this.inMove || this.inMoveEat || this.inMoveKing; 
    }
    
    reset(){
        this.active = true;
        // reset board
        this.move = 0;
    }

    start(){
        this.active = true;
        // reset board
    }

    update(time){}

    display(){}
}