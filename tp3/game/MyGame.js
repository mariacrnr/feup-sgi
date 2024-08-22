import { MyBoard } from "./MyBoard.js";
import { MyPlayer } from "./MyPlayer.js";
import { MyGameMove } from "./MyGameMove.js";
import * as utils from "./utils.js";
/**
* MyGame
* @method constructor
 * @param id - Component's id
*/
export class MyGame {
    constructor(scene) {
        this.scene = scene;
        this.mainBoard = new MyBoard(scene, [8, 8], false, null, [8, 24]);
        this.blackStorage = new MyBoard(scene, [2, 8], true, 'black', [6,88]); // white player
        this.whiteStorage = new MyBoard(scene, [2, 8], true, 'white', [6,100]); // black player
        this.players = [new MyPlayer('white', 'Beatriz'), new MyPlayer('black', 'Maria')];
        this.numPieces = this.mainBoard.pieces.length;
        this.turn = this.players[1];
        this.moves = [];
        this.currentMove = null;
        this.time = 0;
        this.timisup = false;
        this.timeleft = '2:00';
    }

    // ALREADY WORKING, RETURNS THE POSSIBLE MOVES FOR A PIECE, IF CAPTURE, EAT FIELD EXISTS IN MOVE
    // ESTAVA A PENSAR QUE O JOGADOR SELECIONA E DEPOIS FAZ A CLASSE GAMEMOVE
    // TESTADO
    possibleMoves(row, col) {
        const opponent = this.players.filter(player => player !== this.turn)[0];
        const currentTile = this.mainBoard.getTile(row, col);
        const moves = [];
        [1, -1].forEach((rowChange) => {
            if (currentTile.pieceId.length < 2 && this.turn.color === 'white' && rowChange !== 1) {
                return;
            } else if (currentTile.pieceId.length < 2 && this.turn.color === 'black' && rowChange !== -1) {
                return;
            }
            const possibleRow = row + rowChange;
            if (possibleRow < 0 || possibleRow > 7) return;
            [1, -1].forEach((colChange) => {
                const number = utils.addNumberToString(col, colChange);
                if (number < 0 || number > 7) return;
                let tile = this.mainBoard.getTile(possibleRow, number);
                if (tile) {
                    if (!tile.pieceId.length) {
                        tile.selectable = true;
                        moves.push({
                            pos: [possibleRow, number],
                        });
                    } else {
                        if (this.mainBoard.getPieceColor(tile.pieceId[0]) === opponent.color) {
                            const number_2 = utils.addNumberToString(col, colChange * 2);
                            if (number_2 < 0 || number_2 > 7) return;
                            if (possibleRow + rowChange < 0 || possibleRow + rowChange > 7) return;
                            tile = this.mainBoard.getTile(possibleRow + rowChange, number_2);
                            if (tile && !tile.pieceId.length) {
                                tile.selectable = true;
                                moves.push({
                                    pos: [possibleRow + rowChange, number_2],
                                    eat: [possibleRow, number],
                                });
                            }
                        }
                    }
                }
            });
        });
        return moves;
    }

    async createMove(row, col, move) {
        let fromTile = this.mainBoard.getTile(row, col);
        let toTile = this.mainBoard.getTile(move.pos[0], move.pos[1]);
        const pieceID = fromTile.pieceId;
        const eatTile = move.eat ? this.mainBoard.getTile(move.eat[0], move.eat[1]) : null;
        const eatPiece = move.eat ? eatTile.pieceId.map(id => this.mainBoard.getPieceByID(id)) : null;
        const movedPieces = pieceID.map(id => this.mainBoard.getPieceByID(id));
        const storage = this.turn.color !== 'white' ? this.blackStorage : this.whiteStorage;
        const eatPositionsDestination = move.eat? storage.returnEmptyTilePos(eatPiece[0].kingMate != null): storage.returnEmptyTilePos(false);

        // add move
        this.currentMove = new MyGameMove(this.scene, movedPieces, fromTile, toTile, this.turn, 
            move.eat ? {from: eatTile, to: eatPositionsDestination.map(dest => storage.getTile(dest[0], dest[1])) , piece: eatPiece}: null);

        this.moves.push({move: this.currentMove});
        await this.makeMove(this.currentMove, this.turn);
    }

    // RECEBE O MOVE FEITO ACIMA E SELECIONADO PELO USER
    async makeMove(move, player) {
        const pieceID = move.tileFrom.pieceId[0];
        const eatTile = move.eatPiece ? move.eatPiece.from : null;
        const eatPiece = move.eatPiece ? move.eatPiece.piece : null;
        const storage = this.turn.color !== 'white' ? this.blackStorage : this.whiteStorage;
        const eatPositionsDestination = move.eatPiece ? move.eatPiece.to : null;
        const makeKing = (!move.pieces[0].kingMate && this.mainBoard.checkIfKing(move.tileTo.tileId[0], pieceID))
        if (makeKing) this.scene.gameOrchestrator.animator.inMoveKing = true;

        // animate move
        await move.animate();
        if(eatPiece != null) eatPiece.map(piece => piece.animation = null);
        move.pieces.map(piece => piece.animation = null);

        // add points
        if (move.eatPiece) this.addPoints(eatPositionsDestination, eatTile, storage);

        // remove piece from previous tile and add to new one
        this.mainBoard.removePieceFromTile(move.tileFrom, pieceID);
        this.mainBoard.addPieceToTile(pieceID, move.tileTo);
        if (move.pieces[0].kingMate) {
            this.mainBoard.removePieceFromTile(move.tileFrom, move.pieces[0].kingMate);
            this.mainBoard.addPieceToTile(move.pieces[0].kingMate, move.tileTo);
        }

        // make king
        if (makeKing) {
            const opponent = this.players.filter(p => p.color !== player.color)[0]
            const storage = opponent.color === 'white' ? this.whiteStorage : this.blackStorage;
            const storagePiece = storage.returnRemovedPieceFromStorage();
            
            if(storagePiece !== null){
                await move.animateKing(storagePiece, storage.getTile(storagePiece.tileId[0], storagePiece.tileId[1]));
                storagePiece.animation = null;
            } else this.scene.gameOrchestrator.animator.inMoveKing = false;

            const newPiece = storage.removePieceFromBoard('storage', this.numPieces);
            this.updateStorages();
            newPiece.setTopKing();
            this.mainBoard.addPieceToBoard(newPiece);
            this.mainBoard.addPieceToTile(newPiece.id, move.tileTo);
            move.pieces[0].setKingMate(newPiece.id);
            newPiece.setKingMate(move.pieces[0].id);

            move.becameKing = true;
        }
    }

    // removes piece from tile and adds to storage
    addPoints(destTiles, eatTile, storage) {
        const eatedId = [...eatTile.pieceId];
        for (let i = 0; i < eatedId.length; i++) {
            this.mainBoard.removePieceFromTile(eatTile, eatedId[i]);
            const eatedPiece = this.mainBoard.removePieceFromBoard(eatedId[i]);
            if (eatedPiece.kingMate) eatedPiece.removeKing();
            storage.addPieceToBoard(eatedPiece);
            storage.addPieceToTile(eatedPiece.id, destTiles[i]);
            this.updateStorages();
        }
    }

    changePlayer() {        
        this.turn = this.turn == this.players[0] ? this.players[1] : this.players[0];

        this.changeCamera();
    }

    changeCamera() {
        let camera = '';
        if(this.turn.color == 'white') camera = 'whitePlayer';
        else camera = 'blackPlayer';

        this.scene.updateCamera(camera);
        this.lastCamera = camera;
    }


    async revertMove() {
        if (!this.moves.length) return;
        const move = this.moves.pop().move;

        if(move.becameKing){
            const storage = this.turn.color === 'white' ? this.whiteStorage : this.blackStorage;
            const storageTile = storage.returnEmptyTilePos(false);

            this.mainBoard.getTile(0,'a');
            this.mainBoard.removePieceFromTile(move.tileTo, move.pieces[0].kingMate);
            const kingTop = this.mainBoard.removePieceFromBoard(move.pieces[0].kingMate);

            storage.addPieceToBoard(kingTop);
            storage.addPieceToTile(move.pieces[0].kingMate, storage.getTile(storageTile[0][0], storageTile[0][1]));

            kingTop.removeKing();
            move.pieces[0].removeKing();
        }

        this.turn = move.player;
        this.changeCamera();
        this.mainBoard.removePieceFromTile(move.tileTo, move.pieces[0].id);
        this.mainBoard.addPieceToTile(move.pieces[0].id, move.tileFrom);
        if (move.pieces[0].kingMate) {
            this.mainBoard.removePieceFromTile(move.tileTo, move.pieces[0].kingMate);
            this.mainBoard.addPieceToTile(move.pieces[0].kingMate, move.tileFrom);
        }

        if (move.eatPiece) {
            const storage = this.turn.color === 'white' ? this.whiteStorage : this.blackStorage;
            for(let i = 0; i < move.eatPiece.piece.length; i++){
                storage.removePieceFromTile(move.eatPiece.to[i], move.eatPiece.piece[i].id);
                const eatedPiece = storage.removePieceFromBoard(move.eatPiece.piece[i].id);
                this.mainBoard.addPieceToBoard(eatedPiece);
                this.mainBoard.addPieceToTile(move.eatPiece.piece[i].id, move.eatPiece.from);
            }
            this.updateStorages();
        }

        this.numPieces = this.mainBoard.pieces.length;
    }

    // check if end game
    checkEndGame() {
        if (!this.checkPiecesLeft()) return false;
        for (let i = 0; i < this.mainBoard.size[0]; i++) {
            for (let j = 0; j < this.mainBoard.size[1]; j++) {
                const tile = this.mainBoard.getTile(i, (j+10).toString(36));
                if (tile.pieceId.length) {
                    const piece = this.mainBoard.getPieceByID(tile.pieceId[0]);
                    if (piece.color === this.turn.color) {
                        if (this.possibleMoves(i, (j+10).toString(36)).length > 0) return true;
                    }
                }
            }
        }
        return false;
    }

    checkPiecesLeft() {
        let white = 0;
        let black = 0;
        for (let i = 0; i < this.mainBoard.size[0]; i++) {
            for (let j = 0; j < this.mainBoard.size[1]; j++) {
                const tile = this.mainBoard.getTile(i, (j+10).toString(36));
                if (tile.pieceId.length) {
                    const piece = this.mainBoard.getPieceByID(tile.pieceId[0]);
                    if (piece.color === 'white') white++;
                    else black++;
                }
            }
        }
        if (white === 0 || black === 0) {
            return false;
        }
        return true;
    }

    winner() {
        if (this.whiteStorage.pieces.length > this.blackStorage.pieces.length) {
            return this.players[0];
        } else if (this.blackStorage.pieces.length > this.whiteStorage.pieces.length) {
            return this.players[1];
        } else {
            return null;
        }
    }

    display() {
        this.mainBoard.display();
        this.blackStorage.display();
        this.whiteStorage.display();
    }

    replay() {
        //nao sei se pode ser por tar a igualr e js não cria copias
        this.tempMainBoard = this.mainBoard;
        this.tempBlackStorage = this.blackStorage;
        this.tempWhiteStorage = this.whiteStorage;
        this.tempTurn = this.turn;
        this.tempNumPieces = this.numPieces;
        this.mainBoard = new MyBoard(this.scene, [8, 8], false, null, [8, 24]);
        this.blackStorage = new MyBoard(this.scene, [2, 8], true, 'black', [6,88]); // white player
        this.whiteStorage = new MyBoard(this.scene, [2, 8], true, 'white', [6,100]); // black player
        this.moves.forEach(move => {
            console.log(move);
            utils.sleep(10000).then(()=> {
                console.log('sleep', move);
                console.log(this.mainBoard)
                this.makeMove(move.move, this.turn).then(() => {
                    this.changePlayer();
                    this.display();
                });
            });
        });
        this.mainBoard = this.tempMainBoard;
        this.blackStorage = this.blackStorage;
        this.whiteStorage = this.whiteStorage;
        this.turn = this.tempTurn;
        this.numPieces = this.tempNumPieces;
    }

    updateStorages() {
        this.players.map(player => {
            const storage = player.color === 'white' ? this.whiteStorage : this.blackStorage;
            player.addPoints(storage.pieces.length);
            const getText = player.color === 'white' ? 'player2Points' : 'player1Points';
            this.scene.gameOrchestrator.gamePanel.buttons.get(getText).setButtonText(player.points);
        });
    }

}