import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.18/+esm';

// --- Scene ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdddddd);

// --- Camera ---
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(4, 3, 6);

// --- Renderer ---
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// ---- XR Buttons Container ----
const xrButtonContainer = document.createElement('div');
xrButtonContainer.style.cssText = `
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16px;
  z-index: 999;
`;
document.body.appendChild(xrButtonContainer);

// VR Button
const vrButton = VRButton.createButton(renderer);
vrButton.style.position = 'relative';
vrButton.style.bottom = 'unset';
vrButton.style.left = 'unset';
vrButton.style.transform = 'none';
xrButtonContainer.appendChild(vrButton);

// AR Button
const arButton = ARButton.createButton(renderer, {
  requiredFeatures: ['hit-test'],
  optionalFeatures: ['dom-overlay'],
});
arButton.style.position = 'relative';
arButton.style.bottom = 'unset';
arButton.style.left = 'unset';
arButton.style.transform = 'none';
xrButtonContainer.appendChild(arButton);

// Track AR mode — flag set on click so sessionstart knows which mode launched
let isARMode = false;

arButton.addEventListener('click', () => { isARMode = true; });
vrButton.addEventListener('click', () => { isARMode = false; });

renderer.xr.addEventListener('sessionstart', () => {
  applyARMode(isARMode);
});

renderer.xr.addEventListener('sessionend', () => {
  isARMode = false;
  applyARMode(false);
});

// Meshes to hide in AR (environment objects)
const environmentObjects = [];

function applyARMode(active) {
  if (active) {
    scene.background = null; // transparent background
  } else {
    scene.background = new THREE.Color(0xdddddd);
  }
  environmentObjects.forEach(obj => {
    obj.visible = !active;
  });
}

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
environmentObjects.push(backWall);

const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4, 10), wallMat);
leftWall.position.set(-5, 2, 0);
scene.add(leftWall);
environmentObjects.push(leftWall);

// --- Table / Counter ---
const counterMat = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.3, metalness: 0.6 });

const counter = new THREE.Mesh(new THREE.BoxGeometry(2, 0.2, 9), counterMat);
counter.position.set(-4, 1, 0);
scene.add(counter);
environmentObjects.push(counter);

const table = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, 2), counterMat);
table.position.set(0, 1, 3.5);
scene.add(table);
// NOTE: table stays visible in AR — it's a prop for the robot

// --- Plate ---
const plateMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });

const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.1, 0.1, 42), plateMat);
plate.position.set(0, 1.1, 3);
scene.add(plate);

// --- Cup (Glass) ---
const cupMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.1,
  transparent: true,
  opacity: 0.4
});

const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.1, 0.4, 32), cupMat);
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
environmentObjects.push(plane);

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

// ROBOT MATERIAL SYSTEM /////////////////////////////////////////////////
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

const upperArmLength = 1.0;
const forearmLength = 1.0;

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

[-0.12, -0.04, 0.04, 0.12].forEach(x => {
  const f = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.25, 0.07), handMat);
  f.position.set(x, -0.2, 0.2);
  f.castShadow = true;
  right_hand.add(f);
});

// Left Arm
const leftShoulder = new THREE.Group();
leftShoulder.position.set(-0.6, 0.6, 0);
torso.add(leftShoulder);

const upperArmLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1, 0.3), armMat);
upperArmLeft.geometry.translate(0, -0.5, 0);
upperArmLeft.castShadow = true;
leftShoulder.add(upperArmLeft);

const elbowLeft = new THREE.Group();
elbowLeft.position.y = -1;
upperArmLeft.add(elbowLeft);

const forearmLeft = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1, 0.25), forearmMat);
forearmLeft.geometry.translate(0, -0.5, 0);
forearmLeft.castShadow = true;
elbowLeft.add(forearmLeft);

const handLeft = new THREE.Group();

const palmLeft = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.5), handMat);
palmLeft.castShadow = true;
handLeft.add(palmLeft);

[-0.12, -0.04, 0.04, 0.12].forEach(x => {
  const f = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.25, 0.07), handMat);
  f.position.set(x, -0.2, 0.2);
  f.castShadow = true;
  handLeft.add(f);
});

const thumbLeft = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.2, 0.07), handMat);
thumbLeft.position.set(0.22, -0.1, 0);
thumbLeft.rotation.z = -Math.PI / 6;
thumbLeft.castShadow = true;
handLeft.add(thumbLeft);

handLeft.position.y = -1;
forearmLeft.add(handLeft);

// --- Legs ---
const legMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

const rightLeg = new THREE.Group();
rightLeg.position.set(0.3, -0.7, 0);
torso.add(rightLeg);

const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.3), legMat);
thigh.position.y = -0.4;
rightLeg.add(thigh);

const shin = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.8, 0.25), legMat);
shin.position.y = -0.9;
rightLeg.add(shin);

const foot = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.5), legMat);
foot.position.set(0, -1.25, 0.1);
rightLeg.add(foot);

const leftLeg = new THREE.Group();
leftLeg.position.set(-0.3, -0.7, 0);
torso.add(leftLeg);

const thighL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.3), legMat);
thighL.position.y = -0.4;
leftLeg.add(thighL);

const shinL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.8, 0.25), legMat);
shinL.position.y = -0.9;
leftLeg.add(shinL);

const footL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.5), legMat);
footL.position.set(0, -1.25, 0.1);
leftLeg.add(footL);

// ================= VR CONTROLLERS =================

const controllerModelFactory = new XRControllerModelFactory();

const controller1 = renderer.xr.getController(0);
scene.add(controller1);

const controllerGrip1 = renderer.xr.getControllerGrip(0);
controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
scene.add(controllerGrip1);

const controller2 = renderer.xr.getController(1);
scene.add(controller2);

const controllerGrip2 = renderer.xr.getControllerGrip(1);
controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
scene.add(controllerGrip2);

const lineGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, -1)
]);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });

controller1.add(new THREE.Line(lineGeometry.clone(), lineMaterial));
controller2.add(new THREE.Line(lineGeometry.clone(), lineMaterial.clone()));

const targetMat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
const rightTarget = new THREE.Mesh(new THREE.SphereGeometry(0.05), targetMat);
const leftTarget = new THREE.Mesh(new THREE.SphereGeometry(0.05), targetMat.clone());
leftTarget.material.color.set(0x0000ff);
scene.add(rightTarget, leftTarget);

// ================= INVERSE KINEMATICS =================

function solveTwoLinkIK(targetPos, shoulderWorldPos, l1, l2) {
  const dx = targetPos.x - shoulderWorldPos.x;
  const dy = targetPos.y - shoulderWorldPos.y;
  const dz = targetPos.z - shoulderWorldPos.z;

  const distXZ = Math.sqrt(dx * dx + dz * dz);
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

  const maxReach = l1 + l2 - 0.01;
  const minReach = Math.abs(l1 - l2) + 0.01;
  const clampedDist = THREE.MathUtils.clamp(dist, minReach, maxReach);

  const cosElbow = (l1 * l1 + l2 * l2 - clampedDist * clampedDist) / (2 * l1 * l2);
  const elbowAngle = Math.PI - Math.acos(THREE.MathUtils.clamp(cosElbow, -1, 1));

  const cosAlpha = (l1 * l1 + clampedDist * clampedDist - l2 * l2) / (2 * l1 * clampedDist);
  const alpha = Math.acos(THREE.MathUtils.clamp(cosAlpha, -1, 1));

  const angleToTarget = Math.atan2(-dy, distXZ);
  const shoulderPitch = angleToTarget + alpha;
  const shoulderYaw = Math.atan2(dx, dz);

  return { shoulderPitch, shoulderYaw, elbowAngle };
}

// ================= GUI =================

const gui = new GUI();

const lightFolder = gui.addFolder("Lights");
lightFolder.add(ambientLight, 'intensity', 0, 2, 0.01).name("Ambient Intensity");
lightFolder.add(spotLight, 'intensity', 0, 5, 0.01).name("SpotLight Intensity");
lightFolder.add(spotLight.position, 'x', -10, 10, 0.1);
lightFolder.add(spotLight.position, 'y', 0, 10, 0.1);
lightFolder.add(spotLight.position, 'z', -10, 10, 0.1);
lightFolder.open();

const robotFolder = gui.addFolder("Robot Material");
const materialSettings = { metalness: 0.3, roughness: 0.6 };

robotFolder.add(materialSettings, 'metalness', 0, 1, 0.01)
  .name("Metalness")
  .onChange((v) => robotMaterials.forEach(m => m.metalness = v));

robotFolder.add(materialSettings, 'roughness', 0, 1, 0.01)
  .name("Roughness")
  .onChange((v) => robotMaterials.forEach(m => m.roughness = v));

robotFolder.open();

const fkSettings = { shoulder: 0, elbow: 0 };
const robotControlFolder = gui.addFolder("Robot FK Control");
robotControlFolder.add(fkSettings, "shoulder", -2, 2, 0.01).name("Shoulder Angle");
robotControlFolder.add(fkSettings, "elbow", -2, 2, 0.01).name("Elbow Angle");
robotControlFolder.open();

const vrSettings = { ikEnabled: true, showTargets: true };
const vrFolder = gui.addFolder("VR Teleoperation");
vrFolder.add(vrSettings, "ikEnabled").name("Enable IK");
// vrFolder.add(vrSettings, "showTargets").name("Show Targets");
vrFolder.open();

const objectFolder = gui.addFolder("Table Objects");
const plateSettings = { plateColor: "#ffffff" };
objectFolder.addColor(plateSettings, "plateColor")
  .name("Plate Color")
  .onChange((v) => plateMat.color.set(v));

const cupSettings = { cupColor: "#ffffff", opacity: 0.4 };
objectFolder.addColor(cupSettings, "cupColor")
  .name("Glass Tint")
  .onChange((v) => cupMat.color.set(v));

objectFolder.add(cupSettings, "opacity", 0, 1, 0.01)
  .name("Glass Opacity")
  .onChange((v) => cupMat.opacity = v);

objectFolder.open();

// ================= ANIMATION LOOP =================

const rightShoulderWorldPos = new THREE.Vector3();
const leftShoulderWorldPos = new THREE.Vector3();
const controller1WorldPos = new THREE.Vector3();
const controller2WorldPos = new THREE.Vector3();

function animate() {
  const session = renderer.xr.getSession();

  rightTarget.visible = vrSettings.showTargets;
  leftTarget.visible = vrSettings.showTargets;

  if (session && vrSettings.ikEnabled) {
    controller1.getWorldPosition(controller1WorldPos);
    controller2.getWorldPosition(controller2WorldPos);

    rightTarget.position.copy(controller1WorldPos);
    leftTarget.position.copy(controller2WorldPos);

    right_shoulder.getWorldPosition(rightShoulderWorldPos);
    leftShoulder.getWorldPosition(leftShoulderWorldPos);

    const rightIK = solveTwoLinkIK(controller1WorldPos, rightShoulderWorldPos, upperArmLength, forearmLength);
    right_shoulder.rotation.x = rightIK.shoulderPitch;
    right_shoulder.rotation.y = rightIK.shoulderYaw;
    right_elbow.rotation.x = rightIK.elbowAngle;

    const leftIK = solveTwoLinkIK(controller2WorldPos, leftShoulderWorldPos, upperArmLength, forearmLength);
    leftShoulder.rotation.x = leftIK.shoulderPitch;
    leftShoulder.rotation.y = -leftIK.shoulderYaw;
    elbowLeft.rotation.x = leftIK.elbowAngle;

  } else {
    const t = Date.now() * 0.001;
    const wave = (Math.sin(t) - 1) * 0.5;

    const shoulderForward = wave * 0.8;
    const elbowForward = wave * 1.0;

    right_shoulder.rotation.x = fkSettings.shoulder + shoulderForward;
    right_shoulder.rotation.y = 0;
    right_elbow.rotation.x = fkSettings.elbow + elbowForward;

    leftShoulder.rotation.x = fkSettings.shoulder + shoulderForward;
    leftShoulder.rotation.y = 0;
    elbowLeft.rotation.x = fkSettings.elbow + elbowForward;

    rightTarget.visible = false;
    leftTarget.visible = false;
  }

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);