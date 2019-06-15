import { PerspectiveCamera, Vector3 } from 'three';
import { component } from 'bidello';
import OrbitControls from 'orbit-controls-es6';
import renderer from './renderer';
import pointer from './utils/pointer';

import { map, lerp } from 'math-toolbox';

class Camera extends component(PerspectiveCamera) {
  constructor() {
    super(35, 0, 0.1, 1000);

    this.position.set(0, 0, 80);
    this.lookAt(new Vector3(0, 0, 0));

    // this.targetRot = new Vector3().copy(this.rotation);
  }

  initOrbitControl() {
    const controls = new OrbitControls(this, renderer.domElement);

    controls.enabled = true;
    controls.maxDistance = 900;
    controls.minDistance = 30;
  }

  onResize({ ratio }) {
    this.aspect = ratio;
    this.updateProjectionMatrix();
  }

  onRaf({ delta }) {
    const x = map(pointer.normalized.y, -1, 1, -0.2, 0.2);
    const y = map(pointer.normalized.x, -1, 1, 0.2, -0.2);

    this.rotation.x = lerp(this.rotation.x, x, .01)
    this.rotation.y = lerp(this.rotation.y, y, .01)
  }
}

export default new Camera();