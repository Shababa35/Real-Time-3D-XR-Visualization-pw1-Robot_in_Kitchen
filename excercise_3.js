import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.18/+esm';

// --- Scene ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdddddd);

// --- Camera ---
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(4, 3, 6);

// --- Renderer ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.update();

// --- Resize ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Texture Loader ---
const textureLoader = new THREE.TextureLoader();

// --- Walls ---
const wallTexture = textureLoader.load('wall.jpg');
wallTexture.colorSpace = THREE.SRGBColorSpace;
wallTexture.wrapS = THREE.RepeatWrapping;
wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.repeat.set(2, 2);

const wallMat = new THREE.MeshStandardMaterial({
  map: wallTexture,
  roughness: 0.2,
  metalness: 0.5
});

const backWall = new THREE.Mesh(new THREE.BoxGeometry(10, 4, 0.2), wallMat);
backWall.position.set(0, 2, -5);
scene.add(backWall);

const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4, 10), wallMat);
leftWall.position.set(-5, 2, 0);
scene.add(leftWall);

// --- Table ---
const counterMat = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.3, metalness: 0.6 });

const counter = new THREE.Mesh(new THREE.BoxGeometry(2, 0.2, 9), counterMat);
counter.position.set(-4, 1, 0);
scene.add(counter);

const table = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, 2), counterMat);
table.position.set(0, 1, 3.5);
scene.add(table);

// --- Plate ---
const plateMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.5
});

const plate = new THREE.Mesh(
  new THREE.CylinderGeometry(0.3, 0.1, 0.1, 42),
  plateMat
);
plate.position.set(0, 1.1, 3);
scene.add(plate);

// --- Cup (Glass) ---
const cupMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.1,
  transparent: true,
  opacity: 0.4
});

const cup = new THREE.Mesh(
  new THREE.CylinderGeometry(0.2, 0.1, 0.4, 32),
  cupMat
);
cup.position.set(-0.9, 1.3, 3);
scene.add(cup);

// --- Floor ---
const woodTexture = textureLoader.load('wood.jpg');
woodTexture.wrapS = THREE.RepeatWrapping;
woodTexture.wrapT = THREE.RepeatWrapping;
woodTexture.repeat.set(2, 2);

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({ map: woodTexture })
);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

// --- Lights ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const spotLight = new THREE.SpotLight(0xffffff, 0.7);
spotLight.position.set(2, 12, 2);
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.5;
spotLight.castShadow = true;
scene.add(spotLight);
scene.add(spotLight.target);

scene.add(new THREE.SpotLightHelper(spotLight));

// ---------------- ROBOT MATERIAL SYSTEM ----------------
const robotMaterials = [];

// --- Robot ---
const robot = new THREE.Group();
scene.add(robot);
robot.position.y = 0.5;
robot.position.z = 1;

// Torso
const torsoMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.3, roughness: 0.6 });
robotMaterials.push(torsoMat);

const torso = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 0.6), torsoMat);
torso.position.y = 1.5;
robot.add(torso);

// Head
const headMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.5, metalness: 0.2 });
robotMaterials.push(headMat);

const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 32), headMat);
head.position.set(0, 1.1, 0);
torso.add(head);

// --- Arms materials ---
const armMat = new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 0.3, roughness: 0.6 });
const forearmMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.3, roughness: 0.6 });
const handMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.3, roughness: 0.6 });

robotMaterials.push(armMat, forearmMat, handMat);

// Right Arm
const right_shoulder = new THREE.Group();
right_shoulder.position.set(0.6, 0.6, 0);
torso.add(right_shoulder);

const right_upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1, 0.3), armMat);
right_upperArm.geometry.translate(0, -0.5, 0);
right_shoulder.add(right_upperArm);

const right_elbow = new THREE.Group();
right_elbow.position.y = -1;
right_upperArm.add(right_elbow);

const right_forearm = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1, 0.25), forearmMat);
right_forearm.geometry.translate(0, -0.5, 0);
right_elbow.add(right_forearm);

const right_hand = new THREE.Group();
right_hand.position.y = -1;
right_forearm.add(right_hand);

const right_palm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.5), handMat);
right_hand.add(right_palm);


// fingers
[-0.12, -0.04, 0.04, 0.12].forEach(x => {
  const f = new THREE.Mesh(
    new THREE.BoxGeometry(0.07, 0.25, 0.07),
    handMat
  );
  f.position.set(x, -0.2, 0.2);
  f.castShadow = true;
  right_hand.add(f);
});






/// --- LEFT ARM  ---
const leftShoulder = new THREE.Group();
leftShoulder.position.set(-0.6, 0.6, 0);
torso.add(leftShoulder);

// reuse RIGHT ARM geometry + materials
const upperArmLeft = new THREE.Mesh(
  new THREE.BoxGeometry(0.3, 1, 0.3),
  armMat
);
upperArmLeft.geometry.translate(0, -0.5, 0);
upperArmLeft.castShadow = true;
leftShoulder.add(upperArmLeft);

const elbowLeft = new THREE.Group();
elbowLeft.position.y = -1;
upperArmLeft.add(elbowLeft);

const forearmLeft = new THREE.Mesh(
  new THREE.BoxGeometry(0.25, 1, 0.25),
  forearmMat
);
forearmLeft.geometry.translate(0, -0.5, 0);
forearmLeft.castShadow = true;
elbowLeft.add(forearmLeft);

const handLeft = new THREE.Group();

const palmLeft = new THREE.Mesh(
  new THREE.BoxGeometry(0.4, 0.15, 0.5),
  handMat
);
palmLeft.castShadow = true;
handLeft.add(palmLeft);

// fingers
[-0.12, -0.04, 0.04, 0.12].forEach(x => {
  const f = new THREE.Mesh(
    new THREE.BoxGeometry(0.07, 0.25, 0.07),
    handMat
  );
  f.position.set(x, -0.2, 0.2);
  f.castShadow = true;
  handLeft.add(f);
});

// thumb
const thumbLeft = new THREE.Mesh(
  new THREE.BoxGeometry(0.07, 0.2, 0.07),
  handMat
);
thumbLeft.position.set(0.22, -0.1, 0);
thumbLeft.rotation.z = -Math.PI / 6;
thumbLeft.castShadow = true;
handLeft.add(thumbLeft);

handLeft.position.y = -1;
forearmLeft.add(handLeft);


// --- Legs  ---
const legMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
// Right
const rightLeg = new THREE.Group();
rightLeg.position.set(0.3, -0.7, 0);
torso.add(rightLeg);

const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.3,0.8,0.3), legMat);
thigh.position.y = -0.4;
rightLeg.add(thigh);

const shin = new THREE.Mesh(new THREE.BoxGeometry(0.25,0.8,0.25), legMat);
shin.position.y = -0.9;
rightLeg.add(shin);

const foot = new THREE.Mesh(new THREE.BoxGeometry(0.35,0.15,0.5), legMat);
foot.position.set(0, -1.25, 0.1);
rightLeg.add(foot);

// Left
const leftLeg = new THREE.Group();
leftLeg.position.set(-0.3, -0.7, 0);
torso.add(leftLeg);

const thighL = new THREE.Mesh(new THREE.BoxGeometry(0.3,0.8,0.3), legMat);
thighL.position.y = -0.4;
leftLeg.add(thighL);

const shinL = new THREE.Mesh(new THREE.BoxGeometry(0.25,0.8,0.25), legMat);
shinL.position.y = -0.9;
leftLeg.add(shinL);

const footL = new THREE.Mesh(new THREE.BoxGeometry(0.35,0.15,0.5), legMat);
footL.position.set(0, -1.25, 0.1);
leftLeg.add(footL);

// ---------------- GUI ----------------
const gui = new GUI();

const robotFolder = gui.addFolder("Robot Material");

const materialSettings = {
  metalness: 0.3,
  roughness: 0.6
};


const lightFolder = gui.addFolder("Lights");
lightFolder.add(ambientLight, 'intensity', 0, 2, 0.01).name("Ambient Intensity");
lightFolder.add(spotLight, 'intensity', 0, 5, 0.01).name("SpotLight Intensity");
lightFolder.add(spotLight.position, 'x', -10, 10, 0.1);
lightFolder.add(spotLight.position, 'y', 0, 10, 0.1);
lightFolder.add(spotLight.position, 'z', -10, 10, 0.1);
lightFolder.open();

robotFolder.add(materialSettings, 'metalness', 0, 1, 0.01).name("Metalness").onChange((v) => {
  robotMaterials.forEach(m => m.metalness = v);
});

robotFolder.add(materialSettings, 'roughness', 0, 1, 0.01).name("Roughness").onChange((v) => {
  robotMaterials.forEach(m => m.roughness = v);
});

robotFolder.open();

const objectFolder = gui.addFolder("Table Objects");

// Plate color
const plateSettings = {
  plateColor: "#ffffff"
};

objectFolder.addColor(plateSettings, "plateColor").name("Plate Color").onChange((v) => {
  plateMat.color.set(v);
});

// Cup color (glass tint)
const cupSettings = {
  cupColor: "#ffffff",
  opacity: 0.4
};

objectFolder.addColor(cupSettings, "cupColor").name("Glass Tint").onChange((v) => {
  cupMat.color.set(v);
});

objectFolder.add(cupSettings, "opacity", 0, 1, 0.01).name("Glass Opacity").onChange((v) => {
  cupMat.opacity = v;
});

objectFolder.open();

// --- Animate ---
function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();