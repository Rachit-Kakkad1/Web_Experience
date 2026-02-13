document.addEventListener("DOMContentLoaded", () => {
    const panels = document.querySelectorAll(".panel");
    const bgImage = document.querySelector(".bg-image");
    const textDel = document.querySelector(".text-del");
    const textVe = document.querySelector(".text-ve");

    // ── Page Load Animation ──
    const loadTl = gsap.timeline({ defaults: { ease: "power3.out" } });

    loadTl
        .from(".bg-image img", {
            scale: 1.15,
            opacity: 0,
            duration: 1.4,
        })
        .from(".panel-dark", {
            x: "-100%",
            opacity: 0,
            duration: 1,
        }, "-=0.8")
        .from(".panel-pink", {
            y: "-80%",
            opacity: 0,
            duration: 1,
        }, "-=0.7")
        .from(".panel-light", {
            x: "80%",
            opacity: 0,
            duration: 1,
        }, "-=0.7")
        .from(".text-del", {
            y: 80,
            opacity: 0,
            duration: 0.8,
        }, "-=0.5")
        .from(".text-ve", {
            y: 80,
            opacity: 0,
            duration: 0.8,
            // note: final opacity is 0.22 set via CSS
        }, "-=0.6")
        .from(".projects-label", {
            y: 20,
            opacity: 0,
            duration: 0.5,
        }, "-=0.4")
        .from(".corner-d", {
            scale: 0,
            opacity: 0,
            duration: 0.4,
            ease: "back.out(1.7)",
        }, "-=0.3");

    // ── Panel Hover Interactions ──
    panels.forEach((panel) => {
        const hoverImg = panel.querySelector(".panel-hover-img");
        let hoverTl = null;

        panel.addEventListener("mouseenter", () => {
            if (hoverTl) hoverTl.kill();

            // Dim others
            panels.forEach((p) => {
                if (p !== panel) p.classList.add("dimmed");
            });
            bgImage.classList.add("dimmed");

            // Reveal hover image inside this panel
            hoverTl = gsap.timeline();
            hoverTl.to(hoverImg, {
                opacity: 1,
                duration: 0.6,
                ease: "power2.out",
            });

            // Slightly scale up text
            gsap.to([textDel, textVe], {
                scale: 1.03,
                duration: 0.5,
                ease: "power2.out",
            });
        });

        panel.addEventListener("mouseleave", () => {
            if (hoverTl) hoverTl.kill();

            // Restore
            panels.forEach((p) => p.classList.remove("dimmed"));
            bgImage.classList.remove("dimmed");

            // Hide hover image
            hoverTl = gsap.timeline();
            hoverTl.to(hoverImg, {
                opacity: 0,
                duration: 0.45,
                ease: "power2.inOut",
            });

            gsap.to([textDel, textVe], {
                scale: 1,
                duration: 0.4,
                ease: "power2.out",
            });
        });

        // Parallax within panel
        panel.addEventListener("mousemove", (e) => {
            const rect = panel.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * 12;

            gsap.to(hoverImg, {
                x: x,
                y: y,
                duration: 0.5,
                ease: "power2.out",
            });
        });
    });

    // ── Background image hover (the exposed photo area) ──
    bgImage.addEventListener("mouseenter", () => {
        panels.forEach((p) => p.classList.add("dimmed"));

        gsap.to(".bg-image img", {
            scale: 1.04,
            filter: "brightness(0.9)",
            duration: 0.7,
            ease: "power2.out",
        });
    });

    bgImage.addEventListener("mouseleave", () => {
        panels.forEach((p) => p.classList.remove("dimmed"));

        gsap.to(".bg-image img", {
            scale: 1,
            filter: "brightness(0.7)",
            duration: 0.5,
            ease: "power2.out",
        });
    });
});
