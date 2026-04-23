import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createScene() {
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
// --- Lights ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); 
scene.add(ambientLight);

// Add this:
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;

// Setup shadow properties for better quality
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;

scene.add(directionalLight);



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

// --- Animate ---
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
}

createScene();