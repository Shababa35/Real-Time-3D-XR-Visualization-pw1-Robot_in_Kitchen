import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.update();

// --- Resize Handler ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Textures ---
const textureLoader = new THREE.TextureLoader();

// --- Walls ---
const wallTexture = textureLoader.load('wall.jpg');
wallTexture.colorSpace = THREE.SRGBColorSpace;
wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.repeat.set(2, 2);

const wallMat = new THREE.MeshStandardMaterial({ map: wallTexture, emissive: 0xffffff, emissiveIntensity: 0.35 });

const backWall = new THREE.Mesh(new THREE.BoxGeometry(10, 4, 0.2), wallMat);
backWall.position.set(0, 2, -5);
scene.add(backWall);

const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4, 10), wallMat);
leftWall.position.set(-5, 2, 0);
scene.add(leftWall);

// --- Floor ---
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const woodTexture = textureLoader.load('wood.jpg');
woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
woodTexture.repeat.set(2, 2);
const planeMaterial = new THREE.MeshStandardMaterial({ map: woodTexture });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

// --- Tables ---
function createTable(width, height, depth, color, position) {
  const geo = new THREE.BoxGeometry(width, height, depth);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.6 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

const counter = createTable(2, 0.2, 9, 0x999999, [-4, 1, 0]);
const table = createTable(6, 0.2, 2, 0x999999, [0, 1, 3.5]);
scene.add(counter, table);

// --- Plate & Cup ---
function createCylinder(radiusTop, radiusBottom, height, segments, color, pos, options = {}) {
  const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, ...options });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(...pos);
  mesh.castShadow = true;
  return mesh;
}

const plate = createCylinder(0.3, 0.1, 0.1, 42, 0xffffff, [0, 1.1, 3]);
const cup = createCylinder(0.2, 0.1, 0.4, 32, 0xffffff, [-0.9, 1.3, 3], { roughness: 0.1, metalness: 0, transparent: true, opacity: 0.4 });
scene.add(plate, cup);

// --- Lights ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);



// --- UI Message ---
const infoMessage = document.createElement('div');
Object.assign(infoMessage.style, {
  position: 'absolute',
  bottom: '50px',
  left: '50px',
  background: 'rgba(255,255,255,0.8)',
  padding: '10px',
  borderRadius: '8px',
  fontFamily: 'Arial, sans-serif',
  fontSize: '14px',
  color: '#000'
});
infoMessage.innerText = "Touch the glass or plate to move them";
document.body.appendChild(infoMessage);

// --- Dragging ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;
let offset = new THREE.Vector3();
let dragPlane = new THREE.Plane();
const draggableObjects = [plate, cup];

function onMouseDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(draggableObjects);
  if (intersects.length > 0) {
    selectedObject = intersects[0].object;
    dragPlane.set(new THREE.Vector3(0, 1, 0), -selectedObject.position.y);
    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(dragPlane, intersectionPoint);
    offset.copy(intersectionPoint).sub(selectedObject.position);
    document.body.style.cursor = 'move';
  }
}

function onMouseMove(event) {
  if (!selectedObject) return;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersectionPoint = new THREE.Vector3();
  if (raycaster.ray.intersectPlane(dragPlane, intersectionPoint)) {
    selectedObject.position.copy(intersectionPoint.sub(offset));
  }
}

function onMouseUp() {
  selectedObject = null;
  document.body.style.cursor = 'default';
}

window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mouseup', onMouseUp);






// //////////////////////////////////Excercise :02// /////////////////////////////////

// --- Robot base ---
const robot = new THREE.Group();
scene.add(robot);
robot.position.set(0, 0.99, 0); // ground level

// --- Torso ---
const torsoGeo = new THREE.BoxGeometry(1, 1.5, 0.6);
const torsoMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
const torso = new THREE.Mesh(torsoGeo, torsoMat);
torso.castShadow = true;
torso.position.y = 1; // half height
robot.add(torso);

// --- Head ---
const headGeo = new THREE.SphereGeometry(0.4, 32, 32);
const headMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.5 });
const head = new THREE.Mesh(headGeo, headMat);
head.castShadow = true;
head.position.y = 1.1;
torso.add(head);

// --- RIGHT ARM ---

// Right Shoulder
const shoulder = new THREE.Group();
shoulder.position.set(0.6, 0.6, 0);
torso.add(shoulder);

// Right Upperarm

const upperArmGeo = new THREE.BoxGeometry(0.3, 1, 0.3);
upperArmGeo.translate(0, -0.5, 0); // pivot top
const upperArmMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
const upperArm = new THREE.Mesh(upperArmGeo, upperArmMat);
upperArm.castShadow = true;
shoulder.add(upperArm);

// Right Elbow

const elbow = new THREE.Group();
elbow.position.y = -1;
upperArm.add(elbow);

// fprarm
const forearmGeo = new THREE.BoxGeometry(0.25, 1, 0.25);
forearmGeo.translate(0, -0.5, 0);
const forearmMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
const forearm = new THREE.Mesh(forearmGeo, forearmMat);
forearm.castShadow = true;
elbow.add(forearm);

// Hand/ 
const hand = new THREE.Group();
const palmGeo = new THREE.BoxGeometry(0.4, 0.15, 0.5);
const handMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
const palm = new THREE.Mesh(palmGeo, handMat);
palm.castShadow = true;
hand.add(palm);

// Gripper/ Fingers
const fingerGeo = new THREE.BoxGeometry(0.07, 0.25, 0.07);
[-0.12, -0.04, 0.04, 0.12].forEach(x => {
  const f = new THREE.Mesh(fingerGeo, handMat);
  f.position.set(x, -0.2, 0.2);
  f.castShadow = true;
  hand.add(f);
});

const thumbGeo = new THREE.BoxGeometry(0.07, 0.2, 0.07);
const thumb = new THREE.Mesh(thumbGeo, handMat);
thumb.position.set(-0.22, -0.1, 0);
thumb.rotation.z = Math.PI/6;
thumb.castShadow = true;
hand.add(thumb);

hand.position.y = -1;
forearm.add(hand);

// --- LEFT ARM  ---
const leftShoulder = new THREE.Group();
leftShoulder.position.set(-0.6, 0.6, 0);
torso.add(leftShoulder);

const upperArmLeft = new THREE.Mesh(upperArmGeo.clone(), upperArmMat);
upperArmLeft.castShadow = true;
leftShoulder.add(upperArmLeft);

const elbowLeft = new THREE.Group();
elbowLeft.position.y = -1;
upperArmLeft.add(elbowLeft);

const forearmLeft = new THREE.Mesh(forearmGeo.clone(), forearmMat);
forearmLeft.castShadow = true;
elbowLeft.add(forearmLeft);

const handLeft = new THREE.Group();
const palmLeft = new THREE.Mesh(palmGeo.clone(), handMat);
palmLeft.castShadow = true;
handLeft.add(palmLeft);

[-0.12, -0.04, 0.04, 0.12].forEach(x => {
  const f = new THREE.Mesh(fingerGeo.clone(), handMat);
  f.position.set(x, -0.2, 0.2);
  f.castShadow = true;
  handLeft.add(f);
});

const thumbLeft = new THREE.Mesh(thumbGeo.clone(), handMat);
thumbLeft.position.set(0.22, -0.1, 0);
thumbLeft.rotation.z = -Math.PI/6;
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

// --- Robot axes helper/debug ---
robot.add(new THREE.AxesHelper(2));
shoulder.add(new THREE.AxesHelper(0.5));
elbow.add(new THREE.AxesHelper(0.5));
forearm.add(new THREE.AxesHelper(0.5));
hand.add(new THREE.AxesHelper(0.5));

// --- Animate ---
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();