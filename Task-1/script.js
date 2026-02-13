document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll(".section");

    // ── Page Load Animation ──
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(".section-bg", {
        opacity: 0,
        duration: 1,
        stagger: 0.12,
    })
        .from(".big-text", {
            y: 60,
            opacity: 0,
            duration: 0.9,
            stagger: 0.08,
        }, "-=0.6")
        .from(".label, .corner-letter", {
            y: 15,
            opacity: 0,
            duration: 0.5,
        }, "-=0.5");

    // ── Hover: reveal image + dim others ──
    sections.forEach((section) => {
        const image = section.querySelector(".section-image");
        let enterTl = null;

        section.addEventListener("mouseenter", () => {
            if (enterTl) enterTl.kill();

            // Dim other sections
            sections.forEach((s) => {
                if (s !== section) s.classList.add("dimmed");
            });

            // Reveal image
            enterTl = gsap.timeline();
            enterTl.to(image, {
                opacity: 1,
                scale: 1,
                duration: 0.7,
                ease: "power2.out",
            });
        });

        section.addEventListener("mouseleave", () => {
            if (enterTl) enterTl.kill();

            // Restore other sections
            sections.forEach((s) => s.classList.remove("dimmed"));

            // Hide image
            enterTl = gsap.timeline();
            enterTl.to(image, {
                opacity: 0,
                scale: 1.1,
                duration: 0.5,
                ease: "power2.inOut",
            });
        });

        // Subtle parallax on mouse move
        section.addEventListener("mousemove", (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 15;
            const y = (e.clientY / window.innerHeight - 0.5) * 15;

            gsap.to(image, {
                x: x,
                y: y,
                duration: 0.5,
                ease: "power2.out",
            });
        });
    });
});
