// Mobile nav toggle
const burger = document.getElementById("burger");
const mobileNav = document.getElementById("mobileNav");

if (burger && mobileNav) {
  burger.addEventListener("click", () => {
    const expanded = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!expanded));
    mobileNav.hidden = expanded;
  });

  // close menu after clicking a link
  mobileNav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      burger.setAttribute("aria-expanded", "false");
      mobileNav.hidden = true;
    });
  });
}

// Subtle reveal animation when scrolling (simple + clean)
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("in");
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".card, .section-head, .hero-left, .hero-right").forEach((el) => {
  el.classList.add("reveal");
  observer.observe(el);
});

// Inject reveal styles (keeps code simple)
const style = document.createElement("style");
style.textContent = `
  .reveal{opacity:0; transform: translateY(10px); transition: opacity .45s ease, transform .45s ease;}
  .reveal.in{opacity:1; transform: translateY(0);}
`;
document.head.appendChild(style);
