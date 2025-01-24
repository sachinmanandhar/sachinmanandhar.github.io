import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

// Configure renderer
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById("globe-container").appendChild(renderer.domElement);

// Create Earth with improved texture and material
const earthGeometry = new THREE.SphereGeometry(2, 64, 64); // Increased segments for smoother sphere
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load(
  "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg"
);
const bumpMap = textureLoader.load(
  "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg"
);
const specMap = textureLoader.load(
  "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg"
);

const earthMaterial = new THREE.MeshPhongMaterial({
  map: earthTexture,
  bumpMap: bumpMap,
  bumpScale: 0.05,
  specularMap: specMap,
  specular: new THREE.Color("grey"),
  shininess: 50,
});

const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Enhanced lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1.5);
pointLight.position.set(5, 3, 5);
scene.add(pointLight);

// Add atmospheric glow
const atmosphereGeometry = new THREE.SphereGeometry(2.1, 64, 64);
const atmosphereMaterial = new THREE.ShaderMaterial({
  transparent: true,
  side: THREE.BackSide,
  uniforms: {
    glowColor: { value: new THREE.Color(0x6699ff) },
    viewVector: { value: camera.position },
  },
  vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPositionNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vPositionNormal = normalize(normalMatrix * position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
  fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        varying vec3 vPositionNormal;
        void main() {
            float intensity = pow(0.7 - dot(vNormal, vPositionNormal), 2.0);
            gl_FragColor = vec4(glowColor, intensity);
        }
    `,
});

const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
scene.add(atmosphere);

// Enhanced stars
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.1,
  transparent: true,
  opacity: 0.8,
});

const starVertices = [];
for (let i = 0; i < 15000; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = (Math.random() - 0.5) * 2000;
  starVertices.push(x, y, z);
}

starGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVertices, 3)
);
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Camera position and controls
camera.position.z = 5;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 3;
controls.maxDistance = 10;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// Project markers with hover effect
const projectLocations = [
  { lat: 28.3949, lng: 84.124, name: "ICIMOD Projects" },
  { lat: 27.7172, lng: 85.324, name: "Kathmandu Projects" },
];

// Function to convert lat/lng to 3D coordinates
function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Add interactive markers
const markers = [];
projectLocations.forEach((location) => {
  const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
  const markerMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.8,
  });
  const marker = new THREE.Mesh(markerGeometry, markerMaterial);

  const position = latLngToVector3(location.lat, location.lng, 2);
  marker.position.copy(position);
  marker.userData.location = location;
  markers.push(marker);
  scene.add(marker);

  // Add pulsing effect
  const pulseGeometry = new THREE.SphereGeometry(0.08, 16, 16);
  const pulseMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.3,
  });
  const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
  pulse.position.copy(position);
  scene.add(pulse);

  marker.pulse = pulse;
});

// Remove the scroll-based visibility code and replace with constant visibility
const globeContainer = document.getElementById("globe-container");
globeContainer.style.opacity = "0.6"; // Set a constant semi-transparent opacity
controls.autoRotate = true; // Keep auto-rotation always on

// Update the animation loop to always render
function animate() {
  requestAnimationFrame(animate);

  earth.rotation.y += 0.001;

  // Animate markers
  markers.forEach((marker) => {
    marker.pulse.scale.x = 1 + Math.sin(Date.now() * 0.003) * 0.2;
    marker.pulse.scale.y = 1 + Math.sin(Date.now() * 0.003) * 0.2;
    marker.pulse.scale.z = 1 + Math.sin(Date.now() * 0.003) * 0.2;
  });

  controls.update();
  renderer.render(scene, camera);
}

// Update the CSS for the globe container
const style = document.createElement("style");
style.textContent = `
    #globe-container {
        opacity: 0.6;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        z-index: -1;
        pointer-events: none;
        background: transparent;
    }
`;
document.head.appendChild(style);

animate();
