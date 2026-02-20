import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js"

/* -------------------- Globals -------------------- */
let mixer;
let medusa;
let wheel;

const clock = new THREE.Clock();

/* -------------------- Scene Setup -------------------- */
const scene = new THREE.Scene();

const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 1.5;

const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 100
);

camera.position.set(0, -0.15, 2);
camera.lookAt(0, -0.15, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById("medusaThree").appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = true;
controls.minDistance = 0.5;
controls.maxDistance = 5;
/* -------------------- Environment -------------------- */
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

new RGBELoader().load('/night.hdr', (texture) => {
  const envMap = pmremGenerator.fromEquirectangular(texture).texture;
  scene.environment = envMap;
  scene.background = new THREE.Color("#ffffff");
  texture.dispose();
  pmremGenerator.dispose();
});

/* -------------------- Lights -------------------- */
scene.add(new THREE.AmbientLight(0xffffff, 0.2));
const keyLight = new THREE.DirectionalLight(0xffffff, 0.2);
keyLight.position.set(0, 3, 3);
scene.add(keyLight);

/* -------------------- Load Model -------------------- */
const loader = new GLTFLoader();
loader.load('./medusa.glb', (gltf) => {

  medusa = gltf.scene;
  scene.add(medusa);

  const box = new THREE.Box3().setFromObject(medusa);
  const center = box.getCenter(new THREE.Vector3());
  medusa.position.sub(center);
  medusa.position.y += 0.02;

  mixer = new THREE.AnimationMixer(medusa);
  wheel = medusa.getObjectByName("CamWheel");

});

/* -------------------- Animation Loop -------------------- */

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  if (medusa) {
    medusa.rotation.y += 0.01;
  }
  if (wheel) {
    wheel.rotation.x += delta * 3;
  }
  controls.update();
  renderer.render(scene, camera);
}

animate();

const infoBtn = document.getElementById("infoBtn");
const infoPanel = document.getElementById("infoPanel");
infoBtn.addEventListener("click", () => {
  infoPanel.classList.toggle("active");
});
