/* =====================================================================
   INSTITUT CLÉMENTINE — Scène 3D du héro (Three.js)
   Sculpture d'arcs concentriques inspirée du symbole du logo.
   ===================================================================== */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.getElementById('hero-canvas');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (canvas) init();

function init() {
  const wrap = canvas.parentElement;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.4, 15);

  // Lumières
  scene.add(new THREE.AmbientLight(0xfff1e6, 0.35));
  const key = new THREE.DirectionalLight(0xfff4ea, 1.4); key.position.set(4, 6, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffb27a, 1.2); rim.position.set(-6, 2, -4); scene.add(rim);
  const fill = new THREE.PointLight(0xfa6a00, 6, 14, 2); fill.position.set(0, -2.5, 2); scene.add(fill);

  // Groupe principal
  const group = new THREE.Group();
  scene.add(group);

  // Arcs concentriques (demi-tores), du cœur orange vers le nude
  const colA = new THREE.Color(0xfa6a00), colB = new THREE.Color(0xe6b79b);
  const radii = [1.05, 1.55, 2.05, 2.55, 3.05];
  const arcs = [];
  radii.forEach((r, i) => {
    const t = i / (radii.length - 1);
    const geo = new THREE.TorusGeometry(r, 0.11 + i * 0.012, 36, 160, Math.PI);
    const mat = new THREE.MeshPhysicalMaterial({
      color: colA.clone().lerp(colB, t * 0.85),
      roughness: 0.22 + t * 0.15,
      metalness: 0.08,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      sheen: 0.4,
      sheenColor: new THREE.Color(0xffd3b0),
      envMapIntensity: 1.1,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = -0.4;
    mesh.userData = { base: r, phase: i * 0.6 };
    group.add(mesh); arcs.push(mesh);
  });

  // Sphère centrale (la personne au cœur du soin) : nacre
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.62, 64, 64),
    new THREE.MeshPhysicalMaterial({ color: 0xfff1e4, roughness: 0.18, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, transmission: 0.25, thickness: 1.2, ior: 1.4, envMapIntensity: 1.4 })
  );
  core.position.set(0, -0.35, 0.2);
  group.add(core);

  // Petit satellite orange
  const satellite = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 32, 32),
    new THREE.MeshPhysicalMaterial({ color: 0xfa6a00, roughness: 0.25, clearcoat: 1, envMapIntensity: 1.2 })
  );
  group.add(satellite);

  // Particules
  const N = 260;
  const positions = new Float32Array(N * 3), speeds = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 18;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
    speeds[i] = 0.2 + Math.random() * 0.8;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xcdaa98, size: 0.035, transparent: true, opacity: 0.75, depthWrite: false, sizeAttenuation: true });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  // Ombre portée douce (plan avec dégradé radial)
  const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 256;
  const sctx = shadowCanvas.getContext('2d');
  const grad = sctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, 'rgba(120,60,30,0.38)'); grad.addColorStop(1, 'rgba(120,60,30,0)');
  sctx.fillStyle = grad; sctx.fillRect(0, 0, 256, 256);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  scene.add(shadow);

  // Interaction souris
  const mouse = { x: 0, y: 0 }, target = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    target.x = (e.clientX / window.innerWidth - 0.5) * 2;
    target.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // Cadrage : la sculpture doit tenir entièrement dans la colonne droite (ou en haut sur mobile)
  const OUTER_R = 3.4;   // demi-largeur de la sculpture à l'échelle 1 (unités monde)
  const TOTAL_H = 4.0;   // hauteur totale (arcs + socle) à l'échelle 1
  const CENTER_Y = 1.2;  // centre visuel de la sculpture par rapport à l'origine du groupe
  let baseScale = 1, baseY = 0;
  function resize() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const mobile = window.innerWidth < 1024;
    const dist = camera.position.z;
    const visH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const visW = visH * camera.aspect;
    let cx;
    if (mobile) {
      baseScale = Math.min(0.9, (visW / 2 - 0.4) / OUTER_R, (visH - 1.2) / TOTAL_H);
      cx = 0;
    } else {
      const halfCol = visW * 0.25; // demi-largeur de la colonne droite
      baseScale = Math.min(1, (halfCol - 0.5) / OUTER_R, (visH - 1.6) / TOTAL_H);
      cx = visW * 0.25 + 0.2;
    }
    baseY = camera.position.y - CENTER_Y * baseScale; // centre visuel au centre de la vue
    group.position.set(cx, baseY, 0);
    shadow.position.x = cx;
    shadow.position.y = baseY - 0.9 * baseScale;
    shadow.scale.setScalar(baseScale);
  }
  resize();
  window.addEventListener('resize', resize);

  // Entrée en scène
  group.rotation.x = 0.55; group.scale.setScalar(0.001);
  let introT = 0, ready = false;
  window.addEventListener('site:ready', () => { ready = true; });
  setTimeout(() => { ready = true; }, 3500);

  // Visibilité : on ne rend que lorsque le héro est visible
  let visible = true;
  new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }, { threshold: 0 }).observe(wrap);

  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = clock.getElapsedTime();
    if (ready && introT < 1) { introT = Math.min(1, introT + 0.012); }
    const e = 1 - Math.pow(1 - introT, 4);
    group.scale.setScalar(0.001 + e * baseScale);

    mouse.x += (target.x - mouse.x) * 0.04; mouse.y += (target.y - mouse.y) * 0.04;
    const auto = prefersReduced ? 0 : t;
    group.rotation.y = Math.sin(auto * 0.25) * 0.35 + mouse.x * 0.35;
    group.rotation.x = 0.2 + Math.sin(auto * 0.2) * 0.1 + mouse.y * 0.16 + (1 - e) * 0.6;
    group.position.y = baseY + Math.sin(auto * 0.6) * 0.1;

    arcs.forEach((m, i) => {
      const s = 1 + Math.sin(auto * 0.9 + m.userData.phase) * 0.018;
      m.scale.set(s, s, s);
      m.rotation.z = Math.sin(auto * 0.35 + i * 0.4) * 0.06;
    });
    core.rotation.y = auto * 0.2;
    const a = auto * 0.7;
    satellite.position.set(Math.cos(a) * 2.3, -0.4 + Math.sin(a * 1.3) * 0.5, Math.sin(a) * 2.3);

    const pos = points.geometry.attributes.position;
    for (let i = 0; i < N; i++) {
      let y = pos.getY(i) + speeds[i] * 0.0025;
      if (y > 6) y = -6;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
    points.rotation.y = auto * 0.02;

    renderer.render(scene, camera);
  }
  frame();
}
