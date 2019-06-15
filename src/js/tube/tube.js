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
  Texture,
  RepeatWrapping,
  MeshBasicMaterial,
  Vector3,
  AdditiveBlending,
} from 'three';

import {
  lerp
} from 'math-toolbox';

import MagicShader, { gui } from 'magicshader';
import FBO from '../utils/fbo';
import assets from '../assets';
import pointer from '../utils/pointer';

export default class extends component(Object3D) {
  init() {
    const LIFE = 1500;
    const INSTANCES = 100;
    const WIDTH = 64;
    const HEIGHT = INSTANCES;
    
    this.mousePos = new Vector3();
    this.oldMousePos = new Vector2();
    this.angle = 0;
    this.stop = false;

    const velocityData = new Float32Array(1 * HEIGHT * 4);

    for (let i = 0; i < velocityData.length; i += 4) {
      // velocityData[i + 3] = i / velocityData.length; // take the alpha part
      velocityData[i + 3] = (i / velocityData.length) * LIFE; // take the alpha part
    }

    this.velocity = new FBO({
      data: velocityData,
      width: 1, // Only the head needs velocity
      height: HEIGHT,
      name: 'velocity',
      shader: require('./velocity.frag'),
      uniforms: {
        uTime: { value: 0 },
        uLife: { value: LIFE }
        // uMousePos: { value: this.mousePos }
      },
    });

    this.curvepos = new FBO({
      width: WIDTH,
      height: HEIGHT,
      name: 'position',
      shader: require('./position.frag'),
      uniforms: {
        uTime: { value: 0 },
        velocity: { value: this.velocity.target },
        uMousePos: { value: this.mousePos },
        uMouseAngle: { value: this.angle },
      },
    });

    this.velocity.material.gui.add(this, 'stop');

    this.velocity.uniforms.uPosition = {
      value: this.curvepos.target
    };

    // this.curvepos.update();
    
    const radialSegment = 20;// 50;
    const heightSegment = 150;// 50;

    const cylinder = new CylinderBufferGeometry(1, 1, 1, radialSegment, heightSegment, false);
    cylinder.rotateZ(Math.PI / 2);

    this.geometry = new InstancedBufferGeometry().copy(cylinder);

    // const pp = this.geometry.attributes.position.array;
    // let min = undefined;
    // let max = undefined;
    // for (let i = 0; i < pp.length; i+=4) {
    //   let x = pp[i + 0]
    //   let y = pp[i + 1]
    //   let z = pp[i + 2]

    //   let t = y;

    //   if (t < min || typeof min === 'undefined') {
    //     min = t;
    //   }

    //   if (t > max || typeof max === 'undefined') {
    //     max = t;
    //   }
    // }

    // console.log('min ', min);
    // console.log('max ', max);

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

    this.matcap = new Texture();

    assets.resources.matcap.loading.then(res => {
      const tex = new Texture(res.meta.data, RepeatWrapping, RepeatWrapping);
      tex.needsUpdate = true;
      this.material.uniforms.uMatcap.value = tex;
    });

    this.material = new MagicShader({
      // wireframe: true,
      transparent: true,
      name: 'Tube',
      extensions: {
        derivatives: true,
      },
      defines: {
        RESOLUTION: `vec2(${WIDTH.toFixed(1)}, ${HEIGHT.toFixed(1)})`,
        LIFE: LIFE.toFixed(1),
      },
      uniforms: {
        uData: { value: this.curvepos.target },
        uMatcap: { value: this.matcap },
        uMousePos: { value: this.mousePos },
        uMouseAngle: { value: this.angle },
      },
      // side: DoubleSide,
      vertexShader: require('./tube.vert'),
      fragmentShader: require('./tube.frag')
    });

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;

    this.add(this.mesh);
  }

  stop() {
    this.stop = !this.stop;
  }

  // onPointerMove({ pointer }) {
    
  // }

  onRaf({ delta }) {
    this.mousePos.lerp(pointer.world, .1);

    if (pointer.y !== this.oldMousePos.y && pointer.x !== this.oldMousePos.x) {
      this.angle = Math.atan2(pointer.y - this.oldMousePos.y, pointer.x - this.oldMousePos.x);
    }

    this.curvepos.uniforms.uMouseAngle.value = lerp(this.curvepos.uniforms.uMouseAngle.value, this.angle, .1);
    this.material.uniforms.uMouseAngle.value = this.curvepos.uniforms.uMouseAngle.value;

    this.oldMousePos.set(pointer.x, pointer.y);

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