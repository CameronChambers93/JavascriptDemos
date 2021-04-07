import {math} from './math.js';
import {spatial_grid} from './SpatialHashGrid.js';

// Testing harness

const _NUM_CLIENTS = 100000;
const _ITERATIONS = 10000;

const _CLIENT_BOUNDS = [[-1000.0, -1000.0, -1000.0], [1000.0, 1000.0, 1000.0]];
const _CLIENT_DIMENSIONS = [100, 100, 100];

const _CLIENT_POSITIONS = [];
for (let i = 0; i < _NUM_CLIENTS; ++i) {
  _CLIENT_POSITIONS.push(
      [
          math.rand_range(_CLIENT_BOUNDS[0][0], _CLIENT_BOUNDS[1][0]),
          math.rand_range(_CLIENT_BOUNDS[0][1], _CLIENT_BOUNDS[1][1]),
          math.rand_range(_CLIENT_BOUNDS[0][2], _CLIENT_BOUNDS[1][2])
      ]);
}

const _CLIENT_QUERIES = [];
for (let i = 0; i < _ITERATIONS; ++i) {
  const p = [
      math.rand_range(_CLIENT_BOUNDS[0][0], _CLIENT_BOUNDS[1][0]),
      math.rand_range(_CLIENT_BOUNDS[0][1], _CLIENT_BOUNDS[1][1]),
      math.rand_range(_CLIENT_BOUNDS[0][2], _CLIENT_BOUNDS[1][2])];

  _CLIENT_QUERIES.push(p);
}

const _CLIENT_MOVES = [];
for (let i = 0; i < _NUM_CLIENTS; ++i) {
  const p = [
      Math.random(),
      Math.random(),
      Math.random()];

  _CLIENT_MOVES.push(p);
}

class GridTester {
  constructor(gridClass) {
    this._grid = new gridClass(_CLIENT_BOUNDS, _CLIENT_DIMENSIONS);

    this._clients = [];
    for (let i = 0; i < _NUM_CLIENTS; ++i) {
      const client = this._grid.NewClient(
          _CLIENT_POSITIONS[i], [15, 15]
      );
      this._clients.push(client);
    }
  }

  Test_FindNearby() {
    const queryBounds = [15, 15];

    let startTime = performance.now();
    for (let i = 0; i < _ITERATIONS; ++i) {
      this._grid.FindNear([_CLIENT_QUERIES[i][0], _CLIENT_QUERIES[i][1]], queryBounds);
    }
    let totalTime = performance.now() - startTime;
    return totalTime;
  }

  Test_Update() {
    for (let i = 0; i < this._clients.length; ++i) {
      const c = this._clients[i];
      c.position[0] = _CLIENT_POSITIONS[i][0];
      c.position[1] = _CLIENT_POSITIONS[i][1];
      this._grid.UpdateClient(this._clients[i]);
    }
  
    let startTime = performance.now();
    for (let i = 0; i < this._clients.length; ++i) {
      const c = this._clients[i];
      c.position[0] += _CLIENT_MOVES[i][0];
      c.position[1] += _CLIENT_MOVES[i][1];
      this._grid.UpdateClient(this._clients[i]);
    }
    let totalTime = performance.now() - startTime;

    return totalTime;
  }
}


class GridTester3d {
  constructor(gridClass) {
    this._grid = new gridClass(_CLIENT_BOUNDS, _CLIENT_DIMENSIONS);

    this._clients = [];
    for (let i = 0; i < _NUM_CLIENTS; ++i) {
      const client = this._grid.NewClient(
          _CLIENT_POSITIONS[i], [15, 15, 15]
      );
      this._clients.push(client);
    }
  }

  Test_FindNearby() {
    const queryBounds = [15, 15, 15];

    let startTime = performance.now();
    for (let i = 0; i < _ITERATIONS; ++i) {
      this._grid.FindNear(_CLIENT_QUERIES[i], queryBounds);
    }
    let totalTime = performance.now() - startTime;
    return totalTime;
  }

  Test_Update() {
    for (let i = 0; i < this._clients.length; ++i) {
      const c = this._clients[i];
      c.position[0] = _CLIENT_POSITIONS[i][0];
      c.position[1] = _CLIENT_POSITIONS[i][1];
      c.position[2] = _CLIENT_POSITIONS[i][2];
      this._grid.UpdateClient(this._clients[i]);
    }
  
    let startTime = performance.now();
    for (let i = 0; i < this._clients.length; ++i) {
      const c = this._clients[i];
      c.position[0] += _CLIENT_MOVES[i][0];
      c.position[1] += _CLIENT_MOVES[i][1];
      c.position[2] += _CLIENT_MOVES[i][2];
      this._grid.UpdateClient(this._clients[i]);
    }
    let totalTime = performance.now() - startTime;

    return totalTime;
  }
}

export default {
    test: function() {
        return new Promise(resolve => {
            const gridSlow = new GridTester(spatial_grid.SpatialHash_Crap);
            const gridFast = new GridTester(spatial_grid.SpatialHash_Fast);
            const grid3d = new GridTester3d(spatial_grid.SpatialHash_3D);
            let msg = ""
            msg += 'Spatial Grid (Slow) - FindNearby: ' + gridSlow.Test_FindNearby() + 'ms<br>';
            msg +='Spatial Grid (Fast) - FindNearby: ' + gridFast.Test_FindNearby() + 'ms<br>';
            msg +='Spatial Grid (3D) - FindNearby: ' + grid3d.Test_FindNearby() + 'ms<br>';
            msg += '----------------------------------<br>';
            msg += 'Spatial Grid (Slow) - FindNearby: ' + gridSlow.Test_FindNearby() + 'ms<br>';
            msg += 'Spatial Grid (Fast) - FindNearby: ' + gridFast.Test_FindNearby() + 'ms<br>';
            msg += 'Spatial Grid (3D) - FindNearby: ' + grid3d.Test_FindNearby() + 'ms<br>';
            
            msg += '----------------------------------<br>';
            msg += '----------------------------------<br>';
            
            msg += 'Spatial Grid (Slow) - Update: ' + gridSlow.Test_Update() + 'ms<br>';
            msg += 'Spatial Grid (Fast) - Update: ' + gridFast.Test_Update() + 'ms<br>';
            msg += 'Spatial Grid (3D) - Update: ' + grid3d.Test_Update() + 'ms<br>';
            msg += '----------------------------------<br>';
            msg += 'Spatial Grid (Slow) - Update: ' + gridSlow.Test_Update() + 'ms<br>';
            msg += 'Spatial Grid (Fast) - Update: ' + gridFast.Test_Update() + 'ms<br>';
            msg += 'Spatial Grid (3D) - Update: ' + grid3d.Test_Update() + 'ms<br>';
            resolve(msg);
        })
    }
}