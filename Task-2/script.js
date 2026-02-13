/* ═══════════════════════════════════════════════════════════
   FORGE — ENGINEER YOUR STRENGTH
   Main Script: Three.js Hero, GSAP Animations, Interactivity
   ═══════════════════════════════════════════════════════════ */

(() => {
    'use strict';

    // ─── REGISTER GSAP PLUGINS ───
    gsap.registerPlugin(ScrollTrigger);

    // ─── LENIS SMOOTH SCROLL ───
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // ═══════════════════════════════════════════════════════════
    // THREE.JS HERO SCENE
    // ═══════════════════════════════════════════════════════════
    function initHeroScene() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        // ── PROTEIN JAR (Cylinder Group) ──
        const jarGroup = new THREE.Group();

        // Main body
        const bodyGeo = new THREE.CylinderGeometry(0.7, 0.7, 2, 32, 1, false);
        const bodyMat = new THREE.MeshPhysicalMaterial({
            color: 0x1a1a1a,
            metalness: 0.8,
            roughness: 0.25,
            clearcoat: 1,
            clearcoatRoughness: 0.1,
            envMapIntensity: 1.5,
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        jarGroup.add(body);

        // Lid
        const lidGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.3, 32);
        const lidMat = new THREE.MeshPhysicalMaterial({
            color: 0x39ff14,
            metalness: 0.9,
            roughness: 0.15,
            emissive: 0x39ff14,
            emissiveIntensity: 0.15,
        });
        const lid = new THREE.Mesh(lidGeo, lidMat);
        lid.position.y = 1.15;
        jarGroup.add(lid);

        // Label band
        const labelGeo = new THREE.CylinderGeometry(0.71, 0.71, 0.8, 32, 1, true);
        const labelMat = new THREE.MeshPhysicalMaterial({
            color: 0x39ff14,
            metalness: 0.5,
            roughness: 0.4,
            transparent: true,
            opacity: 0.15,
            emissive: 0x39ff14,
            emissiveIntensity: 0.1,
            side: THREE.DoubleSide,
        });
        const label = new THREE.Mesh(labelGeo, labelMat);
        label.position.y = 0.1;
        jarGroup.add(label);

        // Rim glow ring
        const rimGeo = new THREE.TorusGeometry(0.72, 0.02, 16, 64);
        const rimMat = new THREE.MeshBasicMaterial({
            color: 0x39ff14,
            transparent: true,
            opacity: 0.6,
        });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.position.y = 1.0;
        rim.rotation.x = Math.PI / 2;
        jarGroup.add(rim);

        jarGroup.position.set(1.8, -0.2, 0);
        jarGroup.rotation.set(0.1, -0.5, 0.05);
        scene.add(jarGroup);

        // ── FLOATING PARTICLES ──
        const particleCount = 800;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
            sizes[i] = Math.random() * 2 + 0.5;
        }

        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const particleMat = new THREE.PointsMaterial({
            color: 0x39ff14,
            size: 0.03,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
        });

        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // ── LIGHTS ──
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x39ff14, 2, 15);
        pointLight1.position.set(3, 3, 3);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x00f0ff, 1.5, 15);
        pointLight2.position.set(-3, -2, 4);
        scene.add(pointLight2);

        const pointLight3 = new THREE.PointLight(0xa855f7, 1, 10);
        pointLight3.position.set(0, 4, -3);
        scene.add(pointLight3);

        // ── MOUSE PARALLAX ──
        let mouseX = 0, mouseY = 0;
        let targetMouseX = 0, targetMouseY = 0;

        document.addEventListener('mousemove', (e) => {
            targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        // ── ANIMATION LOOP ──
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            const elapsed = clock.getElapsedTime();

            // Smooth mouse follow
            mouseX += (targetMouseX - mouseX) * 0.05;
            mouseY += (targetMouseY - mouseY) * 0.05;

            // Rotate jar
            jarGroup.rotation.y = elapsed * 0.3 + mouseX * 0.2;
            jarGroup.rotation.x = 0.1 + mouseY * 0.1;
            jarGroup.position.y = -0.2 + Math.sin(elapsed * 0.8) * 0.1;

            // Animate particles
            const posArray = particles.geometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                posArray[i * 3 + 1] += Math.sin(elapsed + i) * 0.001;
            }
            particles.geometry.attributes.position.needsUpdate = true;
            particles.rotation.y = elapsed * 0.02;

            // Pulse lights
            pointLight1.intensity = 2 + Math.sin(elapsed * 2) * 0.5;
            pointLight2.intensity = 1.5 + Math.cos(elapsed * 1.5) * 0.3;

            renderer.render(scene, camera);
        }
        animate();

        // ── RESIZE ──
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // ═══════════════════════════════════════════════════════════
    // CSS PARTICLE SYSTEM (Hero + Final Section)
    // ═══════════════════════════════════════════════════════════
    function createParticles(containerId, count = 50) {
        const container = document.getElementById(containerId);
        if (!container) return;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 4 + 1;
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: rgba(57, 255, 20, ${Math.random() * 0.5 + 0.1});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                pointer-events: none;
                box-shadow: 0 0 ${size * 3}px rgba(57, 255, 20, 0.3);
            `;
            container.appendChild(particle);

            gsap.to(particle, {
                y: `random(-100, 100)`,
                x: `random(-50, 50)`,
                opacity: `random(0.1, 0.6)`,
                duration: `random(3, 8)`,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: Math.random() * 3,
            });
        }
    }

    // ═══════════════════════════════════════════════════════════
    // PRELOADER
    // ═══════════════════════════════════════════════════════════
    function initPreloader() {
        const preloader = document.getElementById('preloader');
        const fill = document.querySelector('.preloader__bar-fill');
        if (!preloader || !fill) return;

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress >= 100) {
                progress = 100;
                fill.style.width = '100%';
                clearInterval(interval);

                gsap.to(preloader, {
                    opacity: 0,
                    duration: 0.8,
                    delay: 0.3,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        preloader.style.display = 'none';
                        runHeroIntro();
                    },
                });
            } else {
                fill.style.width = progress + '%';
            }
        }, 120);
    }

    // ═══════════════════════════════════════════════════════════
    // HERO INTRO ANIMATION
    // ═══════════════════════════════════════════════════════════
    function runHeroIntro() {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Badge
        tl.to('.hero__badge', {
            opacity: 1,
            y: 0,
            duration: 0.8,
        });

        // Title lines stagger
        tl.from('.hero__title-line', {
            y: 120,
            opacity: 0,
            duration: 1,
            stagger: 0.15,
            ease: 'power4.out',
        }, '-=0.3');

        // Tagline
        tl.to('.hero__tagline', {
            opacity: 1,
            y: 0,
            duration: 0.8,
        }, '-=0.4');

        // CTA buttons
        tl.to('.hero__actions', {
            opacity: 1,
            y: 0,
            duration: 0.8,
        }, '-=0.4');

        // Scroll hint
        tl.to('.hero__scroll-hint', {
            opacity: 1,
            duration: 0.8,
        }, '-=0.3');

        // Stats
        tl.to('.hero__stats', {
            opacity: 1,
            y: 0,
            duration: 0.8,
        }, '-=0.5');

        // Counter animations
        tl.add(() => animateCounters(), '-=0.5');
    }

    // ═══════════════════════════════════════════════════════════
    // ANIMATED COUNTERS
    // ═══════════════════════════════════════════════════════════
    function animateCounters() {
        document.querySelectorAll('[data-count]').forEach(el => {
            const target = parseInt(el.dataset.count);
            gsap.to({ val: 0 }, {
                val: target,
                duration: 2,
                ease: 'power2.out',
                onUpdate: function () {
                    el.textContent = Math.round(this.targets()[0].val).toLocaleString();
                },
            });
        });
    }

    // ═══════════════════════════════════════════════════════════
    // NAVBAR SCROLL BEHAVIOR
    // ═══════════════════════════════════════════════════════════
    function initNavbar() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        // Scroll class toggle
        ScrollTrigger.create({
            start: 'top -80',
            onUpdate: (self) => {
                if (self.scroll() > 80) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            },
        });

        // Active link tracking
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.navbar__link');

        sections.forEach(section => {
            ScrollTrigger.create({
                trigger: section,
                start: 'top center',
                end: 'bottom center',
                onEnter: () => setActiveLink(section.id),
                onEnterBack: () => setActiveLink(section.id),
            });
        });

        function setActiveLink(id) {
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
        }

        // Smooth scroll for nav links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    lenis.scrollTo(target, { offset: -60 });
                }
            });
        });
    }

    // ═══════════════════════════════════════════════════════════
    // PRODUCT SHOWCASE SCROLL ANIMATIONS
    // ═══════════════════════════════════════════════════════════
    function initProductAnimations() {
        const scenes = document.querySelectorAll('.product-scene');

        scenes.forEach((scene, index) => {
            const color = scene.dataset.color || '#39ff14';
            const bg = scene.querySelector('.product-scene__bg');
            const imageWrap = scene.querySelector('.product-scene__image-wrap');
            const info = scene.querySelector('.product-scene__info');
            const stats = scene.querySelectorAll('.stat-card');
            const number = scene.querySelector('.product-scene__number');
            const priceEl = scene.querySelector('.price-value');
            const glow = scene.querySelector('.product-scene__glow');

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: scene,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse',
                },
            });

            // Glow color
            if (glow) {
                gsap.set(glow, {
                    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                });
            }

            // Image reveal
            tl.from(imageWrap, {
                scale: 0.8,
                opacity: 0,
                rotateY: index % 2 === 0 ? -15 : 15,
                duration: 1,
                ease: 'power3.out',
            });

            // Number
            tl.from(number, {
                x: -50,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
            }, '-=0.7');

            // Info block
            tl.from(info.querySelectorAll('.product-scene__name, .product-scene__description'), {
                y: 30,
                opacity: 0,
                duration: 0.7,
                stagger: 0.1,
                ease: 'power3.out',
            }, '-=0.5');

            // Stats
            tl.from(stats, {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.08,
                ease: 'power3.out',
            }, '-=0.3');

            // Price counter
            if (priceEl) {
                const priceTarget = parseInt(priceEl.dataset.price);
                tl.add(() => {
                    gsap.to({ val: 0 }, {
                        val: priceTarget,
                        duration: 1.5,
                        ease: 'power2.out',
                        onUpdate: function () {
                            priceEl.textContent = Math.round(this.targets()[0].val).toLocaleString();
                        },
                    });
                }, '-=0.3');
            }

            // Footer
            tl.from(scene.querySelector('.product-scene__footer'), {
                y: 20,
                opacity: 0,
                duration: 0.6,
                ease: 'power3.out',
            }, '-=1');

            // Create scene-specific particles
            createSceneParticles(scene, color);
        });
    }

    function createSceneParticles(scene, color) {
        const container = scene.querySelector('.product-scene__particles');
        if (!container) return;

        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            const size = Math.random() * 3 + 1;
            p.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: 0;
                box-shadow: 0 0 ${size * 3}px ${color};
                pointer-events: none;
            `;
            container.appendChild(p);

            gsap.to(p, {
                opacity: `random(0.2, 0.6)`,
                y: `random(-60, 60)`,
                x: `random(-40, 40)`,
                duration: `random(3, 6)`,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: Math.random() * 2,
            });
        }
    }

    // ═══════════════════════════════════════════════════════════
    // PRODUCT SECTION INTRO ANIMATION
    // ═══════════════════════════════════════════════════════════
    function initProductsIntro() {
        const section = document.querySelector('.products-intro');
        if (!section) return;

        gsap.from(section.querySelectorAll('.section-label, .section-title, .section-desc'), {
            scrollTrigger: {
                trigger: section,
                start: 'top 75%',
            },
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
        });
    }

    // ═══════════════════════════════════════════════════════════
    // BUILD YOUR STACK — INTERACTIVE CALCULATOR
    // ═══════════════════════════════════════════════════════════
    function initStackBuilder() {
        const stackCards = document.querySelectorAll('.stack-card');
        const trayItems = document.getElementById('stack-tray-items');
        const totalProtein = document.getElementById('total-protein');
        const totalPrice = document.getElementById('total-price');
        const tray = document.getElementById('stack-tray');
        const ctaBtn = document.getElementById('start-transform-btn');

        const selectedStack = new Map();

        stackCards.forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.stackId;
                const name = card.dataset.stackName;
                const price = parseInt(card.dataset.stackPrice);
                const protein = parseInt(card.dataset.stackProtein);
                const icon = card.dataset.stackIcon;

                if (selectedStack.has(id)) {
                    // Remove
                    selectedStack.delete(id);
                    card.classList.remove('selected');

                    // Animate out
                    gsap.to(card, {
                        scale: 1,
                        duration: 0.3,
                        ease: 'power2.out',
                    });
                } else {
                    // Add
                    selectedStack.set(id, { name, price, protein, icon });
                    card.classList.add('selected');

                    // Animate in
                    gsap.fromTo(card, {
                        scale: 0.95,
                    }, {
                        scale: 1,
                        duration: 0.4,
                        ease: 'elastic.out(1, 0.5)',
                    });
                }

                updateTray();
            });
        });

        // Also handle "Add to Stack" buttons in product scenes
        document.querySelectorAll('.product-scene__cart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const name = btn.dataset.name;
                const price = parseInt(btn.dataset.price);
                const protein = parseInt(btn.dataset.protein);

                // Find matching stack card
                const matchingCard = document.querySelector(`.stack-card[data-stack-id="${id}"]`);
                const icon = matchingCard ? matchingCard.dataset.stackIcon : '📦';

                if (selectedStack.has(id)) {
                    selectedStack.delete(id);
                    btn.classList.remove('added');
                    btn.querySelector('span').textContent = 'Add to Stack';
                    if (matchingCard) matchingCard.classList.remove('selected');
                } else {
                    selectedStack.set(id, { name, price, protein, icon });
                    btn.classList.add('added');
                    btn.querySelector('span').textContent = 'In Stack';
                    if (matchingCard) matchingCard.classList.add('selected');
                }

                updateTray();
            });
        });

        function updateTray() {
            // Update tray items
            trayItems.innerHTML = '';
            selectedStack.forEach((item, id) => {
                const el = document.createElement('div');
                el.className = 'stack-tray__item';
                el.innerHTML = `${item.icon} ${item.name}`;
                trayItems.appendChild(el);
            });

            // Calculate totals
            let proteinTotal = 0;
            let priceTotal = 0;
            selectedStack.forEach(item => {
                proteinTotal += item.protein;
                priceTotal += item.price;
            });

            // Animate counter updates
            animateValue(totalProtein, proteinTotal);
            animateValue(totalPrice, priceTotal, true);

            // Toggle tray state
            if (selectedStack.size > 0) {
                tray.classList.add('active');
                ctaBtn.disabled = false;
            } else {
                tray.classList.remove('active');
                ctaBtn.disabled = true;
            }

            // Sync product scene buttons
            document.querySelectorAll('.product-scene__cart-btn').forEach(btn => {
                const id = btn.dataset.id;
                if (selectedStack.has(id)) {
                    btn.classList.add('added');
                    btn.querySelector('span').textContent = 'In Stack';
                } else {
                    btn.classList.remove('added');
                    btn.querySelector('span').textContent = 'Add to Stack';
                }
            });
        }

        function animateValue(el, target, format = false) {
            const current = parseInt(el.textContent.replace(/,/g, '')) || 0;
            gsap.to({ val: current }, {
                val: target,
                duration: 0.6,
                ease: 'power2.out',
                onUpdate: function () {
                    const v = Math.round(this.targets()[0].val);
                    el.textContent = format ? v.toLocaleString() : v;
                },
            });
        }

        // CTA button click
        if (ctaBtn) {
            ctaBtn.addEventListener('click', () => {
                gsap.to(ctaBtn, {
                    scale: 0.95,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {
                        // Confetti burst effect
                        createConfettiBurst(ctaBtn);
                    },
                });
            });
        }

        // Stack section scroll animation
        const stackSection = document.querySelector('.stack-section');
        if (stackSection) {
            gsap.from('.stack-section__header .section-label, .stack-section__header .section-title, .stack-section__header .section-desc', {
                scrollTrigger: {
                    trigger: stackSection,
                    start: 'top 75%',
                },
                y: 40,
                opacity: 0,
                stagger: 0.15,
                duration: 0.8,
                ease: 'power3.out',
            });

            gsap.from('.stack-card', {
                scrollTrigger: {
                    trigger: '.stack-section__grid',
                    start: 'top 80%',
                },
                y: 40,
                opacity: 0,
                stagger: 0.1,
                duration: 0.6,
                ease: 'power3.out',
            });

            gsap.from('.stack-tray', {
                scrollTrigger: {
                    trigger: '.stack-tray',
                    start: 'top 85%',
                },
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
            });
        }
    }

    function createConfettiBurst(triggerEl) {
        const rect = triggerEl.getBoundingClientRect();
        const colors = ['#39ff14', '#00f0ff', '#a855f7', '#ff6b35', '#ffffff'];

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 8 + 4;
            const color = colors[Math.floor(Math.random() * colors.length)];

            particle.style.cssText = `
                position: fixed;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
                z-index: 9999;
                pointer-events: none;
            `;
            document.body.appendChild(particle);

            gsap.to(particle, {
                x: (Math.random() - 0.5) * 300,
                y: (Math.random() - 0.5) * 300 - 100,
                rotation: Math.random() * 720,
                opacity: 0,
                duration: 1 + Math.random(),
                ease: 'power2.out',
                onComplete: () => particle.remove(),
            });
        }
    }

    // ═══════════════════════════════════════════════════════════
    // BEFORE / AFTER SLIDER
    // ═══════════════════════════════════════════════════════════
    function initBeforeAfterSlider() {
        const container = document.getElementById('ba-slider');
        const handle = document.getElementById('ba-handle');
        const afterDiv = container?.querySelector('.transform-slider__after');
        if (!container || !handle || !afterDiv) return;

        let isDragging = false;

        function updateSlider(x) {
            const rect = container.getBoundingClientRect();
            let pos = (x - rect.left) / rect.width;
            pos = Math.max(0, Math.min(1, pos));

            afterDiv.style.clipPath = `inset(0 0 0 ${pos * 100}%)`;
            handle.style.left = pos * 100 + '%';
        }

        handle.addEventListener('mousedown', () => isDragging = true);
        handle.addEventListener('touchstart', () => isDragging = true);

        window.addEventListener('mouseup', () => isDragging = false);
        window.addEventListener('touchend', () => isDragging = false);

        window.addEventListener('mousemove', (e) => {
            if (isDragging) updateSlider(e.clientX);
        });

        window.addEventListener('touchmove', (e) => {
            if (isDragging) updateSlider(e.touches[0].clientX);
        });

        container.addEventListener('click', (e) => {
            updateSlider(e.clientX);
        });

        // Section animations
        const transformSection = document.querySelector('.transform-section');
        if (transformSection) {
            gsap.from('.transform-section__header .section-label, .transform-section__header .section-title', {
                scrollTrigger: {
                    trigger: transformSection,
                    start: 'top 75%',
                },
                y: 40,
                opacity: 0,
                stagger: 0.15,
                duration: 0.8,
                ease: 'power3.out',
            });

            gsap.from('.transform-slider', {
                scrollTrigger: {
                    trigger: '.transform-slider',
                    start: 'top 80%',
                },
                scale: 0.9,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
            });

            gsap.from('.transform-quote__text, .transform-quote__author', {
                scrollTrigger: {
                    trigger: '.transform-quote',
                    start: 'top 85%',
                },
                y: 30,
                opacity: 0,
                stagger: 0.2,
                duration: 0.8,
                ease: 'power3.out',
            });
        }
    }

    // ═══════════════════════════════════════════════════════════
    // FINAL CTA SECTION
    // ═══════════════════════════════════════════════════════════
    function initFinalCTA() {
        const section = document.querySelector('.final-section');
        if (!section) return;

        // Product grid fly-in
        gsap.to('.final-product', {
            scrollTrigger: {
                trigger: section,
                start: 'top 70%',
            },
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: 'power3.out',
        });

        // Title
        gsap.from('.final-section__title span', {
            scrollTrigger: {
                trigger: section,
                start: 'top 60%',
            },
            y: 60,
            opacity: 0,
            stagger: 0.15,
            duration: 1,
            ease: 'power4.out',
        });

        // Subtitle
        gsap.from('.final-section__subtitle', {
            scrollTrigger: {
                trigger: section,
                start: 'top 50%',
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
        });

        // CTA Button
        gsap.from('.final-section__btn', {
            scrollTrigger: {
                trigger: section,
                start: 'top 45%',
            },
            scale: 0.8,
            opacity: 0,
            duration: 0.8,
            ease: 'elastic.out(1, 0.5)',
        });

        // Create particles for final section
        createParticles('final-particles', 40);
    }

    // ═══════════════════════════════════════════════════════════
    // MAGNETIC BUTTON EFFECT
    // ═══════════════════════════════════════════════════════════
    function initMagneticButtons() {
        document.querySelectorAll('[data-magnetic]').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                gsap.to(btn, {
                    x: x * 0.2,
                    y: y * 0.2,
                    duration: 0.3,
                    ease: 'power2.out',
                });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.3)',
                });
            });
        });
    }

    // ═══════════════════════════════════════════════════════════
    // SMOOTH SCROLL LINKS
    // ═══════════════════════════════════════════════════════════
    function initSmoothNav() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    lenis.scrollTo(target, { offset: -60 });
                }
            });
        });
    }

    // ═══════════════════════════════════════════════════════════
    // INITIALIZE EVERYTHING
    // ═══════════════════════════════════════════════════════════
    function init() {
        initHeroScene();
        createParticles('particles', 50);
        initPreloader();
        initNavbar();
        initProductsIntro();
        initProductAnimations();
        initStackBuilder();
        initBeforeAfterSlider();
        initFinalCTA();
        initMagneticButtons();
        initSmoothNav();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
