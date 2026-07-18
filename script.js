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
  const revealTargets = document.querySelectorAll(".section__inner, .case, .timeline__item");
  revealTargets.forEach((el) => el.classList.add("reveal"));
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
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
