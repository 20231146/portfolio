const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


// ─── Scroll-reveal: fade items in as they enter the viewport ───────────────
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // animate only once
      }
    });
  },
  { threshold: 0.12 }
);

// Observe headings, cards and the About columns
document.querySelectorAll('.section h2, .card, .about-grid > div, .contact-grid > *').forEach((el) => {
  el.classList.add('reveal');
  observer.observe(el);
});


// ─── Meteor streaks across the hero ────────────────────────────────────────
const sky = document.querySelector('.meteors');
if (sky && !reducedMotion) {
  for (let n = 0; n < 9; n++) {
    const meteor = document.createElement('span');
    meteor.style.left = `${30 + Math.random() * 80}%`;
    meteor.style.top = `${-10 + Math.random() * 50}%`;
    meteor.style.animationDuration = `${5 + Math.random() * 5}s`;
    meteor.style.animationDelay = `${Math.random() * 6}s`;
    sky.appendChild(meteor);
  }
}


// ─── Typing animation on the hero role line ────────────────────────────────
const typed = document.querySelector('.typed');
if (typed && !reducedMotion) {
  const roles = ['Full-stack developer', 'Systems enthusiast', 'Codeforces Specialist'];
  let role = 0;
  let i = roles[0].length;
  let deleting = true;

  const type = () => {
    typed.textContent = roles[role].slice(0, i);
    if (deleting && i === 0) {
      deleting = false;
      role = (role + 1) % roles.length;
      setTimeout(type, 300);
    } else if (!deleting && i === roles[role].length) {
      deleting = true;
      setTimeout(type, 2200);
    } else {
      i += deleting ? -1 : 1;
      setTimeout(type, deleting ? 30 : 60);
    }
  };
  setTimeout(type, 2200);
}


// ─── Active nav link highlight on scroll ───────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a');

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => link.classList.remove('active'));
        const active = document.querySelector(`nav a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach((s) => navObserver.observe(s));


// ─── Mobile menu ───────────────────────────────────────────────────────────
const menuBtn = document.querySelector('.menu-btn');
const menu = document.querySelector('.nav-links');

const setMenu = (open) => {
  menu.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', open);
};

menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
menu.addEventListener('click', (e) => {
  if (e.target.closest('a')) setMenu(false);
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.menu-btn, .nav-links')) setMenu(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu.classList.contains('open')) {
    setMenu(false);
    menuBtn.focus();
  }
});


// ─── About tabs ────────────────────────────────────────────────────────────
// Panels stay visible until this runs, so the content works without JS
const tabs = [...document.querySelectorAll('[role="tab"]')];

const selectTab = (selected) => {
  tabs.forEach((tab) => {
    const isSelected = tab === selected;
    tab.setAttribute('aria-selected', isSelected);
    tab.tabIndex = isSelected ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !isSelected;
  });
};

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = tabs[(index + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    selectTab(next);
    next.focus();
  });
});

if (tabs.length) selectTab(tabs[0]);


// ─── Cursor ring that trails the mouse ─────────────────────────────────────
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reducedMotion) {
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  ring.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ring);

  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    ring.classList.add('on');
    ring.classList.toggle('hover', !!e.target.closest('a, button'));
  });
  document.documentElement.addEventListener('mouseleave', () => ring.classList.remove('on'));

  const follow = () => {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(follow);
  };
  follow();
}
