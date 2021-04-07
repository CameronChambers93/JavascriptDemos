import {math} from './math'

class SpatialHashGrid {
    constructor(bounds, dimensions) {
        this._bounds = bounds;
        this._dimensions = dimensions;
        this._cells = new Map();
    }

    NewClient(position, dimensions, owner) {
        const client = {
            position: position,
            dimensions: dimensions,
            indices: null,
            owner: owner
        };

        this._Insert(client);

        return client;
    }

    _Reset() {
        this._cells = new Map();
    }

    _Insert(client) {
        const [x, y] = client.position;
        const [w,h] = client.dimensions;

        const i1 = this._GetCellIndex([x - w / 2, y - h / 2]);
        const i2 = this._GetCellIndex([x + w / 2, y + h / 2]);

        client.indices = [i1, i2];

        for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
            for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
                const k = this._Key(x, y);
                
                if (!(k in this._cells)) {
                    this._cells[k] = new Set();
                }

                this._cells[k].add(client);
            }
        }
    }

    _Key(x, y) {
        return x + '.' + y;
    }

    _GetCellIndex(position) {
        const x = math.sat((position[0] - this._bounds[0][0]) / (
            this._bounds[1][0] - this._bounds[0][0]));
        const y = math.sat((position[1] - this._bounds[0][1]) / (
            this._bounds[1][1] - this._bounds[0][1]));
    
        const xIndex = Math.floor(x * (this._dimensions[0] - 1));
        const yIndex = Math.floor(y * (this._dimensions[1] - 1));
        return [xIndex, yIndex];
        }

    FindNear(position, bounds) {
        const [x, y] = position;
        const [w, h] = bounds;

        const i1 = this._GetCellIndex([x - w / 2, y - h / 2]);
        const i2 = this._GetCellIndex([x + w / 2, y + h / 2]);

        const clients = new Set();

        for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
            for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
                const k = this._Key(x, y);

                if (k in this._cells) {
                    for (let v of this._cells[k]) {
                        clients.add(v);
                    }
                }
            }
        }
        return clients;
    }

    UpdateClient(client) {
        this.RemoveClient(client);
        this._Insert(client);
    }

    RemoveClient(client) {
        const [i1, i2] = client.indices;

        for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
            for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
                const k = this._Key(x, y);

                this._cells[k].delete(client);
            }
        }
    }

    isLocationValid(coords) {
        let [x, y] = coords;
        if (x >= this._bounds[0][0] && x <= this._bounds[1][0])
            if (y >= this._bounds[0][1] && y <= this._bounds[1][1])
                return true;
        return false;
    }
}

class SpatialHashGridFast {
    constructor(bounds, dimensions) {
      const [x, y] = dimensions;
      this._cells = [...Array(x)].map(() => [...Array(y)].map(() => (null)));
      this._dimensions = dimensions;
      this._bounds = bounds;
      this._queryIds = 0;
    }
  
    _GetCellIndex(position) {
      const x = math.sat((position[0] - this._bounds[0][0]) / (
          this._bounds[1][0] - this._bounds[0][0]));
      const y = math.sat((position[1] - this._bounds[0][1]) / (
          this._bounds[1][1] - this._bounds[0][1]));
  
      const xIndex = Math.floor(x * (this._dimensions[0] - 1));
      const yIndex = Math.floor(y * (this._dimensions[1] - 1));
  
      return [xIndex, yIndex];
    }
  
    NewClient(position, dimensions, owner) {
      const client = {
        position: position,
        dimensions: dimensions,
        _cells: {
          min: null,
          max: null,
          nodes: null,
        },
        _queryId: -1,
        owner: owner
      };
  
      this._Insert(client);
  
      return client;
    }
  
    UpdateClient(client) {
      const [x, y] = client.position;
      const [w, h] = client.dimensions;
  
      const i1 = this._GetCellIndex([x - w / 2, y - h / 2]);
      const i2 = this._GetCellIndex([x + w / 2, y + h / 2]);
  
      if (client._cells.min[0] == i1[0] &&
          client._cells.min[1] == i1[1] &&
          client._cells.max[0] == i2[0] &&
          client._cells.max[1] == i2[1]) {
        return;
      }
  
      this.Remove(client);
      this._Insert(client);
    }
  
    FindNear(position, bounds) {
      const [x, y] = position;
      const [w, h] = bounds;
  
      const i1 = this._GetCellIndex([x - w / 2, y - h / 2]);
      const i2 = this._GetCellIndex([x + w / 2, y + h / 2]);
  
      const clients = [];
      const queryId = this._queryIds++;
  
      for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
        for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
          let head = this._cells[x][y];
  
          while (head) {
            const v = head.client;
            head = head.next;
  
            if (v._queryId != queryId) {
              v._queryId = queryId;
              clients.push(v);
            }
          }
        }
      }
      return clients;
    }
  
    _Insert(client) {
      const [x, y] = client.position;
      const [w, h] = client.dimensions;
  
      const i1 = this._GetCellIndex([x - w / 2, y - h / 2]);
      const i2 = this._GetCellIndex([x + w / 2, y + h / 2]);
  
      const nodes = [];
  
      for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
        nodes.push([]);
  
        for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
          const xi = x - i1[0];
  
          const head = {
            next: null,
            prev: null,
            client: client,
          };
  
          nodes[xi].push(head);
  
          head.next = this._cells[x][y];
          if (this._cells[x][y]) {
            this._cells[x][y].prev = head;
          }
  
          this._cells[x][y] = head;
        }
      }
  
      client._cells.min = i1;
      client._cells.max = i2;
      client._cells.nodes = nodes;
    }
  
    Remove(client) {
      const i1 = client._cells.min;
      const i2 = client._cells.max;
  
      for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
        for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
          const xi = x - i1[0];
          const yi = y - i1[1];
          const node = client._cells.nodes[xi][yi];
  
          if (node.next) {
            node.next.prev = node.prev;
          }
          if (node.prev) {
            node.prev.next = node.next;
          }
  
          if (!node.prev) {
            this._cells[x][y] = node.next;
          }
        }
      }
  
      client._cells.min = null;
      client._cells.max = null;
      client._cells.nodes = null;
    }

    _Reset() {
        const [x, y] = this._dimensions;
        this._cells = [...Array(x)].map(() => [...Array(y)].map(() => (null)));
        this._queryIds = 0;
    }
  }


  class SpatialHashGrid3D {
    constructor(bounds, dimensions) {
      const [x, y, z] = dimensions;
      this._cells = [...Array(x)].map(() => [...Array(y)].map(() => ([...Array(z)].map(() => (null)))));
      this._dimensions = dimensions;
      this._bounds = bounds;
      this._queryIds = 0;
    }
  
    _GetCellIndex(position) {
      const x = math.sat((position[0] - this._bounds[0][0]) / (
          this._bounds[1][0] - this._bounds[0][0]));
      const y = math.sat((position[1] - this._bounds[0][1]) / (
          this._bounds[1][1] - this._bounds[0][1]));
      const z = math.sat((position[2] - this._bounds[0][2]) / (
          this._bounds[1][2] - this._bounds[0][2]));
      const xIndex = Math.floor(x * (this._dimensions[0] - 1));
      const yIndex = Math.floor(y * (this._dimensions[1] - 1));
      const zIndex = Math.floor(z * (this._dimensions[2] - 1));
      return [xIndex, yIndex, zIndex];
    }
  
    NewClient(position, dimensions, owner) {
      const client = {
        position: position,
        dimensions: dimensions,
        _cells: {
          min: null,
          max: null,
          nodes: null,
        },
        _queryId: -1,
        owner: owner
      };
  
      this._Insert(client);
  
      return client;
    }
  
    UpdateClient(client) {
      const [x, y, z] = client.position;
      const [w, h, d] = client.dimensions;
  
      const i1 = this._GetCellIndex([x - w / 2, y - h / 2, z - d / 2]);
      const i2 = this._GetCellIndex([x + w / 2, y + h / 2, z + d / 2]);
  
      if (client._cells.min[0] == i1[0] &&
          client._cells.min[1] == i1[1] &&
          client._cells.max[0] == i2[0] &&
          client._cells.max[1] == i2[1]) {
        return;
      }
  
      this.Remove(client);
      this._Insert(client);
    }
  
    FindNear(position, bounds) {
      const [x, y, z] = position;
      const [w, h, d] = bounds;
  
      const i1 = this._GetCellIndex([x - w / 2, y - h / 2, z - d / 2]);
      const i2 = this._GetCellIndex([x + w / 2, y + h / 2, z + d / 2]);
      const clients = [];
      const queryId = this._queryIds++;
      for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
        for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
            for (let z = i1[2], zn = i2[2]; z <= zn; ++z) {
                let head = this._cells[x][y][z];
        
                while (head) {
                  const v = head.client;
                  head = head.next;
        
                  if (v._queryId != queryId) {
                    v._queryId = queryId;
                    clients.push(v);
                  }
                }
            }
        }
      }
      return clients;
    }
  
    _Insert(client) {
      const [x, y, z] = client.position;
      const [w, h, d] = client.dimensions;
  
      const i1 = this._GetCellIndex([x - w / 2, y - h / 2, z - d / 2]);
      const i2 = this._GetCellIndex([x + w / 2, y + h / 2, z + d / 2]);
      const nodes = [];
  
      for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
        nodes.push([]);
        for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
            const xi = x - i1[0];
            nodes[xi].push([]);
            for (let z = i1[2], zn = i2[2]; z <= zn; ++z) {
                let yi = y - i1[1];

                const head = {
                    next: null,
                    prev: null,
                    client: client,
                };
        
                nodes[xi][yi].push(head);
        
                head.next = this._cells[x][y][z];
                if (this._cells[x][y][z]) {
                    this._cells[x][y][z].prev = head;
                }
        
                this._cells[x][y][z] = head;
            }
        }
      }
  
      client._cells.min = i1;
      client._cells.max = i2;
      client._cells.nodes = nodes;
    }
  
    Remove(client) {
      const i1 = client._cells.min;
      const i2 = client._cells.max;
  
      for (let x = i1[0], xn = i2[0]; x <= xn; ++x) {
        for (let y = i1[1], yn = i2[1]; y <= yn; ++y) {
            for (let z = i1[2], zn = i2[2]; z <= zn; ++z) {
                const xi = x - i1[0];
                const yi = y - i1[1];
                const zi = z - i1[2];
                const node = client._cells.nodes[xi][yi][zi];
        
                if (node.next) {
                    node.next.prev = node.prev;
                }
                if (node.prev) {
                    node.prev.next = node.next;
                }
        
                if (!node.prev) {
                    this._cells[x][y][z] = node.next;
                }
            }
        }
      }
  
      client._cells.min = null;
      client._cells.max = null;
      client._cells.nodes = null;
    }

    _Reset() {
        const [x, y, z] = this._dimensions;
        this._cells = [...Array(x)].map(() => [...Array(y)].map(() => (() => [...Array(z)].map(() => (null)))));
        this._queryIds = 0;
    }
  }

export const spatial_grid = {
    SpatialHash_Crap: SpatialHashGrid,
    SpatialHash_Slow: SpatialHashGrid,
    SpatialHash_Fast: SpatialHashGridFast,
    SpatialHash_3D: SpatialHashGrid3D
}