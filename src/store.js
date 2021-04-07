import Vue from "vue";
import Vuex from "vuex";
import {
  Scene,
  TrackballControls,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  MeshPhongMaterial,
  Mesh,
  DirectionalLight,
  AmbientLight,
  LineBasicMaterial,
  Geometry,
  Vector3,
  Line,
  SphereGeometry
} from "three-full";

Vue.use(Vuex);

const getDefaultState = () => {
  return {
      width: 0,
      height: 0,
      camera: null,
      controls: null,
      scene: null,
      renderer: null,
      axisLines: [],
      spheres: [],
      sphereIdPlusFactor: 0,
      sphereIdMinusFactor: 1
  }
}

export default new Vuex.Store({
  state: {
    width: 0,
    height: 0,
    camera: null,
    controls: null,
    scene: null,
    renderer: null,
    axisLines: [],
    spheres: [],
    sphereIdPlusFactor: 0,
    sphereIdMinusFactor: 1
  },
  getters: {
    CAMERA_POSITION: state => {
      return state.camera ? state.camera.position : null;
    }
  },
  mutations: {
    RESET_STATE(state) {
      for (const sphere of state.spheres) {
        state.scene.remove(sphere);
        delete sphere.geometry;
        delete sphere.material;
      }
      Object.assign(state, getDefaultState());
    },
    SET_VIEWPORT_SIZE(state, { width, height }) {
      state.width = width;
      state.height = height;
    },
    INITIALIZE_RENDERER(state, el) {
      if (!state.renderer) {
        state.renderer = new WebGLRenderer({ antialias: true });
        state.renderer.setPixelRatio(window.devicePixelRatio);
        state.renderer.setSize(state.width, state.height);
        el.appendChild(state.renderer.domElement);
      }
    },
    INITIALIZE_CAMERA(state) {
      state.camera = new PerspectiveCamera(
        // 1. Field of View (degrees)
        60,
        // 2. Aspect ratio
        state.width / state.height,
        // 3. Near clipping plane
        1,
        // 4. Far clipping plane
        1000
      );
      state.camera.position.z = 500;
      
      
    },
    INITIALIZE_CONTROLS(state) {
      state.controls = new TrackballControls(
        state.camera,
        state.renderer.domElement
      );
      state.controls.rotateSpeed = 1.0;
      state.controls.zoomSpeed = 1.2;
      state.controls.panSpeed = 0.8;
      state.controls.noZoom = false;
      state.controls.noPan = false;
      state.controls.staticMoving = true;
      state.controls.dynamicDampingFactor = 0.3;
      state.controls.keys = [65, 83, 68];
    },
    UPDATE_CONTROLS(state) {
      state.controls.update();
    },
    INITIALIZE_SCENE(state) {
      state.scene = null;
      state.scene = new Scene();
      state.spheres = [];
      state.scene.background = new Color(0xcccccc);
      /*
      var material = new MeshPhongMaterial({
        color: 0xffffff,
        flatShading: true
      });
      */
      let colors = [0x000000, 0xf00000, 0x00ff04, 0x005fff, 0xffffff];
      let piece = state.pieces;
      var geometry = new SphereGeometry(piece.size / 2, 32, 32);
      let count = 0;
      while (piece) {
        let material = new MeshPhongMaterial({
          color: colors[piece.color],
          flatShading: true
        });
        var mesh = new Mesh(geometry, material);
        [mesh.position.x, mesh.position.y] = piece.position;
        (piece.position.length > 2) ? mesh.position.z = piece.position[2] : mesh.position.z = 12.5;
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        state.spheres.push(mesh);
        piece.sphereIndex = count++;
        piece = piece.tail;
      }
      state.scene.add(...state.spheres);

        console.log(state.spheres)
      // lights
      var lightA = new DirectionalLight(0xffffff);
      lightA.position.set(1, 1, 1);
      state.scene.add(lightA);
      var lightB = new DirectionalLight(0x002288);
      lightB.position.set(-1, -1, -1);
      state.scene.add(lightB);
      var lightC = new AmbientLight(0x222222);
      state.scene.add(lightC);

      // Axis Line 1
      var materialB = new LineBasicMaterial({ color: 0x0000ff });
      var geometryB = new Geometry();
      geometryB.vertices.push(new Vector3(0, 0, 0));
      geometryB.vertices.push(new Vector3(0, 1000, 0));
      var lineA = new Line(geometryB, materialB);
      state.axisLines.push(lineA);

      // Axis Line 2
      var materialC = new LineBasicMaterial({ color: 0x00ff00 });
      var geometryC = new Geometry();
      geometryC.vertices.push(new Vector3(0, 0, 0));
      geometryC.vertices.push(new Vector3(1000, 0, 0));
      var lineB = new Line(geometryC, materialC);
      state.axisLines.push(lineB);

      // Axis 3
      var materialD = new LineBasicMaterial({ color: 0xff0000 });
      var geometryD = new Geometry();
      geometryD.vertices.push(new Vector3(0, 0, 0));
      geometryD.vertices.push(new Vector3(0, 0, 1000));
      var lineC = new Line(geometryD, materialD);
      state.axisLines.push(lineC);

      state.scene.add(...state.axisLines);
    },
    RESIZE(state, { width, height }) {
      state.width = width;
      state.height = height;
      state.camera.aspect = width / height;
      state.camera.updateProjectionMatrix();
      state.renderer.setSize(width, height);
      state.controls.handleResize();
      state.renderer.render(state.scene, state.camera);
    },
    SET_CAMERA_POSITION(state, { x, y, z }) {
      if (state.camera) {
        state.camera.position.set(x, y, z);
      }
    },
    RESET_CAMERA_ROTATION(state) {
      if (state.camera) {
        state.camera.rotation.set(0, 0, 0);
        state.camera.quaternion.set(0, 0, 0, 1);
        state.camera.up.set(0, 1, 0);
        state.controls.target.set(0, 0, 0);
      }
    },
    HIDE_AXIS_LINES(state) {
      state.scene.remove(...state.axisLines);
      state.renderer.render(state.scene, state.camera);
    },
    SHOW_AXIS_LINES(state) {
      state.scene.add(...state.axisLines);
      state.renderer.render(state.scene, state.camera);
    },
    HIDE_spheres(state) {
      state.scene.remove(...state.spheres);
      state.renderer.render(state.scene, state.camera);
    },
    SHOW_spheres(state) {
      state.scene.add(...state.spheres);
      state.renderer.render(state.scene, state.camera);
    },
    SET_PIECES(state, piece) {
      state.pieces = piece;
    },
    UPDATE_FRAME(state) {
      let piece = state.pieces;
      let colors = [0x000000, 0xf00000, 0x00ff04, 0x005fff, 0xffffff];
      while (piece) {
        let id = piece.sphereIndex;
        [state.spheres[id].position.x, state.spheres[id].position.y] = [piece.position[0], piece.position[1]];
        if (piece.position.length > 2)
          state.spheres[id].position.z = piece.position[2];
        if (piece.colorNeedsUpdating) {
          state.spheres[id].material = new MeshPhongMaterial({
            color: colors[piece.color],
            flatShading: true
          });
          piece.colorNeedsUpdating = false;
        }
        state.spheres[id].updateMatrix();
        piece = piece.tail;
      }
    },
    RESIZE_PIECES(state, size) {
      console.log('resize')
      let piece = state.pieces;
      let geometry = new SphereGeometry(size / 2, 32, 32);
      while (piece) {
        piece.resize(size);
        let id = piece.sphereIndex;
        state.spheres[id].geometry = geometry
        piece = piece.tail;
      }
    },
    REMOVE_UNIT(state) {
      state.spheres[state.spheres.length - 1].visible = false;
      state.spheres.pop();
    },
    ADD_UNIT(state, pieces) {
      let piece = pieces
      let color = 0x000000
      var geometry = new SphereGeometry(piece.size / 2, 32, 32);
        let material = new MeshPhongMaterial({
          color: color,
          flatShading: true
        });
        var mesh = new Mesh(geometry, material);
        [mesh.position.x, mesh.position.y, mesh.position.z] = piece.position;
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        piece.
        piece.sphereIndex = state.spheres.length;
        state.spheres.push(mesh);
    }
  },
  actions: {
    INIT({ state, commit }, { width, height, el, piece }) {
      return new Promise(resolve => {
        commit("SET_VIEWPORT_SIZE", { width, height });
        commit("INITIALIZE_RENDERER", el);
        commit("INITIALIZE_CAMERA");
        commit("INITIALIZE_CONTROLS");
        
        commit("SET_PIECES", piece);
        commit("INITIALIZE_SCENE");

        // Initial scene rendering
        state.renderer.render(state.scene, state.camera);

        // Add an event listener that will re-render
        // the scene when the controls are changed
        state.controls.addEventListener("change", () => {
          state.renderer.render(state.scene, state.camera);
        });

        resolve();
      });
    },
    SET_PIECE({ state, commit }, { pieces, resize }) {
      let reset = false;
      if (state.pieces) {
        if (state.pieces.id != pieces.id)
          reset = true;
        if (resize != -1)
          commit("RESIZE_PIECES", resize);
      }
      return new Promise(resolve => {
        commit("SET_PIECES", pieces, resize);
        if (reset){
          this.state.sphereIdPlusFactor += state.spheres.length;
          commit("INITIALIZE_SCENE");
        }
        resolve();
      })
    },
    ANIMATE({ state, commit }) {
      return new Promise(resolve => {
        commit("UPDATE_FRAME");
        window.requestAnimationFrame(() => {
          state.controls.update();
        });
        state.renderer.render(state.scene, state.camera);
        resolve();
      })
    },
    REMOVE_LAST_UNIT({ commit }, { pieces }) {
      console.log(pieces)
      return new Promise(resolve => {
        commit("REMOVE_UNIT", pieces);
        resolve();
      })
    },
    RESET_STATE({ commit }) {
      return new Promise(resolve => {
        commit("RESET_STATE");
        resolve();
      })
    }
  }
});