/* ============================================================
   NO DISCIPLINE ART — main.js
   Three.js 3D scenes + scroll-driven animations
   ============================================================ */

const THREE = window.THREE;

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

// ── Scroll tracking ───────────────────────────────────────────

let scrollY = 0;
let scrollYSmooth = 0;
window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

// ── Global progress bar ───────────────────────────────────────

const progressBar = document.createElement('div');
progressBar.className = 'progress-bar';
document.body.insertAdjacentElement('afterbegin', progressBar);

function updateGlobalProgress() {
  scrollYSmooth = lerp(scrollYSmooth, scrollY, 0.08);
  const totalH = document.body.scrollHeight - window.innerHeight;
  if (totalH > 0) progressBar.style.width = (scrollY / totalH * 100) + '%';
  requestAnimationFrame(updateGlobalProgress);
}
updateGlobalProgress();

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
  for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 30;
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.04, color: 0xc9a84c, transparent: true, opacity: 0.5, sizeAttenuation: true,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Central sculptural torus knot
  const knotGeo = new THREE.TorusKnotGeometry(1.4, 0.38, 200, 32, 2, 3);
  const knotMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a, metalness: 1, roughness: 0.1,
  });
  const knot = new THREE.Mesh(knotGeo, knotMat);
  scene.add(knot);

  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xc9a84c, wireframe: true, transparent: true, opacity: 0.07,
  });
  const wire = new THREE.Mesh(knotGeo, wireMat);
  scene.add(wire);

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

  let mx = 0, my = 0;
  window.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let frame = 0;
  function animate() {
    requestAnimationFrame(animate);
    frame += 0.005;

    // Scroll-reactive: knot grows and spins faster as hero exits
    const heroH = canvas.clientHeight || window.innerHeight;
    const heroProgress = Math.min(scrollYSmooth / heroH, 1);
    const s = 1 + heroProgress * 0.35;
    knot.scale.setScalar(s);
    wire.scale.setScalar(s);

    knot.rotation.x += 0.003 + heroProgress * 0.005;
    knot.rotation.y += 0.005 + heroProgress * 0.003;
    wire.rotation.x = knot.rotation.x;
    wire.rotation.y = knot.rotation.y;

    camera.position.x += (mx * 0.8 - camera.position.x) * 0.04;
    camera.position.y += (-my * 0.5 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    particles.rotation.y += 0.0008;
    particles.rotation.x += 0.0003;

    pointA.position.x = Math.sin(frame) * 4;
    pointA.position.y = Math.cos(frame * 0.7) * 3;

    resizeRenderer(renderer, camera);
    renderer.render(scene, camera);
  }
  animate();
})();

// ── SCROLL FEATURE SCENE ──────────────────────────────────────

(function initScrollFeature() {
  const canvas = document.getElementById('featureCanvas');
  if (!canvas) return;
  const section = document.getElementById('scrollFeature');
  if (!section) return;

  const renderer = createRenderer(canvas, false);
  renderer.setClearColor(0x080808, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 0, 7);

  // Large metallic torus knot — the centrepiece
  const knotGeo = new THREE.TorusKnotGeometry(2, 0.52, 320, 40, 3, 5);
  const knotMat = new THREE.MeshStandardMaterial({
    color: 0xc9a84c, metalness: 0.96, roughness: 0.04,
  });
  const knot = new THREE.Mesh(knotGeo, knotMat);
  scene.add(knot);

  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, wireframe: true, transparent: true, opacity: 0.025,
  });
  const wire = new THREE.Mesh(knotGeo, wireMat);
  scene.add(wire);

  // Orbiting particle ring
  const ringCount = 2500;
  const ringPos = new Float32Array(ringCount * 3);
  for (let i = 0; i < ringCount; i++) {
    const angle = (i / ringCount) * Math.PI * 2;
    const r = 5.5 + (Math.random() - 0.5) * 3.5;
    ringPos[i * 3]     = Math.cos(angle) * r;
    ringPos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
    ringPos[i * 3 + 2] = Math.sin(angle) * r;
  }
  const ringGeo = new THREE.BufferGeometry();
  ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPos, 3));
  const ringMat = new THREE.PointsMaterial({
    size: 0.025, color: 0xc9a84c, transparent: true, opacity: 0.35,
  });
  const ring = new THREE.Points(ringGeo, ringMat);
  scene.add(ring);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.04));
  const goldLight = new THREE.PointLight(0xc9a84c, 6, 22);
  goldLight.position.set(4, 4, 4);
  scene.add(goldLight);
  const blueLight = new THREE.PointLight(0x4466ff, 2, 22);
  blueLight.position.set(-5, -3, 2);
  scene.add(blueLight);
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.35);
  rimLight.position.set(0, 6, -6);
  scene.add(rimLight);

  const slides = section.querySelectorAll('.scroll-feature__slide');
  const tickerFill = section.querySelector('.scroll-feature__ticker-fill');

  let currentRotX = 0, currentRotY = 0;
  let targetRotX = 0, targetRotY = 0;
  let camAngle = 0;

  function getProgress() {
    const top = section.getBoundingClientRect().top;
    const scrollable = section.offsetHeight - window.innerHeight;
    return scrollable > 0 ? Math.max(0, Math.min(1, -top / scrollable)) : 0;
  }

  function animate() {
    requestAnimationFrame(animate);

    const progress = getProgress();

    // Scroll drives rotation — 2.5 full turns
    targetRotY = progress * Math.PI * 5;
    targetRotX = progress * Math.PI * 2;

    // Breathe scale — swells at midpoint
    const breathe = 1 + Math.sin(progress * Math.PI) * 0.12;
    knot.scale.setScalar(breathe);
    wire.scale.setScalar(breathe);

    // Smooth lerp to target rotation
    currentRotY = lerp(currentRotY, targetRotY, 0.055);
    currentRotX = lerp(currentRotX, targetRotX, 0.055);
    knot.rotation.y = currentRotY;
    knot.rotation.x = currentRotX;
    wire.rotation.y = currentRotY;
    wire.rotation.x = currentRotX;

    // Camera slow orbit
    camAngle += 0.003;
    camera.position.x = Math.sin(camAngle) * 1.2;
    camera.position.y = Math.cos(camAngle * 0.6) * 0.7;
    camera.lookAt(0, 0, 0);

    // Ring counter-rotates
    ring.rotation.y += 0.001;
    ring.rotation.x = progress * 0.4;

    // Light colour shift: gold → blue peak at 50% → gold
    const blueIntensity = Math.sin(progress * Math.PI) * 5;
    blueLight.intensity = 2 + blueIntensity;
    goldLight.intensity = 6 - blueIntensity * 0.4;

    // Slide activation with smooth thirds
    const rawIdx = progress < 0.97 ? Math.floor(progress * 3) : 2;
    slides.forEach((s, i) => s.classList.toggle('active', i === rawIdx));

    // Ticker progress fill
    if (tickerFill) tickerFill.style.width = (progress * 100) + '%';

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
    color: 0xc9a84c, metalness: 0.9, roughness: 0.2,
  });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  const pt = new THREE.PointLight(0xc9a84c, 5, 20);
  pt.position.set(3, 3, 3);
  scene.add(pt);

  function animate() {
    requestAnimationFrame(animate);
    mesh.rotation.x += 0.003;
    mesh.rotation.y += 0.006;
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
  for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 60;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.08, color: 0xc9a84c, transparent: true, opacity: 0.6,
  });
  scene.add(new THREE.Points(geo, mat));

  const gridHelper = new THREE.GridHelper(80, 40, 0x222222, 0x1a1a1a);
  gridHelper.rotation.x = Math.PI / 2;
  gridHelper.position.z = -5;
  scene.add(gridHelper);

  function animate() {
    requestAnimationFrame(animate);
    scene.children.forEach(c => { if (c.isPoints) c.rotation.z += 0.0005; });
    resizeRenderer(renderer, camera);
    renderer.render(scene, camera);
  }
  animate();
})();

// ── NAV SCROLL BEHAVIOUR ──────────────────────────────────────

const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

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
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.12 }
);
revealEls.forEach(el => observer.observe(el));

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
