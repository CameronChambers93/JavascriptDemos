import {spatial_grid} from './SpatialHashGrid'

import {math} from './math'
let pieces = [0, 0, 0, 0]


let clock = 0;


// Color: 0 is black, 1 is white
class Piece{
    constructor(id, grid, size, direction, color, position, head, tail) {
        this.id = id;
        this.color = color;
        this.size = size;
        this.direction = direction;

        this.tags = new Map();

        this.colorNeedsUpdating = false;

        this.movement = [0, 1];
        this.head = head;
        this.tail = tail;

        this.grid = grid;
        this.position = position;
        this.client = grid.NewClient(position, [size, size], this);
        this.client.position = position;
        grid.UpdateClient(this.client);
    }

    resize(size) {
        this.size = size;
        this.client.dimensions = [size, size]
    }

    isPieceOverlapping(piece) {
        let [x1, y1] = this.position;
        let [x2, y2] = piece.position;
        let dx = x2 - x1;
        let dy = y2 - y1;
        let d = Math.sqrt(dx*dx + dy*dy);
        if (d <= this.size){
            return true;
        }
        else
            return false;
    }

    checkForCollision(direction) {
        let [x, y] = direction;
        let position = [this.position[0] + (x * (this.size / 2)), this.position[1] + (y * (this.size / 2))];
        if (position[0] < 0 || position[0] > this.grid._bounds[1][0] || position[1] < 0 || position[1] > this.grid._bounds[1][1]) {
            [x, y] = direction;
            if (x != 0) { //  Reverse x momentum
                this.direction[0] *= -1   
                return true;
            }
            else {    // Reverse y momentum
                this.direction[1] *= -1
                return true;
            }
        }
        return false;
    }

    move() {
        let [x, y] = this.direction;
        this.moveTo([this.position[0] + x, this.position[1] + y]);
        if (x > 0)
            this.checkForCollision([1, 0]);
        else
            this.checkForCollision([-1, 0]);
        if (y > 0)
            this.checkForCollision([0, 1]);
        else
            this.checkForCollision([0, -1]);
    }

    moveTo(position) {
        this.position = position;
        this.client.position = position;
        this.grid.UpdateClient(this.client);
        for (let client of this.grid.FindNear(this.position, [this.size, this.size])) {
            if (client.owner.position != this.position)
                if (this.isPieceOverlapping(client.owner)) {
                    this.tag(client.owner);
                }
        }
    }

    tag(unit) {
        if (this.tags[unit.id]) {
            if (clock - this.tags[unit.id] > 3) {
                let tmp = {id: this.id, color: this.color, position: this.position, direction: this.direction};
                this.getTagged(unit);
                unit.getTagged(tmp);
            }
        }
        else {
            let tmp = {id: this.id, color: this.color, position: this.position, direction: this.direction};
            this.getTagged(unit);
            unit.getTagged(tmp);
        }
    }

    getTagged(unit) {
        if (unit.color > this.color) {
            pieces[this.color] -= 1;
            this.color += 1;
            this.colorNeedsUpdating = true;
            pieces[this.color] += 1;
        }
        else if (unit.color < this.color) {
            pieces[this.color] -= 1;
            this.color = Math.min(this.color + 1, 3);
            this.colorNeedsUpdating = true;
            pieces[this.color] += 1;    
        }
        let direction = this.getDirectionTowardsUnit(unit);
        this.direction[0] += (direction[0] * -1);
        this.direction[1] += (direction[1] * -1);
        this.direction = math.normalize(this.direction);
        this.tags[unit.id] = clock;
    }

    getDirectionTowardsUnit(unit) {
        let from = this.position;
        let to = unit.position;
        let direction = [to[0] - from[0], to[1] - from[1]];
        direction = math.normalize(direction);
        return direction;
    }
}

class Game{
    constructor(width) {
        this.width = width;
        this.tileWidth = width / 8;
        this.grid = new spatial_grid.SpatialHash_Fast([[0, 0], [width, width]], [25, 25]);

        this.pieceAmount = 20;

        this.pieceSize = 25;
        this.pieces = null;
        this.lastPiece = null

        this.gameId = 0;
        this.pieceIdCounter = 0;

        this.initiatePieces(this.pieceAmount);

        this.shouldReset = false;
        this.gameInterval = setInterval(() => {this.gameLoop()}, Math.floor(1000 / 20));
    }

    resetGame(tickRate) {
        clearInterval(this.gameInterval);
        pieces = [0, 0, 0, 0]
        this.pieces = null;
        this.grid._Reset();
        this.initiatePieces(this.pieceAmount);
        this.gameId++;
        this.shouldReset = false;
        this.gameInterval = setInterval(() => {this.gameLoop()}, Math.floor(1000 / tickRate));
    }

    gameLoop(tickRate = 20) {
        clock++;

        if (pieces[0] == 0 && pieces[1] == 0 && pieces[2] == 0)
            this.shouldReset = true;    
        
        if (this.shouldReset)
            return this.resetGame(tickRate);
        else {
            this.executeMoves();
        }
    }

    executeMoves() {
        let piece = this.pieces;    //  head piece
        while (piece != null) {
            piece.move();
            piece = piece.tail;
        }
    }
    

    addPiece(color, size) {
        let x = Math.floor(Math.random() * this.width);
        let y = Math.floor(Math.random() * this.width);
        let piece;
        let deg = Math.random() * 2 * Math.PI;
        let direction = [Math.cos(deg), Math.sin(deg)]
        piece = new Piece(this.pieceIdCounter++, this.grid, size, direction, color, [x, y]);
        if (this.pieces == null) {
            this.pieces = piece;
            this.lastPiece = piece;
        }
        else {
            piece.tail = this.pieces;
            this.pieces.head = piece;
            this.pieces = piece;
        }
        pieces[color] += 1;
        let count = 0;
        while (count < 10) {
            let d;
            let collision = false;
            let clients = this.grid.FindNear([x, y], [size, size])
            for (const client of clients) {
                let [dx, dy] = [x - client.position[0], y - client.position[1]];
                d = Math.sqrt(dx*dx + dy*dy)
                if (d < size)
                    collision = true;
            }
            if (collision) {
                x = Math.floor(Math.random() * this.width);
                y = Math.floor(Math.random() * this.width);
                count++;
            }
            else {
                return
            }
        }
    }


    getIndexFromCoordinates(position) {
        let [x,y] = position;
        if (x < 0 || y < 0 || x > this.width || y > this.width)
            return -1
        x = Math.floor(x / this.cellSize);
        y = Math.floor(y / this.cellSize);
        return (x * 16) + y
    }

    
    getCoordinatesFromIndex(index) {
        let x = Math.floor(index / 16);
        let y = index % 16;
        return [x,y]
    }

    initiatePieces(pieceAmount) {
        this.addPiece(1, this.pieceSize);
        for (let x = 1; x < pieceAmount; x++) {
            this.addPiece(0, this.pieceSize);
        }
    }


    resize(width) {
        width = 745;
        this.width = width;
        this.tileWidth = width / 8;
        this.canvas.width = width;
        this.canvas.height = width;
    }

    
    click(position) {
        let [x, y] = position;
        console.log(this.grid.FindNear([x, y], [1, 1]));
    }

    setPieceSize(size) {
        let piece = this.pieces;
        while (piece) {
            piece.size = size;
            piece = piece.tail;
        }
        this.pieceSize = size;
    }

    addPieceFromClient(size = this.pieceSize) {
        this.addPiece(0, size);
        this.pieceAmount++;
    }

    removePieceFromClient() {
        if (this.lastPiece.head){
            pieces[this.lastPiece.color]--;
            this.grid.Remove(this.lastPiece.client);
            this.lastPiece = this.lastPiece.head;
            this.lastPiece.tail = null
            this.pieceAmount -= 1;
        }
    }

    async resetGameFromClient() {
        this.shouldReset = true;
    }
}

export default Game;