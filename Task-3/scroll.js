// ════════════════════════════════════════════════════════
//  SCROLL.JS — GSAP ScrollTrigger Choreography
//  7-scene cinematic narrative driven by scroll
// ════════════════════════════════════════════════════════

import {
    getCamera, getModel, getModelParts, getOriginalTransforms,
    getLights, getFloor
} from './scene.js';
import { setParticleOpacity } from './particles.js';

// ─── STATE ──────────────────────────────────────────────
let deconstructionOffsets = [];

// ─── INIT ───────────────────────────────────────────────
export function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    const camera = getCamera();
    const model = getModel();
    const parts = getModelParts();
    const transforms = getOriginalTransforms();
    const lights = getLights();
    const floor = getFloor();

    if (!model || !camera) {
        console.warn('ScrollAnimations: model or camera not ready');
        return;
    }

    // Pre-compute deconstruction offsets for each part
    generateDeconstructionOffsets(parts);

    // ═══════════════════════════════════════════════════
    //  SCENE 1 — VOID
    //  Model rises from darkness, floor fades in
    // ═══════════════════════════════════════════════════
    const tl1 = gsap.timeline({
        scrollTrigger: {
            trigger: '#scene-1',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
        }
    });

    tl1
        .to(model.position, {
            y: 0,
            ease: 'power2.out',
            duration: 1
        }, 0)
        .to(floor.material, {
            opacity: 0.25,
            duration: 0.6
        }, 0.3)
        .to('#whisper-1', {
            opacity: 1,
            duration: 0.3
        }, 0.1)
        .to('#whisper-1', {
            opacity: 0,
            duration: 0.3
        }, 0.7)
        .to(lights.ambient, {
            intensity: 0.15,
            duration: 0.5
        }, 0);


    // ═══════════════════════════════════════════════════
    //  SCENE 2 — ENERGY AWAKENING
    //  Particles activate, model subtly pulses
    // ═══════════════════════════════════════════════════
    const tl2 = gsap.timeline({
        scrollTrigger: {
            trigger: '#scene-2',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
        }
    });

    tl2
        .to(camera.position, {
            z: 4,
            y: 0.3,
            duration: 1
        }, 0)
        .to(model.rotation, {
            y: Math.PI * 0.15,
            duration: 1
        }, 0)
        .to({}, {
            duration: 1,
            onUpdate: function () {
                setParticleOpacity(this.progress());
            }
        }, 0)
        .to(lights.energy, {
            intensity: 2,
            duration: 0.5
        }, 0.2)
        .to('#subtitle-2', {
            opacity: 1,
            y: 0,
            duration: 0.3
        }, 0.2)
        .from('#subtitle-2', {
            y: 40,
            duration: 0.3
        }, 0.2)
        .to('#subtitle-2b', {
            opacity: 1,
            y: 0,
            duration: 0.3
        }, 0.35)
        .from('#subtitle-2b', {
            y: 40,
            duration: 0.3
        }, 0.35)
        .to('#subtitle-2, #subtitle-2b', {
            opacity: 0,
            duration: 0.2
        }, 0.8);

    // ═══════════════════════════════════════════════════
    //  SCENE 3 — STRUCTURAL DECONSTRUCTION
    //  Parts elegantly separate, camera orbits
    // ═══════════════════════════════════════════════════
    const tl3 = gsap.timeline({
        scrollTrigger: {
            trigger: '#scene-3',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
        }
    });

    // Camera moves to side angle
    tl3.to(camera.position, {
        x: 2.5,
        y: 1,
        z: 3.5,
        duration: 1
    }, 0);

    // Reduce particle opacity
    tl3.to({}, {
        duration: 0.3,
        onUpdate: function () {
            setParticleOpacity(1 - this.progress());
        }
    }, 0);

    // Energy light fades
    tl3.to(lights.energy, {
        intensity: 0,
        duration: 0.5
    }, 0);

    // Deconstruct each part
    parts.forEach((part, i) => {
        const offset = deconstructionOffsets[i];
        if (!offset) return;

        tl3.to(part.position, {
            x: part.position.x + offset.x,
            y: part.position.y + offset.y,
            z: part.position.z + offset.z,
            duration: 1,
            ease: 'power2.inOut'
        }, 0.1 + i * 0.02);
    });

    // Text reveal
    tl3
        .to('#title-3', {
            opacity: 1,
            duration: 0.3
        }, 0.3)
        .from('#title-3', {
            x: -60,
            duration: 0.4
        }, 0.3)
        .to('#title-3b', {
            opacity: 1,
            duration: 0.3
        }, 0.45)
        .from('#title-3b', {
            x: -60,
            duration: 0.4
        }, 0.45)
        .to('#title-3, #title-3b', {
            opacity: 0,
            duration: 0.2
        }, 0.85);


    // ═══════════════════════════════════════════════════
    //  SCENE 4 — TYPOGRAPHY FROM DEPTH
    //  Monumental text emerges, camera pulls back
    // ═══════════════════════════════════════════════════
    const tl4 = gsap.timeline({
        scrollTrigger: {
            trigger: '#scene-4',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
        }
    });

    tl4
        .to(camera.position, {
            x: 0,
            y: 0.5,
            z: 5.5,
            duration: 1
        }, 0)
        .to('#depth-text', {
            opacity: 1,
            scale: 1,
            duration: 0.5
        }, 0.1)
        .fromTo('#depth-text', {
            scale: 2.5
        }, {
            scale: 1,
            duration: 0.5
        }, 0.1)
        .to('#depth-sub', {
            opacity: 1,
            duration: 0.3
        }, 0.4)
        .from('#depth-sub', {
            y: 20,
            duration: 0.3
        }, 0.4)
        .to('#depth-text, #depth-sub', {
            opacity: 0,
            duration: 0.2
        }, 0.82);


    // ═══════════════════════════════════════════════════
    //  SCENE 5 — PERFECT REASSEMBLY
    //  Parts glide back, light sweep
    // ═══════════════════════════════════════════════════
    const tl5 = gsap.timeline({
        scrollTrigger: {
            trigger: '#scene-5',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
        }
    });

    // Camera returns front
    tl5.to(camera.position, {
        x: 0,
        y: 0.3,
        z: 4.5,
        duration: 1
    }, 0);

    // Reassemble parts
    parts.forEach((part, i) => {
        const orig = transforms[i];
        if (!orig) return;

        tl5.to(part.position, {
            x: orig.position.x,
            y: orig.position.y,
            z: orig.position.z,
            duration: 1,
            ease: 'power3.inOut'
        }, i * 0.01);
    });

    // Light sweep effect
    tl5
        .to(lights.sweep, {
            intensity: 3,
            duration: 0.3
        }, 0.4)
        .to(lights.sweep.position, {
            x: 5,
            duration: 0.5
        }, 0.4)
        .to(lights.sweep, {
            intensity: 0,
            duration: 0.3
        }, 0.7);

    // Reveal text
    tl5
        .to('#reveal-line', {
            opacity: 1,
            duration: 0.3
        }, 0.5)
        .from('#reveal-line', {
            y: 20,
            duration: 0.3
        }, 0.5)
        .to('#reveal-line', {
            opacity: 0,
            duration: 0.2
        }, 0.85);


    // ═══════════════════════════════════════════════════
    //  SCENE 6 — LUXURY ROTATION / SPECS
    //  Slow rotation, specs appear one by one
    // ═══════════════════════════════════════════════════
    const tl6 = gsap.timeline({
        scrollTrigger: {
            trigger: '#scene-6',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
        }
    });

    tl6
        .to(camera.position, {
            x: -0.5,
            y: 0.8,
            z: 4,
            duration: 1
        }, 0)
        .to(model.rotation, {
            y: Math.PI * 2.15,
            duration: 1,
            ease: 'none'
        }, 0);

    // Stagger spec reveals
    ['#spec-1', '#spec-2', '#spec-3', '#spec-4'].forEach((sel, i) => {
        tl6
            .to(sel, {
                opacity: 1,
                duration: 0.15
            }, 0.15 + i * 0.15)
            .from(sel, {
                y: 25,
                duration: 0.2
            }, 0.15 + i * 0.15);
    });

    tl6.to('#spec-1, #spec-2, #spec-3, #spec-4', {
        opacity: 0,
        duration: 0.15
    }, 0.85);


    // ═══════════════════════════════════════════════════
    //  SCENE 7 — FINAL EMOTIONAL STRIKE
    //  Camera pulls into darkness, final text
    // ═══════════════════════════════════════════════════
    const tl7 = gsap.timeline({
        scrollTrigger: {
            trigger: '#scene-7',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
        }
    });

    tl7
        .to(camera.position, {
            z: 8,
            y: 0.5,
            duration: 1
        }, 0)
        .to(model.position, {
            y: -0.5,
            duration: 1
        }, 0)
        .to(model.scale || {}, {
            // We animate the group scale
        }, 0)
        .to(lights.key, {
            intensity: 0.3,
            duration: 0.5
        }, 0.3)
        .to(lights.rim, {
            intensity: 0.2,
            duration: 0.5
        }, 0.3)
        .to(floor.material, {
            opacity: 0,
            duration: 0.5
        }, 0.3)
        .to('#final-text', {
            opacity: 1,
            duration: 0.4
        }, 0.4)
        .from('#final-text', {
            letterSpacing: '0.8em',
            duration: 0.5
        }, 0.4);

    // Nav visibility based on scroll
    ScrollTrigger.create({
        trigger: '#scene-1',
        start: 'bottom 80%',
        onEnter: () => document.getElementById('nav').classList.add('visible'),
        onLeaveBack: () => document.getElementById('nav').classList.remove('visible')
    });

    // Scroll indicator fades out after first scroll
    ScrollTrigger.create({
        trigger: '#scene-1',
        start: 'top+=100 top',
        onEnter: () => document.getElementById('scrollIndicator').classList.remove('visible'),
        onLeaveBack: () => document.getElementById('scrollIndicator').classList.add('visible')
    });
}


// ─── HELPERS ────────────────────────────────────────────

function generateDeconstructionOffsets(parts) {
    deconstructionOffsets = [];
    const count = parts.length;

    parts.forEach((part, i) => {
        // Compute a direction away from center based on part position
        const box = new THREE.Box3().setFromObject(part);
        const center = box.getCenter(new THREE.Vector3());

        // Normalize direction away from origin
        const dir = center.clone().normalize();

        // If direction is near zero (part at center), randomize
        if (dir.length() < 0.01) {
            dir.set(
                (Math.random() - 0.5),
                (Math.random() - 0.5),
                (Math.random() - 0.5)
            ).normalize();
        }

        // Scale the offset — bigger parts move less for elegance
        const partSize = box.getSize(new THREE.Vector3()).length();
        const magnitude = 0.6 + Math.random() * 0.8;

        deconstructionOffsets.push({
            x: dir.x * magnitude,
            y: dir.y * magnitude + (Math.random() - 0.5) * 0.3,
            z: dir.z * magnitude
        });
    });
}

// Need THREE for Box3/Vector3 in helpers
import * as THREE from 'three';
