/* ═══════════════════════════════════════
   Site Renderer v2 — Fetches data.json & builds EVERYTHING
   ═══════════════════════════════════════ */

const SITE_DATA_URL = '../data.json';

// ── DOM shortcuts ──
const $ = (id) => document.getElementById(id);
const qs = (sel) => document.querySelector(sel);

let data = null;

// ═══ DOCUMENT READY ═══
document.addEventListener('DOMContentLoaded', async () => {
  initThemeToggle();
  try {
    const res = await fetch(SITE_DATA_URL + '?t=' + Date.now());
    if (!res.ok) throw new Error('Failed to load data.json');
    data = await res.json();
    renderSEO();
    renderAll();
    initRevealObserver();
    initNavScroll();
    initHamburger();
  } catch (err) {
    console.error('Site load error:', err);
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:1rem;padding:2rem;text-align:center;">
        <h2 style="color:#dc2626;">⚠️ Could not load content</h2>
        <p style="color:#6B7280;">Check that <code>data.json</code> exists and refresh.</p>
        <button onclick="location.reload()" style="padding:0.6rem 1.5rem;border-radius:999px;border:none;background:#10B981;color:white;font-weight:600;cursor:pointer;">Refresh</button>
      </div>`;
  } finally {
    document.getElementById('loader')?.classList.add('loaded');
  }
});

// ── Hero Portrait ──
  const heroImg = document.getElementById('heroPortraitImg');
  if (heroImg && data.hero?.image) {
    heroImg.src = data.hero.image;
    heroImg.alt = data.hero.imageAlt || 'Apostle Gabriel Olu Akintan';
    document.getElementById('heroPortrait')?.classList.add('reveal', 'reveal-delay-1');
  }

  // ── About Portrait ──
  const aboutImg = document.getElementById('aboutPortraitImg');
  if (aboutImg && data.aboutImage) {
    aboutImg.src = data.aboutImage;
    aboutImg.alt = data.aboutImageAlt || 'Apostle Gabriel Olu Akintan';
    document.getElementById('aboutPortrait')?.classList.add('reveal');
  }

// ═══ THEME TOGGLE ═══
function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Set initial
  const theme = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);

  btn?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

// ═══ SEO RENDER (dynamic from data.json) ═══
function renderSEO() {
  if (!data) return;
  const base = 'https://graceassemblyministries.org';
  const name = data.site.name || '';
  const desc = data.seo?.description || data.hero?.subtitle || 'Grace Assembly Ministries';
  const img = data.site.ogImage || 'https://placehold.co/1200x630/065F46/FFFFFF?text=Grace+Assembly';

  setMeta('seoTitle', name + ' — ' + (data.site.ministry || ''));
  setMeta('seoDesc', desc);
  setMeta('seoKeywords', data.seo?.keywords || '');
  setMeta('seoCanonical', base + '/');

  setMeta('ogTitle', name + ' — ' + data.site.ministry);
  setMeta('ogDesc', desc);
  setMeta('ogUrl', base + '/');
  setMeta('ogImage', img);

  setMeta('twTitle', name + ' — ' + data.site.ministry);
  setMeta('twDesc', desc);
  setMeta('twImage', img);

  // Update JSON-LD
  const ld = document.getElementById('jsonLd');
  if (ld && data.site.name) {
    try {
      const schema = JSON.parse(ld.textContent);
      if (schema['@graph']) {
        schema['@graph'][0].name = data.site.name;
        schema['@graph'][0].url = base;
        schema['@graph'][0].sameAs = [
          data.site.youtube, data.site.facebook, data.site.instagram, data.site.x
        ].filter(Boolean);
        schema['@graph'][1].name = data.site.ministry || data.site.name;
        schema['@graph'][1].url = base;
      }
      ld.textContent = JSON.stringify(schema, null, 2);
    } catch (e) { /* ignore */ }
  }
}

function setMeta(id, val) {
  const el = document.getElementById(id);
  if (!el || !val) return;
  if (el.tagName === 'META') {
    el.setAttribute('content', val);
  } else if (el.tagName === 'LINK') {
    el.setAttribute('href', val);
  } else {
    el.textContent = val;
  }
}

// ═══ RENDER ALL SECTIONS ═══
function renderAll() {
  if (!data) return;

  // ── Site Info ──
  document.title = data.site.title || data.site.name;
  $('navBrand').textContent = data.site.ministry || data.site.name;
  $('heroMinistry').textContent = data.site.ministry || '';
  $('heroMinistry').classList.add('reveal', 'reveal-delay-1');
  $('heroSubtitle').textContent = data.hero?.subtitle || '';
  $('verseText').textContent = data.hero?.verseText || '';
  $('verseRef').textContent = '— ' + (data.hero?.verseRef || '');
  const cta = $('heroCta');
  if (data.hero?.ctaText) {
    cta.querySelector('span').textContent = data.hero.ctaText;
    cta.href = data.hero.ctaLink || '#messages';
  }

  // Typing effect
  const line1 = qs('.line-1');
  if (line1 && data.hero?.title) {
    line1.textContent = '';
    typeText(line1, data.hero.title, 60);
  }

  // Hero reveal classes
  $('heroTitle').classList.add('reveal', 'reveal-delay-2');
  $('heroSubtitle').classList.add('reveal', 'reveal-delay-3');
  $('heroVerse').classList.add('reveal', 'reveal-delay-4');
  cta.classList.add('reveal', 'reveal-delay-4');

  // ── About ──
  const ap = $('aboutPreview');
  ap.querySelector('p').textContent = data.aboutPreview || '';
  ap.classList.add('reveal');
  renderAboutSections();

  // ── Messages ──
  renderMessages();

  // ── Books ──
  renderBooks();

  // ── Verses ──
  renderVerses();

  // ── Events ──
  renderEvents();

  // ── Contact ──
  $('contactHeading').textContent = data.contact?.heading || 'Get in Touch';
  $('contactSub').textContent = data.contact?.subtext || 'Reach out via WhatsApp';
  const waBtn = $('whatsappBtn');
  if (data.site.whatsapp) {
    waBtn.href = `https://wa.me/${data.site.whatsapp}`;
    waBtn.querySelector('span').textContent = data.site.displayPhone || 'Chat on WhatsApp';
  }
  renderSocialLinks();

  // ── Footer ──
  $('footerText').textContent = data.site.footer || `© ${new Date().getFullYear()} ${data.site.ministry}. All rights reserved.`;
  $('footerEmail').textContent = data.site.email || '';
  $('footerLocation').textContent = data.site.location || '';
}

// ── Typing Effect ──
function typeText(el, text, speed = 50) {
  let i = 0;
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  el.appendChild(cursor);
  (function type() {
    if (i < text.length) {
      cursor.before(text.charAt(i));
      i++;
      setTimeout(type, speed);
    } else {
      cursor.remove();
    }
  })();
}

// ── About ──
function renderAboutSections() {
  const grid = $('aboutGrid');
  grid.innerHTML = '';
  if (!data.aboutSections?.length) return;
  const icons = ['🌟', '📖', '🔥', '💒', '✝️', '📜', '🕊️', '🙏'];
  data.aboutSections.forEach((s, i) => {
    const card = document.createElement('div');
    card.className = 'about-card reveal';
    card.style.transitionDelay = `${i * 0.1}s`;
    card.innerHTML = `
      <div class="card-icon">${icons[i % icons.length]}</div>
      <h3>${escHtml(s.heading)}</h3>
      <p>${escHtml(s.body)}</p>`;
    grid.appendChild(card);
  });
}

// ── Messages ──
function renderMessages() {
  const grid = $('messagesGrid');
  grid.innerHTML = '';
  if (!data.messages?.length) {
    grid.innerHTML = '<p class="empty-state">No messages available yet.</p>';
    return;
  }
  data.messages.forEach((msg, i) => {
    const thumb = msg.youtubeId ? `https://img.youtube.com/vi/${msg.youtubeId}/hqdefault.jpg` : '';
    const card = document.createElement('a');
    card.href = `https://youtube.com/watch?v=${msg.youtubeId}`;
    card.target = '_blank'; card.rel = 'noopener';
    card.className = 'msg-card reveal';
    card.style.transitionDelay = `${i * 0.08}s`;
    const date = msg.date ? new Date(msg.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
    card.innerHTML = `
      <div class="msg-thumb">
        <img src="${thumb}" alt="${escHtml(msg.title)}" loading="lazy" />
        <div class="play-overlay"><div class="play-icon">▶</div></div>
      </div>
      <div class="msg-info">
        <h4>${escHtml(msg.title)}</h4>
        ${date ? `<span class="msg-date">${date}</span>` : ''}
      </div>`;
    grid.appendChild(card);
  });
}

// ── Books ──
function renderBooks() {
  const grid = $('booksGrid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!data.books?.length) {
    grid.innerHTML = '<p class="empty-state">No books available yet.</p>';
    return;
  }
  data.books.forEach((book, i) => {
    const card = document.createElement('div');
    card.className = 'book-card reveal';
    card.style.transitionDelay = `${i * 0.1}s`;
    const img = book.image || 'https://placehold.co/400x300/E5E7EB/9CA3AF?text=Book';
    card.innerHTML = `
      <div class="book-cover">
        <img src="${img}" alt="${escHtml(book.title)}" loading="lazy" />
      </div>
      <div class="book-info">
        <h3>${escHtml(book.title)}</h3>
        ${book.subtitle ? `<p class="book-subtitle">${escHtml(book.subtitle)}</p>` : ''}
        <p>${escHtml(book.description)}</p>
        <div class="book-meta">
          ${book.amazon ? `<a href="${book.amazon}" target="_blank" rel="noopener">📚 Buy on Amazon</a>` : ''}
          ${book.pdf ? `<a href="${book.pdf}" target="_blank" rel="noopener">📄 Download PDF</a>` : ''}
          ${book.year ? `<span style="font-size:0.78rem;color:var(--text-muted);margin-left:auto;">${book.year}</span>` : ''}
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

// ── Verses ──
function renderVerses() {
  const grid = $('versesGrid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!data.verses?.length) {
    grid.innerHTML = '<p class="empty-state">No verses added yet.</p>';
    return;
  }
  data.verses.forEach((v, i) => {
    const card = document.createElement('div');
    card.className = `verse-card reveal${v.featured ? ' featured' : ''}`;
    card.style.transitionDelay = `${i * 0.08}s`;
    card.innerHTML = `
      <div class="quote-mark">"</div>
      <p class="verse-text">${escHtml(v.text)}</p>
      <cite class="verse-ref">— ${escHtml(v.ref)}</cite>
      ${v.featured ? '<span class="verse-badge">Featured</span>' : ''}
      ${v.category ? `<span style="display:block;font-size:0.7rem;color:var(--text-muted);margin-top:0.75rem;text-transform:capitalize;">#${escHtml(v.category)}</span>` : ''}
    `;
    grid.appendChild(card);
  });
}

// ── Events ──
function renderEvents() {
  const list = $('eventsList');
  if (!list) return;
  if (!data.events?.length) {
    list.innerHTML = '<p class="empty-state">No upcoming events at this time.</p>';
    return;
  }
  list.innerHTML = '';
  data.events.forEach((ev, i) => {
    const d = new Date(ev.date);
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const day = d.getDate();
    const card = document.createElement('div');
    card.className = 'event-card reveal';
    card.style.transitionDelay = `${i * 0.1}s`;
    const timeHtml = ev.time ? `<span>🕐 ${escHtml(ev.time)}</span>` : '';
    const locHtml = ev.location ? `<span>📍 ${escHtml(ev.location)}</span>` : '';
    card.innerHTML = `
      <div class="event-date-box">
        <span class="month">${month}</span>
        <span class="day">${day}</span>
      </div>
      <div class="event-info">
        <h3>${escHtml(ev.title)}</h3>
        <div class="event-details">${timeHtml}${locHtml}</div>
        ${ev.description ? `<p>${escHtml(ev.description)}</p>` : ''}
        ${ev.registrationLink ? `<a href="${ev.registrationLink}" target="_blank" rel="noopener" class="event-link">📝 Register Now →</a>` : ''}
      </div>`;
    list.appendChild(card);
  });
}

// ── Social Links ──
function renderSocialLinks() {
  const container = $('socialLinks');
  if (!container) return;
  container.innerHTML = '';
  const links = [
    { url: data.site.youtube, label: 'YouTube', svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>' },
    { url: data.site.facebook, label: 'Facebook', svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' },
    { url: data.site.instagram, label: 'Instagram', svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>' },
    { url: data.site.x, label: 'X (Twitter)', svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' },
  ];
  links.forEach(l => {
    if (!l.url) return;
    const a = document.createElement('a');
    a.href = l.url; a.target = '_blank'; a.rel = 'noopener'; a.title = l.label;
    a.innerHTML = l.svg;
    container.appendChild(a);
  });
}

// ── Scroll Reveal Observer ──
function initRevealObserver() {
  const observer = new IntersectionObserver(
    (entries) => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }); },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ── Nav scroll effect ──
function initNavScroll() {
  const nav = document.querySelector('.glass-nav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 50));
}

// ── Hamburger menu ──
function initHamburger() {
  const ham = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (!ham || !links) return;
  ham.addEventListener('click', () => { ham.classList.toggle('active'); links.classList.toggle('open'); });
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => { ham.classList.remove('active'); links.classList.remove('open'); });
  });
  document.addEventListener('click', (e) => {
    if (!ham.contains(e.target) && !links.contains(e.target)) { ham.classList.remove('active'); links.classList.remove('open'); }
  });
}

// ── Utility ──
function escHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
