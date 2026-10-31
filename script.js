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

// Observe every section and every .item card
document.querySelectorAll('section, .item').forEach((el) => {
  el.classList.add('reveal');
  observer.observe(el);
});


// ─── Typing animation on the h1 hero text ──────────────────────────────────
const h1 = document.querySelector('#home h1');
if (h1) {
  const fullText = h1.textContent;
  h1.textContent = '';
  h1.style.borderRight = '2px solid var(--accent)'; // blinking cursor

  let i = 0;
  const type = () => {
    if (i < fullText.length) {
      h1.textContent += fullText[i++];
      setTimeout(type, 45);
    } else {
      // Remove cursor after typing finishes
      setTimeout(() => (h1.style.borderRight = 'none'), 600);
    }
  };
  type();
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
