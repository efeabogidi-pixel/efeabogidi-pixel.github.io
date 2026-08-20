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
  btn.setAttribute("aria-expanded", "false");
  mobile.hidden = true;

  btn.addEventListener("click", toggleMenu);

  mobile.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (e) => {
    if (mobile.hidden) return;
    const clickedInside = mobile.contains(e.target) || btn.contains(e.target);
    if (!clickedInside) closeMenu();
  });

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

// Seamless homepage film loop using two overlapping video layers.
const homeLoopVideos = Array.from(document.querySelectorAll(".home-loop-video"));
if (homeLoopVideos.length === 2 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let activeVideoIndex = 0;
  let videoCrossfading = false;
  const crossfadeDuration = 580;

  const crossfadeHomeVideo = async () => {
    if (videoCrossfading) return;
    videoCrossfading = true;
    const currentVideo = homeLoopVideos[activeVideoIndex];
    const nextVideoIndex = activeVideoIndex === 0 ? 1 : 0;
    const nextVideo = homeLoopVideos[nextVideoIndex];
    nextVideo.currentTime = 0;
    try {
      await nextVideo.play();
      nextVideo.classList.add("is-active");
      currentVideo.classList.remove("is-active");
      window.setTimeout(() => {
        currentVideo.pause();
        currentVideo.currentTime = 0;
        activeVideoIndex = nextVideoIndex;
        videoCrossfading = false;
      }, crossfadeDuration);
    } catch (_) {
      currentVideo.currentTime = 0;
      currentVideo.play();
      videoCrossfading = false;
    }
  };

  homeLoopVideos.forEach((video, index) => {
    video.addEventListener("timeupdate", () => {
      if (index !== activeVideoIndex || videoCrossfading || !Number.isFinite(video.duration)) return;
      if (video.currentTime >= video.duration - 0.62) crossfadeHomeVideo();
    });
    video.addEventListener("ended", () => {
      if (index === activeVideoIndex && !videoCrossfading) crossfadeHomeVideo();
    });
  });
}

// Cinematic transition from the homepage into a selected portfolio section.
if (document.body.classList.contains("page-home") && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll(".home-menu a").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      document.body.classList.add("home-leaving");
      window.setTimeout(() => { window.location.href = link.href; }, 470);
    });
  });
}

// Dedicated media archive views
const mediaLanes = document.querySelectorAll("[data-media-category]");
if (mediaLanes.length) {
  const requested = new URLSearchParams(window.location.search).get("section") || "press";
  const valid = ["press", "highlights", "documentaries", "interviews"];
  const active = valid.includes(requested) ? requested : "press";
  mediaLanes.forEach((lane) => { lane.hidden = lane.dataset.mediaCategory !== active; });
  document.body.dataset.mediaView = active;
  const labels = { press: "News & Features", highlights: "Career Highlights", documentaries: "Documentaries", interviews: "Interviews" };
  document.title = `${labels[active]} — Efemena Abogidi`;
  const heading = document.querySelector(".page-media .section-heading h2");
  if (heading) heading.innerHTML = `${labels[active]}<br><em>archive.</em>`;
}

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

// Profile cinematic scroll sequence
const profileSpread = document.querySelector(".profile-spread");
if (profileSpread && !reduceMotion) {
  const portrait = profileSpread.querySelector("figure");
  const storyItems = profileSpread.querySelectorAll(".profile-story p");
  const factItems = document.querySelectorAll(".profile-facts article");

  storyItems.forEach((item, index) => {
    item.classList.add("profile-scroll-item");
    item.style.setProperty("--reveal-delay", `${Math.min(index * 70, 210)}ms`);
  });
  factItems.forEach((item, index) => {
    item.classList.add("profile-scroll-item");
    item.style.setProperty("--reveal-delay", `${index * 90}ms`);
  });

  const profileObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          profileObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -4% 0px" }
  );
  document.querySelectorAll(".profile-scroll-item").forEach((item) => profileObserver.observe(item));

  let profileTicking = false;
  const updateProfileParallax = () => {
    profileTicking = false;
    if (!portrait || window.innerWidth <= 900) return;
    const rect = profileSpread.getBoundingClientRect();
    const progress = Math.max(-1, Math.min(1, (window.innerHeight / 2 - rect.top) / window.innerHeight));
    portrait.style.setProperty("--portrait-parallax", `${progress * 14}px`);
  };
  window.addEventListener("scroll", () => {
    if (!profileTicking) {
      profileTicking = true;
      requestAnimationFrame(updateProfileParallax);
    }
  }, { passive: true });
  updateProfileParallax();
}

// Career timeline progress and cinematic reveals
const careerTimeline = document.querySelector(".career-page .timeline");
if (careerTimeline) {
  const careerItems = careerTimeline.querySelectorAll(".timeline-item");

  if (reduceMotion) {
    careerItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    careerItems.forEach((item) => item.classList.add("career-reveal"));
    const careerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            careerObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.22, rootMargin: "0px 0px -8% 0px" }
    );
    careerItems.forEach((item) => careerObserver.observe(item));
  }

  let careerTicking = false;
  const updateCareerProgress = () => {
    careerTicking = false;
    const rect = careerTimeline.getBoundingClientRect();
    const start = window.innerHeight * 0.72;
    const distance = rect.height + start;
    const progress = Math.max(0, Math.min(1, (start - rect.top) / distance));
    careerTimeline.style.setProperty("--career-progress", `${(progress * 100).toFixed(2)}%`);
  };
  window.addEventListener("scroll", () => {
    if (!careerTicking) {
      careerTicking = true;
      requestAnimationFrame(updateCareerProgress);
    }
  }, { passive: true });
  updateCareerProgress();
}

// Education mini-page views
const educationButtons = document.querySelectorAll("[data-education-view]");
const educationPanels = document.querySelectorAll("[data-education-panel]");
if (educationButtons.length && educationPanels.length) {
  const validEducationViews = ["overview", "projects", "certifications", "opportunities"];
  const showEducationView = (view, updateHash = true) => {
    const selected = validEducationViews.includes(view) ? view : "overview";
    educationButtons.forEach((button) => {
      const active = button.dataset.educationView === selected;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    educationPanels.forEach((panel) => {
      const active = panel.dataset.educationPanel === selected;
      panel.hidden = !active;
      panel.classList.toggle("active", active);
    });
    if (updateHash) history.replaceState(null, "", selected === "overview" ? location.pathname : `#${selected}`);
  };
  educationButtons.forEach((button) => button.addEventListener("click", () => showEducationView(button.dataset.educationView)));
  showEducationView(location.hash.slice(1), false);
}

// Education journey reveal
const educationRecords = document.querySelectorAll(".education-records article");
if (educationRecords.length && !reduceMotion) {
  educationRecords.forEach((record, index) => {
    record.classList.add("education-record-reveal");
    record.style.setProperty("--education-delay", `${Math.min(index * 55, 260)}ms`);
  });
  const educationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        educationObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  educationRecords.forEach((record) => educationObserver.observe(record));
}

// Active education chapter and ambient light
const educationOverview = document.querySelector('[data-education-panel="overview"] .academics');
const educationTrack = document.querySelector(".education-records");
if (educationOverview && educationTrack && educationRecords.length && !reduceMotion) {
  let educationTicking = false;
  const updateEducationScene = () => {
    educationTicking = false;
    const focusY = window.innerHeight * 0.48;
    let currentIndex = 0;
    let shortest = Infinity;
    educationRecords.forEach((record, index) => {
      const rect = record.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - focusY);
      if (distance < shortest) {
        shortest = distance;
        currentIndex = index;
      }
    });
    educationRecords.forEach((record, index) => {
      record.classList.toggle("is-current", index === currentIndex);
      record.classList.toggle("is-passed", index < currentIndex);
    });
    const progress = educationRecords.length > 1 ? currentIndex / (educationRecords.length - 1) : 1;
    educationTrack.style.setProperty("--education-progress", `${(progress * 100).toFixed(2)}%`);
    educationOverview.style.setProperty("--education-light-y", `${30 + progress * 45}%`);
  };
  window.addEventListener("scroll", () => {
    if (!educationTicking) {
      educationTicking = true;
      requestAnimationFrame(updateEducationScene);
    }
  }, { passive: true });
  updateEducationScene();
}

// Subtle cursor-responsive 3D depth for the education gateways
const educationGatewayButtons = document.querySelectorAll(".education-directory button");
if (educationGatewayButtons.length && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  educationGatewayButtons.forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      button.style.setProperty("--tilt-x", `${((0.5 - y) * 10).toFixed(2)}deg`);
      button.style.setProperty("--tilt-y", `${((x - 0.5) * 10).toFixed(2)}deg`);
      button.style.setProperty("--shine-x", `${(x * 100).toFixed(1)}%`);
      button.style.setProperty("--shine-y", `${(y * 100).toFixed(1)}%`);
    });
    button.addEventListener("pointerleave", () => {
      button.style.setProperty("--tilt-x", "0deg");
      button.style.setProperty("--tilt-y", "0deg");
      button.style.setProperty("--shine-x", "35%");
      button.style.setProperty("--shine-y", "25%");
    });
  });
}
