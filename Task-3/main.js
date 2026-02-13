// ════════════════════════════════════════════════════════
//  MAIN.JS — Entry Point
//  Orchestrates loading, scene init, scroll, render loop
// ════════════════════════════════════════════════════════

import { initScene, render, onResize, getCamera, getClock, getModel } from './scene.js';
import { createParticles, updateParticles, setParticleOpacity } from './particles.js';
import { initScrollAnimations } from './scroll.js';
import { getScene } from './scene.js';

// ─── DOM ELEMENTS ───────────────────────────────────────
const loader = document.getElementById('loader');
const loaderFill = document.getElementById('loaderFill');
const loaderPercent = document.getElementById('loaderPercent');
const scrollIndicator = document.getElementById('scrollIndicator');

// ─── LOADING ────────────────────────────────────────────
function updateLoadingProgress(progress) {
    const pct = Math.round(progress * 100);
    loaderFill.style.width = `${pct}%`;
    loaderPercent.textContent = `${pct}%`;
}

// ─── BOOT SEQUENCE ──────────────────────────────────────
async function boot() {
    try {
        // 1) Initialize the Three.js scene and load the model
        await initScene(updateLoadingProgress);

        // 2) Create the particle system
        const scene = getScene();
        createParticles(scene);
        setParticleOpacity(0);

        // 3) Small delay for smoothness, then fade out loader
        await delay(400);
        updateLoadingProgress(1);
        await delay(600);

        loader.classList.add('loaded');

        // 4) After loader fades, init scroll animations
        await delay(900);
        initScrollAnimations();

        // 5) Show scroll indicator
        scrollIndicator.classList.add('visible');

        // 6) Start render loop
        tick();

    } catch (err) {
        console.error('Boot failed:', err);
        loaderPercent.textContent = 'Error loading experience';
    }
}

// ─── RENDER LOOP ────────────────────────────────────────
function tick() {
    requestAnimationFrame(tick);

    const clock = getClock();
    const elapsed = clock.getElapsedTime();
    const camera = getCamera();
    const model = getModel();

    // Update particles wave motion
    updateParticles(elapsed);

    // Camera always looks at the model center
    if (model) {
        camera.lookAt(
            model.position.x,
            model.position.y + 0.3,
            model.position.z
        );
    }

    // Render the scene
    render();
}

// ─── EVENTS ─────────────────────────────────────────────
window.addEventListener('resize', onResize);

// ─── UTILITY ────────────────────────────────────────────
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── START ──────────────────────────────────────────────
boot();
