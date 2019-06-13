import { component } from 'bidello';
import {
  Object3D,
  CylinderBufferGeometry,
  Mesh,
  DoubleSide,
  Vector4,
} from 'three';
import MagicShader from 'magicshader';
import FBO from '../utils/fbo';

export default class extends component(Object3D) {
  init() {
    const WIDTH = 4;
    const HEIGHT = 1;
    const data = new Float32Array(WIDTH * HEIGHT * 4);

    this.points = [
      new Vector4(10, 0, 14, 1),
      new Vector4(0.2, 0, 0, 1),
      new Vector4(-2.9, 0, .3, 1),
      new Vector4(-4.5, 0, -.4, 1)
    ];

    this.points.forEach((p, index) => {
      const i = index * 4;

      data[i + 0] = p.x;
      data[i + 1] = p.y;
      data[i + 2] = p.z;
      data[i + 3] = p.w;
    })

    this.velocity = new FBO({
      width: WIDTH,
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

    this.velocity.uniforms.uPosition = {
      value: this.curvepos.target
    };

    // this.curvepos.update();
    
    this.geometry = new CylinderBufferGeometry(1, 1, 30, 20, 40, true);
    this.geometry.rotateZ(Math.PI / 2);
    this.material = new MagicShader({
      wireframe: true,
      name: 'Tube',
      defines: {
        PATH_LENGTH: (4).toFixed(1),
        PATH_MAX: (4 - 1).toFixed(1)
      },
      uniforms: {
        uData: { value: this.curvepos.target },
        // uPath: { value: this.points },
      },
      side: DoubleSide,
      vertexShader: require('./tube.vert'),
      fragmentShader: require('./tube.frag')
    });

    this.mesh = new Mesh(this.geometry, this.material);

    this.add(this.mesh);
  }

  onRaf({ delta }) {
    // this.mesh.rotation.x += 0.3 * delta;
    // this.mesh.rotation.y += 0.3 * delta;

    this.curvepos.uniforms.uTime.value += delta;
    this.velocity.uniforms.uTime.value += delta;

    this.velocity.uniforms.uPosition.value = this.curvepos.target;
    this.velocity.update();

    this.curvepos.uniforms.velocity.value = this.velocity.target;
    this.curvepos.update();
  }
}