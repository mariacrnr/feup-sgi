import { MyAnimator } from "../animation/MyAnimator.js";
import { MyGamePanel } from "../components/MyGamePanel.js";
import { MySceneParser } from "../MySceneParser.js";
import { MyGame } from './MyGame.js';
import { MyPiece } from "./MyPiece.js";
import { MyTile } from "./MyTile.js";

/* 
Game orchestration
• Manages the entire game:
• Load of new scenes
• Manage gameplay (game states and interrupting game states)
• Manages undo
• Manages movie play
• Manage object selection
*/

/**
* MyOrchestrator
* @method constructor
 * @param id - Component's id
*/
export class MyOrchestrator {
    constructor(filename, scene){
        this.scene = scene;
        this.scene.gameOrchestrator = this;
        this.game = new MyGame(this.scene);
        this.animator = new MyAnimator(this);
        this.sceneParser = new MySceneParser(this.scene);
        this.theme = this.sceneParser.currentScene;
        this.gameState = 'INITIAL';
        this.currentPiece = null;
        this.currentMove = null;
        this.possibleMoves = [];
        this.gamePanel = new MyGamePanel(this.scene, this);
        this.lastCamera = null;
        this.winner = null;
    }

    countDown(game){
        var myfunc = setInterval(function() {
            var now = new Date().getTime();
            var timeleft = game.time - now;
                
            var minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((timeleft % (1000 * 60)) / 1000);
            game.timeleft = minutes + ":" + seconds;
            if (timeleft < 0) {
                clearInterval(myfunc);
                game.timeisup = true;
            }
        }, 1000);
    }
    async gameplay() {
        switch (this.gameState) {
            case 'INITIAL':
                if (!this.gamePanel.kingWarning) {
                    this.gamePanel.setWarnings(this.game.turn);
                    this.gamePanel.setWarningText(3);
                }
                if(this.scene.allParsed){
                    if (this.start) {
                    this.scene.updateCamera('blackPlayer');
                    this.lastCamera = 'blackPlayer';
                    this.game.time = new Date().getTime();
                    this.game.time = new Date(this.game.time + (2 * 60 * 1000));
                    this.gameState = 'CHOOSE_PIECE';
                }
                }
                break;

            case 'CHOOSE_PIECE':
                if (!this.gamePanel.kingWarning) {
                    this.gamePanel.setWarnings(this.game.turn);
                    this.gamePanel.setWarningText(2);
                }
                this.unselectPossibleMoves();
                if (this.game.timeisup) {
                    this.gameState = 'CHANGE_TURN';
                    break;
                }
                this.countDown(this.game);
                this.gamePanel.setTimer(this.game.timeleft);
                this.currentPiece = this.game.mainBoard.pieces.filter(piece => piece.selected)[0];
                if(this.currentPiece !== undefined) this.gameState = 'CHOOSE_MOVE';
                break;
            
            case 'CHOOSE_MOVE':
                if ((this.game.timeisup && !this.currentPiece) || (this.game.timeisup && this.currentPiece && !this.currentPiece.kingMate && !this.currentPiece.playedOnce)) {
                    this.gameState = 'FINAL';
                    break;
                } else if (this.game.timeisup && this.currentPiece && this.currentPiece.kingMate && this.currentPiece.playedOnce) {
                    this.gameState = 'CHANGE_TURN';
                    break;
                }
                this.countDown(this.game);
                this.gamePanel.setTimer(this.game.timeleft);
                if (!this.gamePanel.kingWarning) {
                    this.gamePanel.setWarnings(this.game.turn);
                    this.gamePanel.setWarningText(0);
                }
                // choose another piece
                if(!this.currentPiece.selected) {
                    this.gameState = 'CHOOSE_PIECE';
                    break;
                }
                
                // check possible moves (will only return 0 1 or 2 possibilities)
                this.unselectPossibleMoves();
                this.possibleMoves = this.game.possibleMoves(this.currentPiece.tileId[0], this.currentPiece.tileId[1]);
                if(this.possibleMoves.length == 0){
                    this.currentPiece.selected = false;
                    this.gameState = 'CHOOSE_PIECE';
                }

                if (this.possibleMoves.length !== 0 && !this.game.mainBoard.tiles[this.possibleMoves[0].pos[0]][this.possibleMoves[0].pos[1]].possibleMove) {
                    this.selectPossibleMoves();
                }                    
                this.currentMove = this.possibleMoves.filter(move => this.game.mainBoard.tiles[move.pos[0]][move.pos[1]].selected)[0];
                if(this.currentMove !== undefined) {
                    this.unselectPossibleMoves();
                    this.gameState = 'MAKE_MOVE';
                }
                break;

            case 'MAKE_MOVE':
                // make the move
                this.gamePanel.showWarning = false;
                this.unselectPossibleMoves();
                if(this.currentPiece.tileId != null){
                    this.currentPiece.selected = false;
                    if(this.currentPiece.kingMate != null) {
                        if (!this.currentPiece.playedOnce) {
                            this.currentPiece.setPlayedOnce();
                            this.gamePanel.setWarningText(1);
                            this.game.mainBoard.getPieceByID(this.currentPiece.kingMate).setPlayedOnce();
                        } else {
                            this.gamePanel.setWarningText(1);
                        }
                        this.game.mainBoard.getPieceByID(this.currentPiece.kingMate).selected = false;
                    }
                    this.gameState = 'WAITING';
                    await this.game.createMove(this.currentPiece.tileId[0], this.currentPiece.tileId[1], this.currentMove);
                }
                break;

            case 'WAITING':
                this.unselectPossibleMoves();
                if(!this.animator.isInAnyMove()){
                    this.game.mainBoard.tiles[this.currentMove.pos[0]][this.currentMove.pos[1]].selected = false;
                    const playedPiece = this.game.moves[this.game.moves.length - 1].move.pieces[0];
                    if (playedPiece.kingMate !== null) {
                        if (this.currentPiece.playedOnce) {
                            playedPiece.selected = true;
                            this.game.mainBoard.getPieceByID(playedPiece.kingMate).selected = true;
                            this.gameState = 'CHOOSE_MOVE';
                            break;
                        }
                    }
                    this.gamePanel.kingWarning = false;
                    this.gameState = 'CHANGE_TURN';
                } 
                break;

            case 'CHANGE_TURN':
                this.unselectPossibleMoves();
                this.game.changePlayer();
                if (this.currentPiece)  console.log(this.currentPiece)
                // console(this.game.timeisup, this.currentPiece, !this.currentPiece.kingMate, !this.currentPiece.playedOnce)
                if ((this.game.timeisup && !this.currentPiece) || (this.game.timeisup && this.currentPiece && !this.currentPiece.kingMate && !this.currentPiece.playedOnce)) {
                    this.gameState = 'FINAL';
                    break;
                }
                if (!this.game.checkEndGame()) this.gameState = 'FINAL';
                else this.gameState = 'CHOOSE_PIECE';
                this.game.time = new Date().getTime();
                this.game.time = new Date(this.game.time + (2 * 60 * 1000));
                break;

            case 'FINAL':
                this.gamePanel.showWarning = false;
                if (this.game.timeisup) {
                    this.winner = this.game.turn;
                } else this.winner = this.game.winner();
                console.log('game ended, winner: ', this.winner)
                this.gameState = 'FINAL MENU';
                break;

            case 'FINAL MENU':
                // this.gamePanel.displayWinner(this.winner);
                break;
            
            default:
                this.gameState = 'UNKNOWN';
                break;
        }
    }

    passTurn(){
        this.gameState = 'CHANGE_TURN';
        this.unselectPossibleMoves();
        this.currentPiece.selected = false;
        this.game.mainBoard.getPieceByID(this.currentPiece.kingMate).selected = false;
    }

    managePick(pickMode, pickResults) {
		if (pickMode == false && !this.animator.isInAnyMove()) {
			if (pickResults != null && pickResults.length > 0) {
				for (var i=0; i< pickResults.length; i++) {
					var pickedComponent = pickResults[i][0];
					if (pickedComponent) {
						var customId = pickResults[i][1];				
                        this.onComponentSelected(pickedComponent, customId)
					}
				}
				pickResults.splice(0, pickResults.length);
			}		
		}
	}

    resetGame(){
        this.game = new MyGame(this.scene);
        this.animator = new MyAnimator(this);
        this.theme = this.sceneParser.currentScene;
        this.gamePanel.reset();
        this.gameState = 'INITIAL';
        this.currentPiece = null;
        this.currentMove = null;
        this.possibleMoves = [];
        this.lastCamera = null;
        this.winner = null;
    }        

    async undoMove(){
        console.log('undo move');
        await this.game.revertMove();
    }

    unselectPossibleMoves(){
        for (let i = 0; i < this.game.mainBoard.size[0]; i++) {
            for (let j = 0; j < this.game.mainBoard.size[1]; j++) {
                this.game.mainBoard.tiles[i][(j+10).toString(36)].possibleMove = false;
            }
        }
    }

    selectPossibleMoves(){
        this.possibleMoves.forEach(move => {
            this.game.mainBoard.tiles[move.pos[0]][move.pos[1]].possibleMove = true;
        });
    }

    onComponentSelected(component, id){
        if (component instanceof MyPiece) {
            if (this.currentPiece && this.currentPiece.kingMate && this.currentPiece.playedOnce) {
                return;
            }
            if(this.gameState == 'CHOOSE_PIECE' && component.color == this.game.turn.color && this.game.mainBoard.getPieceByID(id)){
                component.selected = true;
                if(component.kingMate != null) this.game.mainBoard.getPieceByID(component.kingMate).selected = true;
            }
            if(this.gameState == 'CHOOSE_MOVE' && component.selected) {
                this.unselectPossibleMoves();
                component.selected = false;
                if(component.kingMate != null) this.game.mainBoard.getPieceByID(component.kingMate).selected = false;
            }
            console.log("Sou peça: Picked object: " + component + ", with pick id " + id);
        }
        else if (component instanceof MyTile) {
            if(this.gameState == 'CHOOSE_MOVE' && this.possibleMoves.some(move => component.tileId[0] == move.pos[0] && component.tileId[1] == move.pos[1])) {
                this.unselectPossibleMoves();
                component.selected = true;
            }
            console.log("Sou tile: Picked object: " + component + ", with pick id " + id);
        }
    }

    getScene(){
        return this.scene; 
    }

    displayMenu(){
        this.gamePanel.displayMenu();
    }

    displayWinner(){
        this.gamePanel.displayWinner(this.winner);
    }

    update(time){
        this.theme.update(time);
        this.animator.update(time);
        this.countDown(this.game);
        if(this.game.currentMove !== null) this.game.currentMove.update(time);
    }

    display(){
        this.theme.display();
        this.game.display();
        this.animator.display();
    }
}