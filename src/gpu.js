import {
  AmbientLight, BoxGeometry, CylinderGeometry, EdgesGeometry, Group, LineBasicMaterial,
  LineSegments, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer,
} from "three";

const BG = 0x070707;
const GREEN = 0x4ade80;
const canvas = document.getElementById("gpu");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

let renderer;
try {
  renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
} catch {
  canvas.remove();
}

if (renderer) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 15);

  const fill = new MeshBasicMaterial({ color: BG, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  const wire = (opacity) => new LineBasicMaterial({ color: GREEN, transparent: true, opacity });

  // Solid dark fill hides back edges; the green edges on top give the wireframe look.
  function part(geometry, opacity = 0.55, angle = 1) {
    const group = new Group();
    group.add(new Mesh(geometry, fill), new LineSegments(new EdgesGeometry(geometry, angle), wire(opacity)));
    return group;
  }

  const card = new Group();
  const W = 7, H = 2.6, D = 0.9;

  const pcb = part(new BoxGeometry(W, H, 0.08), 0.35);
  pcb.position.z = -D / 2;
  const shroud = part(new BoxGeometry(W - 0.2, H - 0.25, D), 0.6);
  shroud.position.set(-0.05, 0.05, 0);
  card.add(pcb, shroud);

  const bracket = part(new BoxGeometry(0.06, H + 0.5, 1.1), 0.5);
  bracket.position.set(-W / 2 - 0.1, 0.1, -0.05);
  card.add(bracket);

  const connector = part(new BoxGeometry(2.6, 0.22, 0.12), 0.45);
  connector.position.set(-0.8, -H / 2 - 0.11, -D / 2);
  card.add(connector);

  const fans = [];
  for (const x of [-1.75, 1.45]) {
    const ring = part(new CylinderGeometry(1.0, 1.0, 0.04, 40, 1, true).rotateX(Math.PI / 2), 0.7);
    ring.position.set(x, 0.05, D / 2 + 0.02);
    const hub = part(new CylinderGeometry(0.22, 0.22, 0.1, 20).rotateX(Math.PI / 2), 0.8);
    const rotor = new Group();
    rotor.add(hub);
    for (let i = 0; i < 9; i++) {
      const blade = part(new BoxGeometry(0.62, 0.2, 0.02), 0.7);
      blade.position.x = 0.58;
      const arm = new Group();
      arm.rotation.z = (i / 9) * Math.PI * 2;
      blade.rotation.x = 0.5;
      arm.add(blade);
      rotor.add(arm);
    }
    rotor.position.set(x, 0.05, D / 2 + 0.06);
    fans.push(rotor);
    card.add(ring, rotor);
  }

  // Cooling fins visible on the top edge.
  for (let i = 0; i < 26; i++) {
    const fin = part(new BoxGeometry(0.03, 0.05, D - 0.1), 0.3);
    fin.position.set(-W / 2 + 0.5 + i * 0.25, H / 2 - 0.05, 0);
    card.add(fin);
  }

  card.rotation.set(0.38, -0.62, -0.05);
  scene.add(new AmbientLight(0xffffff, 1), card);

  const pointer = { x: 0, y: 0 };
  addEventListener("pointermove", (e) => {
    pointer.x = (e.clientX / innerWidth - 0.5) * 2;
    pointer.y = (e.clientY / innerHeight - 0.5) * 2;
  });

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // Keep the card inside narrow viewports and shift it right on wide ones, away from the headline.
    const narrow = w < 720;
    card.scale.setScalar(narrow ? Math.max(0.4, w / 900) : Math.min(1.05, w / 1250));
    card.position.set(narrow ? 0 : 1.7, narrow ? -3.4 : 0.6, 0);
    if (reduceMotion) renderer.render(scene, camera);
  }

  const clock = { last: performance.now() };
  function frame(now) {
    const dt = Math.min((now - clock.last) / 1000, 0.1);
    clock.last = now;
    fans.forEach((f, i) => { f.rotation.z -= dt * (4 + i * 0.6); });
    card.rotation.y = -0.62 + Math.sin(now / 5000) * 0.18 + pointer.x * 0.12;
    card.rotation.x = 0.38 + pointer.y * 0.08;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  new ResizeObserver(resize).observe(canvas);
  resize();
  if (!reduceMotion) requestAnimationFrame(frame);
}
