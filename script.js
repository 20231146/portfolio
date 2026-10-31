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

document.querySelectorAll('.section-title, .about-text, .card, .contact-panel').forEach((el) => {
  el.classList.add('reveal');
  observer.observe(el);
});


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


// ─── Hero background: Dijkstra searching a city graph ──────────────────────
// Nodes settle outward from a source, then the shortest path to a far node is traced
const canvas = document.querySelector('.route-map');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const css = getComputedStyle(document.documentElement);
  const accent = css.getPropertyValue('--accent').trim();
  const violet = css.getPropertyValue('--violet').trim();
  const line = css.getPropertyValue('--line').trim();

  const EXPLORE_MS = 16; // per settled node
  const TRACE_MS = 1100;
  const HOLD_MS = 1500;
  const FADE_MS = 700;

  let width = 0;
  let height = 0;
  let nodes = [];
  let search = null;
  let pointer = null;

  const buildGraph = () => {
    const scale = window.devicePixelRatio || 1;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    const gap = Math.max(84, width / 14);
    const cols = Math.ceil(width / gap) + 1;
    const rows = Math.ceil(height / gap) + 1;
    nodes = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        nodes.push({
          x: c * gap + (Math.random() - 0.5) * gap * 0.6,
          y: r * gap + (Math.random() - 0.5) * gap * 0.6,
          links: [],
        });
      }
    }
    const connect = (a, b) => {
      if (Math.random() < 0.18) return; // missing roads keep the map irregular
      const cost = Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y);
      nodes[a].links.push({ to: b, cost });
      nodes[b].links.push({ to: a, cost });
    };
    nodes.forEach((_, n) => {
      if ((n + 1) % cols) connect(n, n + 1);
      if (n + cols < nodes.length) connect(n, n + cols);
    });
  };

  const dijkstra = (source) => {
    const dist = new Array(nodes.length).fill(Infinity);
    const prev = new Array(nodes.length).fill(-1);
    const done = new Array(nodes.length).fill(false);
    const order = [];
    dist[source] = 0;
    for (;;) {
      let u = -1;
      dist.forEach((d, n) => {
        if (!done[n] && d < Infinity && (u < 0 || d < dist[u])) u = n;
      });
      if (u < 0) break;
      done[u] = true;
      order.push(u);
      nodes[u].links.forEach(({ to, cost }) => {
        if (dist[u] + cost < dist[to]) {
          dist[to] = dist[u] + cost;
          prev[to] = u;
        }
      });
    }
    return { order, prev };
  };

  const newSearch = (now) => {
    let result;
    do {
      result = dijkstra(Math.floor(Math.random() * nodes.length));
    } while (result.order.length < nodes.length / 2); // skip nodes cut off by missing roads

    const { order, prev } = result;
    const target = order[order.length - 1 - Math.floor(Math.random() * order.length * 0.15)];
    const path = [];
    for (let n = target; n >= 0; n = prev[n]) path.unshift(n);
    const explored = order.slice(0, order.indexOf(target) + 1);
    search = { explored, prev, path, start: now, exploreTime: explored.length * EXPLORE_MS };
  };

  const draw = (now) => {
    const elapsed = now - search.start;
    const { explored, prev, path, exploreTime } = search;
    const total = exploreTime + TRACE_MS + HOLD_MS + FADE_MS;
    if (elapsed > total) {
      newSearch(now);
      return draw(now);
    }
    ctx.clearRect(0, 0, width, height);

    // Road network, lifted slightly near the pointer
    ctx.lineWidth = 1;
    ctx.strokeStyle = line;
    ctx.fillStyle = line;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    nodes.forEach((node, n) => {
      node.links.forEach(({ to }) => {
        if (to > n) {
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(nodes[to].x, nodes[to].y);
        }
      });
    });
    ctx.stroke();
    nodes.forEach((node) => {
      const near = pointer ? Math.max(0, 1 - Math.hypot(node.x - pointer.x, node.y - pointer.y) / 150) : 0;
      ctx.globalAlpha = 0.75 + near * 0.25;
      ctx.fillStyle = near ? accent : line;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 2 + near * 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    const fade = Math.min(1, Math.max(0, (total - elapsed) / FADE_MS));

    // Search tree spreading from the source
    const settled = Math.min(explored.length, Math.floor(elapsed / EXPLORE_MS));
    ctx.strokeStyle = violet;
    ctx.fillStyle = violet;
    ctx.globalAlpha = 0.4 * fade;
    ctx.beginPath();
    for (let k = 0; k < settled; k++) {
      const n = explored[k];
      if (prev[n] >= 0) {
        ctx.moveTo(nodes[n].x, nodes[n].y);
        ctx.lineTo(nodes[prev[n]].x, nodes[prev[n]].y);
      }
    }
    ctx.stroke();

    // Shortest path, drawn from source to target once the search reaches it
    const trace = Math.min(1, Math.max(0, (elapsed - exploreTime) / TRACE_MS)) * (path.length - 1);
    if (elapsed > exploreTime) {
      const whole = Math.floor(trace);
      const from = nodes[path[whole]];
      const to = nodes[path[Math.min(whole + 1, path.length - 1)]];
      const headX = from.x + (to.x - from.x) * (trace - whole);
      const headY = from.y + (to.y - from.y) * (trace - whole);

      ctx.strokeStyle = accent;
      ctx.fillStyle = accent;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = fade;
      ctx.beginPath();
      ctx.moveTo(nodes[path[0]].x, nodes[path[0]].y);
      for (let k = 1; k <= whole; k++) ctx.lineTo(nodes[path[k]].x, nodes[path[k]].y);
      ctx.lineTo(headX, headY);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(headX, headY, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Source marker
    ctx.globalAlpha = fade;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(nodes[path[0]].x, nodes[path[0]].y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  let visible = true;
  const loop = (now) => {
    if (!visible) return;
    draw(now);
    requestAnimationFrame(loop);
  };

  const restart = () => {
    buildGraph();
    newSearch(performance.now());
    // Without motion, show one finished route as a still image
    if (reducedMotion) draw(search.start + search.exploreTime + TRACE_MS);
  };

  restart();

  if (!reducedMotion) {
    new IntersectionObserver(([entry]) => {
      const resume = !visible && entry.isIntersecting;
      visible = entry.isIntersecting;
      if (resume) requestAnimationFrame(loop);
    }).observe(canvas);
    requestAnimationFrame(loop);

    const hero = canvas.parentElement;
    hero.addEventListener('pointermove', (e) => {
      const box = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - box.left, y: e.clientY - box.top };
    });
    hero.addEventListener('pointerleave', () => (pointer = null));
  }

  // Phones fire resize when the address bar hides, so only rebuild on a real width change
  let lastWidth = canvas.clientWidth;
  window.addEventListener('resize', () => {
    if (canvas.clientWidth !== lastWidth) {
      lastWidth = canvas.clientWidth;
      restart();
    }
  });
}


// ─── Hero widget: instructions moving through a 5-stage pipeline ───────────
// A load followed by an instruction using its result stalls for one cycle
const pipeline = document.querySelector('.pipeline');
if (pipeline && !reducedMotion) {
  const program = [
    { op: 'add' },
    { op: 'lw', load: true },
    { op: 'sub', usesLoad: true },
    { op: 'beq' },
    { op: 'addi' },
    { op: 'lw', load: true },
    { op: 'and', usesLoad: true },
    { op: 'sw' },
  ];
  const BUBBLE = { op: 'nop', bubble: true };
  const stages = pipeline.querySelectorAll('.stage');
  const clock = pipeline.querySelector('.pipeline-clock');
  const status = pipeline.querySelector('.pipeline-status');

  const pipe = [null, null, null, null, null]; // IF, ID, EX, MEM, WB
  let next = 0;
  let cycle = 0;
  let retired = 0;

  const fetch = () => program[next++ % program.length];

  // Returns true when this cycle stalled
  const advance = () => {
    const stall = pipe[2]?.load && pipe[1]?.usesLoad;

    if (stall) {
      pipe[4] = pipe[3];
      pipe[3] = pipe[2];
      pipe[2] = BUBBLE;
    } else {
      pipe.pop();
      pipe.unshift(fetch());
    }
    cycle++;
    if (pipe[4] && !pipe[4].bubble) retired++;
    return stall;
  };

  const step = () => {
    const stall = advance();
    const moved = stall ? [2, 3, 4] : [0, 1, 2, 3, 4];

    stages.forEach((stage, s) => {
      const slot = stage.querySelector('.slot');
      slot.textContent = pipe[s] ? pipe[s].op : '';
      slot.classList.toggle('bubble', !!pipe[s]?.bubble);
      stage.classList.toggle('lit', !!pipe[s] && !pipe[s].bubble);
      slot.classList.remove('pop');
      if (moved.includes(s) && pipe[s]) {
        void slot.offsetWidth; // restart the animation
        slot.classList.add('pop');
      }
    });

    clock.textContent = `cycle ${cycle} · CPI ${(cycle / retired).toFixed(2)}`;
    status.textContent = stall ? 'Load-use hazard: 1 cycle stall' : 'Instructions flowing';
    status.classList.toggle('calm', !stall);
  };

  // Run ahead so the widget opens with a full pipeline and a settled CPI
  for (let k = 0; k < 96; k++) advance();
  step();

  let timer = null;
  new IntersectionObserver(([entry]) => {
    clearInterval(timer);
    if (entry.isIntersecting) timer = setInterval(step, 1000);
  }).observe(pipeline);
}


// ─── Stat tiles count up the first time they appear ────────────────────────
const counters = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      counters.unobserve(entry.target);
      const el = entry.target;
      const target = Number(el.dataset.count);
      const decimals = Number(el.dataset.decimals || 0);
      const suffix = el.dataset.suffix || '';
      const start = performance.now();

      const tick = (now) => {
        const t = Math.min(1, (now - start) / 1200);
        const eased = 1 - (1 - t) ** 3;
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  },
  { threshold: 0.6 }
);

if (!reducedMotion) {
  document.querySelectorAll('[data-count]').forEach((el) => counters.observe(el));
}


// ─── Card glow follows the pointer ─────────────────────────────────────────
document.addEventListener('pointermove', (e) => {
  const card = e.target.closest?.('.card');
  if (!card) return;
  const box = card.getBoundingClientRect();
  card.style.setProperty('--mx', `${e.clientX - box.left}px`);
  card.style.setProperty('--my', `${e.clientY - box.top}px`);
});


// ─── Scroll progress bar ───────────────────────────────────────────────────
const progress = document.querySelector('.progress');
const updateProgress = () => {
  const range = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${range > 0 ? window.scrollY / range : 0})`;
};
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();


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
