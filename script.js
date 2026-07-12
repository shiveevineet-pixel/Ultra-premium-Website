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

/* 4. THREE.JS SINGULARITY — fractured core + accretion disk + lightning */
function initHeroScene() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    let scene, camera, renderer;

    // Fallback indicator
    let webglSupported = true;
    try {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "high-performance", logarithmicDepthBuffer: false });
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.35;
    } catch (e) {
        webglSupported = false;
        console.warn("WebGL not supported. Running 2D Canvas fallback.");
    }

    if (!webglSupported) {
        run2DHeroFallback(canvas);
        return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.set(0, 0, 13);

    // ─── Fractured core: shard field from a subdivided icosahedron's faces ─
    const baseRadius = 3.2;
    const icoGeo = new THREE.IcosahedronGeometry(baseRadius, 1).toNonIndexed();
    const posAttr = icoGeo.attributes.position;
    const faceCount = posAttr.count / 3;

    const vA = new THREE.Vector3().fromBufferAttribute(posAttr, 0);
    const vB = new THREE.Vector3().fromBufferAttribute(posAttr, 1);
    const edgeLen = vA.distanceTo(vB);
    const h = (edgeLen * Math.sqrt(3)) / 2;

    const shardGeo = new THREE.BufferGeometry();
    shardGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
        0, (h * 2) / 3, 0,
        -edgeLen / 2, -h / 3, 0,
        edgeLen / 2, -h / 3, 0
    ]), 3));
    shardGeo.setIndex([0, 1, 2]);
    shardGeo.computeVertexNormals();

    const shardMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x0A0A0A,
        emissive: 0x1a1a1a,
        emissiveIntensity: 0.2,
        metalness: 0.9,
        roughness: 0.15,
        clearcoat: 0.7,
        clearcoatRoughness: 0.25,
        side: THREE.DoubleSide,
    });

    const shardMesh = new THREE.InstancedMesh(shardGeo, shardMaterial, faceCount);
    scene.add(shardMesh);

    const zAxis = new THREE.Vector3(0, 0, 1);
    const faceData = [];
    const shardWorldPos = []; // updated live each frame, read by the lightning system
    for (let f = 0; f < faceCount; f++) {
        const i0 = f * 3, i1 = f * 3 + 1, i2 = f * 3 + 2;
        const p0 = new THREE.Vector3().fromBufferAttribute(posAttr, i0);
        const p1 = new THREE.Vector3().fromBufferAttribute(posAttr, i1);
        const p2 = new THREE.Vector3().fromBufferAttribute(posAttr, i2);
        const center = new THREE.Vector3().add(p0).add(p1).add(p2).multiplyScalar(1 / 3);
        const normal = center.clone().normalize();

        faceData.push({
            normal,
            quat: new THREE.Quaternion().setFromUnitVectors(zAxis, normal),
            phase: Math.random() * Math.PI * 2,
            spinSpeed: (Math.random() - 0.5) * 0.9,
            floatAmp: 0.4 + Math.random() * 0.9,
        });
        shardWorldPos.push(new THREE.Vector3());
    }

    // ─── Counter-rotating wireframe shell (structural halo) ────────────────
    const wireGeo = new THREE.IcosahedronGeometry(baseRadius * 1.6, 0);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x0A0A0A, wireframe: true, transparent: true, opacity: 0.12 });
    const wireShell = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireShell);

    // ─── Glowing singularity core ───────────────────────────────────────────
    const coreGeo = new THREE.IcosahedronGeometry(0.55, 2);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xf4f4f4, transparent: true, opacity: 0.95 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);
    const coreGlowGeo = new THREE.IcosahedronGeometry(1.0, 1);
    const coreGlowMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false });
    const coreGlow = new THREE.Mesh(coreGlowGeo, coreGlowMat);
    scene.add(coreGlow);

    // ─── Swirling accretion disk ────────────────────────────────────────────
    const diskCount = 1800;
    const diskData = [];
    const diskPos = new Float32Array(diskCount * 3);
    const diskColor = new Float32Array(diskCount * 3);
    const tiltMat = new THREE.Matrix4().makeRotationX(1.15);

    for (let i = 0; i < diskCount; i++) {
        const radius = baseRadius * 1.9 + Math.random() * baseRadius * 3.2;
        const angle = Math.random() * Math.PI * 2;
        const speed = (0.5 / Math.sqrt(radius)) * (Math.random() > 0.5 ? 1 : -1) * 0.6;
        const heightJitter = (Math.random() - 0.5) * (0.25 + radius * 0.04);
        diskData.push({ radius, angle, speed, heightJitter, twinkle: Math.random() * Math.PI * 2 });

        const nearness = 1 - Math.min(1, (radius - baseRadius * 1.9) / (baseRadius * 3.2));
        diskColor[i * 3] = 0.75 + nearness * 0.25;
        diskColor[i * 3 + 1] = 0.75 + nearness * 0.25;
        diskColor[i * 3 + 2] = 0.78 + nearness * 0.22;
    }
    const diskGeo = new THREE.BufferGeometry();
    diskGeo.setAttribute('position', new THREE.BufferAttribute(diskPos, 3));
    diskGeo.setAttribute('color', new THREE.BufferAttribute(diskColor, 3));
    const diskMat = new THREE.PointsMaterial({
        size: 0.05, vertexColors: true, transparent: true, opacity: 0.85,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    });
    const disk = new THREE.Points(diskGeo, diskMat);
    scene.add(disk);

    // ─── Crackling lightning arcs between shards ────────────────────────────
    const arcCount = 7;
    const arcSegments = 7;
    const arcVerts = arcCount * arcSegments * 2 * 3; // segments -> pairs of points -> xyz
    const arcPos = new Float32Array(arcVerts);
    const arcGeo = new THREE.BufferGeometry();
    arcGeo.setAttribute('position', new THREE.BufferAttribute(arcPos, 3));
    const arcMat = new THREE.LineBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const arcs = new THREE.LineSegments(arcGeo, arcMat);
    scene.add(arcs);

    function regenerateArcs() {
        for (let a = 0; a < arcCount; a++) {
            const fromIdx = Math.floor(Math.random() * faceCount);
            const toIdx = Math.floor(Math.random() * faceCount);
            const start = shardWorldPos[fromIdx];
            const end = shardWorldPos[toIdx];

            // Midpoint-displacement jagged path
            const points = [start.clone()];
            for (let s = 1; s < arcSegments; s++) {
                const t = s / arcSegments;
                const p = start.clone().lerp(end, t);
                const jitter = (1 - Math.abs(t - 0.5) * 2) * 0.9;
                p.x += (Math.random() - 0.5) * jitter;
                p.y += (Math.random() - 0.5) * jitter;
                p.z += (Math.random() - 0.5) * jitter;
                points.push(p);
            }
            points.push(end.clone());

            for (let s = 0; s < arcSegments; s++) {
                const base = (a * arcSegments + s) * 6;
                arcPos[base] = points[s].x; arcPos[base + 1] = points[s].y; arcPos[base + 2] = points[s].z;
                arcPos[base + 3] = points[s + 1].x; arcPos[base + 4] = points[s + 1].y; arcPos[base + 5] = points[s + 1].z;
            }
        }
        arcGeo.attributes.position.needsUpdate = true;
    }

    // ─── Ambient starfield for depth ───────────────────────────────────────
    const starCount = 260;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
        const r = 9 + Math.random() * 11;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        starPos[i * 3 + 2] = r * Math.cos(phi);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
        color: 0x0A0A0A, size: 0.045, transparent: true, opacity: 0.3
    }));
    scene.add(stars);

    // ─── Lighting ───────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
    dirLight.position.set(10, 15, 10);
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0xffffff, 3.2, 100);
    pointLight.position.set(0, 0, 12);
    scene.add(pointLight);
    const coreLight = new THREE.PointLight(0xffffff, 2.5, 30);
    scene.add(coreLight);

    const clock = new THREE.Clock();
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

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

    // Reused scratch objects to avoid per-frame allocation
    const dummy = new THREE.Object3D();
    const tmpPos = new THREE.Vector3();
    const tmpSpinQuat = new THREE.Quaternion();
    const tmpFinalQuat = new THREE.Quaternion();
    const diskVec = new THREE.Vector3();

    let frameCount = 0;
    let shakeSeed = 0;

    function animate() {
        requestAnimationFrame(animate);
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        const time = clock.getElapsedTime();
        const mouseInfluence = Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y);

        // Periodic shockwave burst — sharp spike, slow recharge
        const shockwave = Math.pow(Math.max(0, Math.sin(time * 0.22)), 10);
        const globalPulse = (Math.sin(time * 0.35) + 1) / 2;

        // Shard core
        for (let f = 0; f < faceCount; f++) {
            const d = faceData[f];
            const explode = 0.4
                + globalPulse * 1.3
                + shockwave * 2.6
                + Math.sin(time * 0.8 + d.phase) * d.floatAmp * 0.3
                + mouseInfluence * 1.4;

            tmpPos.copy(d.normal).multiplyScalar(baseRadius + explode);
            tmpSpinQuat.setFromAxisAngle(d.normal, time * d.spinSpeed + d.phase);
            tmpFinalQuat.copy(d.quat).multiply(tmpSpinQuat);

            dummy.position.copy(tmpPos);
            dummy.quaternion.copy(tmpFinalQuat);
            dummy.scale.setScalar(0.9 + Math.sin(time * 1.4 + d.phase) * 0.08 + shockwave * 0.15);
            dummy.updateMatrix();
            shardMesh.setMatrixAt(f, dummy.matrix);

            shardWorldPos[f].copy(tmpPos);
        }
        shardMesh.instanceMatrix.needsUpdate = true;
        shardMaterial.emissiveIntensity = 0.2 + shockwave * 1.4;

        // Swirling accretion disk
        for (let i = 0; i < diskCount; i++) {
            const d = diskData[i];
            d.angle += d.speed * 0.016 * (1 + shockwave * 0.8);
            const wobble = Math.sin(time * 1.5 + d.twinkle) * 0.06;
            diskVec.set(
                Math.cos(d.angle) * (d.radius + shockwave * 0.6),
                d.heightJitter + wobble,
                Math.sin(d.angle) * (d.radius + shockwave * 0.6)
            );
            diskVec.applyMatrix4(tiltMat);

            // Mouse acts as a secondary gravity well distorting nearby particles
            const mx = mouse.x * 6, my = -mouse.y * 4;
            const dx = diskVec.x - mx, dy = diskVec.y - my;
            const distToMouse = Math.sqrt(dx * dx + dy * dy);
            if (distToMouse < 2.5) {
                const push = (2.5 - distToMouse) * 0.4;
                diskVec.x += (dx / (distToMouse + 0.001)) * push;
                diskVec.y += (dy / (distToMouse + 0.001)) * push;
            }

            diskPos[i * 3] = diskVec.x;
            diskPos[i * 3 + 1] = diskVec.y;
            diskPos[i * 3 + 2] = diskVec.z;
        }
        diskGeo.attributes.position.needsUpdate = true;
        diskMat.opacity = 0.6 + shockwave * 0.4;

        // Lightning: regenerate periodically, flicker opacity every frame
        frameCount++;
        if (frameCount % 9 === 0) regenerateArcs();
        arcMat.opacity = Math.random() > 0.5 ? (0.15 + Math.random() * 0.35 + shockwave * 0.5) : 0;

        // Core pulse + glow
        const coreScale = 1 + shockwave * 0.8 + Math.sin(time * 2.2) * 0.06;
        core.scale.setScalar(coreScale);
        coreGlow.scale.setScalar(coreScale * (1.4 + shockwave * 0.6));
        coreGlow.rotation.y = time * 0.3;
        coreLight.intensity = 2.0 + shockwave * 6.0;

        // Parallax + autonomous drift for the whole formation
        shardMesh.rotation.y = time * 0.08 + mouse.x * 0.4;
        shardMesh.rotation.x = mouse.y * 0.25;
        wireShell.rotation.y = -time * 0.05;
        wireShell.rotation.x = mouse.y * 0.15;
        disk.rotation.y = time * 0.015;
        stars.rotation.y = time * 0.01;

        pointLight.position.x = mouse.x * 14;
        pointLight.position.y = mouse.y * 8;

        // Camera: parallax drift + shockwave shake + slow zoom punch
        shakeSeed += 1;
        const shakeMag = shockwave * 0.12;
        const shakeX = (Math.sin(shakeSeed * 12.9) - 0.5) * shakeMag;
        const shakeY = (Math.cos(shakeSeed * 7.3) - 0.5) * shakeMag;

        camera.position.x += (mouse.x * 1.2 + shakeX - camera.position.x) * 0.08;
        camera.position.y += (mouse.y * 0.8 + shakeY - camera.position.y) * 0.08;
        camera.position.z = 13 - shockwave * 1.2;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
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