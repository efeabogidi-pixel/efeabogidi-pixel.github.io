// Mobile menu
const btn = document.getElementById("menuBtn");
const mobile = document.getElementById("mobileNav");

if (btn && mobile) {
  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    mobile.hidden = open;
  });

  mobile.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      btn.setAttribute("aria-expanded", "false");
      mobile.hidden = true;
    });
  });
}

// Scroll progress bar
const bar = document.getElementById("progressBar");
function updateProgress() {
  const h = document.documentElement;
  const scrolled = h.scrollTop;
  const height = h.scrollHeight - h.clientHeight;
  const pct = height ? (scrolled / height) * 100 : 0;
  if (bar) bar.style.width = pct.toFixed(2) + "%";
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

// Reveal on scroll (premium feel)
const els = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) e.target.classList.add("on");
  }
}, { threshold: 0.12 });

els.forEach(el => io.observe(el));
