import {
  WebGLRenderTarget,
  NearestFilter,
  DataTexture,
  RGBAFormat,
  FloatType,
  HalfFloatType,
  OrthographicCamera,
  BufferGeometry,
  BufferAttribute,
  Scene,
  Mesh,
} from 'three';

import renderer from '../renderer';
import MagicShader from 'magicshader';

export const isAvailable = (() => {
  const gl = renderer.getContext();

  if (!gl.getExtension('OES_texture_float')) {
    return false;
  }

  if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) === 0) {
    return false;
  }

  return true;
})();

const type = FloatType; // or HalfFloatType

export default class FBO {
  constructor({
      width,
      height,
      data,
      name,
      shader,
      uniforms = {}
    }) {
    this.options = arguments[0];

    const vertices = new Float32Array([
      -1.0, -1.0,
      3.0, -1.0,
      -1.0, 3.0
    ]);
    
    this.renderer = renderer;
    this.camera = new OrthographicCamera();
    this.scene = new Scene();
    this.index = 0;
    this.copyData = true;
    this.texture = new DataTexture(
      data || new Float32Array((width * height * 4)),
      width,
      height,
      RGBAFormat,
      type,
    );
    this.texture.needsUpdate = true;

    this.rt = [this.createRT(), this.createRT()];

    this.geometry = new BufferGeometry();
    this.geometry.addAttribute('position', new BufferAttribute(vertices, 2));

    this.material = new MagicShader({
      name: name || 'FBO',
      defines: {
        RESOLUTION: `vec2(${width.toFixed(1)}, ${height.toFixed(1)})`
      },
      uniforms: {
        ...uniforms,
        texture: { value: this.texture }
      },
      vertexShader: `
        precision highp float;
        attribute vec3 position;

        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: shader || `
        precision highp float;
        uniform sampler2D texture;
        void main() {
          vec2 uv = gl_FragCoord.xy / RESOLUTION.xy;
          gl_FragColor = texture2D(texture, uv);
        }
      `,
    });

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  createRT() {
    return new WebGLRenderTarget(this.options.width, this.options.height, {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      stencilBuffer: false,
      depthBuffer: false,
      type,
    });
  }

  get target() {
    return this.rt[this.index].texture;
  }

  get uniforms() {
    return this.material.uniforms;
  }

  update(switchBack = true) {
    const destIndex = this.index === 0 ? 1 : 0;
    const old = this.rt[this.index];
    const dest = this.rt[destIndex];

    this.material.uniforms.texture.value = this.copyData ? this.texture : this.target;

    const oldMainTarget = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(dest);
    this.renderer.render(this.scene, this.camera);
    switchBack && this.renderer.setRenderTarget(oldMainTarget);

    this.index = destIndex;
    this.copyData = false;
  }
}