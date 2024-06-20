import * as THREE from 'three'
import { addPass, useCamera, useGui, useRenderSize, useScene, useTick } from './render/init.js'
// import postprocessing passes
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { BlendShader } from 'three/examples/jsm/shaders/BlendShader.js'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';


import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

import vertexPars from './shaders/vertexPars.glsl'
import vertexMain from './shaders/vertexMain.glsl'
import vertexBoxMain from './shaders/vertexMain_box.glsl'
import fragmentPars from './shaders/fragmentPars.glsl'
import fragmentMain from './shaders/fragmentMain.glsl'

import PickHelper from './pickerHelper.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap';

const startApp = () => {
  const scene = useScene()
  const camera = useCamera()
  camera.position.set(0, 0, 10);
  // const gui = useGui()
  const { width, height } = useRenderSize()
  const MOTION_BLUR_AMOUNT = 0.725

  const paleblue = 0x425fff
  const skyblue = 0x78d9ff
  const magenta = 0xff42a1
  const purple = 0x4c00ff
  const pink = 0xffbaca

  function createText(message, fontSize, position) {
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/droid/droid_sans_regular.typeface.json', function (font) {
      const textGeometry = new TextGeometry(message, {
        font: font,
        size: fontSize,
        height: 1,
      });
      const textMaterial = new THREE.MeshBasicMaterial({ color: magenta });
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.position.set(position.x, position.y, position.z);
      scene.add(textMesh);
    });
  }


  // createText('Click the objects!', 1, { x: -5, y: 0, z: -10 });


  // settings


  scene.background = new THREE.Color(paleblue);

  // lighting
  const dirLight1 = new THREE.DirectionalLight('0x78d9ff', 0.23)
  dirLight1.position.set(-2, 3, -3)
  dirLight1.castShadow = true
  // scene.add(new THREE.DirectionalLightHelper(dirLight1))
  const dirLight2 = new THREE.DirectionalLight('0xffbaca', 0.23)
  dirLight2.position.set(2, 3, 3)
  dirLight2.castShadow = true
  // scene.add(new THREE.DirectionalLightHelper(dirLight2))

  const ambientLight = new THREE.AmbientLight('#ffffff', 0.20)
  scene.add(dirLight1, dirLight2, ambientLight)

  const torus_geometry = new THREE.TorusGeometry(1.5, 0.8, 300, 300);
  const torus_pink_material = new THREE.MeshStandardMaterial({
    color: pink,
    onBeforeCompile: (shader) => {
      torus_pink_material.userData.shader = shader
      shader.uniforms.uTime = { value: 0 }

      const parsVertexString = `#include <displacementmap_pars_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        parsVertexString,
        parsVertexString + vertexPars
      )

      const mainVertexString = `#include <displacementmap_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        mainVertexString,
        mainVertexString + vertexMain
      )

      const parsFragmentString = `#include <bumpmap_pars_fragment>`
      const mainFragmentString = `#include <normal_fragment_maps>`


      shader.fragmentShader = shader.fragmentShader.replace(
        mainFragmentString,
        mainFragmentString + fragmentMain
      )

      shader.fragmentShader = shader.fragmentShader.replace(
        parsFragmentString,
        parsFragmentString + fragmentPars
      )
    }
  })
  const torus1 = new THREE.Mesh(torus_geometry, torus_pink_material);
  torus1.position.set(2.4,1.3,2.2);
  scene.add(torus1);



  const plane_material = new THREE.MeshPhongMaterial({
    color: pink,    // red (can also use a CSS color string here)
    flatShading: true,
  });
  const sphere_material = new THREE.MeshPhongMaterial({
    color: pink,    // red (can also use a CSS color string here)
    flatShading: true,
  });

  // meshes
  const sphere_geometry = new THREE.IcosahedronGeometry(1, 150)
  const icosahed_geometry = new THREE.IcosahedronGeometry(1, 1)
  const box_geometry = new THREE.BoxGeometry(10, 10, 10, 100, 100, 100)
  const oct_geometry = new THREE.OctahedronGeometry(2, 10)


  const skyblue_plain_material = new THREE.MeshLambertMaterial({
    color: paleblue,    // red (can also use a CSS color string here)
    // wireframe: true,
    wireframeLinewidth: 1,
    emissive: 0x00000,
    transparent: true,
    opacity: 0.5,
    side: THREE.BackSide,

  })

  const plane = new THREE.PlaneGeometry(100, 100);
  const torus_skyblue_material =  new THREE.MeshLambertMaterial({
    color: skyblue,    // red (can also use a CSS color string here)
    // wireframe: true,
    wireframeLinewidth: 1,
    emissive: 0x00000,
    transparent: true,
    opacity: 0.8,
    side: THREE.BackSide,

  })
  const purple_oct_material = new THREE.MeshStandardMaterial({
    color: 0x4c00ff,
    onBeforeCompile: (shader) => {
      purple_oct_material.userData.shader = shader
      shader.uniforms.uTime = { value: 0 }

      const parsVertexString = `#include <displacementmap_pars_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        parsVertexString,
        parsVertexString + vertexPars
      )

      const mainVertexString = `#include <displacementmap_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        mainVertexString,
        mainVertexString + vertexBoxMain
      )

      const parsFragmentString = `#include <bumpmap_pars_fragment>`
      const mainFragmentString = `#include <normal_fragment_maps>`


      shader.fragmentShader = shader.fragmentShader.replace(
        mainFragmentString,
        mainFragmentString + fragmentMain
      )

      shader.fragmentShader = shader.fragmentShader.replace(
        parsFragmentString,
        parsFragmentString + fragmentPars
      )
    }
  })
  
  const purple_box_material = new THREE.MeshStandardMaterial({
    color: 0x4c00ff,
    onBeforeCompile: (shader) => {
      purple_box_material.userData.shader = shader
      shader.uniforms.uTime = { value: 0 }

      const parsVertexString = `#include <displacementmap_pars_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        parsVertexString,
        parsVertexString + vertexPars
      )

      const mainVertexString = `#include <displacementmap_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        mainVertexString,
        mainVertexString + vertexBoxMain
      )

      const parsFragmentString = `#include <bumpmap_pars_fragment>`
      const mainFragmentString = `#include <normal_fragment_maps>`


      shader.fragmentShader = shader.fragmentShader.replace(
        mainFragmentString,
        mainFragmentString + fragmentMain
      )

      shader.fragmentShader = shader.fragmentShader.replace(
        parsFragmentString,
        parsFragmentString + fragmentPars
      )
    }
  })
  const purple_material = new THREE.MeshStandardMaterial({
    color: 0x4c00ff,
    onBeforeCompile: (shader) => {
      purple_material.userData.shader = shader
      shader.uniforms.uTime = { value: 0 }

      const parsVertexString = `#include <displacementmap_pars_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        parsVertexString,
        parsVertexString + vertexPars
      )

      const mainVertexString = `#include <displacementmap_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        mainVertexString,
        mainVertexString + vertexMain
      )

      const parsFragmentString = `#include <bumpmap_pars_fragment>`
      const mainFragmentString = `#include <normal_fragment_maps>`


      shader.fragmentShader = shader.fragmentShader.replace(
        mainFragmentString,
        mainFragmentString + fragmentMain
      )

      shader.fragmentShader = shader.fragmentShader.replace(
        parsFragmentString,
        parsFragmentString + fragmentPars
      )
    }
  })
  const pink_material = new THREE.MeshStandardMaterial({
    color: 0xffbaca,
    onBeforeCompile: (shader) => {
      pink_material.userData.shader = shader
      shader.uniforms.uTime = { value: 0 }

      const parsVertexString = `#include <displacementmap_pars_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        parsVertexString,
        parsVertexString + vertexPars
      )

      const mainVertexString = `#include <displacementmap_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        mainVertexString,
        mainVertexString + vertexMain
      )

      const parsFragmentString = `#include <bumpmap_pars_fragment>`
      const mainFragmentString = `#include <normal_fragment_maps>`


      shader.fragmentShader = shader.fragmentShader.replace(
        mainFragmentString,
        mainFragmentString + fragmentMain
      )

      shader.fragmentShader = shader.fragmentShader.replace(
        parsFragmentString,
        parsFragmentString + fragmentPars
      )
    }
  })
  const magenta_material = new THREE.MeshStandardMaterial({
    color: magenta,
    onBeforeCompile: (shader) => {
      magenta_material.userData.shader = shader
      shader.uniforms.uTime = { value: 0 }

      const parsVertexString = `#include <displacementmap_pars_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        parsVertexString,
        parsVertexString + vertexPars
      )

      const mainVertexString = `#include <displacementmap_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        mainVertexString,
        mainVertexString + vertexMain
      )

      const parsFragmentString = `#include <bumpmap_pars_fragment>`
      const mainFragmentString = `#include <normal_fragment_maps>`


      shader.fragmentShader = shader.fragmentShader.replace(
        mainFragmentString,
        mainFragmentString + fragmentMain
      )

      shader.fragmentShader = shader.fragmentShader.replace(
        parsFragmentString,
        parsFragmentString + fragmentPars
      )
    }
  })
  const skyblue_material = new THREE.MeshStandardMaterial({
    color: 0x78d9ff,
    onBeforeCompile: (shader) => {
      skyblue_material.userData.shader = shader
      shader.uniforms.uTime = { value: 0 }

      const parsVertexString = `#include <displacementmap_pars_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        parsVertexString,
        parsVertexString + vertexPars
      )

      const mainVertexString = `#include <displacementmap_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        mainVertexString,
        mainVertexString + vertexMain
      )

      const parsFragmentString = `#include <bumpmap_pars_fragment>`
      const mainFragmentString = `#include <normal_fragment_maps>`


      shader.fragmentShader = shader.fragmentShader.replace(
        mainFragmentString,
        mainFragmentString + fragmentMain
      )

      shader.fragmentShader = shader.fragmentShader.replace(
        parsFragmentString,
        parsFragmentString + fragmentPars
      )
    }
  })
  // material.uniforms.uTime = {value: 0}
  // material.uniforms.uRadius = {value: 0.5}
  // material.uniforms.uTexture = {value: new THREE.TextureLoader().load(colorfulTexture)}

  const plain_sphere_phong = new THREE.Mesh(sphere_geometry, sphere_material)
  plain_sphere_phong.position.set(4.1, 1.4, 3.3)
  plain_sphere_phong.scale.set(0.5, 0.4, 0.4)

  const oct = new THREE.Mesh(oct_geometry, purple_oct_material)
  oct.position.set(6.2, -1.1, 1.0)
  oct.scale.set(0.3, 0.3, 0.3)

  const torus2 = new THREE.Mesh(torus_geometry, torus_skyblue_material);
  torus2.position.set(6,-1.7,-2.2);
  torus2.scale.set(0.45, 0.2, 0.25)
  scene.add(torus2);

  const torus3 = new THREE.Mesh(torus_geometry, torus_skyblue_material);
  torus3.position.set(6,-1.7,-2.2);
  torus3.scale.set(0.45, 0.2, 0.25)
  scene.add(torus3);
  

  torus1.castShadow = true
  torus2.castShadow = true
  torus3.castShadow = true


  const plain_sphere = new THREE.Mesh(icosahed_geometry, skyblue_plain_material)
  plain_sphere.position.set(1, -1, 3)
  plain_sphere.scale.set(0.1, 0.1, 0.1)

  const ico1 = new THREE.Mesh(sphere_geometry, magenta_material)
  ico1.position.set(0, 0, 0)
  ico1.scale.set(1.5, 1.5, 1.5)
  ico1.rotation.y += Math.PI / 3
  ico1.rotation.z += Math.PI / 2

  


  const ico2 = new THREE.Mesh(sphere_geometry, skyblue_material)
  ico2.position.set(0, 0.1, 0)

  const ico3 = new THREE.Mesh(sphere_geometry, magenta_material)
  ico3.position.set(-2.4, -1.0, 4.0)
  ico3.rotation.y += Math.PI / 3
  ico3.rotation.z += Math.PI / 2
  ico3.scale.set(0.4, 0.6, 0.6)
  scene.add(ico3)

  const box1 = new THREE.Mesh(box_geometry, purple_box_material)
  box1.position.set(-4, -2, 3)
  box1.scale.set(0.1, 0.1, 0.1)



  const plane1 = new THREE.Mesh(plane, plane_material)
  plane1.position.set(0, -2.8, 0)
  plane1.rotateX(-Math.PI / 2)


  plain_sphere_phong.castShadow = true;
  plain_sphere.castShadow = true;
  ico1.castShadow = true;
  ico2.castShadow = true;
  box1.castShadow = true;
  oct.castShadow = true;

  plane1.castShadow = true;
  plane1.receiveShadow = true;

  scene.add(plain_sphere)
  scene.add(ico1)
  scene.add(ico2)
  scene.add(plane1)
  scene.add(box1)
  scene.add(plain_sphere_phong)
  scene.add(oct)

  const pickPosition = { x: 0, y: 0 };
  clearPickPosition();

  const renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true;

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);



  // GUI
  // const cameraFolder = gui.addFolder('Camera')
  // cameraFolder.add(camera.position, 'z', 0, 10)
  // cameraFolder.open()

  // gui.add(material.uniforms.uRadius, "value").min(0).max(1)

  // postprocessing
  const renderTargetParameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    stencilBuffer: false,
  }

  // // save pass
  // const savePass = new SavePass(new THREE.WebGLRenderTarget(width, height, renderTargetParameters))

  // // blend pass
  // const blendPass = new ShaderPass(BlendShader, 'tDiffuse1')
  // blendPass.uniforms['tDiffuse2'].value = savePass.renderTarget.texture
  // blendPass.uniforms['mixRatio'].value = MOTION_BLUR_AMOUNT

  // // output pass
  // const outputPass = new ShaderPass(CopyShader)
  // outputPass.renderToScreen = true

  addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.55, 0.8, 0.1))
  const pickHelper = new PickHelper();
  const info = document.getElementById('info');
  const infoDetail = document.getElementById('infoDetail');

  // adding passes to composer
  // addPass(blendPass)
  // addPass(savePass)
  // addPass(outputPass)

  useTick(({ timestamp, timeDiff }) => {

    const time = timestamp / 8000
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    pickHelper.pick(pickPosition, scene, camera, time);
    // console.log(pickHelper.pickedObject)
    // pink_material.userData.shader.uniforms.uTime.value = time
    // purple_material.userData.shader.uniforms.uTime.value = time
    purple_box_material.userData.shader.uniforms.uTime.value = time
    purple_oct_material.userData.shader.uniforms.uTime.value = time
    skyblue_material.userData.shader.uniforms.uTime.value = time
    magenta_material.userData.shader.uniforms.uTime.value = time
    torus_pink_material.userData.shader.uniforms.uTime.value = time
    // torus_skyblue_material.userData.shader.uniforms.uTime.value = time

    // plain_sphere.position.set(-Math.sin(time * 10) + 2, Math.cos(time * 10)+2, 1)
    plain_sphere.rotation.x = time / 400
    plain_sphere.scale.set(Math.abs(Math.sin(time * 10)) * 0.8 + 1.2, Math.abs(Math.cos(time * 10)) * 1.2 + 0.8, Math.abs(Math.sin(time * 10)) * 1.4 + 0.6)

    ico1.position.set(Math.sin(time * 10) + 3, Math.cos(time * 10), 0)
    ico2.position.set(-Math.sin(time * 10) - 3, -1, -Math.cos(time * 10))
    ico3.position.set(-1.4-1.2*Math.sin(time * 30), -1.0+Math.cos(time * 30), 4.0)
    ico3.scale.x =  0.6+ 0.3*Math.sin(time*30)
    ico3.scale.y =  0.6+0.3*Math.cos(time*30)

    ico1.rotation.y = time / 10000
    ico2.rotation.y = time / 10000
    box1.rotation.x = time
    box1.rotation.y = time

    oct.rotation.x = time
    oct.rotation.y = time
    oct.position.x = Math.sin(time) + 6.5

    torus1.rotation.x = Math.PI/3 + time
    torus1.rotation.y = 2* Math.PI/3 - time
    torus1.scale.set(Math.sin(time * 10)*0.1 + 0.4, Math.cos(time * 10)*0.2+0.3,0.5)
    torus1.position.set(0.5*Math.sin(time *5) - 4, 1.3*Math.cos(time * 30), -4)

    torus2.rotation.x = Math.PI/3 + time
    torus2.rotation.y = 2* Math.PI/3 - time
    torus2.scale.set(Math.sin(time * 10)*0.1 + 0.4, Math.cos(time * 10)*0.2+0.3,0.5)
    torus2.position.set(6+1.3*Math.cos(time * 30),-1.7,-2.2+0.5*Math.sin(time *5));
    
    torus3.rotation.x = 2* Math.PI/3 + time
    torus3.rotation.y = Math.PI/3 - time
    torus3.scale.set(Math.sin(time * 10)*0.1 + 0.4, Math.cos(time * 10)*0.2+0.3,0.5)
    torus3.position.set(6+1.3*Math.cos(time * 30),-1.7,-2.2+0.5*Math.sin(time *5));


    plain_sphere_phong.position.y = 3 * Math.sin(time * 10)
    plain_sphere_phong.scale.y = Math.sin(time * 10)
    plain_sphere_phong.rotation.x = time / (200 + 100 * Math.sin(time * 10))
    // box1.scale.set(Math.abs(Math.sin(time%Math.PI)))
    controls.update();
  })

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = Math.floor(canvas.clientWidth * pixelRatio);
    const height = Math.floor(canvas.clientHeight * pixelRatio);
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function getCanvasRelativePosition(event) {
    const canvas = renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * canvas.width / rect.width,
      y: (event.clientY - rect.top) * canvas.height / rect.height,
    };
  }

  function setPickPosition(event) {
    const canvas = renderer.domElement;
    const pos = getCanvasRelativePosition(event);
    pickPosition.x = (pos.x / canvas.width) * 2 - 1;
    pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // Y 축을 뒤집었음
  }

  function clearPickPosition() {
    /**
     * 마우스의 경우는 항상 위치가 있어 그다지 큰
     * 상관이 없지만, 터치 같은 경우 사용자가 손가락을
     * 떼면 피킹을 멈춰야 합니다. 지금은 일단 어떤 것도
     * 선택할 수 없는 값으로 지정해두었습니다
     **/
    pickPosition.x = -100000;
    pickPosition.y = -100000;
  }

  function onMouseClick(event) {
    console.log(pickHelper.pickedObject.geometry.type === "PlaneGeometry")

    if (pickHelper.pickedObject) {
      const targetPosition = new THREE.Vector3().copy(pickHelper.pickedObject.position).add(new THREE.Vector3(2 * Math.sign(pickHelper.pickedObject.position.x), 2 * pickHelper.pickedObject.scale.y, 3 * Math.sign(pickHelper.pickedObject.position.z)));
      gsap.to(camera.position, {
        duration: 2,
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        onUpdate: () => {
          camera.lookAt((pickHelper.selectedObject.position).add(new THREE.Vector3(0, 0, -1)));
        }
      });
      const text_array = [["Ugly",
        "We all harbor deep-seated jealousy, resentment, and hostility towards others in our hearts. This jealousy quietly rotates on the emotional plane. We cannot completely eliminate these feelings; after all, we are human, not divine. However, we can potentially hold onto them more strongly compared to other emotions."],
      ["Happiness", "Happiness, tinged with a bright pink hue, rises high on the plane, only to rotate back to its original position. Some fear the loss that comes with its descent. Its size may be large, but it does not necessarily guarantee great happiness. Just as happiness closely resembles sadness next to it, our emotions are always relatively changing."],
      ["Sadness", "Depression and sorrow rotate parallel to the plane. This emotion settles deep within us without bouncing around, immersing us somewhere. Yet, sadness isn’t entirely negative. Resembling happiness nearby, sadness becomes a crucial step and element for experiencing happiness. Happiness without sadness is akin to false happiness."],
      ["Transparent", "Do you have a part of yourself that exists but is almost nonexistent, something you never want others to see? The components of our emotions are not necessarily solid."],
      ["Mood Swings", "Rapidly fluctuating emotions from the lowest to the highest points constitute mood swings. While mood swings themselves aren’t emotions, they play a significant role in shaping our minds. Do you like mood swings? Most people strive to maintain their minds like calm lakes, wary of fluctuating emotions. However, excessive suppression may lead to greater backlash."]
      ]

      // const paleblue = 0x425fff
      // const skyblue = 0x78d9ff
      // const magenta = 0xff42a1
      // const purple = 0x4c00ff
      // const pink = 0xffbaca
      console.log(pickHelper.pickedObjectSavedColor)

      if (pickHelper.pickedObjectSavedColor === purple) {
        info.textContent = text_array[0][0]
        infoDetail.textContent = text_array[0][1]
      } else if (pickHelper.pickedObjectSavedColor === magenta) {
        info.textContent = text_array[1][0]
        infoDetail.textContent = text_array[1][1]
      } else if (pickHelper.pickedObjectSavedColor === skyblue) {
        info.textContent = text_array[2][0]
        infoDetail.textContent = text_array[2][1]
      } else if (pickHelper.pickedObjectSavedColor === paleblue) {
        info.textContent = text_array[3][0]
        infoDetail.textContent = text_array[3][1]
      } else if (pickHelper.pickedObjectSavedColor === pink) {
        info.textContent = text_array[4][0]
        infoDetail.textContent = text_array[4][1]
      }
      // info.textContent = `Picked: ${pickHelper.pickedObject.material.color.getHexString()}`;
    }
  }

  window.addEventListener('mousemove', setPickPosition);
  window.addEventListener('mouseout', clearPickPosition);
  window.addEventListener('mouseleave', clearPickPosition);
  window.addEventListener('click', onMouseClick, false);
}

export default startApp
