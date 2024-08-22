import { MyTile } from "./MyTile.js";
import { MyPiece } from "./MyPiece.js";

/**
 * MyBoard
 * @method constructor
 */
export class MyBoard { // tem que ser sempre 8*8
    constructor(scene, size, storage, color, offset) {
        this.scene = scene;
        this.tiles = [];
        this.pieces = [];
        this.storage = storage;
        this.color = color;
        this.size = size;
        this.offset = offset;
        for (var i = 0; i < size[0]; i++) {
            this.tiles[i] = [];
        }

        if (!this.storage) this.initPieces();
        this.initTiles();
    }

    initTiles() {
        let pieceId = 0;
        for (let i = 0; i < this.size[0]; i++) {
            for (let j = 0; j < this.size[1]; j++) {
                if ((i + j) % 2) {
                    this.tiles[i][(j+10).toString(36)] = new MyTile(this.scene, [i,(j+10).toString(36)], [], "white", this.offset);
                } else { 
                    if (i === 3 || i === 4 || this.storage) this.tiles[i][(j+10).toString(36)] = new MyTile(this.scene, [i,(j+10).toString(36)], [], "black", this.offset);
                    else {
                        this.tiles[i][(j+10).toString(36)] = new MyTile(this.scene, [i,(j+10).toString(36)], [pieceId], "black", this.offset);
                        this.pieces[pieceId].tileId = [i,(j+10).toString(36)];
                        pieceId++;
                    }
                }
            }
        }
    }

    initTilesEndGameTest() {
        let pieceId = 0;
        for (let i = 0; i < this.size[0]; i++) {
            for (let j = 0; j < this.size[1]; j++) {
                if ((i + j) % 2) {
                    this.tiles[i][(j+10).toString(36)] = new MyTile(this.scene, [i,(j+10).toString(36)], [], "white", this.offset);
                } else { 
                    if (i === 1 || i === 2 || this.storage) this.tiles[i][(j+10).toString(36)] = new MyTile(this.scene, [i,(j+10).toString(36)], [], "black", this.offset);
                    else if (pieceId < 4) {
                        this.tiles[i][(j+10).toString(36)] = new MyTile(this.scene, [i,(j+10).toString(36)], [pieceId], "black", this.offset);
                        this.pieces[pieceId].tileId = [i,(j+10).toString(36)];
                        pieceId++;
                    }
                }
            }
        }
    }

    initPiecesEndGameTest() {
        for (let i = 0; i < 4; i++) {
            if (i < 2) {
                this.pieces[i] = new MyPiece(this.scene, i, "white");
            } else {
                this.pieces[i] = new MyPiece(this.scene, i, "black");
                this.pieces[i].selectable = true;
            }
        }
    }

    initPieces() {
        for (let i = 0; i < 24; i++) {
            if (i < 12) {
                this.pieces[i] = new MyPiece(this.scene, i, "white");
            } else {
                this.pieces[i] = new MyPiece(this.scene, i, "black");
                this.pieces[i].selectable = true;
            }
        }
    }

    getPieceColor(id) {
        return this.getPieceByID(id).color;
    }

    getTile(row, col) {
        return this.tiles[row][col];
    }

    getCopyTile(row, col) {
        let oldTile = this.tiles[row][col];
        return new MyTile(this.scene, [...oldTile.tileId], [...oldTile.pieceId], oldTile.color, this.offset);
    }

    removePieceFromTile(tile, piece) {
        this.tiles[tile.tileId[0]][tile.tileId[1]].removePiece(piece);
        this.getPieceByID(piece).removeTile();
    }

    getPieceFromTile(tile) {
        return this.getPieceByID(tile.pieceId);
    }

    addPieceToTile(piece, tile) {
        this.tiles[tile.tileId[0]][tile.tileId[1]].addPiece(piece);
        this.getPieceByID(piece).addTile(tile.tileId);
    }

    returnEmptyTilePos(king) {
        let count = 0;
        const emptyPos = [];
        for (let i = 0; i < this.size[0]; i++) {
            for (let j = 0; j < this.size[1]; j++) {
                if (!this.tiles[i][(j+10).toString(36)].pieceId.length) {
                    if (king) {
                        emptyPos.push([i,(j+10).toString(36)]);
                        count++;
                        if (count === 2) return emptyPos;
                    } else {
                        return [[i,(j+10).toString(36)]];
                    }
                }
            }
        }
    }

    returnRemovedPieceFromStorage(){
        if (this.pieces.length > 0) return this.pieces[this.pieces.length - 1];
        else return null;
    }

    removePieceFromBoard(id, numPieces) {
        if (id === 'storage') {
            let removedPiece;
            if (!this.pieces.length) {
                removedPiece = new MyPiece(this.scene, numPieces, this.color === 'white' ? 'black' : 'white');
                numPieces++;
            } else {
                removedPiece = this.pieces[this.pieces.length - 1];
                this.removePieceFromTile(this.tiles[removedPiece.tileId[0]][removedPiece.tileId[1]], removedPiece.id);
                this.pieces.pop();
            }
            return removedPiece;
        }
        else {
            const removedPiece = [...this.pieces.filter(piece => piece.id === id)][0];
            this.pieces = this.pieces.filter(piece => piece.id !== id);
            return removedPiece;
        }
    }

    addPieceToBoard(piece) {
        this.pieces.push(piece);
    }

    getPieceByID(id) {
        return this.pieces.filter(piece => piece.id === id)[0];
    }

    getCopyPieceByID(id) {
        const oldPiece = this.pieces.filter(piece => piece.id === id)[0];
        return new MyPiece(this.scene, id, this.getPieceByID(id).color, oldPiece.tileId);        
    }

    display() {
        var transfMatrix = mat4.create();
        this.scene.pushMatrix();
        var storageRotate = [ //x
            Math.cos(270* Math.PI / 180), 0, Math.sin(270* Math.PI / 180), 0,
            0, 1, 0, 0,
            -Math.sin(270* Math.PI / 180), 0, Math.cos(270 * Math.PI / 180), 0,
            0, 0, 0, 1
        ];
        var boardRotate = [ //y
            1, 0, 0, 0,
            0, Math.cos(90 * Math.PI / 180), -Math.sin(90 * Math.PI / 180), 0,
            0, Math.sin(90 * Math.PI / 180), Math.cos(90 * Math.PI / 180), 0,
            0, 0, 0, 1
        ];
        var boardScale= [
            0.2,0,0,0,
            0,0.2,0,0,
            0,0,0.2,0,           
            0,0,0,1            
        ];
        this.scene.multMatrix(boardScale);
        if (this.color === 'white') {
            this.scene.multMatrix(storageRotate);
            this.scene.multMatrix(mat4.translate(transfMatrix, transfMatrix, [-12*5, 18.6, 6*5]));
        }
        else if (this.color === 'black') {
            this.scene.multMatrix(storageRotate);
            this.scene.multMatrix(mat4.translate(transfMatrix, transfMatrix, [-24*5, 18.6, 6*5]));
        }
        else this.scene.multMatrix(mat4.translate(transfMatrix, transfMatrix, [-2*5, 18.6, 105]));
        this.scene.multMatrix(boardRotate);
        for (let i = 0; i < this.size[0]; i++) {
            for (let j = 0; j < this.size[1]; j++) {
                const tile = this.getTile(i, (j+10).toString(36));
                tile.display();
                tile.pieceId.forEach(id => {
                    this.getPieceByID(id).setCoodinates(tile.middle[0], tile.middle[1]);
                    this.getPieceByID(id).display();
                });
            }
        }
        this.scene.popMatrix();
    }

    checkIfKing(row, pieceID) {
        const piece = this.getPieceByID(pieceID)
        if (piece.color === "white") {
            if (row === 7) {
                return true;
            }
        } else {
            if (row === 0) {
                return true;
            }
        }
        return false;
    }
}