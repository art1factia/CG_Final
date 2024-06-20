import * as THREE from 'three';
import { PlaneGeometry } from 'three/src/Three.js';

export default class PickHelper {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
  }
  pick(normalizedPosition, scene, camera, time) {
    // 이미 다른 물체를 피킹했다면 색을 복원합니다
    if (this.pickedObject) {
      this.pickedObject.material.color.setHex(this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }

    // 절두체 안에 광선을 쏩니다
    this.raycaster.setFromCamera(normalizedPosition, camera);
    // 광선과 교차하는 물체들을 배열로 만듭니다
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      // 첫 번째 물체가 제일 가까우므로 해당 물체를 고릅니다

      if (intersectedObjects[0].object.geometry.type === "PlaneGeometry") {
        this.pickedObject = null
      } else {
        this.pickedObject = intersectedObjects[0].object;
        // 기존 색을 저장해둡니다
        this.pickedObjectSavedColor = this.pickedObject.material.color.getHex();
        // color 색을 빨강/노랑으로 빛나게 만듭니다
        this.pickedObject.material.color.setHex((time * 8) % 2 > 1 ? 0xFFFFFF : 0xFFFFFF);
      }
    }
  }
}