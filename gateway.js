import * as THREE from "three";
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise';

const canvas = document.getElementById('gateway');
const gatewayCanvas = document.getElementById('gateway');


const width = window.innerWidth;
const height = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
camera.position.set(0.5, 0.5, 15);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
scene.fog = new THREE.FogExp2(0x000000, 0.1);
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

const radius = 3;
const tubeLength = 30;
const geometry = new THREE.CylinderGeometry(radius, radius, tubeLength, 64, 2048, true);
const tubeVerts = geometry.attributes.position;

const material = new THREE.PointsMaterial({
    size: 0.03,
    vertexColors: true,
});

const points = new THREE.Points(geometry, material);
points.rotation.x = Math.PI * 0.5;
scene.add(points);
const p = new THREE.Vector3();
const v3 = new THREE.Vector3();
const noise = new ImprovedNoise();


// Noise
const noiseAmplitude = 0.3;
const noiseFrequency = 0.6;

//Colors
const colors =[];
const hueNoiseFrequency = 0.06;
const color = new THREE.Color();


// Apply noise to each vertex of the cylinder
for (let i = 0, len = tubeVerts.count; i < len; i++) {
    p.fromBufferAttribute(tubeVerts, i);
    v3.copy(p);
    //Vertex Noise
    const vertexNoise = noise.noise(
        v3.x * noiseFrequency,
        v3.y * noiseFrequency,
        v3.z * noiseFrequency * 0.001,
    );
    v3.addScaledVector(p, vertexNoise * noiseAmplitude);
    tubeVerts.setXYZ(i, v3.x, p.y, v3.z);
    //Hue Noise
    const hueNoise = noise.noise(
        v3.x * hueNoiseFrequency,
        v3.y * hueNoiseFrequency,
        v3.z * hueNoiseFrequency,
    );
    color.setHSL(hueNoise, 0.9 , 0.3);
    colors.push(color.r, color.g, color.b);

}

geometry.setAttribute('color', new THREE.Float32BufferAttribute( colors, 3 ));

points.position.z = -15;

// Animate function
function animate(t) {
    if (gatewayCanvas.style.opacity === '0') {
        window.removeEventListener("resize", handleWindowResize);
        return; // Stop the animation if the canvas is no longer visible
    }

    requestAnimationFrame(animate);
    camera.position.x = Math.cos(t * 0.001) * 0.9;
    camera.position.y = Math.sin(t * 0.001) * 0.6;

    points.position.z += 0.1;
    if (points.position.z > 30) {
        gatewayCanvas.style.opacity = '0';
        gatewayCanvas.style.transition = 'opacity 3s ease-out';
    }

    gatewayCanvas.addEventListener('transitionend', () => {
        gatewayCanvas.style.zIndex = '-1';
    }, { once: true });

    //console.log('Still running animation');
    renderer.render(scene, camera);
}

animate(0);

// Resize event handler
function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    //console.log('Still running resize');
}

window.addEventListener("resize", handleWindowResize);
