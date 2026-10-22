/* 3D layer: a ring of inlaid stones (pietra dura) orbiting a marble arch.
   Each stone is a section of the site. Drag to spin, click to enter.
   On section pages the same renderer shows that section's stone in the header. */

import * as THREE from "three";
import { RoomEnvironment } from "./RoomEnvironment.js";

const fail = () => { window.Scene3D = null; window.dispatchEvent(new Event("scene3d-unavailable")); };

function webglOK() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); }
  catch (e) { return false; }
}

if (!webglOK()) { fail(); } else {
  try { init(); } catch (e) { console.error(e); fail(); }
}

function init() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const COL = { lapis: 0x2a47b8, jade: 0x2f8a63, marigold: 0xe2a21f, carnelian: 0xb23a32, marble: 0xf4f1ea, onyx: 0x1b1d24 };
  const STONE_LOOK = {
    about: ["arch", COL.marble], experience: ["star", COL.lapis], projects: ["octa", COL.marigold],
    research: ["star", COL.jade], portfolio: ["arch", COL.carnelian], achievements: ["star", COL.marigold],
    writing: ["octa", COL.marble], creative: ["arch", COL.jade], shop: ["star", COL.carnelian], contact: ["octa", COL.lapis],
  };

  /* ---------- renderer ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const canvas = renderer.domElement;
  canvas.className = "gl";
  canvas.setAttribute("aria-hidden", "true");

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  const CAM_HOME = new THREE.Vector3(0, 1.6, 15);
  camera.position.copy(CAM_HOME);

  const key = new THREE.DirectionalLight(0xfff1d6, 1.6); key.position.set(4, 6, 8); scene.add(key);
  const rim = new THREE.DirectionalLight(0x7f9cff, 1.1); rim.position.set(-6, 2, -6); scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));

  /* ---------- shapes ---------- */
  function starShape(R, r) {
    const s = new THREE.Shape();
    for (let k = 0; k < 16; k++) {
      const a = (Math.PI / 8) * k + Math.PI / 2, rad = k % 2 ? r : R;
      const x = Math.cos(a) * rad, y = Math.sin(a) * rad;
      k ? s.lineTo(x, y) : s.moveTo(x, y);
    }
    return s;
  }
  function archShape(w, h, path = new THREE.Shape()) {
    const x = -w / 2, y = -h / 2, spring = y + h * 0.6, ctrl = y + h * 0.92;
    path.moveTo(x, y); path.lineTo(x, spring);
    path.quadraticCurveTo(x, ctrl, 0, y + h);
    path.quadraticCurveTo(x + w, ctrl, x + w, spring);
    path.lineTo(x + w, y); path.lineTo(x, y);
    return path;
  }
  function octaShape(r) {
    const s = new THREE.Shape();
    for (let k = 0; k < 8; k++) { const a = (Math.PI / 4) * k + Math.PI / 8; k ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    return s;
  }
  const extrude = (shape, depth, bevel = 0.05) => {
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 24 });
    g.center(); return g;
  };

  /* marble veins, drawn once */
  function marbleTexture() {
    const c = document.createElement("canvas"); c.width = c.height = 512;
    const g = c.getContext("2d");
    g.fillStyle = "#f4f1ea"; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 46; i++) {
      g.strokeStyle = i % 9 === 0 ? "rgba(214,164,60,.45)" : `rgba(120,120,130,${0.05 + Math.random() * 0.12})`;
      g.lineWidth = 0.6 + Math.random() * 2.2;
      g.beginPath();
      let x = Math.random() * 512, y = -20;
      g.moveTo(x, y);
      while (y < 540) { x += (Math.random() - 0.5) * 60; y += 20 + Math.random() * 40; g.lineTo(x, y); }
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.3, 0.3);
    return t;
  }
  const marbleTex = marbleTexture();
  const gold = new THREE.MeshPhysicalMaterial({ color: COL.marigold, metalness: 0.95, roughness: 0.28, clearcoat: 0.6 });
  const stoneMat = (color) => color === COL.marble
    ? new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: marbleTex, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 })
    : new THREE.MeshPhysicalMaterial({ color, roughness: 0.25, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.1, sheen: 0.3 });

  function makeStone(id) {
    const [kind, color] = STONE_LOOK[id] || ["star", COL.lapis];
    const depth = 0.32;
    const shape = kind === "arch" ? archShape(1.2, 1.55) : kind === "octa" ? octaShape(0.78) : starShape(0.85, 0.6);
    const body = new THREE.Mesh(extrude(shape, depth), stoneMat(color));
    const inlayGeo = extrude(kind === "star" ? octaShape(0.26) : starShape(0.38, 0.26), 0.03, 0.012);
    const inlayColor = color === COL.marigold ? new THREE.MeshPhysicalMaterial({ color: COL.lapis, roughness: 0.3, clearcoat: 1 }) : gold;
    const front = new THREE.Mesh(inlayGeo, inlayColor); front.position.z = depth / 2 + 0.06;
    const back = front.clone(); back.position.z = -front.position.z;
    const spin = new THREE.Group(); spin.add(body, front, back);
    const pivot = new THREE.Group(); pivot.add(spin);
    body.userData.id = id;
    return { pivot, spin, body, id };
  }

  /* ---------- home world ---------- */
  const world = new THREE.Group(); scene.add(world);

  const archShapeWithHole = archShape(3.0, 4.2);
  const holePath = new THREE.Path(starShape(0.95, 0.66).getPoints().map((p) => new THREE.Vector2(p.x, p.y + 0.35)).reverse());
  archShapeWithHole.holes.push(holePath);
  const centerArch = new THREE.Mesh(extrude(archShapeWithHole, 0.5, 0.08),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: marbleTex, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.06 }));
  const archRim = new THREE.Mesh(extrude((() => { const a = archShape(3.3, 4.5); a.holes.push(new THREE.Path(archShape(3.0, 4.2).getPoints(40).reverse())); return a; })(), 0.56, 0.02), gold);
  const gem = new THREE.Mesh(extrude(starShape(0.62, 0.43), 0.28, 0.06), gold);
  gem.position.y = 0.35 * 1.0; // sits in the star window
  const center = new THREE.Group(); center.add(centerArch, archRim, gem);
  world.add(center);

  const ring = new THREE.Group(); ring.rotation.x = 0.28; world.add(ring);
  let stones = [];
  const RADIUS = 4.6;

  // gold dust
  const N = 900, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 6 + Math.random() * 12, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th); pos[i * 3 + 1] = r * Math.cos(ph) * 0.6; pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: COL.marigold, size: 0.05, transparent: true, opacity: 0.7, depthWrite: false }));
  scene.add(dust);

  /* ---------- solo (section header) ---------- */
  const solo = new THREE.Group(); scene.add(solo);
  let soloStone = null;

  /* ---------- labels ---------- */
  const labelLayer = document.createElement("div"); labelLayer.className = "gl-labels";

  /* ---------- state ---------- */
  let mode = "none", host = null, onPick = () => {}, onHover = () => {};
  let angle = 0, vel = 0, dragging = false, moved = 0, lastX = 0, hot = null, flying = null;
  let soloRotY = 0, soloVel = 0;
  const pointer = new THREE.Vector2(9, 9), parallax = new THREE.Vector2();
  const ray = new THREE.Raycaster();
  let visible = true;
  const io = new IntersectionObserver((e) => { visible = e[0]?.isIntersecting ?? true; });

  function buildRing(sections) {
    stones.forEach((s) => ring.remove(s.pivot)); labelLayer.innerHTML = "";
    stones = sections.map((sec, i) => {
      const s = makeStone(sec.id);
      const a = (i / sections.length) * Math.PI * 2;
      s.base = a; s.phase = i * 1.7;
      s.pivot.position.set(Math.sin(a) * RADIUS, 0, Math.cos(a) * RADIUS);
      ring.add(s.pivot);
      const el = document.createElement("a");
      el.className = "stone-label"; el.href = `#/${sec.id}`; el.textContent = sec.title;
      el.addEventListener("mouseenter", () => setHot(s)); el.addEventListener("focus", () => setHot(s));
      el.addEventListener("mouseleave", () => setHot(null)); el.addEventListener("blur", () => setHot(null));
      el.addEventListener("click", (e) => { e.preventDefault(); pick(s); });
      labelLayer.appendChild(el); s.label = el;
      return s;
    });
  }

  function setHot(s) {
    if (hot === s) return;
    hot = s;
    stones.forEach((x) => x.label.classList.toggle("is-hot", x === s));
    canvas.style.cursor = s ? "pointer" : (mode === "home" ? "grab" : "grab");
    onHover(s ? s.id : null);
  }

  function pick(s) {
    if (flying) return;
    if (reduce) { onPick(s.id); return; }
    const target = new THREE.Vector3(); s.pivot.getWorldPosition(target);
    flying = { start: performance.now(), from: camera.position.clone(), to: target.clone().multiplyScalar(0.85).add(new THREE.Vector3(0, 0.2, 2.2)), look: target, id: s.id };
  }

  /* ---------- input ---------- */
  function setPointer(e) {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    parallax.set(pointer.x, pointer.y);
  }
  canvas.addEventListener("pointerdown", (e) => { dragging = true; moved = 0; lastX = e.clientX; setPointer(e); });
  window.addEventListener("pointerup", () => {
    if (dragging && moved < 6 && hot && mode === "home") pick(hot);
    dragging = false;
  });
  canvas.addEventListener("pointermove", (e) => {
    setPointer(e);
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx);
    if (mode === "home") vel = dx * 0.0045; else soloVel = dx * 0.01;
  });
  canvas.addEventListener("pointerleave", () => { pointer.set(9, 9); if (!dragging) setHot(null); });

  /* ---------- layout ---------- */
  function resize() {
    if (!host) return;
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const asp = w / h;
    if (mode === "home") {
      if (asp > 1.15) { world.position.set(Math.min(4.6, 1.6 + asp * 1.3), 0.1, 0); world.scale.setScalar(0.82); }
      else { world.position.set(0, 2.0, 0); world.scale.setScalar(Math.max(0.5, Math.min(0.78, asp * 1.05))); }
    }
  }
  const ro = new ResizeObserver(resize);

  function mount(container, newMode, opts = {}) {
    host = container; mode = newMode;
    onPick = opts.onPick || (() => {}); onHover = opts.onHover || (() => {});
    container.appendChild(canvas);
    if (newMode === "home") container.appendChild(labelLayer); else labelLayer.remove();
    ro.disconnect(); ro.observe(container); io.disconnect(); io.observe(container);
    flying = null; hot = null; camera.position.copy(CAM_HOME); camera.lookAt(0, 0, 0);
    world.visible = newMode === "home"; dust.visible = newMode === "home";
    solo.visible = newMode === "solo";
    if (newMode === "home") { buildRing(opts.sections || []); canvas.style.cursor = "grab"; }
    if (newMode === "solo") {
      if (soloStone) solo.remove(soloStone.pivot);
      soloStone = makeStone(opts.id); soloStone.pivot.scale.setScalar(2.3); solo.add(soloStone.pivot);
      camera.position.set(0, 0.3, 8); camera.lookAt(0, 0, 0); soloRotY = -0.6; canvas.style.cursor = "grab";
    }
    resize();
  }

  /* ---------- loop ---------- */
  const clock = new THREE.Clock();
  const tmp = new THREE.Vector3();
  function frame() {
    requestAnimationFrame(frame);
    if (!host || !host.isConnected || !visible || mode === "none") return;
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;

    if (mode === "home") {
      const scroll = Math.min(window.scrollY / Math.max(innerHeight, 1), 1.2);
      angle += (reduce ? 0 : 0.12 * dt) + vel;
      vel *= dragging ? 0.6 : 0.94;
      ring.rotation.y = angle;
      ring.rotation.x = 0.28 + scroll * 0.5;
      center.rotation.y = Math.sin(t * 0.35) * 0.35 + parallax.x * 0.15;
      gem.rotation.y = reduce ? 0 : t * 0.9;
      dust.rotation.y = t * 0.015;
      world.rotation.x = scroll * 0.25;

      stones.forEach((s) => {
        s.pivot.quaternion.copy(camera.quaternion);
        const target = s === hot ? 1.3 : 1;
        s.pivot.scale.lerp(tmp.setScalar(target), 0.15);
        s.spin.rotation.y = s === hot || reduce ? s.spin.rotation.y * 0.85 : Math.sin(t * 0.8 + s.phase) * 0.7;
        s.spin.rotation.x = reduce ? 0 : Math.sin(t * 0.6 + s.phase) * 0.12;
        s.pivot.position.y = reduce ? 0 : Math.sin(t * 1.1 + s.phase) * 0.12;
      });

      if (!flying) {
        camera.position.x += (CAM_HOME.x + parallax.x * 0.6 - camera.position.x) * 0.05;
        camera.position.y += (CAM_HOME.y + parallax.y * 0.4 - camera.position.y) * 0.05;
        camera.lookAt(world.position.x * 0.35, world.position.y * 0.35, 0);
        if (!dragging) {
          ray.setFromCamera(pointer, camera);
          const hit = ray.intersectObjects(stones.map((s) => s.body), false)[0];
          if (pointer.x < 5) setHot(hit ? stones.find((s) => s.body === hit.object) || null : null);
        }
      } else {
        flying.t = Math.min((performance.now() - flying.start) / 650, 1);
        const e = 1 - Math.pow(1 - flying.t, 3);
        camera.position.lerpVectors(flying.from, flying.to, e);
        camera.lookAt(flying.look);
        if (flying.t >= 1) { const id = flying.id; flying = null; onPick(id); }
      }

      // labels follow their stones
      const w = host.clientWidth, h = host.clientHeight;
      stones.forEach((s) => {
        s.pivot.getWorldPosition(tmp); const depth = tmp.z;
        tmp.y -= 1.05 * world.scale.y; tmp.project(camera);
        const x = (tmp.x * 0.5 + 0.5) * w, y = (-tmp.y * 0.5 + 0.5) * h;
        s.label.style.transform = `translate(${x}px, ${y}px) translate(-50%, 0)`;
        s.label.style.opacity = depth < -1 ? 0.35 : 1;
        s.label.style.zIndex = depth < -1 ? 1 : 2;
      });
    } else if (mode === "solo" && soloStone) {
      soloRotY += (reduce ? 0 : 0.35 * dt) + soloVel; soloVel *= dragging ? 0.6 : 0.93;
      soloStone.spin.rotation.y = soloRotY;
      soloStone.spin.rotation.x = Math.sin(t * 0.7) * 0.15;
      soloStone.pivot.position.y = reduce ? 0 : Math.sin(t * 1.2) * 0.12;
    }
    renderer.render(scene, camera);
  }
  frame();

  window.Scene3D = { mount };
  window.dispatchEvent(new Event("scene3d-ready"));
}
