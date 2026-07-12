/* ----------------------------------------------------
   DREAMERS DESIGNS - INTERACTION ENGINE
   Aesthetic: Swiss Minimalist Precision
   ---------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize everything
    initSmoothScroll();
    initPreloader();
    initCustomCursor();
    initHeroScene();
    initTextScramble();
    init3DTilt();
    initEstimator();
    initBlueprintCanvas();
    initClocks();
    initScrollReveals();
    initPageTransitions();
    initAuthSession();
    initBookingGuard();
});

// Global smooth scroll reference
let lenis;

/* 1. LENIS SMOOTH INERTIAL SCROLL */
function initSmoothScroll() {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // Update ScrollTrigger on scroll
    lenis.on('scroll', ScrollTrigger.update);

    // Integrate Lenis with GSAP ticker
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
}

/* 2. CUSTOM PRELOADER */
function initPreloader() {
    document.body.classList.add('preloader-active');

    // Stagger letter assembly
    gsap.to('.preloader-title .char', {
        y: '0%',
        stagger: 0.08,
        duration: 1.0,
        ease: 'power4.out',
        delay: 0.2
    });

    let percent = 0;
    const percentEl = document.getElementById('preloader-percent');

    const interval = setInterval(() => {
        // Random progress increment
        percent += Math.floor(Math.random() * 8) + 3;

        if (percent >= 100) {
            percent = 100;
            clearInterval(interval);

            // Full line activation
            gsap.to('.preloader-line', {
                width: '100%',
                duration: 0.4,
                ease: 'power2.inOut',
                onComplete: () => {
                    revealPage();
                }
            });
        }

        percentEl.textContent = String(percent).padStart(2, '0') + '%';
        gsap.to('.preloader-line', {
            width: `${percent}%`,
            duration: 0.1,
            ease: 'none'
        });
    }, 60.0);
}

function revealPage() {
    document.body.classList.remove('preloader-active');

    const tl = gsap.timeline();
    tl.to('.preloader-content', {
        opacity: 0,
        y: -40,
        duration: 0.8,
        ease: 'power3.inOut'
    })
        .to('.preloader', {
            yPercent: -100,
            duration: 1.2,
            ease: 'power4.inOut'
        }, '-=0.4')
        .from('.navbar', {
            y: -40,
            opacity: 0,
            duration: 1.0,
            ease: 'power3.out'
        }, '-=0.6')
        .from('#hero-title', {
            y: 100,
            opacity: 0,
            duration: 1.4,
            ease: 'power4.out'
        }, '-=0.8')
        .from('.hero-subtext', {
            y: 30,
            opacity: 0,
            duration: 1.0,
            ease: 'power3.out'
        }, '-=1.0')
        .from('.hero-actions', {
            y: 30,
            opacity: 0,
            duration: 1.0,
            ease: 'power3.out'
        }, '-=1.0')
        .from('.hero-canvas-label', {
            opacity: 0,
            duration: 1.0
        }, '-=0.8')
        .from('.scroll-down-indicator', {
            opacity: 0,
            duration: 0.8
        }, '-=0.6');
}

/* 3. CUSTOM MINIMALIST CURSOR WITH MAGNETIC HOVER */
let cursor = { x: 0, y: 0, ringX: 0, ringY: 0 };

function initCustomCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');

    if (!dot || !ring) return;

    window.addEventListener('mousemove', (e) => {
        cursor.x = e.clientX;
        cursor.y = e.clientY;

        // Immediate position for center dot
        gsap.set(dot, { x: cursor.x, y: cursor.y });
    });

    // Inertial follow loop for cursor ring
    function tick() {
        cursor.ringX += (cursor.x - cursor.ringX) * 0.15;
        cursor.ringY += (cursor.y - cursor.ringY) * 0.15;

        gsap.set(ring, { x: cursor.ringX, y: cursor.ringY });
        requestAnimationFrame(tick);
    }
    tick();

    // Standard links & button hover cursor expand
    const interactables = document.querySelectorAll('a, button, .select-pill, .luxury-slider');
    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('hovering-interactive');
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('hovering-interactive');
        });
    });

    // Magnetic pull setup
    const magneticEls = document.querySelectorAll('[data-magnetic]');
    magneticEls.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const bounds = el.getBoundingClientRect();
            // Mouse offsets relative to the element center
            const x = e.clientX - (bounds.left + bounds.width / 2);
            const y = e.clientY - (bounds.top + bounds.height / 2);

            // Pull the element slightly towards cursor
            gsap.to(el, {
                x: x * 0.35,
                y: y * 0.35,
                duration: 0.3,
                ease: 'power2.out'
            });

            // Snaps cursor ring over the element center
            cursor.x = bounds.left + bounds.width / 2 + x * 0.1;
            cursor.y = bounds.top + bounds.height / 2 + y * 0.1;
        });

        el.addEventListener('mouseleave', () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'power3.out'
            });
        });
    });
}

/* 4. THREE.JS ENTITY — raymarched liquid-chrome organism (SDF metaballs, real-time reflections) */
function initHeroScene() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    let scene, camera, renderer;

    // Fallback indicator
    let webglSupported = true;
    try {
        scene = new THREE.Scene();
        camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.outputColorSpace = THREE.SRGBColorSpace;
    } catch (e) {
        webglSupported = false;
        console.warn("WebGL not supported. Running 2D Canvas fallback.");
    }

    if (!webglSupported) {
        run2DHeroFallback(canvas);
        return;
    }

    // Heavier shader (per-pixel raymarching) — cap pixel ratio a bit tighter than other scenes
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
        }
    `;

    // Raymarched signed-distance-field "organism": three morphing metaballs
    // smooth-blended into one liquid-chrome surface, with a mouse-driven
    // dent/poke deformation and a click-triggered ripple shockwave across
    // the surface. Shaded with fake fresnel + reflection gradient so it
    // reads as polished liquid metal rather than a flat 3D render.
    const fragmentShader = `
        precision highp float;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uAspect;
        uniform float uWarp;
        varying vec2 vUv;

        mat2 rot(float a) {
            float s = sin(a), c = cos(a);
            return mat2(c, -s, s, c);
        }

        float hash(vec3 p) {
            p = fract(p * 0.3183099 + 0.1);
            p *= 17.0;
            return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }

        float noise3(vec3 p) {
            vec3 i = floor(p);
            vec3 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
                mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                    mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                    mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
                f.z);
        }

        float smin(float a, float b, float k) {
            float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
            return mix(b, a, h) - k * h * (1.0 - h);
        }

        float smax(float a, float b, float k) {
            return -smin(-a, -b, k);
        }

        float sdSphere(vec3 p, float r) {
            return length(p) - r;
        }

        float map(vec3 p) {
            vec3 p1 = p - vec3(sin(uTime * 0.6) * 0.55, cos(uTime * 0.5) * 0.4, sin(uTime * 0.35) * 0.3);
            float d = sdSphere(p1, 0.85);

            vec3 p2 = p - vec3(cos(uTime * 0.45) * 0.7, sin(uTime * 0.65) * 0.5, cos(uTime * 0.4) * 0.4);
            d = smin(d, sdSphere(p2, 0.5), 0.55);

            vec3 p3 = p - vec3(sin(uTime * 0.3 + 2.0) * 0.55, cos(uTime * 0.5 + 1.0) * 0.6, sin(uTime * 0.55) * 0.45);
            d = smin(d, sdSphere(p3, 0.42), 0.6);

            // Cursor pokes/dents the surface like a finger pressing into liquid metal
            vec3 poke = vec3(uMouse * 1.7, 0.55);
            float pokeDist = sdSphere(p - poke, 0.55 + uWarp * 0.35);
            d = smax(d, -pokeDist, 0.35);

            // Fine surface ripple, domain-warped noise
            d += (noise3(p * 3.2 + uTime * 0.4) - 0.5) * 0.045;

            // Radial shockwave ripple on click, travels outward from center
            float distFromCenter = length(p);
            d += sin(distFromCenter * 9.0 - uTime * 3.0) * 0.05 * uWarp;

            return d;
        }

        vec3 estimateNormal(vec3 p) {
            vec2 e = vec2(0.0015, 0.0);
            return normalize(vec3(
                map(p + e.xyy) - map(p - e.xyy),
                map(p + e.yxy) - map(p - e.yxy),
                map(p + e.yyx) - map(p - e.yyx)
            ));
        }

        void main() {
            vec2 uv = vUv - 0.5;
            uv.x *= uAspect;

            vec3 ro = vec3(0.0, 0.0, 3.3);
            vec3 rd = normalize(vec3(uv, -1.7));

            float yaw = uMouse.x * 0.5;
            float pitch = uMouse.y * 0.35;
            ro.xz *= rot(yaw);
            rd.xz *= rot(yaw);
            ro.yz *= rot(pitch);
            rd.yz *= rot(pitch);

            float t = 0.0;
            float d = 1.0;
            int steps = 0;
            for (int i = 0; i < 72; i++) {
                vec3 p = ro + rd * t;
                d = map(p);
                if (d < 0.0012 || t > 8.0) break;
                t += d * 0.72;
                steps = i;
            }

            vec3 bg = mix(vec3(1.0), vec3(0.96), smoothstep(0.0, 1.0, length(uv)));

            if (t > 8.0) {
                gl_FragColor = vec4(bg, 1.0);
                return;
            }

            vec3 p = ro + rd * t;
            vec3 nor = estimateNormal(p);

            vec3 lightDir = normalize(vec3(0.5 - uMouse.x * 0.6, 0.6 - uMouse.y * 0.4, 0.7));
            float diff = max(dot(nor, lightDir), 0.0);
            float fresnel = pow(1.0 - max(dot(-rd, nor), 0.0), 3.0);

            vec3 reflDir = reflect(rd, nor);
            float envGrad = clamp(reflDir.y * 0.5 + 0.5, 0.0, 1.0);
            float ao = 1.0 - float(steps) / 72.0;

            float shade = envGrad * 0.35 + diff * 0.45 + fresnel * 0.85;
            shade *= 0.55 + ao * 0.45;
            shade += uWarp * 0.3;

            vec3 metal = mix(vec3(0.03, 0.03, 0.035), vec3(1.0), clamp(shade, 0.0, 1.0));

            gl_FragColor = vec4(metal, 1.0);
        }
    `;

    const uniforms = {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uAspect: { value: window.innerWidth / window.innerHeight },
        uWarp: { value: 0 },
    };

    const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        depthWrite: false,
        depthTest: false,
    });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    plane.frustumCulled = false;
    scene.add(plane);

    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let warp = 0, warpTarget = 0;

    window.addEventListener('mousemove', (e) => {
        mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;

        const cx = document.getElementById('coord-x');
        const cy = document.getElementById('coord-y');
        if (cx && cy) {
            cx.textContent = mouse.targetX.toFixed(2);
            cy.textContent = mouse.targetY.toFixed(2);
        }
    });

    // Click sends a shockwave ripple through the liquid-metal surface
    canvas.addEventListener('click', () => {
        warpTarget = 1.0;
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        mouse.x += (mouse.targetX - mouse.x) * 0.07;
        mouse.y += (mouse.targetY - mouse.y) * 0.07;

        warpTarget *= 0.93;
        warp += (warpTarget - warp) * 0.1;

        uniforms.uTime.value = time;
        uniforms.uMouse.value.set(mouse.x, mouse.y);
        uniforms.uWarp.value = warp;

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        uniforms.uAspect.value = window.innerWidth / window.innerHeight;
    });
}

// Graceful 2D Canvas Fallback — floating/tumbling shard silhouettes

function run2DHeroFallback(canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const shardCount = 46;
    const shards = Array.from({ length: shardCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 10 + Math.random() * 26,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.02,
        driftX: (Math.random() - 0.5) * 0.3,
        driftY: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.08 + Math.random() * 0.18,
    }));

    let frame = 0;
    function draw() {
        frame++;
        ctx.clearRect(0, 0, width, height);

        shards.forEach(s => {
            s.rot += s.spin;
            s.x += s.driftX + Math.sin(frame * 0.01 + s.phase) * 0.2;
            s.y += s.driftY + Math.cos(frame * 0.01 + s.phase) * 0.2;

            if (s.x < -50) s.x = width + 50;
            if (s.x > width + 50) s.x = -50;
            if (s.y < -50) s.y = height + 50;
            if (s.y > height + 50) s.y = -50;

            const scale = 0.85 + Math.sin(frame * 0.02 + s.phase) * 0.15;
            const r = s.size * scale;

            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rot);
            ctx.beginPath();
            ctx.moveTo(0, -r * 0.66);
            ctx.lineTo(-r * 0.58, r * 0.33);
            ctx.lineTo(r * 0.58, r * 0.33);
            ctx.closePath();
            ctx.fillStyle = `rgba(10, 10, 10, ${s.alpha})`;
            ctx.fill();
            ctx.restore();
        });

        requestAnimationFrame(draw);
    }
    draw();
}

/* 5. GSAP SCROLL-TRIGGERED TEXT SCRAMBLE */
function initTextScramble() {
    const elements = document.querySelectorAll('.scramble-text');

    elements.forEach(el => {
        const finalVal = el.getAttribute('data-scramble') || el.innerText;
        el.innerText = ''; // Clear for reveal

        ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            onEnter: () => {
                triggerScramble(el, finalVal);
            },
            once: true
        });
    });
}

function triggerScramble(el, targetString) {
    const chars = '[]\\/+=_-*#@%?X012';
    const len = targetString.length;
    let currentFrame = 0;
    const maxFrames = 35; // Duration parameter

    function step() {
        currentFrame++;
        let output = '';

        for (let i = 0; i < len; i++) {
            if (targetString[i] === ' ') {
                output += ' ';
                continue;
            }

            const frameProgress = currentFrame / maxFrames;
            const letterThreshold = i / len;

            if (frameProgress > letterThreshold) {
                output += targetString[i]; // Lock original character
            } else {
                output += chars[Math.floor(Math.random() * chars.length)]; // Scramble character
            }
        }

        el.innerText = output;

        if (currentFrame < maxFrames) {
            requestAnimationFrame(step);
        }
    }
    step();
}

/* 6. SERVICE BENTO CARDS 3D SPATIAL HOVER */
function init3DTilt() {
    const cards = document.querySelectorAll('[data-magnetic-card]');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const bounds = card.getBoundingClientRect();
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            // Get offsets relative to card center
            const centerX = bounds.left + bounds.width / 2;
            const centerY = bounds.top + bounds.height / 2;

            const offX = mouseX - centerX;
            const offY = mouseY - centerY;

            // Calculate rotations
            const rotX = -offY / (bounds.height / 12);
            const rotY = offX / (bounds.width / 12);

            // Dynamic rotation tilt
            gsap.to(card, {
                rotateX: rotX,
                rotateY: rotY,
                transformPerspective: 1000,
                boxShadow: '0 25px 55px -20px rgba(0,0,0,0.06)',
                duration: 0.4,
                ease: 'power2.out'
            });

            // Parallax element shift inside card
            const content = card.querySelector('.card-content');
            if (content) {
                gsap.to(content, {
                    x: rotY * 0.75,
                    y: -rotX * 0.75,
                    z: 20,
                    duration: 0.4,
                    ease: 'power2.out'
                });
            }
        });

        card.addEventListener('mouseleave', () => {
            // Reset rotations
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                boxShadow: '0 10px 40px -15px rgba(0, 0, 0, 0.03)',
                duration: 0.6,
                ease: 'power3.out'
            });

            const content = card.querySelector('.card-content');
            if (content) {
                gsap.to(content, {
                    x: 0,
                    y: 0,
                    z: 0,
                    duration: 0.6,
                    ease: 'power3.out'
                });
            }
        });
    });
}

/* 7. INTERACTIVE COST ESTIMATOR */
function initEstimator() {
    const pills = document.querySelectorAll('.select-pill');
    const slider = document.getElementById('complexity-slider');
    const lockBtn = document.getElementById('btn-lock-estimate');

    if (!pills.length || !slider) return;

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pill.classList.toggle('active');
            updateEstimate();
        });
    });

    slider.addEventListener('input', () => {
        updateEstimate();
    });

    if (lockBtn) {
        lockBtn.addEventListener('click', (e) => {
            const activePills = document.querySelectorAll('.select-pill.active');
            let selectedServices = [];
            activePills.forEach(p => {
                selectedServices.push(p.textContent.trim().replace('✓ ', ''));
            });

            const costVal = document.getElementById('est-cost').textContent;
            const timeVal = document.getElementById('est-time').textContent;

            // Pre-fill email brief context
            const briefArea = document.getElementById('form-message');
            if (briefArea) {
                briefArea.value = `Hello, I'd like to consult for: ${selectedServices.join(', ')}. Projected timeline: ${timeVal} weeks. Investment lock: $${costVal}. Let's setup a workshop.`;
                briefArea.dispatchEvent(new Event('input')); // Float labels update
            }
        });
    }

    // Initial update call
    updateEstimate();
}

function updateEstimate() {
    const activePills = document.querySelectorAll('.select-pill.active');
    const slider = document.getElementById('complexity-slider');
    const label = document.getElementById('complexity-label');
    const costText = document.getElementById('est-cost');
    const timeText = document.getElementById('est-time');

    if (!slider) return;

    const scale = parseInt(slider.value);
    let scaleMult = 1.0;
    let timeMult = 1.0;

    if (scale === 1) {
        label.textContent = "Bespoke Core";
        scaleMult = 1.0;
        timeMult = 1.0;
    } else if (scale === 2) {
        label.textContent = "Multi-Integration";
        scaleMult = 1.45;
        timeMult = 1.35;
    } else if (scale === 3) {
        label.textContent = "Enterprise Architecture";
        scaleMult = 2.0;
        timeMult = 1.75;
    }

    let baseCostSum = 0;
    let baseTimeArray = [];

    activePills.forEach(pill => {
        baseCostSum += parseInt(pill.getAttribute('data-cost'));
        baseTimeArray.push(parseInt(pill.getAttribute('data-time')));
    });

    let finalTime = 0;
    if (baseTimeArray.length > 0) {
        const maxTime = Math.max(...baseTimeArray);
        const otherSum = baseTimeArray.reduce((a, b) => a + b, 0) - maxTime;
        // Parallel work index: base time is max time plus partial sum of other components
        finalTime = Math.ceil((maxTime + otherSum * 0.25) * timeMult);
    }

    const finalCost = Math.round(baseCostSum * scaleMult);

    // Dynamic mechanical animation
    animateEstimatorValue(costText, finalCost, true);
    animateEstimatorValue(timeText, finalTime, false);
}

function animateEstimatorValue(element, targetValue, isMoney) {
    const startVal = parseInt(element.innerText.replace(/,/g, '')) || 0;
    if (startVal === targetValue) return;

    let trackerObj = { value: startVal };
    gsap.to(trackerObj, {
        value: targetValue,
        duration: 0.5,
        ease: 'power2.out',
        onUpdate: () => {
            if (isMoney) {
                element.innerText = Math.round(trackerObj.value).toLocaleString('en-US');
            } else {
                element.innerText = String(Math.round(trackerObj.value)).padStart(2, '0');
            }
        }
    });
}

/* 8. ALIGNMENT BLUEPRINT CANVAS GRAPHICS */
function initBlueprintCanvas() {
    const canvas = document.getElementById('blueprint-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    function scaleCanvas() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight || 300;
    }
    scaleCanvas();
    window.addEventListener('resize', scaleCanvas);

    let frame = 0;

    function renderLoop() {
        frame++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Technical Grid
        ctx.strokeStyle = 'rgba(10, 10, 10, 0.03)';
        ctx.lineWidth = 0.5;
        const spacing = 30;

        for (let x = 0; x < canvas.width; x += spacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += spacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Circular coordinates systems
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const angle = frame * 0.006;
        const radius = 70 + Math.sin(frame * 0.015) * 6;

        ctx.strokeStyle = 'rgba(10, 10, 10, 0.07)';
        ctx.lineWidth = 0.8;

        // Draw circles
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, radius + 25, 0, Math.PI * 2);
        ctx.stroke();

        // Diagonal vector lines
        ctx.beginPath();
        ctx.moveTo(cx - Math.cos(angle) * (radius + 45), cy - Math.sin(angle) * (radius + 45));
        ctx.lineTo(cx + Math.cos(angle) * (radius + 45), cy + Math.sin(angle) * (radius + 45));
        ctx.stroke();

        // Text markings
        ctx.fillStyle = 'rgba(10, 10, 10, 0.3)';
        ctx.font = '8px Space Grotesk';
        ctx.fillText(`SYS_R: ${radius.toFixed(1)}px`, cx + radius + 10, cy - 10);
        ctx.fillText(`SWISS_GRID_SNAP`, cx - radius - 80, cy - 10);
        ctx.fillText(`D_COORD_X: ${Math.cos(angle).toFixed(3)}`, cx - radius - 80, cy + 15);

        // Snap boxes
        ctx.strokeRect(cx - 4, cy - 4, 8, 8);

        requestAnimationFrame(renderLoop);
    }
    renderLoop();
}

/* 9. REAL-TIME FOOTER TIMEZONE CLOCKS */
function initClocks() {
    function refreshClocks() {
        const configs = [
            { id: 'clock-zh', zone: 'Europe/Zurich' },
            { id: 'clock-ldn', zone: 'Europe/London' },
            { id: 'clock-tyo', zone: 'Asia/Tokyo' }
        ];

        configs.forEach(conf => {
            const el = document.getElementById(conf.id);
            if (!el) return;

            const timeString = new Date().toLocaleTimeString('en-US', {
                timeZone: conf.zone,
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            el.textContent = timeString;
        });
    }

    refreshClocks();
    setInterval(refreshClocks, 1000);
}

/* 10. ADVANCED SCROLL TRIGGER REVEALS */
function initScrollReveals() {
    // Reveal container blocks
    const revealContainers = document.querySelectorAll('.results-grid, .comparison-table, .contact-wrapper');
    revealContainers.forEach(container => {
        gsap.fromTo(container,
            { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)', y: 40 },
            {
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                y: 0,
                duration: 1.1,
                ease: 'power3.inOut',
                scrollTrigger: {
                    trigger: container,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // Animate manifesto words scroll highlight
    const paragraph = document.querySelector('.reveal-words');
    if (paragraph) {
        const text = paragraph.textContent.trim();
        const words = text.split(/\s+/);
        paragraph.innerHTML = words.map(w => `<span class="word">${w}</span>`).join(' ');

        const spans = paragraph.querySelectorAll('.word');
        gsap.to(spans, {
            color: '#0A0A0A',
            stagger: 0.02,
            scrollTrigger: {
                trigger: paragraph,
                start: 'top 75%',
                end: 'bottom 40%',
                scrub: true
            }
        });
    }

    // Scroll trigger for counting numbers
    const revealNums = document.querySelectorAll('.reveal-num');
    revealNums.forEach(num => {
        const targetValue = parseFloat(num.getAttribute('data-val'));
        const hasDecimals = targetValue % 1 !== 0;

        ScrollTrigger.create({
            trigger: num,
            start: 'top 85%',
            onEnter: () => {
                let tracker = { v: 0 };
                gsap.to(tracker, {
                    v: targetValue,
                    duration: 1.4,
                    ease: 'power2.out',
                    onUpdate: () => {
                        const unit = num.textContent.includes('%') ? '%' : (num.textContent.includes('s') ? 's' : (num.textContent.includes('x') ? 'x' : ''));

                        if (hasDecimals) {
                            num.textContent = tracker.v.toFixed(1) + unit;
                        } else {
                            num.textContent = Math.round(tracker.v) + unit;
                        }
                    }
                });
            },
            once: true
        });
    });
}

/* 11. LIQUID WAVE CANVAS PAGE TRANSITIONS */
function initPageTransitions() {
    const navLinks = document.querySelectorAll('.nav-link, .nav-cta, .mobile-nav-link, .footer-nav a, .scroll-top-btn');
    const path = document.querySelector('.transition-path');

    if (!path) return;

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const target = link.getAttribute('href');
            if (target && target.startsWith('#')) {
                e.preventDefault();

                // Close mobile navigation if active
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu) mobileMenu.classList.remove('active');

                // Trigger liquid wave timeline
                const tl = gsap.timeline();

                // Curve in
                tl.to(path, {
                    attr: { d: 'M 0 100 V 0 Q 50 0 100 0 V 100 Z' },
                    duration: 0.55,
                    ease: 'power3.in'
                })
                    .call(() => {
                        // Scroll instantly on cover
                        const targetEl = document.querySelector(target);
                        if (targetEl) {
                            lenis.scrollTo(targetEl, { immediate: true });
                        }
                    })
                    // Wave out
                    .to(path, {
                        attr: { d: 'M 0 0 V 0 Q 50 0 100 0 V 0 Z' },
                        duration: 0.55,
                        ease: 'power3.out'
                    })
                    // Reset parameters
                    .set(path, {
                        attr: { d: 'M 0 100 V 100 Q 50 100 100 100 V 100 Z' }
                    });
            }
        });
    });

    // Mobile Menu Button interaction
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            toggle.classList.toggle('active');
        });
    }

    // Fix mobile nav link clicks — use 'click' for universal mobile/desktop support
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const target = link.getAttribute('href');
            e.preventDefault();
            e.stopPropagation();
            if (menu) menu.classList.remove('active');
            if (toggle) toggle.classList.remove('active');
            if (target && target.startsWith('#')) {
                const targetEl = document.querySelector(target);
                if (targetEl && lenis) {
                    setTimeout(() => {
                        lenis.scrollTo(targetEl, { immediate: false, duration: 1.2 });
                    }, 350);
                }
            } else if (target) {
                setTimeout(() => { window.location.href = target; }, 350);
            }
        });
    });

    // Fix mobile CTA button click
    const mobileCta = document.querySelector('.mobile-menu-cta');
    if (mobileCta) {
        mobileCta.addEventListener('click', (e) => {
            const target = mobileCta.getAttribute('href');
            e.preventDefault();
            e.stopPropagation();
            if (menu) menu.classList.remove('active');
            if (toggle) toggle.classList.remove('active');
            if (target && target.startsWith('#')) {
                const targetEl = document.querySelector(target);
                if (targetEl && lenis) {
                    setTimeout(() => {
                        lenis.scrollTo(targetEl, { immediate: false, duration: 1.2 });
                    }, 350);
                }
            } else if (target) {
                setTimeout(() => { window.location.href = target; }, 350);
            }
        });
    }
}

/* 12. CLIENT-SIDE AUTHENTICATION SESSION SYSTEM */
function initAuthSession() {
    const navAuthBtn = document.getElementById('nav-auth-btn');
    const navProfile = document.getElementById('nav-profile');
    const profileInitials = document.getElementById('profile-initials');
    const dropdownName = document.getElementById('dropdown-name');
    const dropdownEmail = document.getElementById('dropdown-email');
    const mobileAuthLink = document.getElementById('mobile-auth-link');
    const mobileLogoutLink = document.getElementById('mobile-logout-link');

    // Retrieve active session
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser) {
        // User is authenticated
        if (navAuthBtn) navAuthBtn.style.display = 'none';
        if (navProfile) navProfile.style.display = 'block';

        // Calculate initials
        const name = currentUser.name || 'User';
        const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

        if (profileInitials) profileInitials.textContent = initials;
        if (dropdownName) dropdownName.textContent = name;
        if (dropdownEmail) dropdownEmail.textContent = currentUser.email || '';

        // Mobile navbar states
        if (mobileAuthLink) mobileAuthLink.style.display = 'none';
        if (mobileLogoutLink) mobileLogoutLink.style.display = 'block';
    } else {
        // User is signed out
        if (navAuthBtn) navAuthBtn.style.display = 'block';
        if (navProfile) navProfile.style.display = 'none';

        // Mobile navbar states
        if (mobileAuthLink) mobileAuthLink.style.display = 'block';
        if (mobileLogoutLink) mobileLogoutLink.style.display = 'none';
    }

    // Toggle profile dropdown active state on trigger click for tap interfaces
    const trigger = document.getElementById('profile-trigger');
    if (trigger && navProfile) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            navProfile.classList.toggle('active');
        });

        // Close when clicking outside
        document.addEventListener('click', () => {
            navProfile.classList.remove('active');
        });
    }

    // Setup logout functionality
    const handleLogout = (e) => {
        e.preventDefault();

        const path = document.querySelector('.transition-path');
        if (path) {
            const tl = gsap.timeline();
            tl.to(path, {
                attr: { d: 'M 0 100 V 0 Q 50 0 100 0 V 100 Z' },
                duration: 0.55,
                ease: 'power3.in'
            })
                .call(() => {
                    localStorage.removeItem('currentUser');
                    window.location.reload();
                });
        } else {
            localStorage.removeItem('currentUser');
            window.location.reload();
        }
    };

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    if (mobileLogoutLink) mobileLogoutLink.addEventListener('click', handleLogout);
}

/* 13. BOOKING GUARD SYSTEM */
function initBookingGuard() {
    // Select both the CTA button, mobile CTA button, and Lock Estimate button
    const bookingTriggers = [
        document.querySelector('.nav-cta'),
        document.querySelector('.mobile-menu-cta'),
        document.getElementById('btn-lock-estimate')
    ];

    bookingTriggers.forEach(trigger => {
        if (!trigger) return;

        trigger.addEventListener('click', (e) => {
            const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('sb-session');
            if (!currentUser) {
                e.preventDefault();
                e.stopPropagation();

                // Store target hash to scroll to after login
                let targetHash = '#estimator';
                const href = trigger.getAttribute('href');
                if (href && href.startsWith('#')) {
                    targetHash = href;
                }
                sessionStorage.setItem('redirectAfterLogin', 'index.html' + targetHash);

                // Elegant liquid wave page transition to login
                const path = document.querySelector('.transition-path');
                if (path) {
                    const tl = gsap.timeline();
                    tl.to(path, {
                        attr: { d: 'M 0 100 V 0 Q 50 0 100 0 V 100 Z' },
                        duration: 0.55,
                        ease: 'power3.in'
                    })
                        .call(() => {
                            window.location.href = 'auth/login.html';
                        });
                } else {
                    window.location.href = 'auth/login.html';
                }
            }
        });
    });

    // Handle post-redirect actions if redirected from login
    const redirectTarget = sessionStorage.getItem('redirectAfterLogin');
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('sb-session');

    if (currentUser && redirectTarget) {
        sessionStorage.removeItem('redirectAfterLogin');

        // Extract the hash from target
        const hashIndex = redirectTarget.indexOf('#');
        if (hashIndex !== -1) {
            const hash = redirectTarget.substring(hashIndex);
            setTimeout(() => {
                const targetEl = document.querySelector(hash);
                if (targetEl && lenis) {
                    lenis.scrollTo(targetEl, { immediate: false, duration: 1.5 });
                }
            }, 800); // Give the DOM and animations time to settle
        }
    }
}
async function handleContactSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('.btn-submit');
    const btnText = btn.querySelector('.btn-text');

    btnText.textContent = 'Sending...';
    btn.style.opacity = '0.7';
    btn.style.pointerEvents = 'none';

    const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
        btnText.textContent = 'Brief Sent ✓';
        btn.style.background = '#10b981';
        form.reset();
        setTimeout(() => {
            btnText.textContent = 'Submit Brief';
            btn.style.background = '';
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
        }, 3000);
    } else {
        btnText.textContent = 'Failed. Try again.';
        btn.style.background = '#ef4444';
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
    }
}