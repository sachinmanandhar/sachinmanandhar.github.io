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
  // { lat: 28.3949, lng: 84.124, name: "ICIMOD Projects" },
  // { lat: 27.7172, lng: 85.324, name: "Kathmandu Projects" },
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

// Update the CSS injection
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
        transition: opacity 0.3s ease;
    }
    
    #globe-container.interactive {
        z-index: 1;
    }

    /* Updated Back to Top Button Styles */
    #backToTop {
        position: fixed;
        bottom: 30px;
        right: 30px;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        border-radius: 50%;
        width: 45px;
        height: 45px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        z-index: 1000;
        padding: 0;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }

    #backToTop:hover {
        background-color: rgba(0, 0, 0, 0.9);
        transform: translateY(-3px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }

    #backToTop i {
        font-size: 20px;
        transition: transform 0.3s ease;
    }

    #backToTop:hover i {
        transform: translateY(-2px);
    }

    /* Add styles for the coming soon message */
    #interactionMessage {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-size: 18px;
        text-align: center;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        font-family: 'Arial', sans-serif;
        backdrop-filter: blur(5px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    #interactionMessage.visible {
        opacity: 1;
    }

    #interactionMessage .emoji {
        font-size: 24px;
        margin-left: 8px;
        display: inline-block;
        animation: wave 2s infinite;
    }

    @keyframes wave {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-10deg); }
        75% { transform: rotate(10deg); }
    }
`;
document.head.appendChild(style);

// Update the button creation - only use the icon
const backToTopButton = document.createElement("button");
backToTopButton.id = "backToTop";
backToTopButton.innerHTML = '<i class="bi bi-arrow-up"></i>'; // Remove the "Back to Top" text
backToTopButton.style.display = "none";
document.body.appendChild(backToTopButton);

// Create the message element
const interactionMessage = document.createElement("div");
interactionMessage.id = "interactionMessage";
interactionMessage.innerHTML = `Interactive Globe Interactions Coming Soon <span class="emoji">🌍</span>`;
document.body.appendChild(interactionMessage);

// Update the scroll-based visibility and interactivity
window.addEventListener("scroll", () => {
  const publicationsSection = document.getElementById("publications");
  const globeContainer = document.getElementById("globe-container");
  const backToTopButton = document.getElementById("backToTop");
  const interactionMessage = document.getElementById("interactionMessage");

  if (publicationsSection) {
    const rect = publicationsSection.getBoundingClientRect();
    const isAfterPublications = rect.bottom < 0;

    if (isAfterPublications) {
      globeContainer.style.opacity = "1";
      globeContainer.style.pointerEvents = "auto";
      globeContainer.classList.add("interactive");
      controls.enableZoom = true;
      controls.enableRotate = true;
      controls.enablePan = true;
      controls.autoRotate = false;
      backToTopButton.style.display = "block";
      interactionMessage.classList.add("visible"); // Show message
    } else {
      globeContainer.style.opacity = "0.6";
      globeContainer.style.pointerEvents = "none";
      globeContainer.classList.remove("interactive");
      controls.enableZoom = false;
      controls.enableRotate = false;
      controls.enablePan = false;
      controls.autoRotate = true;
      backToTopButton.style.display = "none";
      interactionMessage.classList.remove("visible"); // Hide message
    }
  }
});

// Add back to top functionality
backToTopButton.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

// Add event listeners for manual interaction
renderer.domElement.addEventListener("mousedown", () => {
  if (controls.autoRotate) return; // Only handle if not auto-rotating
  controls.autoRotate = false;
});

// Optional: Resume rotation when mouse leaves the container
renderer.domElement.addEventListener("mouseleave", () => {
  const publicationsSection = document.getElementById("publications");
  if (
    !publicationsSection ||
    publicationsSection.getBoundingClientRect().bottom >= 0
  ) {
    controls.autoRotate = true;
  }
});

// Add marker hover effects and info popup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredMarker = null;

// Create popup HTML element
const popup = document.createElement("div");
popup.className = "marker-popup";
popup.style.display = "none";
popup.style.position = "absolute";
popup.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
popup.style.color = "white";
popup.style.padding = "10px";
popup.style.borderRadius = "5px";
popup.style.pointerEvents = "none";
popup.style.zIndex = "1000";
document.body.appendChild(popup);

// Add mouse move event listener
renderer.domElement.addEventListener("mousemove", (event) => {
  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(markers);

  if (intersects.length > 0) {
    const marker = intersects[0].object;
    if (hoveredMarker !== marker) {
      // Reset previous marker if exists
      if (hoveredMarker) {
        hoveredMarker.material.color.setHex(0xff0000);
        hoveredMarker.scale.set(1, 1, 1);
      }
      // Highlight new marker
      hoveredMarker = marker;
      marker.material.color.setHex(0x00ff00);
      marker.scale.set(1.5, 1.5, 1.5);

      // Show popup with location info
      popup.innerHTML = `
                <strong>${marker.userData.location.name}</strong>
                <br>
                Lat: ${marker.userData.location.lat}°
                <br>
                Lng: ${marker.userData.location.lng}°
            `;
      popup.style.display = "block";
    }
    // Update popup position
    popup.style.left = event.clientX + 15 + "px";
    popup.style.top = event.clientY + 15 + "px";
  } else {
    if (hoveredMarker) {
      hoveredMarker.material.color.setHex(0xff0000);
      hoveredMarker.scale.set(1, 1, 1);
      hoveredMarker = null;
      popup.style.display = "none";
    }
  }
});

// Add marker click event
renderer.domElement.addEventListener("click", (event) => {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(markers);

  if (intersects.length > 0) {
    const marker = intersects[0].object;
    // Animate camera to focus on clicked marker
    const targetPosition = marker.position.clone().multiplyScalar(1.5);
    gsap.to(camera.position, {
      duration: 1,
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      onUpdate: function () {
        camera.lookAt(marker.position);
      },
    });
  }
});

// Add atmospheric glow animation
const glowIntensity = { value: 0.7 };
gsap.to(glowIntensity, {
  value: 1.0,
  duration: 2,
  yoyo: true,
  repeat: -1,
  ease: "power1.inOut",
  onUpdate: function () {
    atmosphereMaterial.uniforms.glowColor.value.setRGB(
      0.4 * glowIntensity.value,
      0.6 * glowIntensity.value,
      1.0 * glowIntensity.value
    );
  },
});

// Add custom shader for earth highlight
const customEarthShader = {
  uniforms: {
    ...earthMaterial.uniforms,
    highlightCenter: { value: new THREE.Vector3(0, 0, 0) },
    highlightRadius: { value: 0.5 },
  },
  vertexShader: `
        varying vec3 vPosition;
        void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
  fragmentShader: `
        uniform vec3 highlightCenter;
        uniform float highlightRadius;
        varying vec3 vPosition;
        void main() {
            float distance = length(vPosition - highlightCenter);
            float highlight = smoothstep(highlightRadius, highlightRadius - 0.2, distance);
            gl_FragColor = vec4(1.0, 1.0, 1.0, highlight * 0.3);
        }
    `,
};

// Update animation loop
function animate() {
  requestAnimationFrame(animate);

  earth.rotation.y += 0.001;

  // Update markers
  markers.forEach((marker) => {
    marker.pulse.scale.x = 1 + Math.sin(Date.now() * 0.003) * 0.2;
    marker.pulse.scale.y = 1 + Math.sin(Date.now() * 0.003) * 0.2;
    marker.pulse.scale.z = 1 + Math.sin(Date.now() * 0.003) * 0.2;
  });

  // Update atmosphere
  atmosphere.material.uniforms.viewVector.value = camera.position;

  controls.update();
  renderer.render(scene, camera);
}

// Add window resize handler
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
