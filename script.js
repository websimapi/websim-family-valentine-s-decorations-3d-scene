import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.module.min.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.134.0/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls;
const familyMembers = [];
const heartAnimations = [];
let decorationTargets = [];
let decorationIndex = 0;
let house; // reference to the house group

init();
animate();

function init() {
  // Create scene with a soft blue sky background
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0d8f0);

  // Set up camera: a perspective camera that can view our scene
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(-15, 10, 15);
  camera.lookAt(0, 2, 0);

  // Create the renderer and append it to the container
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("container").appendChild(renderer.domElement);

  // Add orbit controls for interactive viewing
  controls = new OrbitControls(camera, renderer.domElement);

  // Lights: ambient for soft overall lighting and directional for defined shadows
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 20, 10);
  scene.add(directionalLight);

  // Ground plane: a large, green plane to simulate grass
  const groundGeo = new THREE.PlaneGeometry(50, 50);
  const groundMat = new THREE.MeshPhongMaterial({ color: 0x228B22 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  scene.add(ground);

  // Create a simple house to decorate
  house = createHouse();
  scene.add(house);

  // Define fixed decoration target positions on the house's front face.
  // The house is rotated so that its front (with the door) is facing negative X.
  decorationTargets = [
    new THREE.Vector3(-0.55, 3, 0.8),
    new THREE.Vector3(-0.55, 3, -0.8)
  ];

  // Create two family members using simple shapes.
  // Family Member 1: Blue figure
  const member1 = createFamilyMember(0x0000ff);
  member1.position.set(-12, 0, 2);
  member1.userData = { velocity: new THREE.Vector3(0.02, 0, 0), hasDecorated: false };
  scene.add(member1);
  familyMembers.push(member1);

  // Family Member 2: Pink figure
  const member2 = createFamilyMember(0xff69b4);
  member2.position.set(-14, 0, -2);
  member2.userData = { velocity: new THREE.Vector3(0.02, 0, 0), hasDecorated: false };
  scene.add(member2);
  familyMembers.push(member2);

  // Adjust on window resize.
  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Create a simple 3D representation of a family member using a box (body) and a sphere (head)
function createFamilyMember(color) {
  const group = new THREE.Group();

  // Body: a box geometry centered on the lower half
  const bodyGeo = new THREE.BoxGeometry(0.6, 1.2, 0.4);
  const bodyMat = new THREE.MeshPhongMaterial({ color: color });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.6; // sets the body so its bottom is at ground level
  group.add(body);

  // Head: a small sphere placed on top of the body
  const headGeo = new THREE.SphereGeometry(0.3, 16, 16);
  const headMat = new THREE.MeshPhongMaterial({ color: 0xffe0bd });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.5;
  group.add(head);

  return group;
}

// Create a simple house with a box for the body and a cone as a roof.
// The house is rotated so its front (decorated face) is toward negative X.
function createHouse() {
  const houseGroup = new THREE.Group();

  // Main building: a box geometry
  const bodyGeo = new THREE.BoxGeometry(6, 4, 1);
  const bodyMat = new THREE.MeshPhongMaterial({ color: 0xfff8e1 });
  const houseBody = new THREE.Mesh(bodyGeo, bodyMat);
  houseBody.position.y = 2; // raise so that the base is at y=0
  houseGroup.add(houseBody);

  // Roof: a cone geometry styled like a pyramid
  const roofGeo = new THREE.ConeGeometry(4, 2, 4);
  const roofMat = new THREE.MeshPhongMaterial({ color: 0xd32f2f });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 4 + 1; // sits atop the building
  roof.rotation.y = Math.PI / 4;
  houseGroup.add(roof);

  // Rotate the house so its front face (to receive decorations) is toward negative X.
  houseGroup.rotation.y = Math.PI / 2;

  return houseGroup;
}

// Generate a heart mesh using a custom shape made from Bézier curves and extruding it.
// The geometry is scaled down to a proper size.
function createHeart() {
  const x = 0, y = 0;
  const heartShape = new THREE.Shape();
  heartShape.moveTo(x + 5, y + 5);
  heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
  heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
  heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
  heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
  heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
  heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

  const extrudeSettings = {
    steps: 2,
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.2,
    bevelSize: 0.2,
    bevelSegments: 2
  };

  const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
  geometry.scale(0.05, 0.05, 0.05);
  const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
  const heartMesh = new THREE.Mesh(geometry, material);
  return heartMesh;
}

// When a family member reaches the decoration zone, trigger a heart decoration animation.
// A heart is spawned at the member's "hand" position and animated toward the designated target on the house.
function triggerDecoration(member, targetPos) {
  // Approximate the hand position from the member (offset a little from the body)
  const handPos = new THREE.Vector3().copy(member.position);
  handPos.x += 0.3;
  handPos.y += 1.0;
  
  // Create a heart and place it at the hand position
  const heart = createHeart();
  heart.position.copy(handPos);
  scene.add(heart);
  
  // Set up the animation parameters for the heart
  const animation = {
    mesh: heart,
    start: handPos.clone(),
    end: targetPos.clone(),
    elapsed: 0,
    duration: 2.0 // seconds
  };
  heartAnimations.push(animation);
}

function animate() {
  requestAnimationFrame(animate);
  const delta = 0.016; // approximate frame time (in seconds)

  // Update each family member's movement and trigger decoration when close to the house.
  familyMembers.forEach(member => {
    if (!member.userData.hasDecorated) {
      member.position.add(member.userData.velocity);
      // When the member reaches the decoration zone (x >= -2), stop them and trigger decoration.
      if (member.position.x >= -2) {
        member.userData.hasDecorated = true;
        member.userData.velocity.set(0, 0, 0);
        if (decorationIndex < decorationTargets.length) {
          triggerDecoration(member, decorationTargets[decorationIndex]);
          decorationIndex++;
        }
      }
    }
  });

  // Update all heart animation motions.
  for (let i = heartAnimations.length - 1; i >= 0; i--) {
    const anim = heartAnimations[i];
    anim.elapsed += delta;
    let t = anim.elapsed / anim.duration;
    if (t > 1) t = 1;
    // Interpolate linearly from start to end.
    anim.mesh.position.lerpVectors(anim.start, anim.end, t);
    // Add a little up-and-down wiggle for a playful effect.
    anim.mesh.position.y += 0.1 * Math.sin(t * Math.PI);
    if (t === 1) {
      // Once the heart reaches its target, remove it from the animation queue.
      heartAnimations.splice(i, 1);
    }
  }

  controls.update();
  renderer.render(scene, camera);
}