/**
 * Motor de ondas (canvas de fundo): ruído de Perlin + deslocamento por cursor com mola.
 * Porta literal do antigo core.js (initWaves), sem estado global: tudo é limpo pelo retorno de createWaveEngine.
 */

class Grad {
  constructor(
    public x: number,
    public y: number,
    public z: number,
  ) {}
  dot2(x: number, y: number): number {
    return this.x * x + this.y * y;
  }
}

const P = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

class Noise {
  private grad3 = [
    new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0),
    new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1),
    new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1),
  ];
  private perm = new Array<number>(512);
  private gradP = new Array<Grad>(512);

  constructor(seed = 0) {
    this.seed(seed);
  }

  private seed(seed: number) {
    if (seed > 0 && seed < 1) seed *= 65536;
    seed = Math.floor(seed);
    if (seed < 256) seed |= seed << 8;
    for (let i = 0; i < 256; i++) {
      const v = i & 1 ? P[i] ^ (seed & 255) : P[i] ^ ((seed >> 8) & 255);
      this.perm[i] = this.perm[i + 256] = v;
      this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 12];
    }
  }

  private fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  private lerp(a: number, b: number, t: number) {
    return (1 - t) * a + t * b;
  }

  perlin2(x: number, y: number): number {
    let X = Math.floor(x);
    let Y = Math.floor(y);
    x -= X;
    y -= Y;
    X &= 255;
    Y &= 255;
    const n00 = this.gradP[X + this.perm[Y]].dot2(x, y);
    const n01 = this.gradP[X + this.perm[Y + 1]].dot2(x, y - 1);
    const n10 = this.gradP[X + 1 + this.perm[Y]].dot2(x - 1, y);
    const n11 = this.gradP[X + 1 + this.perm[Y + 1]].dot2(x - 1, y - 1);
    const u = this.fade(x);
    return this.lerp(this.lerp(n00, n10, u), this.lerp(n01, n11, u), this.fade(y));
  }
}

interface Point {
  x: number;
  y: number;
  wave: { x: number; y: number };
  cursor: { x: number; y: number; vx: number; vy: number };
}

/**
 * @param canvas   canvas de fundo
 * @param waveRoot elemento que recebe --x/--y (brilho que segue o cursor)
 * @param zones    seções em que as ondas ficam ativas (hero e rodapé); fora delas o loop pausa
 * @returns função de limpeza (remove listeners, observers e cancela o rAF)
 */
export function createWaveEngine(canvas: HTMLCanvasElement, waveRoot: HTMLElement, zones: Element[]): () => void {
  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true }) ?? canvas.getContext("2d");
  if (!ctx) return () => {};
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const root = document.documentElement;
  const noise = new Noise(Math.random());
  const lines: Point[][] = [];
  const mouse = { x: innerWidth * 0.5, y: innerHeight * 0.62, lx: 0, ly: 0, sx: innerWidth * 0.5, sy: innerHeight * 0.62, v: 0, vs: 0, a: 0, set: false };
  const ctrl = { speed: 1, mouse: 1, freq: 1, amp: 1, color: "rgba(168, 196, 230, 0.42)" };

  let dpr = 1;
  let quality = innerWidth < 768 ? 1.45 : 1;
  let ampScale = 1;
  let gapScale = 1;
  let width = 0;
  let height = 0;
  let raf = 0;
  let running = false;
  let destroyed = false;
  let lastT = 0;
  let burst = 0;
  let lastEnergy = "";
  let spotOn = false;
  let slowFrames = 0;
  let fastFrames = 0;
  const active = new Set<Element>();

  function setLines() {
    lines.length = 0;
    let xGap = 12 * gapScale * quality;
    let yGap = 38 * gapScale * quality;
    const oWidth = width + 50;
    const oHeight = height + 30;
    let totalLines = Math.ceil(oWidth / xGap);
    let totalPoints = Math.ceil(oHeight / yGap);
    if (totalLines > 130) {
      xGap *= totalLines / 130;
      totalLines = 130;
    }
    if (totalPoints > 90) {
      yGap *= totalPoints / 90;
      totalPoints = 90;
    }
    const xStart = (width - xGap * totalLines) / 2;
    const yStart = (height - yGap * totalPoints) / 2;
    for (let i = 0; i <= totalLines; i++) {
      const pts: Point[] = [];
      for (let j = 0; j <= totalPoints; j++) {
        pts.push({ x: xStart + xGap * i, y: yStart + yGap * j, wave: { x: 0, y: 0 }, cursor: { x: 0, y: 0, vx: 0, vy: 0 } });
      }
      lines.push(pts);
    }
  }

  function rebuild(preserveDpr?: boolean) {
    width = window.innerWidth;
    height = window.innerHeight;
    ampScale = 1;
    gapScale = 1;
    if (width < 480) {
      ampScale = 0.5;
      gapScale = 1.4;
    } else if (width < 768) {
      ampScale = 0.7;
      gapScale = 1.2;
    } else if (width > 1200) {
      const s = width / 1200;
      gapScale = 1 + 1.3 * (s - 1);
      ampScale = 0.9;
    }
    const cap = Math.min(window.devicePixelRatio || 1, 1.75);
    if (!preserveDpr) dpr = cap;
    else dpr = Math.min(cap, Math.max(1, dpr));
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    setLines();
    root.classList.toggle("q-low", quality > 1.25);
  }

  function degrade() {
    if (dpr > 1.05) {
      dpr = Math.max(1, dpr - 0.25);
      rebuild(true);
      return;
    }
    if (quality < 1.8) {
      quality = Math.min(1.8, quality * 1.35);
      rebuild(true);
    }
  }

  function recover() {
    const cap = Math.min(window.devicePixelRatio || 1, 1.75);
    if (quality > 1.05) {
      quality = 1;
      rebuild(true);
      return;
    }
    if (dpr < cap - 0.05) {
      dpr = Math.min(cap, dpr + 0.25);
      rebuild(true);
    }
  }

  function drawFrame(t: number, step: number) {
    const c = ctx!;
    const speedX = 0.018 * ctrl.speed;
    const speedY = 0.008 * ctrl.speed;
    const amp = 16 * ctrl.amp * ampScale * (reduce.matches ? 0.25 : 1);
    const freq = 0.0012 * ctrl.freq;
    const freqY = 0.001 * ctrl.freq;
    const friction = 0.93;
    const tension = 0.006;
    const maxCursor = 32 * (0.65 + ctrl.mouse * 0.7);
    const cursorOn = reduce.matches ? 0 : 1;
    const fPow = Math.pow(friction, step);

    mouse.sx += (mouse.x - mouse.sx) * (1 - Math.pow(0.94, step));
    mouse.sy += (mouse.y - mouse.sy) * (1 - Math.pow(0.94, step));
    const mdx = mouse.x - mouse.lx;
    const mdy = mouse.y - mouse.ly;
    const distM = Math.hypot(mdx, mdy);
    mouse.v = distM;
    mouse.vs += (distM - mouse.vs) * (1 - Math.pow(0.94, step));
    if (mouse.vs > 100) mouse.vs = 100;
    mouse.lx = mouse.x;
    mouse.ly = mouse.y;
    if (distM > 0.01) mouse.a = Math.atan2(mdy, mdx);

    const energy = Math.min(1, mouse.vs / 42);
    const bucket = energy.toFixed(2);
    if (bucket !== lastEnergy) {
      lastEnergy = bucket;
      root.style.setProperty("--wave-energy", bucket);
    }
    if (mouse.set && !spotOn) {
      spotOn = true;
      root.style.setProperty("--spot", "1");
    }

    for (let i = 0; i < lines.length; i++) {
      const pts = lines[i];
      for (let j = 0; j < pts.length; j++) {
        const p = pts[j];
        const nx = (p.x + t * speedX) * freq * 0.7;
        const ny = (p.y + t * speedY) * freqY * 0.7;
        const nVal = noise.perlin2(nx, ny);
        const angle = nVal * 5.2 + Math.sin(p.y * 0.0025 + t * 0.0008) * 0.5;
        p.wave.x = Math.cos(angle) * amp * 0.85;
        p.wave.y = Math.sin(angle) * amp * 1.15;
        const dx = p.x - mouse.sx;
        const dy = p.y - mouse.sy;
        const dist = Math.hypot(dx, dy);
        const reach = Math.max(240, mouse.vs * 1.4);
        if (cursorOn && dist < reach && dist > 0.001) {
          const normDist = dist / reach;
          const s = 1 - normDist;
          const f = s * s * (3 - 2 * s);
          const impulse = reach * (mouse.vs + 14) * 0.00045 * ctrl.mouse * step;
          p.cursor.vx += Math.cos(mouse.a) * f * impulse;
          p.cursor.vy += Math.sin(mouse.a) * f * impulse;
          if (burst > 0.02) {
            const radial = s * burst * 16 * ctrl.mouse * step;
            p.cursor.vx += (dx / dist) * radial;
            p.cursor.vy += (dy / dist) * radial;
          }
        }
        p.cursor.vx += (0 - p.cursor.x) * tension * step;
        p.cursor.vy += (0 - p.cursor.y) * tension * step;
        p.cursor.vx *= fPow;
        p.cursor.vy *= fPow;
        p.cursor.x += p.cursor.vx * 2 * step;
        p.cursor.y += p.cursor.vy * 2 * step;
        if (p.cursor.x > maxCursor) p.cursor.x = maxCursor;
        else if (p.cursor.x < -maxCursor) p.cursor.x = -maxCursor;
        if (p.cursor.y > maxCursor) p.cursor.y = maxCursor;
        else if (p.cursor.y < -maxCursor) p.cursor.y = -maxCursor;
      }
    }
    if (burst > 0) burst *= Math.pow(0.9, step);

    c.clearRect(0, 0, width, height);
    c.beginPath();
    c.strokeStyle = ctrl.color;
    c.lineWidth = width < 480 ? 1.2 : 1.4;
    for (let i = 0; i < lines.length; i++) {
      const pts = lines[i];
      const p0 = pts[0];
      c.moveTo(p0.x + p0.wave.x + p0.cursor.x, p0.y + p0.wave.y + p0.cursor.y);
      for (let j = 1; j < pts.length - 1; j++) {
        const a = pts[j];
        const b = pts[j + 1];
        const ax = a.x + a.wave.x + a.cursor.x;
        const ay = a.y + a.wave.y + a.cursor.y;
        const bx = b.x + b.wave.x + b.cursor.x;
        const by = b.y + b.wave.y + b.cursor.y;
        c.quadraticCurveTo(ax, ay, (ax + bx) / 2, (ay + by) / 2);
      }
      const last = pts[pts.length - 1];
      c.lineTo(last.x + last.wave.x + last.cursor.x, last.y + last.wave.y + last.cursor.y);
    }
    c.stroke();
  }

  function tick(t: number) {
    if (!running) return;
    const dt = lastT ? Math.min(34, t - lastT) : 16.67;
    lastT = t;
    const start = performance.now();
    drawFrame(t, dt / 16.67);
    const cost = performance.now() - start;
    if (cost > 12) {
      slowFrames++;
      fastFrames = 0;
    } else if (cost < 5) {
      fastFrames++;
      slowFrames = 0;
    } else {
      slowFrames = 0;
      fastFrames = 0;
    }
    if (slowFrames > 12) {
      slowFrames = 0;
      fastFrames = 0;
      degrade();
    } else if (fastFrames > 90) {
      fastFrames = 0;
      recover();
    }
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (running || reduce.matches) return;
    running = true;
    lastT = 0;
    raf = requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }
  function syncRun() {
    if (active.size && !document.hidden && !reduce.matches) start();
    else stop();
  }

  const zoneObs = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) active.add(e.target);
        else active.delete(e.target);
      }
      syncRun();
      if (reduce.matches && active.size) drawFrame(800, 0);
    },
    { threshold: 0.12 },
  );
  zones.forEach((z) => zoneObs.observe(z));

  let resizeTimer = 0;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (destroyed) return;
      rebuild();
      if (!running) drawFrame(800, 0);
    }, 80);
  };
  const onPointerMove = (e: PointerEvent) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    waveRoot.style.setProperty("--x", e.clientX.toFixed(1) + "px");
    waveRoot.style.setProperty("--y", e.clientY.toFixed(1) + "px");
    if (!mouse.set) {
      mouse.sx = mouse.x;
      mouse.sy = mouse.y;
      mouse.lx = mouse.x;
      mouse.ly = mouse.y;
      mouse.set = true;
    }
  };
  const onPointerDown = (e: PointerEvent) => {
    if ((e.target as Element | null)?.closest?.("input, textarea, select")) return;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    burst = 1;
  };
  const onReduceChange = () => {
    if (reduce.matches) {
      stop();
      drawFrame(800, 0);
    } else syncRun();
  };

  document.addEventListener("visibilitychange", syncRun);
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  reduce.addEventListener("change", onReduceChange);

  rebuild();
  mouse.lx = mouse.x;
  mouse.ly = mouse.y;
  if (reduce.matches) drawFrame(800, 0);
  else start();

  return () => {
    destroyed = true;
    stop();
    clearTimeout(resizeTimer);
    zoneObs.disconnect();
    document.removeEventListener("visibilitychange", syncRun);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerdown", onPointerDown);
    reduce.removeEventListener("change", onReduceChange);
    root.classList.remove("q-low");
  };
}
