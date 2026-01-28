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
