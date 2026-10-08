// Deliberately small: native scrolling and navigation, with no visual scroll loops.
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());

const menuButton = document.getElementById('menuBtn');
const mobileNav = document.getElementById('mobileNav');
function setMenu(open, restoreFocus = false) {
  if (!menuButton || !mobileNav) return;
  mobileNav.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  if (restoreFocus) menuButton.focus();
}
if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => setMenu(mobileNav.hidden));
  mobileNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('click', (event) => {
    if (!mobileNav.hidden && !mobileNav.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !mobileNav.hidden) setMenu(false, true);
  });
  document.addEventListener('focusin', (event) => {
    if (!mobileNav.hidden && !mobileNav.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });
}

// Education tabs support deep links, back/forward, and keyboard navigation.
const educationButtons = Array.from(document.querySelectorAll('[data-education-view]'));
const educationPanels = Array.from(document.querySelectorAll('[data-education-panel]'));
if (educationButtons.length && educationPanels.length) {
  const tablist = document.querySelector('.education-directory');
  tablist.setAttribute('role', 'tablist');
  educationButtons.forEach((button) => {
    const view = button.dataset.educationView;
    button.id = `tab-${view}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `panel-${view}`);
  });
  educationPanels.forEach((panel) => {
    const view = panel.dataset.educationPanel;
    panel.id = `panel-${view}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `tab-${view}`);
    panel.tabIndex = 0;
  });
  function showEducation(view, updateUrl = false) {
    const selected = educationPanels.some(panel => panel.dataset.educationPanel === view) ? view : 'overview';
    educationButtons.forEach((button) => {
      const active = button.dataset.educationView === selected;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    educationPanels.forEach((panel) => {
      const active = panel.dataset.educationPanel === selected;
      panel.hidden = !active;
      panel.classList.toggle('active', active);
    });
    if (updateUrl) {
      const hash = selected === 'overview' ? '' : `#${selected}`;
      if (location.hash !== hash) history.pushState(null, '', location.pathname + location.search + hash);
    }
  }
  educationButtons.forEach((button, index) => {
    button.addEventListener('click', () => showEducation(button.dataset.educationView, true));
    button.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % educationButtons.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + educationButtons.length) % educationButtons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = educationButtons.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      educationButtons[next].focus();
      showEducation(educationButtons[next].dataset.educationView, true);
    });
  });
  window.addEventListener('popstate', () => showEducation(location.hash.slice(1)));
  window.addEventListener('hashchange', () => showEducation(location.hash.slice(1)));
  showEducation(location.hash.slice(1));
}

const mediaLanes = document.querySelectorAll('[data-media-category]');
if (mediaLanes.length) {
  const labels = {press:'News & Features', highlights:'Career Highlights', documentaries:'Documentaries', interviews:'Interviews'};
  const requested = new URLSearchParams(location.search).get('section');
  const active = Object.hasOwn(labels, requested) ? requested : 'press';
  mediaLanes.forEach(lane => { lane.hidden = lane.dataset.mediaCategory !== active; });
  document.title = `${labels[active]} — Efemena Abogidi`;
  const heading = document.querySelector('.page-media .section-heading h1');
  if (heading) heading.textContent = labels[active];
  document.querySelectorAll('.archive-nav a').forEach(link => {
    if (new URL(link.href).searchParams.get('section') === active) link.setAttribute('aria-current', 'page');
  });
}

// A keyboard-accessible play action supplements the native film controls.
document.querySelectorAll('.home-film video, .media-film video').forEach(video => {
  const play = document.createElement('button');
  play.type = 'button';
  play.className = 'film-play';
  play.textContent = 'Play film';
  play.setAttribute('aria-label', `Play ${video.getAttribute('aria-label') || 'film'}`);
  video.after(play);
  play.addEventListener('click', async () => {
    try { await video.play(); }
    catch (_) { play.textContent = 'Unable to play — try again'; }
  });
  video.addEventListener('play', () => { play.hidden = true; });
  video.addEventListener('pause', () => { play.hidden = false; play.textContent = 'Resume film'; });
  video.addEventListener('ended', () => { play.hidden = false; play.textContent = 'Replay film'; });
});

// Pause film playback when the page is no longer visible.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) document.querySelectorAll('video').forEach(video => video.pause());
});
