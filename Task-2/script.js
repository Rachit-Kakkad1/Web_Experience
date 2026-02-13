/* ═══════════════════════════════════════════════════════════
   FORGE — ENGINEER YOUR STRENGTH — GOD-LEVEL JS ENGINE v2
   Text Scramble • Parallax Tilt • Magnetic • Particles • GSAP
   ═══════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    /* ── HELPERS ── */
    const $ = (s, p = document) => p.querySelector(s);
    const $$ = (s, p = document) => [...p.querySelectorAll(s)];
    const lerp = (a, b, t) => a + (b - a) * t;

    /* ═══ 1. TEXT SCRAMBLE CLASS ═══ */
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            this.queue = [];
            this.frameRequest = null;
            this.frame = 0;
            this.resolve = null;
        }
        setText(newText) {
            const oldText = this.el.textContent;
            const length = Math.max(oldText.length, newText.length);
            return new Promise(resolve => {
                this.resolve = resolve;
                this.queue = [];
                for (let i = 0; i < length; i++) {
                    const from = oldText[i] || '';
                    const to = newText[i] || '';
                    const start = Math.floor(Math.random() * 30);
                    const end = start + Math.floor(Math.random() * 30);
                    this.queue.push({ from, to, start, end });
                }
                cancelAnimationFrame(this.frameRequest);
                this.frame = 0;
                this.update();
            });
        }
        update() {
            let output = '', complete = 0;
            for (let i = 0; i < this.queue.length; i++) {
                let { from, to, start, end, char } = this.queue[i];
                if (this.frame >= end) { complete++; output += to; }
                else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.chars[Math.floor(Math.random() * this.chars.length)];
                        this.queue[i].char = char;
                    }
                    output += `<span style="color:var(--accent);opacity:.7">${char}</span>`;
                } else { output += from; }
            }
            this.el.innerHTML = output;
            if (complete === this.queue.length) { this.resolve(); }
            else { this.frameRequest = requestAnimationFrame(() => this.update()); this.frame++; }
        }
    }

    /* ═══ 2. PRELOADER ═══ */
    const preloader = $('#preloader');
    const preloaderFill = $('.preloader__bar-fill');
    const preloaderCounter = $('#preloader-counter');
    let loadProgress = 0;

    function animatePreloader() {
        const interval = setInterval(() => {
            loadProgress += Math.random() * 14 + 4;
            if (loadProgress >= 100) { loadProgress = 100; clearInterval(interval); setTimeout(hidePreloader, 300); }
            if (preloaderFill) preloaderFill.style.width = loadProgress + '%';
            if (preloaderCounter) preloaderCounter.textContent = Math.round(loadProgress) + '%';
        }, 70);
    }

    function hidePreloader() {
        gsap.to(preloader, {
            yPercent: -100, duration: 0.8, ease: 'power4.inOut',
            onComplete: () => { preloader.style.display = 'none'; startHeroAnimation(); }
        });
    }
    animatePreloader();

    /* ═══ 3. LENIS SMOOTH SCROLL ═══ */
    const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    /* ═══ 4. GSAP ═══ */
    gsap.registerPlugin(ScrollTrigger);

    /* ═══ 5. CUSTOM CURSOR ═══ */
    const cursor = $('#cursor');
    const trail = $('#cursor-trail');
    let mx = -100, my = -100, cx = -100, cy = -100, tx = -100, ty = -100;

    if (window.innerWidth > 768 && cursor && trail) {
        document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
        (function updateCursor() {
            cx = lerp(cx, mx, 0.12); cy = lerp(cy, my, 0.12);
            tx = lerp(tx, mx, 0.35); ty = lerp(ty, my, 0.35);
            cursor.style.transform = `translate(${cx - 20}px, ${cy - 20}px)`;
            trail.style.transform = `translate(${tx - 3}px, ${ty - 3}px)`;
            requestAnimationFrame(updateCursor);
        })();
        $$('a, button, .stack-card, .magnetic-btn, .product-scene__image-wrap').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        });
    }

    /* ═══ 6. SCROLL PROGRESS ═══ */
    const progressBar = $('#scroll-progress');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            progressBar.style.width = (window.scrollY / h * 100) + '%';
        });
    }

    /* ═══ 7. NAVBAR ═══ */
    const navbar = $('#navbar');
    const navLinks = $$('.navbar__link');
    const sections = $$('section[id]');

    window.addEventListener('scroll', () => {
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 80);
        let current = '';
        sections.forEach(s => { if (window.scrollY >= s.offsetTop - 150) current = s.id; });
        navLinks.forEach(l => {
            l.classList.toggle('active', l.getAttribute('href') === '#' + current);
        });
    });

    navLinks.forEach(l => {
        l.addEventListener('click', e => {
            e.preventDefault();
            const target = $(l.getAttribute('href'));
            if (target) lenis.scrollTo(target, { offset: -60 });
        });
    });

    /* ═══ 8. THREE.JS HERO SCENE ═══ */
    function initHeroScene() {
        const canvas = $('#hero-canvas');
        if (!canvas) return;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        camera.position.set(0, 0, 5);
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Protein jar
        const jarGroup = new THREE.Group();
        const jarMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.9, roughness: 0.2 });
        const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.7, 2.2, 32), jarMat);
        const labelMat = new THREE.MeshStandardMaterial({ color: 0x39ff14, metalness: 0.4, roughness: 0.6, emissive: 0x39ff14, emissiveIntensity: 0.3 });
        const label = new THREE.Mesh(new THREE.CylinderGeometry(0.81, 0.71, 0.8, 32), labelMat);
        label.position.y = -0.2;
        const capMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.3 });
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.35, 32), capMat);
        cap.position.y = 1.27;
        jarGroup.add(jar, label, cap);
        jarGroup.rotation.x = 0.15;
        scene.add(jarGroup);

        // Particles
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(1000 * 3);
        for (let i = 0; i < 3000; i++) pPos[i] = (Math.random() - 0.5) * 14;
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x39ff14, size: 0.015, transparent: true, opacity: 0.4 }));
        scene.add(particles);

        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.3));
        const spot = new THREE.SpotLight(0x39ff14, 2, 15, Math.PI / 4, 0.5);
        spot.position.set(3, 4, 4); scene.add(spot);
        const rim = new THREE.PointLight(0x00f0ff, 1, 10);
        rim.position.set(-3, 0, 2); scene.add(rim);

        let mouseX = 0;
        document.addEventListener('mousemove', e => { mouseX = (e.clientX / window.innerWidth - 0.5) * 2; });

        (function animate() {
            requestAnimationFrame(animate);
            jarGroup.rotation.y += 0.006;
            jarGroup.rotation.x = lerp(jarGroup.rotation.x, 0.15 + mouseX * 0.1, 0.03);
            particles.rotation.y -= 0.0008;
            renderer.render(scene, camera);
        })();

        window.addEventListener('resize', () => {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        });
    }
    initHeroScene();

    /* ═══ 9. HERO ANIMATIONS — CINEMATIC ═══ */
    function startHeroAnimation() {
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

        // Badge slide in
        tl.to('.hero__badge', { opacity: 1, y: 0, duration: 0.7 })
            // Title lines reveal with stagger + scramble
            .from('.hero__title-line', { y: '120%', rotateX: -40, duration: 1.1, stagger: 0.18, ease: 'power4.out' }, '-=0.3')
            // Tagline
            .to('.hero__tagline', { opacity: 1, y: 0, duration: 0.8 }, '-=0.4')
            // Buttons
            .to('.hero__actions', { opacity: 1, y: 0, duration: 0.7 }, '-=0.3')
            // Scroll hint
            .to('.hero__scroll-hint', { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
            // Stats
            .to('.hero__stats', { opacity: 1, duration: 0.7 }, '-=0.3');

        // Scramble the logo text
        const logoText = $('[data-scramble]');
        if (logoText) {
            const scrambler = new TextScramble(logoText);
            setTimeout(() => scrambler.setText('FORGE'), 800);
        }

        // Animate stat counters
        $$('.hero__stat-num[data-count]').forEach(el => {
            const target = parseInt(el.dataset.count);
            gsap.to({ val: 0 }, {
                val: target, duration: 2.5, delay: 1.2, ease: 'power2.out',
                onUpdate() { el.textContent = Math.round(this.targets()[0].val).toLocaleString(); }
            });
        });
    }

    /* ═══ 10. PRODUCT SCENES ═══ */
    $$('.product-scene').forEach(scene => {
        const accent = scene.dataset.accent || '#39ff14';
        scene.style.setProperty('--accent', accent);

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: scene, start: 'top 70%', end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            }
        });

        const imgWrap = scene.querySelector('.product-scene__image-wrap');
        const number = scene.querySelector('.product-scene__number');
        const category = scene.querySelector('.product-scene__category');
        const name = scene.querySelector('.product-scene__name');
        const desc = scene.querySelector('.product-scene__description');
        const stats = scene.querySelectorAll('.stat-card');
        const footer = scene.querySelector('.product-scene__footer');
        const glow = scene.querySelector('.product-scene__glow');
        const ring = scene.querySelector('.product-scene__ring');

        // Glow pulse in
        if (glow) tl.fromTo(glow, { scale: 0, opacity: 0 }, { scale: 1, opacity: 0.12, duration: 1.2 }, 0);
        if (ring) tl.fromTo(ring, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 1 }, 0.2);
        // Image dramatic entrance
        if (imgWrap) tl.from(imgWrap, { x: -100, opacity: 0, scale: 0.85, rotateY: 15, duration: 1.2, ease: 'power3.out' }, 0.1);
        // Text stagger
        if (number) tl.from(number, { opacity: 0, y: 80, duration: 0.7 }, 0.3);
        if (category) tl.from(category, { opacity: 0, x: -30, duration: 0.5 }, 0.5);
        if (name) tl.from(name, { opacity: 0, y: 40, duration: 0.7 }, 0.6);
        if (desc) tl.from(desc, { opacity: 0, y: 25, duration: 0.6 }, 0.8);
        // Stats with scale bounce
        if (stats.length) tl.from(stats, { opacity: 0, y: 30, scale: 0.85, stagger: 0.08, duration: 0.5, ease: 'back.out(2)' }, 0.9);
        if (footer) tl.from(footer, { opacity: 0, y: 25, duration: 0.5 }, 1.1);

        // Price counter
        const priceEl = scene.querySelector('.price-value');
        if (priceEl) {
            const tp = parseInt(priceEl.dataset.price);
            ScrollTrigger.create({
                trigger: scene, start: 'top 55%',
                onEnter: () => gsap.to({ v: 0 }, {
                    v: tp, duration: 1.5, ease: 'power2.out',
                    onUpdate() { priceEl.textContent = Math.round(this.targets()[0].v).toLocaleString(); }
                }), once: true
            });
        }

        // Float tag bounce
        const tag = scene.querySelector('.product-scene__float-tag');
        if (tag) gsap.to(tag, { y: -10, duration: 2.5, ease: 'sine.inOut', repeat: -1, yoyo: true });

        // Parallax tilt on image
        if (imgWrap && window.innerWidth > 768) {
            scene.addEventListener('mousemove', e => {
                const rect = scene.getBoundingClientRect();
                const dx = (e.clientX - rect.left) / rect.width - 0.5;
                const dy = (e.clientY - rect.top) / rect.height - 0.5;
                gsap.to(imgWrap, { rotateY: dx * 8, rotateX: -dy * 5, duration: 0.6, ease: 'power2.out' });
            });
            scene.addEventListener('mouseleave', () => {
                gsap.to(imgWrap, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
            });
        }
    });

    /* ═══ 11. CART BUTTONS ═══ */
    $$('.product-scene__cart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            btn.classList.toggle('added');
            const textEl = btn.querySelector('.cart-btn__text');
            const iconEl = btn.querySelector('.cart-btn__icon');

            if (btn.classList.contains('added')) {
                textEl.textContent = 'Added ✓'; iconEl.textContent = '✓';
                const sc = $(`.stack-card[data-stack-id="${id}"]`);
                if (sc && !sc.classList.contains('selected')) sc.click();
            } else {
                textEl.textContent = 'Add to Stack'; iconEl.textContent = '+';
                const sc = $(`.stack-card[data-stack-id="${id}"]`);
                if (sc && sc.classList.contains('selected')) sc.click();
            }
            createBurst(btn);
        });
    });

    function createBurst(el) {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        for (let i = 0; i < 16; i++) {
            const d = document.createElement('div');
            const colors = ['#39ff14', '#00f0ff', '#a855f7', '#ff6b35'];
            d.style.cssText = `position:fixed;width:${3 + Math.random() * 4}px;height:${3 + Math.random() * 4}px;border-radius:50%;background:${colors[i % 4]};z-index:99999;pointer-events:none;left:${cx}px;top:${cy}px;`;
            document.body.appendChild(d);
            gsap.to(d, {
                x: (Math.random() - 0.5) * 160, y: (Math.random() - 0.5) * 160,
                opacity: 0, scale: 0, duration: 0.9, ease: 'power3.out',
                onComplete: () => d.remove()
            });
        }
    }

    /* ═══ 12. STACK BUILDER ═══ */
    const stackCards = $$('.stack-card');
    const stackTray = $('#stack-tray');
    const stackTrayItems = $('#stack-tray-items');
    const totalProteinEl = $('#total-protein');
    const totalPriceEl = $('#total-price');
    const totalItemsEl = $('#total-items');
    const transformBtn = $('#start-transform-btn');
    const selectedItems = new Map();

    stackCards.forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.stackId;
            const isSelected = card.classList.toggle('selected');
            if (isSelected) {
                selectedItems.set(id, {
                    name: card.dataset.stackName,
                    price: parseInt(card.dataset.stackPrice),
                    protein: parseInt(card.dataset.stackProtein),
                    icon: card.dataset.stackIcon
                });
                gsap.fromTo(card, { scale: 0.92 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1.2, 0.5)' });
                // Sync cart button
                const cb = $(`.product-scene__cart-btn[data-id="${id}"]`);
                if (cb && !cb.classList.contains('added')) {
                    cb.classList.add('added');
                    const t = cb.querySelector('.cart-btn__text');
                    const ic = cb.querySelector('.cart-btn__icon');
                    if (t) t.textContent = 'Added ✓';
                    if (ic) ic.textContent = '✓';
                }
            } else {
                selectedItems.delete(id);
                const cb = $(`.product-scene__cart-btn[data-id="${id}"]`);
                if (cb && cb.classList.contains('added')) {
                    cb.classList.remove('added');
                    const t = cb.querySelector('.cart-btn__text');
                    const ic = cb.querySelector('.cart-btn__icon');
                    if (t) t.textContent = 'Add to Stack';
                    if (ic) ic.textContent = '+';
                }
            }
            updateTray();
            createBurst(card);
        });
    });

    function updateTray() {
        if (!stackTrayItems) return;
        stackTrayItems.innerHTML = '';
        selectedItems.forEach((item) => {
            const el = document.createElement('span');
            el.className = 'stack-tray__item';
            el.textContent = `${item.icon} ${item.name}`;
            stackTrayItems.appendChild(el);
        });

        let tp = 0, tpr = 0;
        selectedItems.forEach(i => { tp += i.protein; tpr += i.price; });

        animateValue(totalProteinEl, tp);
        animateValue(totalPriceEl, tpr, true);
        if (totalItemsEl) totalItemsEl.textContent = selectedItems.size;
        if (stackTray) stackTray.classList.toggle('active', selectedItems.size > 0);
        if (transformBtn) {
            if (selectedItems.size > 0) transformBtn.removeAttribute('disabled');
            else transformBtn.setAttribute('disabled', '');
        }
    }

    function animateValue(el, target, format = false) {
        if (!el) return;
        const current = parseInt(el.textContent.replace(/,/g, '')) || 0;
        gsap.to({ val: current }, {
            val: target, duration: 0.6, ease: 'power2.out',
            onUpdate() {
                const v = Math.round(this.targets()[0].val);
                el.textContent = format ? v.toLocaleString() : v;
            }
        });
    }

    if (transformBtn) {
        transformBtn.addEventListener('click', () => {
            if (selectedItems.size === 0) return;
            createBurst(transformBtn);
            gsap.fromTo(transformBtn, { scale: 0.94 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1.2, 0.4)' });
            const ts = $('#transform');
            if (ts) lenis.scrollTo(ts, { offset: -60 });
        });
    }

    /* ═══ 12B. COMBO BUTTONS ═══ */
    $$('.stack-combo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const ids = btn.dataset.comboIds.split(',');
            // Deselect all first
            stackCards.forEach(card => {
                if (card.classList.contains('selected')) {
                    card.classList.remove('selected');
                    const id = card.dataset.stackId;
                    selectedItems.delete(id);
                    const cb = $(`.product-scene__cart-btn[data-id="${id}"]`);
                    if (cb && cb.classList.contains('added')) {
                        cb.classList.remove('added');
                        const t = cb.querySelector('.cart-btn__text');
                        const ic = cb.querySelector('.cart-btn__icon');
                        if (t) t.textContent = 'Add to Stack';
                        if (ic) ic.textContent = '+';
                    }
                }
            });
            // Select combo items
            ids.forEach(id => {
                const card = $(`.stack-card[data-stack-id="${id}"]`);
                if (card && !card.classList.contains('selected')) card.click();
            });
            // Toggle active state on combo buttons
            $$('.stack-combo-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    /* ═══ 12C. STACK PARTICLES ═══ */
    function initStackParticles() {
        const container = $('#stack-particles');
        if (!container) return;
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            const size = 2 + Math.random() * 3;
            p.style.cssText = `position:absolute;width:${size}px;height:${size}px;border-radius:50%;background:rgba(57,255,20,${0.05 + Math.random() * 0.15});left:${Math.random() * 100}%;top:${Math.random() * 100}%;`;
            container.appendChild(p);
            gsap.to(p, {
                y: -40 - Math.random() * 60, x: (Math.random() - 0.5) * 40,
                opacity: 0, duration: 3 + Math.random() * 4, repeat: -1,
                delay: Math.random() * 3, ease: 'none'
            });
        }
    }
    initStackParticles();

    /* ═══ 13. BEFORE/AFTER SLIDER ═══ */
    const baSlider = $('#ba-slider'), baHandle = $('#ba-handle');
    if (baSlider && baHandle) {
        let dragging = false;
        function updateSlider(x) {
            const r = baSlider.getBoundingClientRect();
            let p = Math.max(5, Math.min(95, ((x - r.left) / r.width) * 100));
            baSlider.querySelector('.transform-slider__after').style.clipPath = `inset(0 0 0 ${p}%)`;
            baHandle.style.left = p + '%';
        }
        baHandle.addEventListener('mousedown', () => dragging = true);
        baHandle.addEventListener('touchstart', () => dragging = true);
        document.addEventListener('mouseup', () => dragging = false);
        document.addEventListener('touchend', () => dragging = false);
        document.addEventListener('mousemove', e => { if (dragging) updateSlider(e.clientX); });
        document.addEventListener('touchmove', e => { if (dragging) updateSlider(e.touches[0].clientX); });
        baSlider.addEventListener('click', e => updateSlider(e.clientX));
    }

    /* ═══ 14. SCROLL REVEAL ANIMATIONS ═══ */
    // Products intro
    gsap.from('.products-intro__content', {
        scrollTrigger: { trigger: '.products-intro', start: 'top 70%' },
        opacity: 0, y: 80, duration: 1.2, ease: 'power3.out'
    });
    gsap.from('.products-intro__count', {
        scrollTrigger: { trigger: '.products-intro', start: 'top 65%' },
        opacity: 0, scale: 0.5, x: 60, duration: 1, delay: 0.2, ease: 'back.out(2)'
    });

    // Stack section — use fromTo so cards are never stuck invisible
    gsap.from('.stack-section__header', {
        scrollTrigger: { trigger: '.stack-section', start: 'top 70%' },
        opacity: 0, y: 60, duration: 1, ease: 'power3.out'
    });
    // Combos row
    gsap.from('.stack-combos', {
        scrollTrigger: { trigger: '.stack-section', start: 'top 65%' },
        opacity: 0, y: 30, duration: 0.8, ease: 'power3.out'
    });
    // Cards — explicit fromTo to guarantee end state
    ScrollTrigger.create({
        trigger: '.stack-section__grid', start: 'top 80%',
        onEnter: () => {
            gsap.fromTo('.stack-card',
                { opacity: 0, y: 50, scale: 0.88 },
                { opacity: 1, y: 0, scale: 1, stagger: 0.12, duration: 0.8, ease: 'back.out(2)' }
            );
        }, once: true
    });
    // Ensure cards are visible if user scrolls fast past the trigger
    ScrollTrigger.create({
        trigger: '.stack-section__grid', start: 'top 30%',
        onEnter: () => { gsap.set('.stack-card', { opacity: 1, y: 0, scale: 1 }); },
        once: true
    });
    gsap.from('.stack-tray', {
        scrollTrigger: { trigger: '.stack-tray', start: 'top 85%' },
        opacity: 0, y: 50, duration: 0.9, ease: 'power3.out'
    });

    // Transform
    gsap.from('.transform-section__header', {
        scrollTrigger: { trigger: '.transform-section', start: 'top 70%' },
        opacity: 0, y: 60, duration: 1, ease: 'power3.out'
    });
    gsap.from('.transform-slider', {
        scrollTrigger: { trigger: '.transform-slider', start: 'top 75%' },
        opacity: 0, scale: 0.9, rotateX: -5, duration: 1.2, ease: 'power3.out'
    });
    gsap.from('.transform-stat', {
        scrollTrigger: { trigger: '.transform-stats', start: 'top 80%' },
        opacity: 0, y: 40, scale: 0.9, stagger: 0.15, duration: 0.7, ease: 'back.out(2)'
    });
    gsap.from('.transform-quote', {
        scrollTrigger: { trigger: '.transform-quote', start: 'top 85%' },
        opacity: 0, y: 30, duration: 1, ease: 'power3.out'
    });

    /* ═══ 15. FINAL CTA SECTION ═══ */
    function initFinalCanvas() {
        const canvas = $('#final-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;
        const pts = Array.from({ length: 80 }, () => ({
            x: Math.random() * w, y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6,
            r: Math.random() * 2.5 + 0.5, a: Math.random() * 0.35 + 0.05
        }));
        (function draw() {
            ctx.clearRect(0, 0, w, h);
            pts.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(57,255,20,${p.a})`; ctx.fill();
            });
            // Draw lines between close particles
            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
                        ctx.strokeStyle = `rgba(57,255,20,${0.06 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5; ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(draw);
        })();
        window.addEventListener('resize', () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; });
    }
    initFinalCanvas();

    ScrollTrigger.create({
        trigger: '.final-section', start: 'top 55%',
        onEnter: () => {
            gsap.to('.final-product', { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.9, ease: 'back.out(2)' });
            gsap.from('.final-section__title span', { y: '110%', rotateX: -30, duration: 1.1, stagger: 0.18, ease: 'power4.out', delay: 0.4 });
            gsap.from('.final-section__subtitle', { opacity: 0, y: 25, duration: 0.8, delay: 0.9, ease: 'power3.out' });
            gsap.from('.final-section__btn', { opacity: 0, scale: 0.7, duration: 0.9, delay: 1.1, ease: 'elastic.out(1.2, 0.5)' });
        }, once: true
    });

    /* ═══ 16. MAGNETIC BUTTONS ═══ */
    if (window.innerWidth > 768) {
        $$('[data-magnetic]').forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const r = btn.getBoundingClientRect();
                const dx = e.clientX - (r.left + r.width / 2);
                const dy = e.clientY - (r.top + r.height / 2);
                gsap.to(btn, { x: dx * 0.3, y: dy * 0.3, duration: 0.4, ease: 'power2.out' });
            });
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
            });
        });
    }

    /* ═══ 17. MARQUEE PARALLAX ═══ */
    $$('.marquee__track').forEach(track => {
        gsap.to(track, {
            scrollTrigger: { trigger: track.parentElement, scrub: 0.3 },
            x: track.parentElement.classList.contains('marquee--reverse') ? 80 : -80, ease: 'none'
        });
    });

    /* ═══ 18. IMAGE TILT ON CARDS ═══ */
    if (window.innerWidth > 768) {
        $$('.stack-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const dx = (e.clientX - r.left) / r.width - 0.5;
                const dy = (e.clientY - r.top) / r.height - 0.5;
                gsap.to(card, { rotateY: dx * 12, rotateX: -dy * 8, duration: 0.3, ease: 'power2.out', transformPerspective: 600 });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.5, ease: 'power2.out' });
            });
        });
    }

    /* ═══ 19. NAV/FINAL CTA CLICKS ═══ */
    const navCta = $('.navbar__cta');
    if (navCta) navCta.addEventListener('click', () => { const s = $('#stack'); if (s) lenis.scrollTo(s, { offset: -60 }); });

    const finalBtn = $('.final-section__btn');
    if (finalBtn) finalBtn.addEventListener('click', e => { e.preventDefault(); const s = $('#stack'); if (s) lenis.scrollTo(s, { offset: -60 }); });

    /* ═══ 20. SECTION REVEAL STAGGER ═══ */
    $$('.section-label').forEach(label => {
        gsap.from(label, {
            scrollTrigger: { trigger: label, start: 'top 85%' },
            opacity: 0, x: -30, duration: 0.7, ease: 'power3.out'
        });
    });

    $$('.section-title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: { trigger: title, start: 'top 80%' },
            opacity: 0, y: 50, duration: 1, ease: 'power3.out'
        });
    });

})();
