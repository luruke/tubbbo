// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Scene } from 'three';
import { component } from 'bidello';
import Tube from './tube/tube';

class Stage extends component(Scene) {
  init() {
    this.add(new Tube());
  }
}

export default new Stage();