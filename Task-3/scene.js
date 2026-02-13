// ════════════════════════════════════════════════════════
//  SCENE.JS — Three.js WebGL Scene
//  Model loading, lighting, camera, renderer, post-processing
// ════════════════════════════════════════════════════════

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ─── STATE ──────────────────────────────────────────────
let renderer, scene, camera, composer;
let headphoneModel = null;
let headphoneGroup = null;
let modelParts = [];       // individual mesh children for deconstruction
let clock = new THREE.Clock();
let lights = {};
let floorPlane = null;

// Original positions/rotations of model parts (for deconstruct/reassemble)
let originalTransforms = [];

// ─── INIT ───────────────────────────────────────────────
export function initScene(onProgress) {
    const canvas = document.getElementById('webgl');

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.08);

    // Camera
    camera = new THREE.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );
    camera.position.set(0, 0.5, 5);
    camera.lookAt(0, 0, 0);

    // ─── LIGHTING ───────────────────────────────────
    // Ambient — very subtle fill
    lights.ambient = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(lights.ambient);

    // Key light — warm white from top-right
    lights.key = new THREE.DirectionalLight(0xffeedd, 1.5);
    lights.key.position.set(3, 4, 2);
    lights.key.castShadow = false;
    scene.add(lights.key);

    // Fill light — cool from left
    lights.fill = new THREE.DirectionalLight(0x88bbff, 0.4);
    lights.fill.position.set(-3, 1, 2);
    scene.add(lights.fill);

    // Rim light — blue-ish from behind
    lights.rim = new THREE.DirectionalLight(0x4a9eff, 0.8);
    lights.rim.position.set(0, 2, -3);
    scene.add(lights.rim);

    // Spot for light-sweep effect (used in Scene 5)
    lights.sweep = new THREE.SpotLight(0x4a9eff, 0, 15, Math.PI / 6, 0.5, 1);
    lights.sweep.position.set(-5, 3, 2);
    lights.sweep.target.position.set(0, 0, 0);
    scene.add(lights.sweep);
    scene.add(lights.sweep.target);

    // Point light that orbits (energy scene)
    lights.energy = new THREE.PointLight(0x4a9eff, 0, 8);
    lights.energy.position.set(2, 1, 2);
    scene.add(lights.energy);

    // ─── REFLECTIVE FLOOR ───────────────────────────
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0.9,
        roughness: 0.15,
        transparent: true,
        opacity: 0
    });
    floorPlane = new THREE.Mesh(floorGeo, floorMat);
    floorPlane.rotation.x = -Math.PI / 2;
    floorPlane.position.y = -1.5;
    scene.add(floorPlane);

    // ─── ENVIRONMENT ────────────────────────────────
    // Create a simple studio environment for reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x111111);
    // Add some colored lights to the environment scene
    const envLight1 = new THREE.DirectionalLight(0x4a9eff, 2);
    envLight1.position.set(5, 5, 5);
    envScene.add(envLight1);
    const envLight2 = new THREE.DirectionalLight(0xffeedd, 1.5);
    envLight2.position.set(-5, 3, -5);
    envScene.add(envLight2);
    const envTexture = pmremGenerator.fromScene(envScene, 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // ─── POST-PROCESSING ────────────────────────────
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.4,    // strength
        0.8,    // radius
        0.7     // threshold
    );
    composer.addPass(bloomPass);

    // ─── LOAD MODEL ─────────────────────────────────
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(
            './models/Angelica_Andreasson_Hörlurar_White1.glb',
            (gltf) => {
                headphoneModel = gltf.scene;

                // Create a group to hold the model (for easy transforms)
                headphoneGroup = new THREE.Group();
                headphoneGroup.add(headphoneModel);
                scene.add(headphoneGroup);

                // Auto-center and scale model
                const box = new THREE.Box3().setFromObject(headphoneModel);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 2.5 / maxDim;

                headphoneModel.scale.setScalar(scale);
                headphoneModel.position.sub(center.multiplyScalar(scale));

                // Set initial position (below view for VOID scene reveal)
                headphoneGroup.position.y = -3;
                headphoneGroup.visible = true;

                // Collect all meshes for deconstruction
                headphoneModel.traverse((child) => {
                    if (child.isMesh) {
                        modelParts.push(child);
                        // Store original world position
                        originalTransforms.push({
                            mesh: child,
                            position: child.position.clone(),
                            rotation: child.rotation.clone(),
                            quaternion: child.quaternion.clone()
                        });

                        // Enhance materials
                        if (child.material) {
                            child.material.envMapIntensity = 1.5;
                            child.material.needsUpdate = true;
                        }
                    }
                });

                resolve();
            },
            (xhr) => {
                const progress = xhr.loaded / (xhr.total || 1);
                if (onProgress) onProgress(progress);
            },
            (error) => {
                console.error('Model load error:', error);
                reject(error);
            }
        );
    });
}

// ─── GETTERS ────────────────────────────────────────────
export function getCamera() { return camera; }
export function getScene() { return scene; }
export function getModel() { return headphoneGroup; }
export function getModelParts() { return modelParts; }
export function getOriginalTransforms() { return originalTransforms; }
export function getLights() { return lights; }
export function getFloor() { return floorPlane; }
export function getClock() { return clock; }

// ─── RENDER LOOP ────────────────────────────────────────
export function render() {
    if (composer) {
        composer.render();
    }
}

// ─── RESIZE ─────────────────────────────────────────────
export function onResize() {
    if (!camera || !renderer || !composer) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    renderer.setSize(w, h);
    composer.setSize(w, h);
}
