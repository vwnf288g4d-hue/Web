/* ============================================================
   NO DISCIPLINE ART — main.js
   Three.js 3D scenes + UI interactions
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

    knot.rotation.x += 0.003;
    knot.rotation.y += 0.005;
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

  function animate() {
    requestAnimationFrame(animate);
    mesh.rotation.x += 0.003;
    mesh.rotation.y += 0.006;
    resizeRenderer(renderer, camera);
    renderer.render(scene, camera);
  }
  animate();
})();

// ── WORK CARD CANVASES ────────────────────────────────────────

(function initWorkCards() {
  const cards = document.querySelectorAll('.work__card-canvas');

  const shapeBuilders = {
    torus:  () => new THREE.TorusGeometry(1, 0.4, 32, 64),
    box:    () => new THREE.BoxGeometry(1.5, 1.5, 1.5, 4, 4, 4),
    sphere: () => new THREE.SphereGeometry(1.3, 64, 64),
    knot:   () => new THREE.TorusKnotGeometry(1, 0.32, 150, 20, 2, 3),
    cone:   () => new THREE.ConeGeometry(1, 2.2, 6, 1),
  };

  cards.forEach(canvas => {
    const shape = canvas.dataset.shape || 'sphere';
    const renderer = createRenderer(canvas);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 4);

    const geo = shapeBuilders[shape]?.() || shapeBuilders.sphere();

    const mat = new THREE.MeshStandardMaterial({
      color: 0xd4af60,
      metalness: 1,
      roughness: 0.08,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xc9a84c,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const wireMesh = new THREE.Mesh(geo, wireMat);
    scene.add(wireMesh);

    scene.add(new THREE.AmbientLight(0xffffff, 0.15));
    const pt1 = new THREE.PointLight(0xffd080, 5, 15);
    pt1.position.set(3, 2, 3);
    scene.add(pt1);
    const pt2 = new THREE.PointLight(0x4466ff, 2, 10);
    pt2.position.set(-3, -1, 1);
    scene.add(pt2);

    let hovered = false;
    canvas.closest('.work__card-inner').addEventListener('mouseenter', () => { hovered = true; });
    canvas.closest('.work__card-inner').addEventListener('mouseleave', () => { hovered = false; });

    let speedX = 0.002 + Math.random() * 0.003;
    let speedY = 0.003 + Math.random() * 0.004;

    function animate() {
      requestAnimationFrame(animate);
      const sp = hovered ? 2.5 : 1;
      mesh.rotation.x += speedX * sp;
      mesh.rotation.y += speedY * sp;
      wireMesh.rotation.x = mesh.rotation.x;
      wireMesh.rotation.y = mesh.rotation.y;
      resizeRenderer(renderer, camera);
      renderer.render(scene, camera);
    }
    animate();
  });
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
  scene.add(new THREE.Points(geo, mat));

  // Grid lines
  const gridHelper = new THREE.GridHelper(80, 40, 0x222222, 0x1a1a1a);
  gridHelper.rotation.x = Math.PI / 2;
  gridHelper.position.z = -5;
  scene.add(gridHelper);

  function animate() {
    requestAnimationFrame(animate);
    scene.children.forEach(c => {
      if (c.isPoints) c.rotation.z += 0.0005;
    });
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
  entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } }),
  { threshold: 0.12 }
);
revealEls.forEach(el => observer.observe(el));

// ── CONTACT FORM ──────────────────────────────────────────────

document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const orig = btn.textContent;
  btn.textContent = 'Sent!';
  btn.style.borderColor = '#5cb85c';
  btn.style.color = '#5cb85c';
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.borderColor = '';
    btn.style.color = '';
    e.target.reset();
  }, 3000);
});

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
