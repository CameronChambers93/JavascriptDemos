import {spatial_grid} from './SpatialHashGrid'

import {math} from './math'
let pieces = [0, 0, 0, 0]


let clock = 0;
let tickRate = 20;

// Color: 0 is black, 1 is white
class Piece{
    constructor(id, grid, size, direction, color, position, head, tail) {
        this.id = id;
        this.color = color;
        this.size = size;
        this.direction = direction;

        this.tags = new Map();

        this.colorNeedsUpdating = false;

        this.movement = [0, 1, 0];
        this.head = head;
        this.tail = tail;

        this.grid = grid;
        this.position = position;
        this.client = grid.NewClient(position, [size, size, size], this);

        this.client.position = position;

        grid.UpdateClient(this.client);
    }

    resize(size) {
        this.size = size;
        this.client.dimensions = [size, size, size]
    }

    isPieceOverlapping(piece) {
        let [x1, y1, z1] = this.position;
        let [x2, y2, z2] = piece.position;
        let dx = x2 - x1;
        let dy = y2 - y1;
        let dz = z2 - z1;
        let d = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (d <= this.size){
            return true;
        }
        else
            return false;
    }

    checkForCollision(direction) {
        let [x, y, z] = direction;
        let position = [this.position[0] + (x * (this.size / 2)), this.position[1] + (y * (this.size / 2)), this.position[2] + (z * (this.size / 2))];
        if (position[0] < 0 || position[0] > this.grid._bounds[1][0] || position[1] < 0 || position[1] > this.grid._bounds[1][1]
            || position[2] < 0 || position[2] > this.grid._bounds[1][2]) {
            [x, y, z] = direction;
            if (x != 0) { //  Reverse x momentum
                this.direction[0] *= -1;  
                return true;
            }
            else if (y != 0) {    // Reverse y momentum
                this.direction[1] *= -1;
                return true;
            }
            else {  // Reverse z momentum
                this.direction[2] *= -1;
                return true;
            }
        }
        return false;
    }

    move() {
        let [x, y, z] = this.direction;
        this.moveTo([this.position[0] + x, this.position[1] + y, this.position[2] + z]);
        if (x > 0)
            this.checkForCollision([1, 0, 0]);
        else
            this.checkForCollision([-1, 0, 0]);
        if (y > 0)
            this.checkForCollision([0, 1, 0]);
        else
            this.checkForCollision([0, -1, 0]);
        if (z > 0)
            this.checkForCollision([0, 0, 1]);
        else
            this.checkForCollision([0, 0, -1]);
        
    }

    moveTo(position) {
        this.position = position;
        this.client.position = position;
        this.grid.UpdateClient(this.client);
        for (let client of this.grid.FindNear(this.position, [this.size/2, this.size/2, this.size/2])) {
            if (client.owner.id != this.id)
                if (this.isPieceOverlapping(client.owner)) {
                    this.tag(client.owner);
                }
        }
    }

    tag(unit) {
        let tmp = {id: this.id, color: this.color, position: this.position, direction: this.direction};
        this.getTagged(unit);
        unit.getTagged(tmp);
    }

    getTagged(unit) {
        if (!this.tags[unit.id])
            this.tags[unit.id] = 0;
        if (clock - this.tags[unit.id] > 3) {
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
        }
        let direction = this.getDirectionTowardsUnit(unit);
        this.direction[0] += (direction[0] * -1);
        this.direction[1] += (direction[1] * -1);
        this.direction[2] += (direction[2] * -1);
        this.direction = math.normalize(this.direction);
        this.tags[unit.id] = clock;
    }

    getDirectionTowardsUnit(unit) {
        let from = this.position;
        let to = unit.position;
        let direction = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
        direction = math.normalize(direction);
        return direction;
    }
}

class Game{
    constructor(width) {
        this.width = width;
        this.tileWidth = width / 8;
        this.grid = new spatial_grid.SpatialHash_3D([[0, 0, 0], [width, width, width]], [25, 25, 25]);

        this.pieceAmount = 20;

        this.pieceSize = 25;
        this.pieces = null;
        this.lastPiece = null

        this.gameId = 0;
        this.pieceIdCounter = 0;

        this.initiatePieces(this.pieceAmount);

        this.shouldReset = false;
        this.gameInterval = setInterval(() => {this.gameLoop()}, Math.floor(1000 / tickRate));
    }

    resetGame() {
        clearInterval(this.gameInterval);
        pieces = [0, 0, 0, 0]
        this.pieces = null;
        this.grid._Reset();
        this.initiatePieces(this.pieceAmount);
        this.gameId++;
        this.shouldReset = false;
        this.gameInterval = setInterval(() => {this.gameLoop()}, Math.floor(1000 / tickRate));
    }

    gameLoop() {
        clock++;

        if (pieces[0] == 0 && pieces[1] == 0 && pieces[2] == 0)
            this.shouldReset = true;    
        
        if (this.shouldReset)
            return this.resetGame();
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
        let z = Math.floor(Math.random() * this.width);
        let piece;
        let deg = Math.random() * 2 * Math.PI;
        let direction = [Math.cos(deg), Math.sin(deg), Math.tan(deg) % 1]
        piece = new Piece(this.pieceIdCounter++, this.grid, size, direction, color, [x, y, z]);
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
            let clients = this.grid.FindNear([x, y, z], [size, size, size])
            for (const client of clients) {
                let [dx, dy, dz] = [x - client.position[0], y - client.position[1], z - client.position[2]];
                d = Math.sqrt(dx*dx + dy*dy + dz*dz)
                if (d < size)
                    collision = true;
            }
            if (collision) {
                x = Math.floor(Math.random() * this.width);
                y = Math.floor(Math.random() * this.width);
                z = Math.floor(Math.random() * this.width);
                count++;
            }
            else {
                return
            }
        }
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

    stop() {
        let piece = this.pieces;
        let tail;
        while (piece) {
            tail = piece.tail;
            piece = {}
            piece = tail;
        }
        clearInterval(this.gameInterval);
        delete this;
    }
}

export default Game;