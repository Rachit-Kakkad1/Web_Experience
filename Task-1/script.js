// ================================================
//  GSAP — Hover & Intro Animations
// ================================================

document.addEventListener("DOMContentLoaded", () => {
    const panels = document.querySelectorAll(".panel");

    // ─── PAGE INTRO ────────────────────────────────
    const intro = gsap.timeline({ defaults: { ease: "power4.out" } });

    intro
        .set(".panel__img", { opacity: 0, scale: 1.12 })
        .from(".panel__bg", {
            opacity: 0,
            duration: 1.0,
            stagger: 0.12,
        })
        .from(
            ".panel__text span",
            {
                y: 80,
                opacity: 0,
                duration: 1,
                stagger: 0.06,
                ease: "power3.out",
            },
            "-=0.6"
        )
        .from(
            ".panel__label, .panel__accent",
            {
                y: 15,
                opacity: 0,
                duration: 0.6,
                stagger: 0.08,
            },
            "-=0.5"
        )
        .from(
            ".cross-lines line",
            {
                attr: { "stroke-dasharray": "0 2000" },
                duration: 1.4,
                stagger: 0.15,
                ease: "power2.inOut",
            },
            "-=0.9"
        )
        .from(
            ".center-dot",
            {
                scale: 0,
                opacity: 0,
                duration: 0.5,
                ease: "back.out(2)",
            },
            "-=0.5"
        );

    // ─── HOVER: REVEAL IMAGE + DIM OTHERS ──────────
    panels.forEach((panel) => {
        const img = panel.querySelector(".panel__img");
        let tween = null;

        panel.addEventListener("mouseenter", () => {
            panels.forEach((p) => {
                if (p !== panel) p.classList.add("is-dimmed");
            });

            if (tween) tween.kill();
            tween = gsap.to(img, {
                opacity: 1,
                scale: 1,
                duration: 0.7,
                ease: "power3.out",
            });

            gsap.to(".center-dot", {
                scale: 1.8,
                background: "rgba(255,255,255,0.45)",
                duration: 0.35,
                ease: "power2.out",
            });
        });

        panel.addEventListener("mouseleave", () => {
            panels.forEach((p) => p.classList.remove("is-dimmed"));

            if (tween) tween.kill();
            tween = gsap.to(img, {
                opacity: 0,
                scale: 1.12,
                duration: 0.5,
                ease: "power3.inOut",
            });

            gsap.to(".center-dot", {
                scale: 1,
                background: "rgba(255,255,255,0.25)",
                duration: 0.35,
                ease: "power2.out",
            });
        });

        // Subtle parallax on hovered image
        panel.addEventListener("mousemove", (e) => {
            const r = panel.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width - 0.5;
            const ny = (e.clientY - r.top) / r.height - 0.5;

            gsap.to(img, {
                x: nx * 18,
                y: ny * 18,
                duration: 0.5,
                ease: "power2.out",
                overwrite: "auto",
            });
        });
    });
});
