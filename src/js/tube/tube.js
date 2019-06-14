import { component } from 'bidello';
import {
  Object3D,
  CylinderBufferGeometry,
  Mesh,
  DoubleSide,
  Vector4,
  BufferAttribute,
  Vector2,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
} from 'three';
import MagicShader, { gui } from 'magicshader';
import FBO from '../utils/fbo';

export default class extends component(Object3D) {
  init() {
    const INSTANCES = 512;
    const WIDTH = 64;
    const HEIGHT = INSTANCES;
    const data = new Float32Array(WIDTH * HEIGHT * 4);
    
    this.stop = false;

    this.velocity = new FBO({
      width: 1, // Only the head needs velocity
      height: HEIGHT,
      name: 'velocity',
      shader: require('./velocity.frag'),
      uniforms: {
        uTime: { value: 0 },
      },
    });

    this.curvepos = new FBO({
      data,
      width: WIDTH,
      height: HEIGHT,
      name: 'position',
      shader: require('./position.frag'),
      uniforms: {
        uTime: { value: 0 },
        velocity: { value: this.velocity.target }
      },
    });

    this.velocity.material.gui.add(this, 'stop');

    this.velocity.uniforms.uPosition = {
      value: this.curvepos.target
    };

    // this.curvepos.update();
    
    const cylinder = new CylinderBufferGeometry(1, 1, 1, 50, 50, true);
    cylinder.rotateZ(Math.PI / 2);

    this.geometry = new InstancedBufferGeometry().copy(cylinder);

    const tmp = new Vector2();
    const angles = [];
    const indexes = [];
    const dat = this.geometry.attributes.position.array;

    for (let i = 0; i < this.geometry.attributes.position.count; i++) {
      const index = i * 3;
      const x = dat[index + 0]; // x
      const y = dat[index + 1]; // y
      const z = dat[index + 2]; // z

      tmp.set(y, z).normalize();
      angles.push(Math.atan2(tmp.y, tmp.x));
    }

    for (let i = 0; i < INSTANCES; i++) {
      indexes.push(i / INSTANCES);
    }

    this.geometry.addAttribute('aAngle', new BufferAttribute(new Float32Array(angles), 1));
    this.geometry.addAttribute('aIndex', new InstancedBufferAttribute(new Float32Array(indexes), 1));

    this.material = new MagicShader({
      // wireframe: true,
      name: 'Tube',
      defines: {
        RESOLUTION: `vec2(${WIDTH.toFixed(1)}, ${HEIGHT.toFixed(1)})`
        // PATH_LENGTH: (POINTS).toFixed(1),
        // PATH_MAX: (POINTS - 1).toFixed(1)
      },
      uniforms: {
        uData: { value: this.curvepos.target },
        // uPath: { value: this.points },
      },
      // side: DoubleSide,
      vertexShader: require('./tube.vert'),
      fragmentShader: require('./tube.frag')
    });

    this.mesh = new Mesh(this.geometry, this.material);

    this.add(this.mesh);
  }

  stop() {
    this.stop = !this.stop;
  }

  onRaf({ delta }) {
    // this.mesh.rotation.x += 0.3 * delta;
    // this.mesh.rotation.y += 0.3 * delta;

    if (this.stop) {
      return;
    }

    this.curvepos.uniforms.uTime.value += delta;
    this.velocity.uniforms.uTime.value += delta;

    this.velocity.uniforms.uPosition.value = this.curvepos.target;
    this.velocity.update();

    this.curvepos.uniforms.velocity.value = this.velocity.target;
    this.curvepos.update();
  }
}