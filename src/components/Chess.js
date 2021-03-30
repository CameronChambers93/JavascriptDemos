import blackKing from '../assets/black_king.png'
import blackQueen from '../assets/black_queen.png'
import blackRook from '../assets/black_rook.png'
import blackBishop from '../assets/black_bishop.png'
import blackKnight from '../assets/black_knight.png'
import blackPawn from '../assets/black_pawn.png'
import whiteKing from '../assets/white_king.png'
import whiteQueen from '../assets/white_queen.png'
import whiteRook from '../assets/white_rook.png'
import whiteBishop from '../assets/white_bishop.png'
import whiteKnight from '../assets/white_knight.png'
import whitePawn from '../assets/white_pawn.png'


const pieces = {
    'black_king': blackKing,
    'black_queen': blackQueen,
    'black_rook': blackRook,
    'black_bishop': blackBishop,
    'black_knight': blackKnight,
    'black_pawn': blackPawn,
    'white_king': whiteKing,
    'white_queen': whiteQueen,
    'white_rook': whiteRook,
    'white_bishop': whiteBishop,
    'white_knight': whiteKnight,
    'white_pawn': whitePawn
}

// Color: 0 is black, 1 is white
class Piece{
    constructor(name, color, index, extendedMovement) {
        this.color = color;
        this.index = index;
        this.image = new Image();
        this.image.src = pieces[name];
        this.movements = []
        this.extendedMovement = extendedMovement
    }

    moveTo(index) {
        this.index = index;
    }
}

class Pawn extends Piece {
    constructor(color, index) {
        if (color) {
            super('white_pawn', color, index, false);
            this.direction = -1
        }
        else {
            super('black_pawn', color, index, false);
            this.direction = 1
        }
        this.hasMoved = false;
    }

    get movements() {
        if (this.hasMoved)
            return [1 * this.direction]
        else
            return [1 * this.direction, 2 * this.direction]
    }

    set movements(moves) {
        return moves
    }

    moveTo(index) {
        this.hasMoved = true;
        this.index = index;
    }
}

class King extends Piece {
    constructor(color, index) {
        if (color) {
            super('white_king', color, index, false);
            this.hasMoved = false;
        }
        else {
            super('black_king', color, index, false);
            this.hasMoved = false;
        }
        this.movements = [-1, 1, -16, 16, -17, -15, 15, 17]
    }

    moveTo(index) {
        this.hasMoved = true;
        this.index = index;
    }
}

class Bishop extends Piece {
    constructor(color, index) {
        if (color)
            super('white_bishop', color, index, true);
        else
            super('black_bishop', color, index, true);
        this.movements = [-17, -15, 15, 17]
    }
}

class Rook extends Piece {
    constructor(color, index) {
        if (color) {
            super('white_rook', color, index, true);
            this.hasMoved = false;
        }
        else {
            super('black_rook', color, index, true);
            this.hasMoved = false;
        }
        this.movements = [-1, 1, -16, 16]
    }

    moveTo(index) {
        this.hasMoved = true;
        this.index = index;
    }
}

class Knight extends Piece {
    constructor(color, index) {
        if (color)
            super('white_knight', color, index, false);
        else
            super('black_knight', color, index, false);
        this.movements = [18, -18, 33, -33, 14, -14, 31, -31]
    }
}

class Queen extends Piece {
    constructor(color, index) {
        if (color)
            super('white_queen', color, index, true);
        else
            super('black_queen', color, index, true);
        this.movements = [-1, 1, -16, 16, -17, -15, 15, 17]
    }
}

class Game{
    constructor(width) {
        this.canvas = document.getElementById('chess')
        this.width = width;
        this.tileWidth = width / 8;

        this.tiles = {};
        this.playerTurn = 0;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                this.tiles[(i * 16) + j] = null
            }
        }
        this.tileSelected = -1;
        this.lastMovement = [0, 0]
        this.playerInCheck = false;
        this.whiteKing;
        this.blackKing;
        this.drawBoard();
        this.initiatePieces();
    }

    fillTile(index, color) {
        let x = Math.floor(index / 16);
        let y = index % 16;
        let ctx = this.canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(x*this.tileWidth, y*this.tileWidth, this.tileWidth, this.tileWidth);
    }

    markTileAsAvailable(index) {
        this.fillTile(index, '#ffff00')
    }

    resetTile(index) {
        let x = Math.floor(index / 16);
        let y = index % 16;
        if ((x + y) % 2 == 0)
            this.fillTile(index, '#ffffff');
        else
            this.fillTile(index, '#000000');
    }

    // Selects the piece at location 'index' to be moved
    // Will mark available movements to be colored as such during next render
    selectTileForMovement(index) {
        this.tileSelected = index;
        this.availableMoves = this.getAvailableMovements(index);
    }

    updateCheckStatus() {
        if (this.isKingInCheck())
            this.playerInCheck = true;
        else
            this.playerInCheck = false;
    }

    isKingInCheck() {
        let king;
        if (this.playerTurn) {    // White player's turn
            king = this.whiteKing;
        }
        else {
            king = this.blackKing;
        }
        let index = king.index;
        
        let lPawnTestIndex = index - 16 + (this.playerTurn ? -1 : 1)
        let rPawnTestIndex = index + 16 + (this.playerTurn ? -1 : 1)
        if (this.tiles[lPawnTestIndex])
            if (this.tiles[lPawnTestIndex].color != this.playerTurn)
                if (this.tiles[lPawnTestIndex].constructor.name == 'Pawn')
                    return true
        if (this.tiles[rPawnTestIndex])
            if (this.tiles[rPawnTestIndex].color != this.playerTurn)
                if (this.tiles[rPawnTestIndex].constructor.name == 'Pawn')
                    return true
        let knightMovements = [18, -18, 33, -33, 14, -14, 31, -31];
        for (const move of knightMovements) {
            if (this.tiles[index + move]) {
                if (this.tiles[index + move].color != this.playerTurn)
                    if (this.tiles[index + move].constructor.name == 'Knight') {
                        return true
                    }
            }
        }
        let directions = [-17, -16, -15, -1, 1, 15, 16, 17];
        for (const direction of directions) {
            let cIndex = index + direction;
            while (cIndex in this.tiles)
                if (!this.tiles[cIndex])
                    cIndex += direction
                else if (this.tiles[cIndex].color == this.playerTurn)
                    cIndex = -1
                else
                    if (this.tiles[cIndex].extendedMovement) {
                        if (this.tiles[cIndex].movements.indexOf(direction) != -1)
                            return true
                        else
                            cIndex = -1
                    }
                    else
                        cIndex = -1
        }
        return false;
    }

    // -1 if tile contains current player's piece
    // 0 if tile is empty
    // 1 if tile contains opponents piece
    checkTileStatus(index) {
        if (this.tiles[index]) {
            if (this.tiles[index].color == this.playerTurn)
                return -1
            else
                return 1
        }
        else {
            return 0
        }
    }

    isMovementValid(index) {
        if (index < 0)
            return -1
        let tileStatus = this.checkTileStatus(index);
        let oldIndex = this.tileSelected;
        if (tileStatus == -1)   // Player's own piece occupies the space
            return -1
        let tmpTile = this.tiles[index];
        this.tiles[oldIndex].index = index;
        this.tiles[index] = this.tiles[oldIndex];
        this.tiles[oldIndex] = null
        let illegalMove = this.isKingInCheck();
        this.tiles[oldIndex] = this.tiles[index];
        this.tiles[oldIndex].index = oldIndex;
        this.tiles[index] = tmpTile;
        if (illegalMove)
            return -1
        else
            return tileStatus
    }

    getEnPassantMovements(index) {
        if (this.tiles[this.lastMovement[1]].constructor.name == 'Pawn') {
            if (this.lastMovement[1] == (index - 16) || this.lastMovement[1] == (index + 16)) {
                if (Math.abs(this.lastMovement[1] - this.lastMovement[0]) == 2)
                    return [{index: this.lastMovement[1] + this.tiles[index].direction, enPassant: true, killIndex: this.lastMovement[1]}]
            }
        }
        return []
    }

    getAvailablePawnMovements(index) {
        let moves = [];
        moves.push(...this.getEnPassantMovements(index));
        let direction = this.tiles[index].direction;
        if (this.isMovementValid(index + direction) == 0) 
            moves.push({index: index + direction})
        if (this.checkTileStatus(index + direction) == 0 && this.tiles[index].hasMoved == false && this.isMovementValid(index + (2 * direction)) == 0)
            moves.push({index: index + (2 * direction)});
        if (this.isMovementValid(index - 16 + direction) == 1)
            moves.push({index: index - 16 + direction});
        if (this.isMovementValid(index + 16 + direction) == 1)
            moves.push({index: index + 16 + direction})
        return moves
    }

    getAvailableKingMovements(index) {
        if (this.playerInCheck)
            return []
        let moves = []
        if (this.tiles[index].hasMoved == false) {
            moves.push(...this.checkLeftCastling(index))
            moves.push(...this.checkRightCastling(index))
        }
        return moves
    }

    checkLeftCastling(index) {
        if (!this.tiles[index - 16])
            if (!this.tiles[index - 32])
                if (!this.tiles[index - 48])
                    return [{index: index - 32, castle: true, rookFromIndex: index - 64, rookToIndex: index - 16}]
        return []
    }

    checkRightCastling(index) {
        if (!this.tiles[index + 16]) {
            if (!this.tiles[index + 32])
                return [{index: index + 32, castle: true, rookFromIndex: index + 48, rookToIndex: index + 16}]
        }
        return []
    }

    getAvailableMovements(index) {
        if (this.tiles[index].constructor.name == 'Pawn')
            return this.getAvailablePawnMovements(index)
        else {
            let moves = [];
            if (this.tiles[index].constructor.name == 'King')
                moves.push(...this.getAvailableKingMovements(index))    
            for (const move of this.tiles[index].movements) {
                let newIndex = index + move;
                if (this.checkTileStatus(newIndex) == 0) {
                    if (this.isMovementValid(newIndex) == 0)
                        moves.push({index: newIndex});
                    newIndex += move;
                    if (this.tiles[index].extendedMovement) {
                        while (newIndex in this.tiles) {
                            console.log(newIndex)
                            if (this.isMovementValid(newIndex) == 0) {
                                moves.push({index: newIndex});
                                newIndex += move;
                            }
                            else if (this.isMovementValid(newIndex) == 1) {
                                moves.push({index: newIndex});
                                newIndex = -1;
                            }
                            else {
                                if (this.checkTileStatus(newIndex) == -1)
                                    newIndex = -1;
                                else
                                    newIndex += move;
                            }
                        }
                    }
                }
                else if (this.isMovementValid(newIndex) == 1)
                    moves.push({index: newIndex});
            }
            return moves
        }
    }

    deselect() {
        this.tileSelected = -1;
        this.availableMoves = [];
    }

    click(index) {
        if (this.tileSelected == -1) {
            if (this.tiles[index]) {
                if (this.tiles[index].color == this.playerTurn)
                    this.selectTileForMovement(index);
            }
        }
        else {
            let moveIndex = this.availableMoves.map((e) => {return e.index}).indexOf(index)
            if (moveIndex != -1) {
                this.executeMove(this.availableMoves[moveIndex])
                this.playerTurn = (this.playerTurn + 1) % 2;
            }
            this.deselect();
        }
        this.updateCheckStatus();
        this.drawBoard();
        this.drawPieces();
    }

    executeMove(move) {
        if (move.castle) {
            this.tiles[move.rookFromIndex].moveTo(move.rookToIndex);
            this.tiles[move.rookToIndex] = this.tiles[move.rookFromIndex];
            this.tiles[move.rookFromIndex] = null;
        }
        if (move.enPassant) {
            this.tiles[move.killIndex] = null;
        }
        this.moveToIndex(move.index);
    }

    moveToIndex(index) {
        this.lastMovement = [this.tileSelected, index]
        this.tiles[this.tileSelected].moveTo(index);
        this.tiles[index] = this.tiles[this.tileSelected];
        this.tiles[this.tileSelected] = null;
    }

    getCoordinatesFromIndex(index) {
        let x = Math.floor(index / 16);
        let y = index % 16;
        return [x,y]
    }

    drawBoard() {
        let tileWidth = this.width / 8;
        let ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.width, this.width);
        ctx.fillStyle = "#000000";
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                if ((x + y) % 2 == 1) {     // Tile is black
                    ctx.fillRect(x*tileWidth, y*tileWidth, tileWidth, tileWidth);
                }
            }
        }

        if (this.tileSelected != -1) {
            ctx.fillStyle = "#fff000";
            let [x1, y1] = this.getCoordinatesFromIndex(this.tileSelected);
            ctx.fillRect(x1*this.tileWidth, y1*this.tileWidth, this.tileWidth, this.tileWidth);
            for (const index of this.availableMoves.map((e) => {return e.index})) {
                ctx.fillStyle = "#20ff00";
                let [x2, y2] = this.getCoordinatesFromIndex(index);
                ctx.fillRect(x2*this.tileWidth, y2*this.tileWidth, this.tileWidth, this.tileWidth);
            }
        }
    }



    drawPieces() {
        let ctx = this.canvas.getContext('2d');
        for (const piece of Object.values(this.tiles)) {
            if (piece != null) {
                let x = Math.floor(piece.index / 16) * this.tileWidth;
                let y = (piece.index % 16) * this.tileWidth;
                ctx.drawImage(piece.image, x, y, this.tileWidth, this.tileWidth)
            }
        }
    }

    addPiece(pType, color, index) {
        let piece;
        if (pType == 'PAWN')
            piece = new Pawn(color, index);
        else if (pType == 'ROOK')
            piece = new Rook(color, index)
        else if (pType == 'BISHOP')
            piece = new Bishop(color, index)
        else if (pType == 'KNIGHT')
            piece = new Knight(color, index)
        else if (pType == 'KING') {
            piece = new King(color, index)
            if (color)  // color == white
                this.whiteKing = piece;
            else
                this.blackKing = piece;
        }
        else
            piece = new Queen(color, index)
        this.tiles[index] = piece;
    }


    initiatePieces() {

        this.addPiece('PAWN', 0, 1);
        this.addPiece('PAWN', 0, 1);
        this.addPiece('PAWN', 0, 17);
        this.addPiece('PAWN', 0, 33);
        this.addPiece('PAWN', 0, 49);
        this.addPiece('PAWN', 0, 65);
        this.addPiece('PAWN', 0, 81);
        this.addPiece('PAWN', 0, 97);
        this.addPiece('PAWN', 0, 113);

        this.addPiece('PAWN', 1, 6);
        this.addPiece('PAWN', 1, 22);
        this.addPiece('PAWN', 1, 38);
        this.addPiece('PAWN', 1, 54);
        this.addPiece('PAWN', 1, 70);
        this.addPiece('PAWN', 1, 86);
        this.addPiece('PAWN', 1, 102);
        this.addPiece('PAWN', 1, 118);

        
        this.addPiece('ROOK', 0, 0);
        this.addPiece('ROOK', 0, 112);
        this.addPiece('BISHOP', 0, 32);
        this.addPiece('BISHOP', 0, 80);
        this.addPiece('KNIGHT', 0, 16);
        this.addPiece('KNIGHT', 0, 96);
        this.addPiece('KING', 0, 64);
        this.addPiece('QUEEN', 0, 48);

        this.addPiece('ROOK', 1, 7);
        this.addPiece('ROOK', 1, 119);
        this.addPiece('BISHOP', 1, 39);
        this.addPiece('BISHOP', 1, 87);
        this.addPiece('KNIGHT', 1, 23);
        this.addPiece('KNIGHT', 1, 103);
        this.addPiece('KING', 1, 71);
        this.addPiece('QUEEN', 1, 55);

        this.drawPieces();
    }


    resize(width) {
        this.width = width;
        this.tileWidth = width / 8;
        this.canvas.width = width;
        this.canvas.height = width;
        this.drawBoard();
        this.drawPieces();
    }

    resetGame() {
        this.tiles = {};
        this.playerTurn = 0;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                this.tiles[(i * 16) + j] = null
            }
        }
        this.tileSelected = -1;
        this.lastMovement = [0, 0]
        this.playerInCheck = false;
        this.whiteKing;
        this.blackKing;
        this.initiatePieces();
        this.drawBoard();
        this.drawPieces();
    }
}

export default Game