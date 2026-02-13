// ════════════════════════════════════════════════════════
//  PARTICLES.JS — Sound-wave Particle System
//  Flowing energy particles around the headphones
// ════════════════════════════════════════════════════════

import * as THREE from 'three';

let particleSystem = null;
let particleGeo = null;
let positions = [];
let originalPositions = [];
const PARTICLE_COUNT = 1500;
const WAVE_RADIUS = 3;

export function createParticles(scene) {
    particleGeo = new THREE.BufferGeometry();
    positions = new Float32Array(PARTICLE_COUNT * 3);
    originalPositions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const opacities = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;

        // Distribute in a cylindrical shell around origin
        const angle = Math.random() * Math.PI * 2;
        const radius = WAVE_RADIUS + (Math.random() - 0.5) * 2;
        const height = (Math.random() - 0.5) * 3;

        positions[i3] = Math.cos(angle) * radius;
        positions[i3 + 1] = height;
        positions[i3 + 2] = Math.sin(angle) * radius;

        originalPositions[i3] = positions[i3];
        originalPositions[i3 + 1] = positions[i3 + 1];
        originalPositions[i3 + 2] = positions[i3 + 2];

        sizes[i] = Math.random() * 3 + 0.5;
        opacities[i] = Math.random() * 0.5 + 0.1;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    particleGeo.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));

    const particleMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uOpacity: { value: 0 },
            uColor: { value: new THREE.Color(0x4a9eff) },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
        },
        vertexShader: `
            uniform float uTime;
            uniform float uPixelRatio;
            attribute float aSize;
            attribute float aOpacity;
            varying float vOpacity;

            void main() {
                vec3 pos = position;

                // Wave motion
                float wave = sin(pos.x * 1.5 + uTime * 0.8) * 0.15;
                wave += cos(pos.z * 1.2 + uTime * 0.6) * 0.1;
                pos.y += wave;

                // Subtle radial pulse
                float dist = length(pos.xz);
                float pulse = sin(dist * 2.0 - uTime * 1.5) * 0.05;
                pos.xz *= 1.0 + pulse;

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = aSize * uPixelRatio * (80.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;

                vOpacity = aOpacity;
            }
        `,
        fragmentShader: `
            uniform float uOpacity;
            uniform vec3 uColor;
            varying float vOpacity;

            void main() {
                // Soft circular point
                float dist = length(gl_PointCoord - vec2(0.5));
                if (dist > 0.5) discard;

                float alpha = smoothstep(0.5, 0.1, dist);
                alpha *= vOpacity * uOpacity;

                gl_FragColor = vec4(uColor, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    return particleSystem;
}

export function updateParticles(time) {
    if (!particleSystem) return;
    particleSystem.material.uniforms.uTime.value = time;
}

export function setParticleOpacity(value) {
    if (!particleSystem) return;
    particleSystem.material.uniforms.uOpacity.value = value;
}

export function getParticleSystem() {
    return particleSystem;
}
