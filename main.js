/* ============================================================
   NO DISCIPLINE ART — main.js
   Three.js 3D scenes + scroll-driven experience
   ============================================================ */

const THREE = window.THREE;
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Helpers ──────────────────────────────────────────────────

function createRenderer(canvas, alpha = true) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  return renderer;
}

function resizeRenderer(renderer, camera) {
  const canvas = renderer.domElement;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== w || canvas.height !== h) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

// ── Scroll state (shared by all effects) ─────────────────────

let scrollPos = window.scrollY;
let scrollSmooth = scrollPos;
let scrollVel = 0;

window.addEventListener('scroll', () => { scrollPos = window.scrollY; }, { passive: true });

// ── HERO SCENE ────────────────────────────────────────────────

(function initHero() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const renderer = createRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  // Particle field
  const count = 2000;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 30;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.04,
    color: 0xc9a84c,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Central sculptural torus knot
  const knotGeo = new THREE.TorusKnotGeometry(1.4, 0.38, 200, 32, 2, 3);
  const knotMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    metalness: 1,
    roughness: 0.1,
    envMapIntensity: 1,
  });
  const knot = new THREE.Mesh(knotGeo, knotMat);
  scene.add(knot);

  // Wireframe overlay
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xc9a84c,
    wireframe: true,
    transparent: true,
    opacity: 0.07,
  });
  const wire = new THREE.Mesh(knotGeo, wireMat);
  scene.add(wire);

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.1));

  const pointA = new THREE.PointLight(0xc9a84c, 4, 12);
  pointA.position.set(3, 3, 3);
  scene.add(pointA);

  const pointB = new THREE.PointLight(0x4477ff, 2, 12);
  pointB.position.set(-3, -2, 2);
  scene.add(pointB);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
  rimLight.position.set(-5, 2, -3);
  scene.add(rimLight);

  // Mouse parallax
  let mx = 0, my = 0;
  window.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let frame = 0;
  function animate() {
    requestAnimationFrame(animate);
    frame += 0.005;

    // Knot grows, spins faster and pulls back as the hero scrolls away
    const heroH = canvas.clientHeight || window.innerHeight;
    const hp = clamp(scrollSmooth / heroH, 0, 1);
    const s = 1 + hp * 0.45;
    knot.scale.setScalar(s);
    wire.scale.setScalar(s);

    knot.rotation.x += 0.003 + hp * 0.006;
    knot.rotation.y += 0.005 + hp * 0.004;
    knot.rotation.z = hp * 0.6;
    wire.rotation.copy(knot.rotation);

    camera.position.x += (mx * 0.8 - camera.position.x) * 0.04;
    camera.position.y += (-my * 0.5 - camera.position.y) * 0.04;
    camera.position.z = 6 + hp * 1.5;
    camera.lookAt(0, 0, 0);

    particles.rotation.y += 0.0008 + hp * 0.002;
    particles.rotation.x += 0.0003;

    pointA.position.x = Math.sin(frame) * 4;
    pointA.position.y = Math.cos(frame * 0.7) * 3;

    resizeRenderer(renderer, camera);
    renderer.render(scene, camera);
  }
  animate();
})();

// ── ABOUT CANVAS ──────────────────────────────────────────────

(function initAbout() {
  const canvas = document.getElementById('aboutCanvas');
  if (!canvas) return;

  const renderer = createRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 5);

  const geo = new THREE.IcosahedronGeometry(2, 1);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xc9a84c,
    metalness: 0.9,
    roughness: 0.2,
    wireframe: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  const pt = new THREE.PointLight(0xc9a84c, 5, 20);
  pt.position.set(3, 3, 3);
  scene.add(pt);

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.003;
    // Scroll drives extra rotation so the object responds to the page
    mesh.rotation.x = t + scrollSmooth * 0.0008;
    mesh.rotation.y = t * 2 + scrollSmooth * 0.0012;
    resizeRenderer(renderer, camera);
    renderer.render(scene, camera);
  }
  animate();
})();

// ── PROCESS CANVAS ────────────────────────────────────────────

(function initProcess() {
  const canvas = document.getElementById('processCanvas');
  if (!canvas) return;

  const renderer = createRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
  camera.position.set(0, 0, 30);

  const count = 3000;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    pos[i] = (Math.random() - 0.5) * 60;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.08,
    color: 0xc9a84c,
    transparent: true,
    opacity: 0.6,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // Grid lines
  const gridHelper = new THREE.GridHelper(80, 40, 0x222222, 0x1a1a1a);
  gridHelper.rotation.x = Math.PI / 2;
  gridHelper.position.z = -5;
  scene.add(gridHelper);

  const section = document.getElementById('process');

  function animate() {
    requestAnimationFrame(animate);
    points.rotation.z += 0.0005;

    // Particles drift and camera dollies as the section passes through view
    if (section) {
      const r = section.getBoundingClientRect();
      const p = clamp(1 - r.top / window.innerHeight, 0, 2);
      points.rotation.y = p * 0.35;
      camera.position.z = 30 - p * 4;
    }

    resizeRenderer(renderer, camera);
    renderer.render(scene, camera);
  }
  animate();
})();

// ── MASTER SCROLL LOOP ────────────────────────────────────────
// Progress bar, hero fade-out, image parallax, marquee skew —
// all driven from one rAF loop.

const progressBar = document.createElement('div');
progressBar.className = 'progress-bar';
document.body.appendChild(progressBar);

const heroContent = document.querySelector('.hero__content');
const heroScrollHint = document.querySelector('.hero__scroll');
const heroCanvasEl = document.getElementById('heroCanvas');
const marqueeEl = document.querySelector('.marquee');
const parallaxImgs = [...document.querySelectorAll('.work__card-img')];

let lastFrameScroll = scrollPos;
let marqueeSkew = 0;

function masterLoop() {
  requestAnimationFrame(masterLoop);

  scrollSmooth = lerp(scrollSmooth, scrollPos, 0.09);
  scrollVel = scrollPos - lastFrameScroll;
  lastFrameScroll = scrollPos;

  // Progress bar
  const total = document.documentElement.scrollHeight - window.innerHeight;
  if (total > 0) progressBar.style.width = (scrollPos / total * 100) + '%';

  if (REDUCED_MOTION) return;

  // Hero content drifts up and fades as you scroll past it
  const heroH = window.innerHeight;
  const hp = clamp(scrollSmooth / heroH, 0, 1);
  if (heroContent) {
    heroContent.style.opacity = String(1 - hp * 1.4);
    heroContent.style.transform = `translateY(${hp * -70}px)`;
  }
  if (heroScrollHint) heroScrollHint.style.opacity = String(1 - hp * 3);
  if (heroCanvasEl) heroCanvasEl.style.transform = `translateY(${scrollSmooth * 0.28}px)`;

  // Marquee skews with scroll velocity
  marqueeSkew = lerp(marqueeSkew, clamp(scrollVel * 0.45, -9, 9), 0.12);
  if (marqueeEl) marqueeEl.style.transform = `skewX(${marqueeSkew.toFixed(2)}deg)`;

  // Gallery image parallax — each photo slides inside its frame
  for (const img of parallaxImgs) {
    const card = img.closest('.work__card');
    if (!card) continue;
    const r = card.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) continue;
    const centerOffset = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
    img.style.setProperty('--py', (centerOffset * 34).toFixed(1) + 'px');
  }
}
masterLoop();

// ── NAV: hide on scroll down, reveal on scroll up ─────────────

const nav = document.getElementById('nav');
let lastNavY = window.scrollY;

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 60);
  if (y > lastNavY + 8 && y > 320) {
    nav.classList.add('nav--hidden');
  } else if (y < lastNavY - 8) {
    nav.classList.remove('nav--hidden');
  }
  lastNavY = y;
}, { passive: true });

// ── MOBILE BURGER ─────────────────────────────────────────────

const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

burger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileMenu.classList.toggle('open', menuOpen);
  document.body.style.overflow = menuOpen ? 'hidden' : '';
  const spans = burger.querySelectorAll('span');
  if (menuOpen) {
    spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

document.querySelectorAll('.menu-link').forEach(link => {
  link.addEventListener('click', () => {
    menuOpen = false;
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
    burger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

// ── SECTION TITLES: word-by-word reveal ───────────────────────

(function splitTitles() {
  document.querySelectorAll('.section-title').forEach(title => {
    const frag = document.createDocumentFragment();
    let wordIndex = 0;

    [...title.childNodes].forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/\s+/).filter(Boolean).forEach((word, i, arr) => {
          const mask = document.createElement('span');
          mask.className = 'tw-mask';
          const inner = document.createElement('span');
          inner.className = 'tw';
          inner.textContent = word;
          inner.style.transitionDelay = (wordIndex * 0.08) + 's';
          mask.appendChild(inner);
          frag.appendChild(mask);
          if (i < arr.length - 1) frag.appendChild(document.createTextNode(' '));
          wordIndex++;
        });
      } else {
        frag.appendChild(node.cloneNode(true));
      }
    });

    title.innerHTML = '';
    title.appendChild(frag);
  });

  const titleObserver = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
    { threshold: 0.4 }
  );
  document.querySelectorAll('.section-title').forEach(t => titleObserver.observe(t));
})();

// ── STAT COUNTERS ─────────────────────────────────────────────

document.querySelectorAll('.stat__number').forEach(el => {
  const node = el.firstChild;
  if (!node || node.nodeType !== Node.TEXT_NODE) return;
  const target = parseInt(node.textContent, 10);
  if (isNaN(target) || REDUCED_MOTION) return;

  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    io.disconnect();
    const start = performance.now();
    const dur = 1500;
    (function tick(now) {
      const p = clamp((now - start) / dur, 0, 1);
      node.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }, { threshold: 0.6 });
  io.observe(el);
});

// ── SCROLL REVEAL ─────────────────────────────────────────────

const revealEls = [
  ...document.querySelectorAll('.about__left'),
  ...document.querySelectorAll('.about__right'),
  ...document.querySelectorAll('.stat'),
  ...document.querySelectorAll('.work__card'),
  ...document.querySelectorAll('.process__step'),
  ...document.querySelectorAll('.contact__left'),
  ...document.querySelectorAll('.contact__right'),
];

revealEls.forEach((el, i) => {
  el.classList.add('reveal');
  if (i % 4 === 1) el.classList.add('reveal-delay-1');
  if (i % 4 === 2) el.classList.add('reveal-delay-2');
  if (i % 4 === 3) el.classList.add('reveal-delay-3');
});

const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } }),
  { threshold: 0.12 }
);
revealEls.forEach(el => observer.observe(el));

// Process connector lines draw in as they enter the viewport
const lineObserver = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('grown'); }),
  { threshold: 0.5 }
);
document.querySelectorAll('.process__line').forEach(l => lineObserver.observe(l));

// ── MAGNETIC BUTTONS ──────────────────────────────────────────

if (!REDUCED_MOTION) {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

// ── LIGHTBOX ──────────────────────────────────────────────────

(function initLightbox() {
  const overlay = document.getElementById('lightbox');
  if (!overlay) return;

  const img     = overlay.querySelector('.lightbox__img');
  const tagEl   = overlay.querySelector('.lightbox__tag');
  const titleEl = overlay.querySelector('.lightbox__title');
  const descEl  = overlay.querySelector('.lightbox__desc');

  const cards = [...document.querySelectorAll('.work__card-inner')];
  let current = 0;

  function show(idx) {
    current = ((idx % cards.length) + cards.length) % cards.length;
    const c  = cards[current];
    const ci = c.querySelector('.work__card-img');
    img.src            = ci.src;
    img.alt            = ci.alt;
    tagEl.textContent   = c.querySelector('.work__card-tag')?.textContent || '';
    titleEl.textContent = c.querySelector('h3')?.textContent || '';
    descEl.textContent  = c.querySelector('p')?.textContent || '';
  }

  function open(idx) {
    show(idx);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  cards.forEach((c, i) => c.addEventListener('click', () => open(i)));

  overlay.querySelector('.lightbox__close').addEventListener('click', close);
  overlay.querySelector('.lightbox__prev').addEventListener('click', e => { e.stopPropagation(); show(current - 1); });
  overlay.querySelector('.lightbox__next').addEventListener('click', e => { e.stopPropagation(); show(current + 1); });
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
})();

// ── CURSOR GLOW ───────────────────────────────────────────────

const glow = document.createElement('div');
glow.style.cssText = `
  position:fixed;pointer-events:none;z-index:9999;width:300px;height:300px;
  border-radius:50%;background:radial-gradient(circle,rgba(201,168,76,.06) 0%,transparent 70%);
  transform:translate(-50%,-50%);transition:opacity .3s;top:0;left:0;
`;
document.body.appendChild(glow);
window.addEventListener('mousemove', e => {
  glow.style.left = e.clientX + 'px';
  glow.style.top  = e.clientY + 'px';
});
