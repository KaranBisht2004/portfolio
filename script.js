const lenis = new Lenis({
    duration: 3.2,
    touchMultiplier: 2,
    autoRaf: false,
});

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);


function anchorLinks() {
    const headerHeight = document.querySelector(".site-header")?.offsetHeight ?? 0;

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (e) => {
            const hash = link.getAttribute("href");
            if (!hash || hash.length < 2) return;

            const target = document.querySelector(hash);
            if (!target) return;

            e.preventDefault();
            lenis.scrollTo(target, { offset: -headerHeight });
        });
    });
}

// cursor
function cursor() {
    const cursor = document.querySelector(".cursor");
    if (!cursor) return;


    let mouseX = 9999;
    let mouseY = 9999;


    const xTo = gsap.quickTo(cursor, "x", { duration: 0.3, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.3, ease: "power3.out" });


    xTo(mouseX);
    yTo(mouseY);

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        xTo(mouseX);
        yTo(mouseY);
    });

    document.body.addEventListener("mouseleave", () => {
        gsap.to(cursor, {
            scale: 0,
            opacity: 0,
            duration: 0.2,
            ease: "power2.out",
            overwrite: "auto"
        });
    });

    document.body.addEventListener("mouseenter", () => {
        gsap.to(cursor, {
            scale: 1,
            opacity: 1,
            duration: 0.2,
            ease: "power2.out",
            overwrite: "auto"
        });
    });
}
// navbar
function navbar() {
    const navLinks = document.querySelector(".nav-links");
    const menuBtn = document.querySelector("#menu");
    if (!menuBtn || !navLinks) return;

    menuBtn.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("active");
        menuBtn.textContent = isOpen ? "close" : "menu";
    });

    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            menuBtn.textContent = "menu";
        });
    });
}


function profileCard() {
    const profileCardEl = document.querySelector(".profile-card");
    const header = document.querySelector(".site-header");
    if (!profileCardEl || !header) return;

    let observer;

    const setupObserver = () => {
        if (observer) observer.disconnect();

        const headerHeight = header.getBoundingClientRect().height;

        observer = new IntersectionObserver(
            ([entry]) => {
                profileCardEl.classList.toggle("is-behind", entry.intersectionRatio < 1);
            },
            {
                root: null,
                rootMargin: `-${headerHeight}px 0px 0px 0px`,
                threshold: 1,
            }
        );

        observer.observe(profileCardEl);
    };

    setupObserver();
    window.addEventListener("resize", setupObserver, { passive: true });
}

// mouse trail
function mouseTrail() {
    const heroSection = document.querySelector(".hero-section");
    if (!heroSection) return;


    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const trailImages = [
        "./media/mousetrail/1d058dc9-03ed-40a6-93b0-dd91f1624e50.webp",
        "./media/mousetrail/9a0f2e6d-1b3d-40cd-a745-0fae1a939e31.webp",
        "./media/mousetrail/b671d9a7-2da0-4789-abbc-33a5a4c28dfb.webp",
        "./media/mousetrail/edf60cf2-4748-48c4-8968-a255c5320bae.webp",
    ];
    const distanceThreshold = 250;

    let lastX = 0;
    let lastY = 0;
    let imageIndex = 0;

    heroSection.addEventListener("mousemove", (e) => {
        const distance = Math.hypot(e.clientX - lastX, e.clientY - lastY);
        if (distance <= distanceThreshold) return;

        lastX = e.clientX;
        lastY = e.clientY;
        spawnTrailImage(e.clientX, e.clientY, trailImages[imageIndex % trailImages.length]);
        imageIndex++;
    }, { passive: true });

    function spawnTrailImage(x, y, src) {
        const img = document.createElement("img");
        img.src = src;
        img.className = "trail-img";
        document.body.appendChild(img);

        const rotation = gsap.utils.random(-20, 20);

        gsap.set(img, {
            xPercent: -50,
            yPercent: -50,
            x,
            y,
            scale: 0,
            opacity: 0,
            rotation: rotation - 10,
        });

        gsap.timeline({ onComplete: () => img.remove() })
            .to(img, { scale: 1, opacity: 1, rotation, duration: 0.4, ease: "back.out(1.7)" })
            .to(img, { scale: 0, opacity: 0, y: "+=50", duration: 0.5, ease: "power4.in" }, "+=0.1");
    }
}

// about
function skillCloudPhysics() {
    const container = document.querySelector(".skill-cloud");
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const { Engine, Composite, Bodies, Body, Mouse, MouseConstraint, World } = Matter;

    const config = {
        gravity: { x: 0, y: 0.5 },
        restitution: 0.08,
        friction: 0.2,
        frictionStatic: 0.6,
        frictionAir: 0.012,
        density: 0.0018,
        slop: 0.02,
        wallThickness: 400,
        spawnGap: 90,
        spawnAbove: 20,
        dragStiffness: 0.15,
        dragDamping: 0.25,
        fixedDelta: 1000 / 60,
        maxSubSteps: 4,
        maxFrameDelta: 100,
    };

    const engine = Engine.create({
        gravity: config.gravity,
        enableSleeping: true,
        positionIterations: 6,
        velocityIterations: 4,
        constraintIterations: 2,
    });
    const world = engine.world;

    container.style.position = container.style.position || "relative";
    let width = container.clientWidth;
    let height = container.clientHeight;

    let walls = [];
    function buildWalls() {
        if (walls.length) Composite.remove(world, walls);

        const t = config.wallThickness;
        const wallOptions = { isStatic: true, friction: config.friction, restitution: config.restitution * 0.4 };

        walls = [
            Bodies.rectangle(width / 2, height + t / 2, width + t * 2, t, wallOptions),
            Bodies.rectangle(-t / 2, height / 2, t, height * 6, wallOptions),
            Bodies.rectangle(width + t / 2, height / 2, t, height * 6, wallOptions),
        ];
        Composite.add(world, walls);
    }
    buildWalls();

    const chips = Array.from(container.querySelectorAll(".skill-chip"));
    const items = chips.map((el, i) => {
        el.style.position = "absolute";
        el.style.top = "0";
        el.style.left = "0";

        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const minX = w / 2;
        const maxX = Math.max(minX, width - w / 2);
        const startX = gsap.utils.random(minX, maxX, 1);
        const startY = -config.spawnAbove - i * config.spawnGap;

        const body = Bodies.rectangle(startX, startY, w, h, {
            restitution: config.restitution,
            friction: config.friction,
            frictionStatic: config.frictionStatic,
            frictionAir: config.frictionAir,
            density: config.density,
            slop: config.slop,
            chamfer: { radius: Math.min(w, h) / 2 },
            sleepThreshold: 60,
        });

        Body.setAngle(body, gsap.utils.random(-0.35, 0.35));
        Body.setAngularVelocity(body, gsap.utils.random(-0.05, 0.05));
        Composite.add(world, body);

        return { body, el, w, h, px: startX, py: startY, pa: body.angle };
    });

    const mouse = Mouse.create(container);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
            stiffness: config.dragStiffness,
            damping: config.dragDamping,
            length: 0.01,
            render: { visible: false },
        },
    });
    Composite.add(world, mouseConstraint);

    function releaseDrag() {
        mouseConstraint.body = null;
        mouseConstraint.constraint.bodyB = null;
    }
    window.addEventListener("mouseup", releaseDrag);
    container.addEventListener("mouseleave", releaseDrag);

    const wheelHandler = mouse.mousewheel;
    if (wheelHandler) {
        mouse.element.removeEventListener("mousewheel", wheelHandler);
        mouse.element.removeEventListener("DOMMouseScroll", wheelHandler);
    }

    let accumulator = 0;

    function tick(_time, deltaTime) {
        const frameDelta = Math.min(deltaTime, config.maxFrameDelta);
        accumulator += frameDelta;
        let steps = 0;

        while (accumulator >= config.fixedDelta && steps < config.maxSubSteps) {
            for (const item of items) {
                item.px = item.body.position.x;
                item.py = item.body.position.y;
                item.pa = item.body.angle;
            }
            Engine.update(engine, config.fixedDelta);
            accumulator -= config.fixedDelta;
            steps++;
        }

        if (steps === config.maxSubSteps) accumulator = 0;
        const alpha = accumulator / config.fixedDelta;

        for (const item of items) {
            const body = item.body;
            if (body.isSleeping) continue;

            const x = item.px + (body.position.x - item.px) * alpha;
            const y = item.py + (body.position.y - item.py) * alpha;
            const angle = item.pa + (body.angle - item.pa) * alpha;

            item.el.style.transform =
                `translate3d(${(x - item.w * 0.5).toFixed(2)}px, ${(y - item.h * 0.5).toFixed(2)}px, 0) rotate(${angle.toFixed(4)}rad)`;
        }
    }


    const visibilityObserver = new IntersectionObserver(
        ([entry]) => {
            if (entry.isIntersecting) {
                gsap.ticker.add(tick);
            } else {
                gsap.ticker.remove(tick);
            }
        },
        { threshold: 0 }
    );
    visibilityObserver.observe(container);

    let resizeRaf = 0;
    const resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(() => {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
            if (newWidth === width && newHeight === height) return;

            const scaleX = width ? newWidth / width : 1;
            const scaleY = height ? newHeight / height : 1;
            width = newWidth;
            height = newHeight;
            buildWalls();

            for (const item of items) {
                const pos = item.body.position;
                const minX = item.w / 2;
                const maxX = Math.max(minX, width - item.w / 2);

                Body.setPosition(item.body, {
                    x: gsap.utils.clamp(minX, maxX, pos.x * scaleX),
                    y: Math.min(pos.y * scaleY, height - item.h / 2),
                });
                Body.setVelocity(item.body, { x: 0, y: 0 });
            }
        });
    });
    resizeObserver.observe(container);

    return function destroy() {
        gsap.ticker.remove(tick);
        visibilityObserver.disconnect();
        resizeObserver.disconnect();
        Mouse.clearSourceEvents(mouse);
        World.clear(world, false);
        Engine.clear(engine);
    };
}


// work
function ProjectPreviews() {
    document.querySelectorAll(".project-card").forEach((card) => {
        const video = card.querySelector(".project-card__video");
        if (!video) return;

        card.addEventListener("mouseenter", () => {
            video.currentTime = 0;
            video.play().catch(() => { });
        });

        card.addEventListener("mouseleave", () => {
            video.pause();
            video.currentTime = 0;
        });
    });
}
// servic
function serviceList() {
    document.querySelectorAll(".service-item").forEach((item) => {
        const overlay = item.querySelector(".service-item__overlay");
        if (!overlay) return;

        item.addEventListener("mouseenter", () => {
            item.classList.add("active");
            gsap.to(overlay, { height: "100%", duration: 0.5, ease: "power2.out", overwrite: "auto" });
        });

        item.addEventListener("mouseleave", () => {
            item.classList.remove("active");
            gsap.to(overlay, { height: "0%", duration: 0.4, ease: "power2.out", overwrite: "auto" });
        });
    });
}

// footer
function footer() {
    const yearEl = document.querySelector("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", () => {
    anchorLinks();
    cursor();
    navbar();
    profileCard();
    mouseTrail();
    skillCloudPhysics();
    ProjectPreviews();
    serviceList();
    footer();

});