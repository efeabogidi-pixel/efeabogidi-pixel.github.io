// Set footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Mobile menu (accessible + closes on outside click / ESC)
const btn = document.getElementById("menuBtn");
const mobile = document.getElementById("mobileNav");

function closeMenu() {
  if (!btn || !mobile) return;
  btn.setAttribute("aria-expanded", "false");
  mobile.hidden = true;
}

function openMenu() {
  if (!btn || !mobile) return;
  btn.setAttribute("aria-expanded", "true");
  mobile.hidden = false;
}

function toggleMenu() {
  const expanded = btn.getAttribute("aria-expanded") === "true";
  expanded ? closeMenu() : openMenu();
}

if (btn && mobile) {
  // Start closed
  btn.setAttribute("aria-expanded", "false");
  mobile.hidden = true;

  btn.addEventListener("click", toggleMenu);

  // Close on nav click
  mobile.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", closeMenu);
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (mobile.hidden) return;
    const clickedInside = mobile.contains(e.target) || btn.contains(e.target);
    if (!clickedInside) closeMenu();
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

// Scroll progress bar (smooth)
const bar = document.getElementById("progressBar");
let ticking = false;

function updateProgress() {
  ticking = false;
  if (!bar) return;

  const h = document.documentElement;
  const scrolled = h.scrollTop || document.body.scrollTop;
  const height = h.scrollHeight - h.clientHeight;
  const pct = height ? (scrolled / height) * 100 : 0;

  bar.style.width = `${pct.toFixed(2)}%`;
}

window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateProgress);
    }
  },
  { passive: true }
);

updateProgress();

// Reveal on scroll (respects reduced motion)
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const els = document.querySelectorAll(".reveal");

if (els.length) {
  if (reduceMotion) {
    els.forEach((el) => el.classList.add("on"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("on");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );

    els.forEach((el) => io.observe(el));
  }
}
