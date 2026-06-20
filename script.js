/* ============================================================
   GATHWARA ARTS — script.js
   Nav shrink · Intersection Observer · Lightbox · Gallery
   ============================================================ */

(function () {
  'use strict';

  /* ── NAV ──────────────────────────────────────────────── */
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const mobileMenu = document.querySelector('.nav__mobile');

  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── ACTIVE NAV LINK ──────────────────────────────────── */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── INTERSECTION OBSERVER (fade-in) ─────────────────── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

  /* ── GALLERY MODULE ───────────────────────────────────── */
  const masonryGrid = document.getElementById('masonryGrid');
  if (masonryGrid) {
    const TOTAL_IMAGES = 24;
    const BATCH_SIZE   = 12;
    let loaded         = 0;
    let currentFilter  = 'all';
    let lightboxIndex  = 0;
    const items        = [];

    // Image metadata for filters
    const imageMeta = [
      { id: '3 maasai jumping',  cat: 'portrait',  title: '3 maasai jumping' },
      { id: '4 maasai women',  cat: 'abstract', title: '4 maasai women' },
      { id: '4 maasais abstract',  cat: 'abstract',  title: '4 maasais abstract' },
      { id: 'elephant & wildbeats',  cat: 'portrait',  title: 'elephant & wildbeats' },
      { id: 'buffalo',  cat: 'landscape', title: 'buffalo' },
      { id: '7 maasai abstract',  cat: 'abstract',  title: '7 maasai abstract' },
      { id: 'elephnt & river',  cat: 'portrait',  title: 'elephnt & river' },
      { id: 'hometown',  cat: 'landscape', title: 'hometown' },
      { id: 'kilmanjaro & bird',  cat: 'portrait',  title: 'kilmanjaro & bird' },
      { id: 'lion & river', cat: 'portrait',  title: 'lion & river' },
      { id: 'lomon', cat: 'landscape', title: 'lomon' },
      { id: 'manyattah homelife', cat: 'abstract',  title: 'manyattah homelife' },
      { id: 'mufasa monkey', cat: 'portrait',  title: 'mufasa monkey' },
      { id: 'mum & child monkey', cat: 'portrait', title: 'mum & child monkey' },
      { id: 'rhino', cat: 'landscape',  title: 'rhino' },
      { id: 'smiling lady', cat: 'portrait',  title: 'smiling lady' },
      { id: 'smiling maasai lady', cat: 'portrait', title: 'smiling maasai lady' },
      { id: 'sneakers', cat: 'landscape',  title: 'sneakers' },
      { id: 'thinking', cat: 'portrait',  title: 'thinking' },
      { id: 'ugly beauty', cat: 'portrait', title: 'ugly beauty' },
      { id: 'village kid', cat: 'landscape',  title: 'village kid' },
      { id: 'young lady', cat: 'portrait',  title: 'young lady' },
      { id: 'zebra head', cat: 'landscape', title: 'zebra head' },
    ];

    function buildItem(meta) {
      const div = document.createElement('div');
      div.className = 'masonry-item';
      div.dataset.cat = meta.cat;
      div.dataset.id  = meta.id;
      div.innerHTML = `
        <img src="images/${meta.id}.jpg"
             alt="${meta.title}"
             loading="lazy"
             width="400" height="auto">
        <div class="masonry-item__overlay">
          <div class="masonry-item__num">No. ${String(meta.id).padStart(2,'0')}</div>
        </div>`;
      div.addEventListener('click', () => openLightbox(meta.id - 1));
      return div;
    }

    function applyFilter(filter) {
      currentFilter = filter;
      masonryGrid.innerHTML = '';
      loaded = 0;
      loadBatch();
    }

    function loadBatch() {
      const filtered = imageMeta.filter(m => currentFilter === 'all' || m.cat === currentFilter);
      const toLoad   = filtered.slice(loaded, loaded + BATCH_SIZE);
      const loadMoreBtn = document.getElementById('loadMoreBtn');

      toLoad.forEach((meta, i) => {
        const el = buildItem(meta);
        masonryGrid.appendChild(el);
        items.push(el);
        // Staggered reveal
        setTimeout(() => {
          el.classList.add('visible');
        }, i * 60);
      });

      loaded += toLoad.length;

      if (loadMoreBtn) {
        if (loaded >= filtered.length) {
          loadMoreBtn.style.display = 'none';
        } else {
          loadMoreBtn.style.display = 'inline-flex';
        }
      }
    }

    // Initial load
    loadBatch();

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilter(btn.dataset.filter);
      });
    });

    // Load More
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', loadBatch);
    }

    /* ── LIGHTBOX ───────────────────────────────────────── */
    const lightbox = document.getElementById('lightbox');
    const lbImg    = document.getElementById('lbImg');
    const lbCount  = document.getElementById('lbCount');

    function openLightbox(idx) {
      lightboxIndex = idx;
      updateLightbox();
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    function updateLightbox() {
      const meta = imageMeta[lightboxIndex];
      lbImg.src = `images/${meta.id}.jpg`;
      lbImg.alt = meta.title;
      if (lbCount) lbCount.textContent = `${lightboxIndex + 1} / ${TOTAL_IMAGES}`;
    }

    document.getElementById('lbClose')?.addEventListener('click', closeLightbox);
    document.getElementById('lbPrev')?.addEventListener('click', () => {
      lightboxIndex = (lightboxIndex - 1 + TOTAL_IMAGES) % TOTAL_IMAGES;
      updateLightbox();
    });
    document.getElementById('lbNext')?.addEventListener('click', () => {
      lightboxIndex = (lightboxIndex + 1) % TOTAL_IMAGES;
      updateLightbox();
    });
    lightbox?.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (!lightbox?.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') { lightboxIndex = (lightboxIndex - 1 + TOTAL_IMAGES) % TOTAL_IMAGES; updateLightbox(); }
      if (e.key === 'ArrowRight') { lightboxIndex = (lightboxIndex + 1) % TOTAL_IMAGES; updateLightbox(); }
    });
  }

  /* ── WHATSAPP HELPERS ─────────────────────────────────── */
  const WA_NUMBER = '254714817516';

  function waLink(message) {
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  // Assign WA links to all inquiry buttons
  document.querySelectorAll('[data-wa-service]').forEach(btn => {
    const service = btn.dataset.waService;
    const messages = {
      rendering:   "Hello, I'm interested in your Real-Time Rendering service. I'd love to discuss a potential commission.",
      commissions: "Hello, I'd like to enquire about a Private Commission with Gathwara Arts. Please share availability and pricing.",
      mentorship:  "Hello, I'm interested in the Master-Level Mentorship programme at Gathwara Arts. Could we schedule a consultation?",
      general:     "Hello, I'd like to make a general inquiry about Gathwara Arts' services. Looking forward to connecting.",
    };
    btn.href = waLink(messages[service] || messages.general);
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
  });

  // Generic contact buttons
  document.querySelectorAll('[data-wa]').forEach(btn => {
    const msg = btn.dataset.wa || "Hello, I'd like to get in touch with Gathwara Arts.";
    btn.href = waLink(msg);
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
  });

  /* ── COUNTER ANIMATION ────────────────────────────────── */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el  = e.target;
        const end = parseInt(el.dataset.count, 10);
        const dur = 1600;
        const step = 16;
        const inc  = end / (dur / step);
        let cur  = 0;
        const suffix = el.dataset.suffix || '';
        const timer = setInterval(() => {
          cur = Math.min(cur + inc, end);
          el.textContent = Math.floor(cur) + suffix;
          if (cur >= end) clearInterval(timer);
        }, step);
        countIO.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(c => countIO.observe(c));
  }

})();
