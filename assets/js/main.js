/* =====================================================================
   INSTITUT CLÉMENTINE — Interactions & animations (GSAP + Lenis)
   ===================================================================== */
(function () {
  'use strict';
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = typeof gsap !== 'undefined';
  if (hasGSAP && typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  /* ---------- Défilement fluide ---------- */
  let lenis = null;
  if (!prefersReduced && typeof Lenis !== 'undefined' && hasGSAP) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    // Ancres
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        closeMenu();
        lenis.scrollTo(target, { offset: -70, duration: 1.4, easing: (x) => 1 - Math.pow(1 - x, 4) });
      });
    });
  }

  /* ---------- Données : cartographie corporelle ---------- */
  const ZONES = [
    { id: 'visage', label: 'Visage', x: 200, y: 92, side: 'right', desc: "Rajeunissement, éclat du teint, épilation durable et soins cabine : le visage concentre la majorité de nos protocoles.",
      techs: [['Skin’Up LED', '7 programmes'], ['Réjuvénation Dermeo', 'Lumière pulsée'], ['Radiofréquence INDIBA', '448 kHz'], ['Soins Académie & Esthederm', 'Cabine'], ['Épilation durable Viora', 'Lèvre · joues · menton']] },
    { id: 'cou', label: 'Cou & décolleté', x: 200, y: 190, side: 'left', desc: "Des zones fines et exposées, traitées par photobiomodulation et lumière pulsée pour retendre et unifier.",
      techs: [['Skin’Up LED', 'Programme cou'], ['Réjuvénation Dermeo', 'Cou · décolleté'], ['Radiofréquence INDIBA', 'Double menton']] },
    { id: 'poitrine', label: 'Poitrine', x: 200, y: 262, side: 'right', desc: "L'Institut Clémentine est le seul des Hautes-Pyrénées à proposer le B-Bust : raffermissement et volume, sans chirurgie.",
      techs: [['B-Bust', 'Dispositif médical CE'], ['Radiofréquence INDIBA', 'Fermeté']] },
    { id: 'bras', label: 'Bras & mains', x: 297, y: 330, side: 'right', desc: "Tonification, réduction des graisses localisées, épilation durable et réjuvénation des mains.",
      techs: [['IB SLIM', 'Tonification'], ['Cryolipolyse', 'Graisses localisées'], ['Radiofréquence INDIBA', 'Relâchement'], ['Épilation durable', 'Viora · Dermeo'], ['Réjuvénation Dermeo', 'Mains']] },
    { id: 'abdomen', label: 'Abdomen', x: 200, y: 372, side: 'left', desc: "La zone de référence de l'amincissement : quatre technologies complémentaires, prescrites selon le diagnostic.",
      techs: [['IB SLIM', '20 000 contractions / 30 min'], ['Cryolipolyse', '1 séance par zone'], ['Laser ALS', '−2 à −10 cm'], ['Radiofréquence INDIBA', '448 kHz']] },
    { id: 'hanches', label: 'Hanches & taille', x: 268, y: 428, side: 'right', desc: "Poignées d'amour et taille : froid contrôlé pour éliminer, stimulation électromagnétique pour sculpter.",
      techs: [['Cryolipolyse', "Poignées d'amour"], ['IB SLIM', 'Remodelage'], ['Radiofréquence INDIBA', 'Perte de centimètres']] },
    { id: 'fesses', label: 'Fesses', x: 200, y: 470, side: 'left', desc: "Galber et raffermir : l'IB SLIM équivaut à 20 000 squats en trente minutes, sans effort ni douleur.",
      techs: [['IB SLIM', 'Galbe · fermeté'], ['Cryolipolyse', 'Volume localisé'], ['Radiofréquence INDIBA', 'Flaccidité']] },
    { id: 'cuisses', label: 'Cuisses', x: 262, y: 560, side: 'right', desc: "Culotte de cheval, face interne, cellulite : la zone la plus demandée après l'abdomen.",
      techs: [['IB SLIM', 'Tonification'], ['Cryolipolyse', 'Culotte de cheval · face interne'], ['Laser ALS', 'Cellulite · capitons'], ['Radiofréquence INDIBA', 'Cellulite'], ['Épilation durable', 'Viora · Dermeo']] },
    { id: 'genoux', label: 'Genoux', x: 246, y: 640, side: 'left', desc: "Une zone souvent négligée, traitée par cryolipolyse et radiofréquence sur la face interne.",
      techs: [['Cryolipolyse', 'Genoux'], ['Radiofréquence INDIBA', 'Face interne']] },
    { id: 'jambes', label: 'Jambes & pieds', x: 240, y: 730, side: 'right', desc: "Épilation durable, jambes légères et beauté des pieds : du Spa Jet à la pose de gel.",
      techs: [['Épilation durable', 'Viora · Dermeo'], ['Spa Jet « Jambes légères »', 'Gel cryo · 60 min'], ['Callus peel', '20 min'], ['Beauté des pieds', 'Pose gel · semi-permanent']] },
    { id: 'dos', label: 'Épaules & dos', x: 268, y: 214, side: 'right', desc: "Modelages du dos, épilation dos et torse, cryolipolyse des bourrelets dorsaux.",
      techs: [['Cryolipolyse', 'Dos'], ['Modelage du dos', 'Huiles · bougie'], ['Épilation', 'Dos · épaules · torse'], ['Radiofréquence INDIBA', 'Dos']] },
  ];

  /* ---------- Préchargeur ---------- */
  const loader = document.getElementById('loader');
  function runLoader(done) {
    if (!loader || !hasGSAP || prefersReduced) { if (loader) loader.remove(); done(); return; }
    document.documentElement.classList.add('is-loading');
    if (lenis) lenis.stop();
    const paths = loader.querySelectorAll('.loader__arcs path');
    paths.forEach((p) => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
    const pct = { v: 0 };
    const elPct = document.getElementById('loader-pct'), elBar = document.getElementById('loader-bar');
    let loaded = false, animDone = false, finished = false;
    const finish = () => {
      if (finished || !(loaded || document.readyState === 'complete') || !animDone) return; finished = true;
      clearTimeout(poll);
      gsap.to(pct, { v: 100, duration: .35, ease: 'power2.out', onUpdate: paint });
      gsap.to(loader, { yPercent: -100, duration: .9, ease: 'power4.inOut', delay: .3, onComplete: () => { loader.remove(); if (lenis) lenis.start(); document.documentElement.classList.remove('is-loading'); done(); } });
    };
    const paint = () => { elPct.textContent = String(Math.round(pct.v)).padStart(2, '0'); elBar.style.width = pct.v + '%'; };
    // On attend les polices (nécessaires aux titres) puis on libère la page ; garde-fou à 3 s.
    const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    ready.then(() => { loaded = true; finish(); });
    const poll = setTimeout(() => { loaded = true; finish(); }, 3000);
    gsap.timeline({ onComplete: () => { animDone = true; finish(); } })
      .to(paths, { strokeDashoffset: 0, duration: 1.1, stagger: .08, ease: 'power3.out' }, 0)
      .to(pct, { v: 86, duration: 1.4, ease: 'power2.inOut', onUpdate: paint }, 0)
      .to(paths, { opacity: .3, duration: .4, stagger: { each: .05, from: 'end' } }, 1.2);
  }

  /* ---------- En-tête ---------- */
  const header = document.getElementById('header');
  let lastY = 0;
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    header.classList.toggle('is-hidden', y > 600 && y > lastY + 4 && !menuOpen);
    if (y < lastY - 4) header.classList.remove('is-hidden');
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  if (lenis) lenis.on('scroll', onScroll);

  /* ---------- Menu mobile ---------- */
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  let menuOpen = false;
  function closeMenu() { if (!menuOpen) return; menuOpen = false; menu.classList.remove('is-open'); document.documentElement.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); if (lenis) lenis.start(); }
  burger.addEventListener('click', () => {
    menuOpen = !menuOpen;
    menu.classList.toggle('is-open', menuOpen);
    document.documentElement.classList.toggle('menu-open', menuOpen);
    burger.setAttribute('aria-expanded', String(menuOpen));
    if (lenis) menuOpen ? lenis.stop() : lenis.start();
  });
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

  /* ---------- Découpage des titres en mots ---------- */
  function splitWords(el) {
    const frag = document.createDocumentFragment();
    const walk = (node, parent) => {
      node.childNodes.forEach((child) => {
        if (child.nodeType === 3) {
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { parent.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'split-word'; w.textContent = part; parent.appendChild(w);
          });
        } else if (child.nodeType === 1) {
          const clone = child.cloneNode(false); parent.appendChild(clone); walk(child, clone);
        }
      });
    };
    walk(el, frag);
    el.innerHTML = ''; el.appendChild(frag);
    return el.querySelectorAll('.split-word');
  }

  /* ---------- Compteurs ---------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const obj = { v: 0 };
    gsap.to(obj, { v: target, duration: 1.8, ease: 'power3.out', onUpdate: () => {
      el.textContent = Math.round(obj.v).toLocaleString('fr-FR').replace(/ | /g, ' ') + suffix;
    } });
  }

  /* ---------- Révélations au défilement ---------- */
  function initReveals() {
    if (!hasGSAP) return;
    // Titres découpés
    document.querySelectorAll('[data-split]').forEach((el) => {
      const words = splitWords(el);
      gsap.set(words, { yPercent: 110, opacity: 0, rotateX: -30, transformOrigin: '0 100%' });
      gsap.to(words, { yPercent: 0, opacity: 1, rotateX: 0, duration: 1.1, stagger: .05, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    // Blocs
    const reveals = document.querySelectorAll('[data-reveal]');
    gsap.set(reveals, { y: 36, opacity: 0 });
    ScrollTrigger.batch(reveals, {
      start: 'top 90%', once: true,
      onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 1.1, stagger: .08, ease: 'power3.out', overwrite: true }),
    });
    // Compteurs
    document.querySelectorAll('[data-count]').forEach((el) => {
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => animateCount(el) });
    });
    // Parallaxe d'images
    document.querySelectorAll('[data-parallax]').forEach((img) => {
      const amt = parseFloat(img.dataset.parallax) || 10;
      gsap.fromTo(img, { yPercent: -amt }, { yPercent: amt, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- Plateau technique : défilement horizontal épinglé ---------- */
  function initHorizontal() {
    if (!hasGSAP) return;
    const pin = document.getElementById('tech-pin');
    const track = document.getElementById('tech-track');
    ScrollTrigger.matchMedia({
      '(min-width: 1024px)': function () {
        const getDistance = () => track.scrollWidth - window.innerWidth + 40;
        gsap.to(track, { x: () => -getDistance(), ease: 'none',
          scrollTrigger: { trigger: pin, start: 'top top', end: () => '+=' + (getDistance() + 200), pin: true, scrub: 1.1, invalidateOnRefresh: true, anticipatePin: 1 } });
      },
    });
  }

  /* ---------- Cartographie corporelle ---------- */
  function initBodyMap() {
    const svg = document.getElementById('bodymap-svg'); if (!svg) return;
    const NS = 'http://www.w3.org/2000/svg';
    const g = document.getElementById('bodymap-hotspots');
    const axes = document.getElementById('bodymap-axes');
    const nav = document.getElementById('zone-nav');
    const mk = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent.appendChild(n); return n; };

    ZONES.forEach((z, i) => {
      // ligne-guide horizontale
      mk('line', { class: 'bodymap__axis', x1: 20, x2: 380, y1: z.y, y2: z.y }, axes);
      const hs = mk('g', { class: 'hotspot', 'data-zone': z.id, role: 'button', tabindex: 0, 'aria-label': z.label }, g);
      const lx = z.side === 'right' ? 372 : 28;
      const anchor = z.side === 'right' ? 'end' : 'start';
      mk('line', { class: 'hotspot__lead', x1: z.x, y1: z.y, x2: z.side === 'right' ? lx - 8 : lx + 8, y2: z.y }, hs);
      mk('circle', { class: 'hotspot__ring', cx: z.x, cy: z.y, r: 9 }, hs);
      mk('circle', { class: 'hotspot__halo', cx: z.x, cy: z.y, r: 14 }, hs);
      mk('circle', { class: 'hotspot__dot', cx: z.x, cy: z.y, r: 4.5 }, hs);
      const t = mk('text', { class: 'hotspot__label', x: lx, y: z.y - 6, 'text-anchor': anchor }, hs);
      t.textContent = String(i + 1).padStart(2, '0') + '  ' + z.label;
      hs.addEventListener('click', () => setZone(z.id));
      hs.addEventListener('mouseenter', () => setZone(z.id));
      hs.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setZone(z.id); } });
      // nav
      const b = document.createElement('button'); b.type = 'button'; b.textContent = z.label; b.dataset.zone = z.id; b.setAttribute('role', 'tab');
      b.addEventListener('click', () => setZone(z.id)); nav.appendChild(b);
    });

    const elIndex = document.getElementById('zone-index'), elTitle = document.getElementById('zone-title'), elDesc = document.getElementById('zone-desc'), elTechs = document.getElementById('zone-techs');
    let current = null;
    function setZone(id) {
      if (id === current) return; current = id;
      const z = ZONES.find((x) => x.id === id); const i = ZONES.indexOf(z);
      g.querySelectorAll('.hotspot').forEach((h) => h.classList.toggle('is-active', h.dataset.zone === id));
      nav.querySelectorAll('button').forEach((b) => { const on = b.dataset.zone === id; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', String(on)); });
      const render = () => {
        elIndex.textContent = 'Zone ' + String(i + 1).padStart(2, '0') + ' / ' + String(ZONES.length).padStart(2, '0');
        elTitle.textContent = z.label; elDesc.textContent = z.desc;
        elTechs.innerHTML = z.techs.map(([n, s]) => '<li><strong>' + n + '</strong><span>' + s + '</span></li>').join('');
      };
      if (hasGSAP && !prefersReduced) {
        const items = [elTitle, elDesc, elTechs];
        gsap.to(items, { opacity: 0, y: 8, duration: .18, stagger: .03, onComplete: () => {
          render();
          gsap.fromTo([elTitle, elDesc, ...elTechs.children], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .5, stagger: .05, ease: 'power3.out', clearProps: 'all' });
        } });
      } else render();
    }
    setZone('abdomen');

    // Tracé de la silhouette à l'apparition
    const outline = document.getElementById('bodymap-outline');
    if (hasGSAP && !prefersReduced) {
      const len = outline.getTotalLength();
      gsap.set(outline, { strokeDasharray: len, strokeDashoffset: len, fillOpacity: 0 });
      gsap.set(g, { opacity: 0 }); gsap.set(axes, { opacity: 0 });
      ScrollTrigger.create({ trigger: svg, start: 'top 80%', once: true, onEnter: () => {
        gsap.timeline()
          .to(outline, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' })
          .to(outline, { fillOpacity: 1, duration: 1 }, '-=.8')
          .to(axes, { opacity: 1, duration: .8 }, '-=.8')
          .to(g, { opacity: 1, duration: .8 }, '-=.6');
      } });
    }
  }

  /* ---------- Spa Jet : 22 jets animés ---------- */
  function initSpaJet() {
    const svg = document.getElementById('spajet-overlay'); if (!svg) return;
    const NS = 'http://www.w3.org/2000/svg';
    // Répartition : 10 jets douche à affusion (arc supérieur), 10 hydrojets (arc inférieur), 2 plantaires
    const pts = [];
    for (let i = 0; i < 10; i++) { const t = i / 9; pts.push([180 + t * 840, 150 + Math.sin(t * Math.PI) * -70 + 120]); }
    for (let i = 0; i < 10; i++) { const t = i / 9; pts.push([200 + t * 800, 560 + Math.sin(t * Math.PI) * 40]); }
    pts.push([1040, 470]); pts.push([1080, 420]);
    pts.forEach(([x, y], i) => {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('class', 'jet'); c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 7); c.style.setProperty('--i', i);
      svg.appendChild(c);
    });
    // Courbe reliant les jets supérieurs
    const path = document.createElementNS(NS, 'path');
    const d1 = pts.slice(0, 10).map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
    const d2 = pts.slice(10, 20).map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
    path.setAttribute('d', d1 + ' ' + d2); path.setAttribute('fill', 'none'); path.setAttribute('stroke', 'rgba(121,183,231,.35)'); path.setAttribute('stroke-dasharray', '4 8');
    svg.insertBefore(path, svg.firstChild);
  }

  /* ---------- Horaires : jour courant ---------- */
  (function markToday() {
    const d = new Date().getDay();
    const li = document.querySelector('#hours li[data-day="' + d + '"]'); if (li) li.classList.add('is-today');
  })();

  /* ---------- Curseur & boutons magnétiques ---------- */
  function initCursor() {
    if (!finePointer || prefersReduced || !hasGSAP) return;
    const cursor = document.getElementById('cursor'); const dot = cursor.querySelector('.cursor__dot'); const ring = cursor.querySelector('.cursor__ring');
    const pos = { x: innerWidth / 2, y: innerHeight / 2 }, ringPos = { x: pos.x, y: pos.y };
    window.addEventListener('mousemove', (e) => { pos.x = e.clientX; pos.y = e.clientY; gsap.set(dot, { x: pos.x, y: pos.y }); });
    gsap.ticker.add(() => { ringPos.x += (pos.x - ringPos.x) * .16; ringPos.y += (pos.y - ringPos.y) * .16; gsap.set(ring, { x: ringPos.x, y: ringPos.y }); });
    document.querySelectorAll('a, button, .hotspot, .bento__item, .exp-card, .tech-card').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
    document.querySelectorAll('.section--dark, .signature, .footer').forEach((s) => {
      s.addEventListener('mouseenter', () => cursor.classList.add('is-dark'));
      s.addEventListener('mouseleave', () => cursor.classList.remove('is-dark'));
    });
    // Magnétisme
    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      const strength = 0.35;
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * strength, y = (e.clientY - (r.top + r.height / 2)) * strength;
        gsap.to(btn, { x, y, duration: .5, ease: 'power3.out' });
      });
      btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1, .4)' }));
    });
  }

  /* ---------- Démarrage ---------- */
  function start() {
    initReveals();
    initHorizontal();
    initBodyMap();
    initSpaJet();
    initCursor();
    if (hasGSAP) {
      // Le héro se révèle immédiatement
      const heroItems = document.querySelectorAll('#hero [data-reveal]');
      gsap.to(heroItems, { y: 0, opacity: 1, duration: 1.2, stagger: .1, ease: 'power3.out', delay: .15, overwrite: true });
      const heroWords = document.querySelectorAll('#hero .split-word');
      gsap.to(heroWords, { yPercent: 0, opacity: 1, rotateX: 0, duration: 1.3, stagger: .06, ease: 'power4.out', overwrite: true });
      window.dispatchEvent(new CustomEvent('site:ready'));
      setTimeout(() => ScrollTrigger.refresh(), 400);
    }
  }
  const boot = () => runLoader(start);
  if (document.readyState !== 'loading') boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
