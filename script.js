// ============================================================
// Interaksi: kursor kustom, ripple klik, tombol magnetic,
// tilt kartu, angka menghitung naik, progress bar scroll,
// menu mobile, reveal saat scroll.
// Semua dinonaktifkan sebagian di perangkat sentuh agar tetap nyaman.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Menu mobile ---- */
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
    nav.querySelectorAll(".nav__links a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Reveal saat scroll ---- */
  // Elemen yang perlu class reveal ditambahkan via JS
  const revealByJS = document.querySelectorAll(".section__inner, .case, .timeline__item, .project-card");
  revealByJS.forEach((el) => el.classList.add("reveal"));

  // Gabungkan semua target reveal (termasuk .project-card yang sudah punya class reveal dari HTML)
  const revealTargets = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  revealTargets.forEach((el) => revealObserver.observe(el));

  /* ---- Skill bar ---- */
  const skillBars = document.querySelectorAll(".skillbar");
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  skillBars.forEach((el) => barObserver.observe(el));

  /* ---- Progress bar scroll ---- */
  const progressBar = document.getElementById("progressBar");
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + "%";
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* ---- Angka menghitung naik ---- */
  const countTargets = document.querySelectorAll("[data-count]");
  const animateCount = (el) => {
    const target = parseFloat(el.getAttribute("data-count"));
    const prefix = el.getAttribute("data-prefix") || "";
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = prefix + value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    if (prefersReducedMotion) {
      el.textContent = prefix + target + suffix;
    } else {
      requestAnimationFrame(step);
    }
  };
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  countTargets.forEach((el) => countObserver.observe(el));

  /* ---- Kursor kustom + magnetic + ripple + tilt (desktop saja) ---- */
  if (!isTouch) {
    const cursorDot = document.getElementById("cursorDot");
    const cursorRing = document.getElementById("cursorRing");

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (cursorDot) {
        cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      }
    });

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (cursorRing) {
        cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      }
      requestAnimationFrame(animateRing);
    };
    requestAnimationFrame(animateRing);

    // Ring membesar di elemen interaktif
    const interactiveEls = document.querySelectorAll("a, button, .case, .chip-row span");
    interactiveEls.forEach((el) => {
      el.addEventListener("mouseenter", () => cursorRing && cursorRing.classList.add("is-active"));
      el.addEventListener("mouseleave", () => cursorRing && cursorRing.classList.remove("is-active"));
    });

    // Ripple saat klik
    document.addEventListener("click", (e) => {
      const ripple = document.createElement("div");
      ripple.className = "ripple";
      ripple.style.left = e.clientX + "px";
      ripple.style.top = e.clientY + "px";
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });

    // Tombol magnetic
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });

    // Tilt 3D pada kartu proyek
    document.querySelectorAll(".case").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${y * -4}deg) rotateY(${x * 4}deg) translateY(-2px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(800px) rotateX(0) rotateY(0)";
      });
    });
  } else {
    // Ripple tetap jalan di layar sentuh sebagai umpan balik sentuhan
    document.addEventListener("pointerdown", (e) => {
      const ripple = document.createElement("div");
      ripple.className = "ripple";
      ripple.style.left = e.clientX + "px";
      ripple.style.top = e.clientY + "px";
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  }

});

/* ============================================================
   UPGRADE v2: Particle System, 3D Hero Canvas, Project Modal,
   Project Filter, Scroll-to-Top
   ============================================================ */

/* ---- Particle System ---- */
(function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W, H, particles = [];

  const colors = ["rgba(53,216,240,", "rgba(164,107,255,", "rgba(255,95,168,"];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  function Particle() {
    this.reset();
  }
  Particle.prototype.reset = function () {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.r = Math.random() * 1.6 + 0.4;
    this.vx = (Math.random() - 0.5) * 0.35;
    this.vy = (Math.random() - 0.5) * 0.35;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.alpha = Math.random() * 0.5 + 0.15;
  };
  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  };

  const COUNT = window.innerWidth < 600 ? 60 : 120;
  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function drawLines() {
    const dist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < dist) {
          const alpha = (1 - d / dist) * 0.08;
          ctx.strokeStyle = `rgba(164,107,255,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawLines();
    particles.forEach((p) => {
      p.update();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ")";
      ctx.fill();
    });
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ================================================================
   GAMING CANVAS SCENE
   Draws on #gamingCanvas (full hero background):
   1. Perspective grid floor (neon cyan)
   2. 3D wireframe gamepad (rotating)
   3. PlayStation symbols orbiting the gamepad
   4. Scan-line sweep
   5. Corner HUD brackets
   ================================================================ */
(function initGamingScene() {
  const canvas = document.getElementById("gamingCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width  = canvas.parentElement ? canvas.parentElement.offsetWidth  : window.innerWidth;
    canvas.height = canvas.parentElement ? canvas.parentElement.offsetHeight : window.innerHeight;
  }
  resize();
  window.addEventListener("resize", () => { resize(); }, { passive: true });

  // ---- 3D math helpers ----
  const DEG = Math.PI / 180;
  function rotX(p, a) { const c=Math.cos(a),s=Math.sin(a); return [p[0], p[1]*c-p[2]*s, p[1]*s+p[2]*c]; }
  function rotY(p, a) { const c=Math.cos(a),s=Math.sin(a); return [p[0]*c+p[2]*s, p[1], -p[0]*s+p[2]*c]; }
  function rotZ(p, a) { const c=Math.cos(a),s=Math.sin(a); return [p[0]*c-p[1]*s, p[0]*s+p[1]*c, p[2]]; }
  function project(p, W, H, fov, camZ) {
    const z = p[2] + camZ;
    if (z <= 0) return null;
    return { x: p[0]*fov/z + W/2, y: p[1]*fov/z + H/2, z };
  }

  // ---- Gamepad wireframe definition (body + buttons + sticks) ----
  // Points in local space
  const GP_BODY = (() => {
    const pts=[], edg=[];
    // Main body — stretched oval approximated as box with rounded feel
    const bx=110, by=50, bz=22;
    // 8 corners of main body
    const body=[
      [-bx,-by,-bz],[ bx,-by,-bz],[ bx, by,-bz],[-bx, by,-bz],
      [-bx,-by, bz],[ bx,-by, bz],[ bx, by, bz],[-bx, by, bz],
    ];
    body.forEach(p=>pts.push(p));
    [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(e=>edg.push(e));

    // Left grip (handle going down-left)
    const lg=[
      [-bx, by,-bz],[-bx-30, by+60,-bz],[-bx-30,by+60,bz],[-bx, by, bz],
    ];
    const lgo=pts.length;
    lg.forEach(p=>pts.push(p));
    [[0,1],[1,2],[2,3],[3,0],[0,2],[1,3]].forEach(([a,b])=>edg.push([lgo+a,lgo+b]));

    // Right grip
    const rg=[
      [ bx, by,-bz],[ bx+30, by+60,-bz],[ bx+30,by+60, bz],[ bx, by, bz],
    ];
    const rgo=pts.length;
    rg.forEach(p=>pts.push(p));
    [[0,1],[1,2],[2,3],[3,0],[0,2],[1,3]].forEach(([a,b])=>edg.push([rgo+a,rgo+b]));

    // D-pad (left side, 4 arms as lines)
    const dp=[[-60,-10,-bz-1],[-40,-10,-bz-1],[-40,10,-bz-1],[-60,10,-bz-1],
              [-55,-15,-bz-1],[-45,-15,-bz-1],[-45,15,-bz-1],[-55,15,-bz-1]];
    const dpo=pts.length;
    dp.forEach(p=>pts.push(p));
    [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(([a,b])=>edg.push([dpo+a,dpo+b]));

    // Left analog stick circle (approximated as octagon)
    const ls=[]; const lso=pts.length;
    for(let i=0;i<8;i++){const a=i*Math.PI/4; ls.push([-45,30+Math.sin(a)*14,-bz-1+Math.cos(a)*6]);}
    ls.forEach(p=>pts.push(p));
    for(let i=0;i<8;i++) edg.push([lso+i, lso+(i+1)%8]);

    // Right analog stick circle
    const rs=[]; const rso=pts.length;
    for(let i=0;i<8;i++){const a=i*Math.PI/4; rs.push([45,30+Math.sin(a)*14,-bz-1+Math.cos(a)*6]);}
    rs.forEach(p=>pts.push(p));
    for(let i=0;i<8;i++) edg.push([rso+i, rso+(i+1)%8]);

    // Center touchpad
    const tp=[[-18,-8,-bz-1],[18,-8,-bz-1],[18,8,-bz-1],[-18,8,-bz-1]];
    const tpo=pts.length;
    tp.forEach(p=>pts.push(p));
    [[0,1],[1,2],[2,3],[3,0],[0,2],[1,3]].forEach(([a,b])=>edg.push([tpo+a,tpo+b]));

    return { pts, edg };
  })();

  // ---- PlayStation symbols as 2D paths in 3D space (on face of gamepad) ----
  // Each symbol: { char, cx, cy, color } — projected to screen space
  const PS_SYMBOLS = [
    { char:"○", cx: 80, cy:-15, color:"#E8C94A", size:14 },
    { char:"✕", cx: 98, cy: 2,  color:"#6ABAFF", size:12 },
    { char:"□", cx: 62, cy: 2,  color:"#FF7DAE", size:12 },
    { char:"△", cx: 80, cy: 18, color:"#5FE8A0", size:12 },
  ];

  // ---- Orbiting mini symbols ----
  const ORBIT_SYMS = [
    { char:"○", color:"#E8C94A", r:200, speed:0.003, phase:0,         tilt:0.4 },
    { char:"✕", color:"#6ABAFF", r:180, speed:0.004, phase:Math.PI/2, tilt:-0.3 },
    { char:"□", color:"#FF7DAE", r:220, speed:0.0025,phase:Math.PI,   tilt:0.2 },
    { char:"△", color:"#5FE8A0", r:190, speed:0.0035,phase:3*Math.PI/2,tilt:0.5},
    { char:"⬡", color:"#A46BFF", r:240, speed:0.002, phase:0.8,       tilt:-0.4},
    { char:"✦", color:"#35D8F0", r:160, speed:0.005, phase:2.1,       tilt:0.1 },
  ];

  let t = 0;
  let scanY = 0;

  // ---- Draw perspective grid floor ----
  function drawGrid(W, H) {
    const horizon = H * 0.72;
    const vp = { x: W * 0.65, y: horizon };
    ctx.save();
    ctx.globalAlpha = 0.22;
    // Horizontal lines
    for (let i = 0; i <= 14; i++) {
      const prog = i / 14;
      const y = horizon + (H - horizon) * (prog * prog);
      const spread = 60 + 900 * (prog * prog);
      const grad = ctx.createLinearGradient(vp.x-spread, y, vp.x+spread, y);
      grad.addColorStop(0,"transparent");
      grad.addColorStop(0.3,`rgba(53,216,240,${0.6*prog})`);
      grad.addColorStop(0.7,`rgba(53,216,240,${0.6*prog})`);
      grad.addColorStop(1,"transparent");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(vp.x - spread, y);
      ctx.lineTo(vp.x + spread, y);
      ctx.stroke();
    }
    // Vertical converging lines
    const VCNT = 18;
    for (let i = 0; i <= VCNT; i++) {
      const prog = i / VCNT;
      const xBottom = vp.x - 900 + 1800*prog;
      const grad = ctx.createLinearGradient(vp.x, horizon, xBottom, H);
      grad.addColorStop(0,"rgba(164,107,255,0)");
      grad.addColorStop(1,`rgba(164,107,255,${0.45*(1-Math.abs(prog-0.5)*1.8)})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(vp.x, horizon);
      ctx.lineTo(xBottom, H);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ---- Draw wireframe gamepad ----
  function drawGamepad(W, H) {
    const cx = W * 0.72, cy = H * 0.42;
    const scale = Math.min(W, H) * 0.0026;
    const fov = 550;
    const camZ = 380;
    const ay = t * 0.35;
    const ax = Math.sin(t * 0.18) * 0.28;

    const xfPts = GP_BODY.pts.map(p => {
      let q = rotX(p, ax);
      q = rotY(q, ay);
      q[0] *= scale; q[1] *= scale; q[2] *= scale;
      return q;
    });

    // Draw edges
    ctx.save();
    GP_BODY.edg.forEach(([a, b]) => {
      const pa = xfPts[a], pb = xfPts[b];
      const ppa = project([pa[0]+cx-W/2, pa[1]+cy-H/2, pa[2]], W, H, fov, camZ);
      const ppb = project([pb[0]+cx-W/2, pb[1]+cy-H/2, pb[2]], W, H, fov, camZ);
      if (!ppa || !ppb) return;
      // Depth-based opacity
      const avgZ = (ppa.z + ppb.z) * 0.5;
      const alpha = Math.max(0.08, Math.min(0.7, 1 - avgZ / 900));
      const grad = ctx.createLinearGradient(ppa.x, ppa.y, ppb.x, ppb.y);
      grad.addColorStop(0, `rgba(53,216,240,${alpha})`);
      grad.addColorStop(1, `rgba(164,107,255,${alpha})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.9;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(ppa.x, ppa.y);
      ctx.lineTo(ppb.x, ppb.y);
      ctx.stroke();
    });

    // Glowing vertex dots
    xfPts.forEach((p,i) => {
      if (i > 15) return; // only main body verts
      const pp = project([p[0]+cx-W/2, p[1]+cy-H/2, p[2]], W, H, fov, camZ);
      if (!pp) return;
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = "#35D8F0";
      ctx.shadowBlur = 6; ctx.shadowColor = "#35D8F0";
      ctx.beginPath();
      ctx.arc(pp.x, pp.y, 1.8, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // PS symbols on face
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    PS_SYMBOLS.forEach(({ char, cx: sx, cy: sy, color, size }) => {
      let p = [sx * scale, sy * scale, 0];
      p = rotX(p, ax); p = rotY(p, ay);
      const pp = project([p[0]+cx-W/2, p[1]+cy-H/2, p[2]], W, H, fov, camZ);
      if (!pp) return;
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = color;
      ctx.font = `bold ${size}px Arial`;
      ctx.shadowBlur = 10; ctx.shadowColor = color;
      ctx.fillText(char, pp.x, pp.y);
      ctx.shadowBlur = 0;
    });

    ctx.restore();
  }

  // ---- Draw orbiting PS symbols ----
  function drawOrbits(W, H) {
    const cx = W * 0.72, cy = H * 0.42;
    ORBIT_SYMS.forEach(({ char, color, r, speed, phase, tilt }) => {
      const a = t * speed * 60 + phase;
      const ox = Math.cos(a) * r * Math.min(W,H)/900;
      const oy = Math.sin(a) * r * Math.sin(tilt) * Math.min(W,H)/900;
      const x = cx + ox;
      const y = cy + oy;
      const depth = Math.sin(a); // -1 to 1
      const sz = 14 + depth * 4;
      const alpha = 0.35 + depth * 0.3;
      ctx.save();
      ctx.globalAlpha = Math.max(0.1, alpha);
      ctx.fillStyle = color;
      ctx.font = `bold ${sz}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowBlur = 14 + depth * 8;
      ctx.shadowColor = color;
      ctx.fillText(char, x, y);
      ctx.shadowBlur = 0;
      ctx.restore();
    });
  }

  // ---- Draw scan line sweep ----
  function drawScanLine(W, H) {
    scanY = (scanY + 0.8) % H;
    const grad = ctx.createLinearGradient(0, scanY - 18, 0, scanY + 18);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(0.5, "rgba(53,216,240,0.06)");
    grad.addColorStop(1, "transparent");
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.fillStyle = grad;
    ctx.fillRect(0, scanY - 18, W, 36);
    ctx.restore();
  }

  // ---- HUD corner brackets ----
  function drawHUD(W, H) {
    const L = 28, T = 2;
    const corners = [
      [0, 0,   1, 1], [W, 0,  -1, 1], [0, H,   1,-1], [W, H,  -1,-1]
    ];
    ctx.save();
    ctx.strokeStyle = "rgba(53,216,240,0.45)";
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 1;
    corners.forEach(([x, y, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(x + dx*T, y + dy*(T+L));
      ctx.lineTo(x + dx*T, y + dy*T);
      ctx.lineTo(x + dx*(T+L), y + dy*T);
      ctx.stroke();
    });

    // Center crosshair (subtle)
    const mx = W * 0.72, my = H * 0.42, cs = 16;
    ctx.strokeStyle = "rgba(255,95,168,0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(mx - cs, my); ctx.lineTo(mx + cs, my);
    ctx.moveTo(mx, my - cs); ctx.lineTo(mx, my + cs);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // ---- Ambient glow rings around gamepad ----
  function drawGlowRings(W, H) {
    const cx = W * 0.72, cy = H * 0.42;
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.2);
    [1.0, 1.6, 2.2].forEach((scale, i) => {
      const r = 90 * scale * Math.min(W,H) / 900;
      const alpha = (0.06 - i * 0.015) * pulse;
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.strokeStyle = i % 2 === 0 ? "#35D8F0" : "#A46BFF";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 1.6, r * 0.8, 0, 0, Math.PI*2);
      ctx.stroke();
      ctx.restore();
    });
  }

  // ---- Master loop ----
  function loop(ts) {
    t = ts * 0.001;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    drawGrid(W, H);
    drawGlowRings(W, H);
    drawGamepad(W, H);
    drawOrbits(W, H);
    drawScanLine(W, H);
    drawHUD(W, H);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

/* ---- Project Filter ---- */
(function initFilter() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".project-card");
  if (!filterBtns.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter");
      cards.forEach((card) => {
        const cats = card.getAttribute("data-category") || "";
        if (filter === "all" || cats.includes(filter)) {
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
        }
      });
    });
  });
})();

/* ---- Project Modal ---- */
(function initModal() {
  const overlay = document.getElementById("modalOverlay");
  const modal = document.getElementById("modal");
  const closeBtn = document.getElementById("modalClose");
  if (!overlay || !modal) return;

  function openModal(card) {
    document.getElementById("modalPlatform").textContent = card.dataset.platform || "";
    document.getElementById("modalTitle").textContent = card.dataset.title || "";
    document.getElementById("modalDesc").textContent = card.dataset.desc || "";

    // Metrics
    const metricsEl = document.getElementById("modalMetrics");
    metricsEl.innerHTML = "";
    try {
      const metrics = JSON.parse(card.dataset.metrics || "[]");
      metrics.forEach(({ val, label }) => {
        metricsEl.innerHTML += `<div class="modal__metric"><span class="modal__metric-val">${val}</span><span class="modal__metric-label">${label}</span></div>`;
      });
    } catch (e) {}

    // Tags
    const tagsEl = document.getElementById("modalTags");
    tagsEl.innerHTML = "";
    (card.dataset.tags || "").split(",").forEach((t) => {
      tagsEl.innerHTML += `<span>${t.trim()}</span>`;
    });

    // Highlights
    const hlEl = document.getElementById("modalHighlights");
    hlEl.innerHTML = "";
    try {
      const hl = JSON.parse(card.dataset.highlights || "[]");
      hl.forEach((item) => {
        hlEl.innerHTML += `<li>${item}</li>`;
      });
    } catch (e) {}

    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("click", () => openModal(card));
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") openModal(card); });
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
  });

  closeBtn && closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
})();

/* ---- Scroll-to-Top ---- */
(function initScrollTop() {
  const btn = document.getElementById("scrollTop");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 600);
  }, { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();
