/* ═══════════════════════════════════════
   Site Renderer v4 — HOLEPIC
   Fetches data.json & builds EVERYTHING
   ═══════════════════════════════════════ */

const SITE_DATA_URL = './data.json';

// ── DOM shortcuts ──
const $ = (id) => document.getElementById(id);
const qs = (sel) => document.querySelector(sel);

let data = null;


// ═══════════════════════════════════════
// DOCUMENT READY
// ═══════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
  initThemeToggle();

  try {
    const res = await fetch(`${SITE_DATA_URL}?t=${Date.now()}`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Failed to load data.json (${res.status})`);
    }

    data = await res.json();

    if (!data || typeof data !== 'object') {
      throw new Error('data.json did not return a valid object.');
    }

    renderSEO();
    renderAll();

    initRevealObserver();
    initNavScroll();
    initHamburger();

  } catch (err) {
    console.error('Site load error:', err);

    showLoadError(err);

  } finally {
    $('loader')?.classList.add('loaded');
  }
});


// ═══════════════════════════════════════
// ERROR SCREEN
// ═══════════════════════════════════════

function showLoadError(err) {
  document.body.innerHTML = `
    <div style="
      display:flex;
      align-items:center;
      justify-content:center;
      min-height:100vh;
      flex-direction:column;
      gap:1rem;
      padding:2rem;
      text-align:center;
      font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    ">
      <h2 style="color:#dc2626;margin:0;">
        ⚠️ Could not load content
      </h2>

      <p style="color:#6B7280;max-width:500px;line-height:1.6;">
        There was a problem loading the ministry website content.
        Please check that <strong>data.json</strong> exists and contains valid JSON.
      </p>

      <details style="
        max-width:600px;
        width:100%;
        text-align:left;
        color:#6B7280;
      ">
        <summary style="cursor:pointer;">
          Technical details
        </summary>

        <pre style="
          white-space:pre-wrap;
          word-break:break-word;
          background:#f3f4f6;
          padding:1rem;
          border-radius:10px;
          margin-top:.75rem;
        ">${escHtml(err?.message || String(err))}</pre>
      </details>

      <button
        onclick="location.reload()"
        style="
          padding:.7rem 1.5rem;
          border-radius:999px;
          border:none;
          background:#10B981;
          color:white;
          font-weight:600;
          cursor:pointer;
        "
      >
        Refresh
      </button>
    </div>
  `;
}


// ═══════════════════════════════════════
// THEME TOGGLE
// ═══════════════════════════════════════

function initThemeToggle() {
  const btn = $('themeToggle');

  const stored = localStorage.getItem('theme');

  const prefersDark =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const theme = stored || (prefersDark ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', theme);

  btn?.addEventListener('click', () => {
    const current =
      document.documentElement.getAttribute('data-theme');

    const next = current === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', next);

    localStorage.setItem('theme', next);
  });
}


// ═══════════════════════════════════════
// SEO
// ═══════════════════════════════════════

function renderSEO() {
  if (!data) return;

  const base = window.location.origin;

  const name = data.site?.name || '';

  const ministry =
    data.site?.ministry || 'HOLEPIC';

  const desc =
    data.seo?.description ||
    data.hero?.subtitle ||
    ministry;

  const img =
    data.site?.ogImage ||
    'https://placehold.co/1200x630/065F46/FFFFFF?text=HOLEPIC';

  setMeta(
    'seoTitle',
    data.site?.title || `${name} — ${ministry}`
  );

  setMeta('seoDesc', desc);

  setMeta(
    'seoKeywords',
    data.seo?.keywords || ''
  );

  setMeta(
    'seoCanonical',
    `${base}/`
  );

  setMeta(
    'ogTitle',
    `${name} — ${ministry}`
  );

  setMeta(
    'ogDesc',
    desc
  );

  setMeta(
    'ogUrl',
    `${base}/`
  );

  setMeta(
    'ogImage',
    img
  );

  setMeta(
    'twTitle',
    `${name} — ${ministry}`
  );

  setMeta(
    'twDesc',
    desc
  );

  setMeta(
    'twImage',
    img
  );


  // ── JSON-LD ──

  const ld = $('jsonLd');

  if (ld && data.site?.name) {
    try {
      const schema = JSON.parse(ld.textContent);

      if (schema['@graph']) {

        if (schema['@graph'][0]) {
          schema['@graph'][0].name =
            data.site.name;

          schema['@graph'][0].url =
            base;

          schema['@graph'][0].sameAs = [
            data.site.youtube,
            data.site.facebook,
            data.site.instagram,
            data.site.x
          ].filter(Boolean);
        }

        if (schema['@graph'][1]) {
          schema['@graph'][1].name =
            ministry;

          schema['@graph'][1].url =
            base;
        }
      }

      ld.textContent =
        JSON.stringify(schema, null, 2);

    } catch (e) {
      console.warn('Could not update JSON-LD:', e);
    }
  }
}


function setMeta(id, value) {
  const el = $(id);

  if (!el || value === undefined || value === null) {
    return;
  }

  if (el.tagName === 'META') {
    el.setAttribute('content', value);

  } else if (el.tagName === 'LINK') {
    el.setAttribute('href', value);

  } else {
    el.textContent = value;
  }
}


// ═══════════════════════════════════════
// RENDER ALL
// ═══════════════════════════════════════

function renderAll() {
  if (!data) return;


  // ═════════════════════════════════════
  // HERO PORTRAIT
  // ═════════════════════════════════════

  const heroImg = $('heroPortraitImg');

  if (heroImg && data.hero?.image) {
    heroImg.src = data.hero.image;

    heroImg.alt =
      data.hero.imageAlt ||
      'Apostle Gabriel Olu Akintan';

    $('heroPortrait')?.classList.add(
      'reveal',
      'reveal-delay-1'
    );
  }


  // ═════════════════════════════════════
  // ABOUT PORTRAIT
  // ═════════════════════════════════════

  const aboutImg = $('aboutPortraitImg');

  if (aboutImg && data.aboutImage) {
    aboutImg.src = data.aboutImage;

    aboutImg.alt =
      data.aboutImageAlt ||
      'Apostle Gabriel Olu Akintan';

    $('aboutPortrait')?.classList.add(
      'reveal'
    );
  }


  // ═════════════════════════════════════
  // SITE INFO
  // ═════════════════════════════════════

  if ($('navBrand')) {
    $('navBrand').textContent =
      data.site?.logo || 'HOLEPIC';
  }

  if ($('heroMinistry')) {
    $('heroMinistry').textContent =
      data.site?.ministry || '';

    $('heroMinistry').classList.add(
      'reveal',
      'reveal-delay-1'
    );
  }


  // ═════════════════════════════════════
  // PAGE TITLE
  // ═════════════════════════════════════

  document.title =
    data.site?.title ||
    data.site?.name ||
    'HOLEPIC';


  // ═════════════════════════════════════
  // HERO
  // ═════════════════════════════════════

  if ($('heroSubtitle')) {
    $('heroSubtitle').textContent =
      data.hero?.subtitle || '';

    $('heroSubtitle').classList.add(
      'reveal',
      'reveal-delay-3'
    );
  }

  if ($('verseText')) {
    $('verseText').textContent =
      data.hero?.verseText || '';
  }

  if ($('verseRef')) {
    $('verseRef').textContent =
      data.hero?.verseRef
        ? `— ${data.hero.verseRef}`
        : '';
  }


  // ═════════════════════════════════════
  // HERO CTA
  // ═════════════════════════════════════

  const cta = $('heroCta');

  if (cta) {

    if (data.hero?.ctaText) {
      const span = cta.querySelector('span');

      if (span) {
        span.textContent =
          data.hero.ctaText;
      } else {
        cta.textContent =
          data.hero.ctaText;
      }
    }

    cta.href =
      data.hero?.ctaLink ||
      '#messages';

    cta.classList.add(
      'reveal',
      'reveal-delay-4'
    );
  }


  // ═════════════════════════════════════
  // HERO TITLE — TYPING EFFECT
  // ═════════════════════════════════════

  const line1 = qs('.line-1');

  if (line1 && data.hero?.title) {

    line1.textContent = '';

    typeText(
      line1,
      data.hero.title,
      60
    );
  }

  if ($('heroTitle')) {
    $('heroTitle').classList.add(
      'reveal',
      'reveal-delay-2'
    );
  }

  if ($('heroVerse')) {
    $('heroVerse').classList.add(
      'reveal',
      'reveal-delay-4'
    );
  }


  // ═════════════════════════════════════
  // ABOUT
  // ═════════════════════════════════════

  const aboutPreview = $('aboutPreview');

  if (aboutPreview) {

    const p =
      aboutPreview.querySelector('p');

    if (p) {
      p.textContent =
        data.aboutPreview || '';
    }

    aboutPreview.classList.add(
      'reveal'
    );
  }

  renderAboutSections();


  // ═════════════════════════════════════
  // OTHER SECTIONS
  // ═════════════════════════════════════

  renderMessages();

  renderBooks();

  renderVerses();

  renderEvents();


  // ═════════════════════════════════════
  // CUSTOM SECTIONS (admin-managed)
  // ═════════════════════════════════════

  renderCustomSections();


  // ═════════════════════════════════════
  // CONTACT
  // ═════════════════════════════════════

  if ($('contactHeading')) {
    $('contactHeading').textContent =
      data.contact?.heading ||
      'Get in Touch';
  }

  if ($('contactSub')) {
    $('contactSub').textContent =
      data.contact?.subtext ||
      'Reach out via WhatsApp';
  }


  // ═════════════════════════════════════
  // WHATSAPP
  // ═════════════════════════════════════

  const waBtn = $('whatsappBtn');

  if (waBtn && data.site?.whatsapp) {

    waBtn.href =
      `https://wa.me/${data.site.whatsapp}`;

    const span =
      waBtn.querySelector('span');

    if (span) {
      span.textContent =
        data.site.displayPhone ||
        'Chat on WhatsApp';
    }
  }


  // ═════════════════════════════════════
  // SOCIAL LINKS
  // ═════════════════════════════════════

  renderSocialLinks();


  // ═════════════════════════════════════
  // FOOTER
  // ═════════════════════════════════════

  if ($('footerText')) {
    $('footerText').textContent =
      data.site?.footer ||
      `© ${new Date().getFullYear()} ${
        data.site?.ministry || 'HOLEPIC'
      }. All rights reserved.`;
  }

  if ($('footerEmail')) {
    $('footerEmail').textContent =
      data.site?.email || '';
  }

  if ($('footerLocation')) {
    $('footerLocation').textContent =
      data.site?.location || '';
  }
}


// ═══════════════════════════════════════
// TYPING EFFECT
// ═══════════════════════════════════════

function typeText(el, text, speed = 50) {

  let i = 0;

  const cursor =
    document.createElement('span');

  cursor.className =
    'typing-cursor';

  el.appendChild(cursor);

  function type() {

    if (i < text.length) {

      cursor.before(
        document.createTextNode(
          text.charAt(i)
        )
      );

      i++;

      setTimeout(type, speed);

    } else {

      cursor.remove();
    }
  }

  type();
}


// ═══════════════════════════════════════
// ABOUT SECTIONS
// ═══════════════════════════════════════

function renderAboutSections() {

  const grid = $('aboutGrid');

  if (!grid) return;

  grid.innerHTML = '';

  if (!Array.isArray(data.aboutSections) ||
      !data.aboutSections.length) {

    return;
  }

  const icons = [
    '🌟',
    '📖',
    '🔥',
    '💒',
    '✝️',
    '📜',
    '🕊️',
    '🙏'
  ];

  data.aboutSections.forEach((section, i) => {

    const card =
      document.createElement('div');

    card.className =
      'about-card reveal';

    card.style.transitionDelay =
      `${i * 0.1}s`;

    card.innerHTML = `
      <div class="card-icon">
        ${icons[i % icons.length]}
      </div>

      <h3>
        ${escHtml(section.heading)}
      </h3>

      <p>
        ${escHtml(section.body)}
      </p>
    `;

    grid.appendChild(card);
  });
}


// ═══════════════════════════════════════
// CUSTOM SECTIONS (admin-managed)
// ═══════════════════════════════════════

const SECTION_ANCHORS = {
  afterHero: 'hero',
  afterAbout: 'about',
  afterMessages: 'messages',
  afterBooks: 'books',
  afterVerses: 'verses',
  afterEvents: 'events',
  beforeContact: 'contact'
};

function slugify(text) {
  return 'sec-' + String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'sec-' + Math.random().toString(36).slice(2, 7);
}

function renderCustomSections() {

  if (!Array.isArray(data.sections) ||
      !data.sections.length) {

    return;
  }

  const navLinks = $('navLinks');

  data.sections.forEach((section) => {

    if (!section.title) return;

    const anchorId =
      SECTION_ANCHORS[section.placement] || 'events';

    const anchorEl =
      document.getElementById(anchorId);

    if (!anchorEl) return;

    const secId = slugify(section.title);

    // Build the section element
    const sectionEl = document.createElement('section');
    sectionEl.id = secId;
    sectionEl.className = 'section';

    sectionEl.innerHTML = `
      <div class="container">
        <div class="section-header">
          <span class="section-tag">HOLEPIC</span>
          <h2 class="section-title">${escHtml(section.title)}</h2>
          <div class="section-divider"><span></span></div>
        </div>
        ${
          section.image
            ? `<div class="section-image reveal" style="text-align:center;margin-bottom:1.5rem;">
                 <img src="${escHtml(section.image)}" alt="${escHtml(section.title)}"
                      loading="lazy"
                      style="max-width:100%;border-radius:16px;" />
               </div>`
            : ''
        }
        ${
          section.body
            ? `<p class="reveal" style="max-width:800px;margin:0 auto 1.5rem;line-height:1.8;">
                 ${escHtml(section.body)}
               </p>`
            : ''
        }
        ${
          section.buttonText
            ? `<div style="text-align:center;" class="reveal">
                 <a href="${escHtml(section.buttonLink || '#')}"
                    class="btn-primary" target="_blank" rel="noopener">
                   <span>${escHtml(section.buttonText)}</span>
                 </a>
               </div>`
            : ''
        }
      </div>
    `;

    // Insert AFTER the anchor (or BEFORE if beforeContact)
    if (section.placement === 'beforeContact') {
      anchorEl.parentNode.insertBefore(sectionEl, anchorEl);
    } else {
      anchorEl.parentNode.insertBefore(sectionEl, anchorEl.nextSibling);
    }

    // Add nav link
    if (navLinks) {
      const a = document.createElement('a');
      a.href = '#' + secId;
      a.textContent = section.title;
      a.addEventListener('click', () => {
        $('hamburger')?.classList.remove('active');
        navLinks.classList.remove('open');
      });
      navLinks.appendChild(a);
    }
  });
}


// ═══════════════════════════════════════
// MESSAGES
// ═══════════════════════════════════════

function renderMessages() {

  const grid = $('messagesGrid');

  if (!grid) return;

  grid.innerHTML = '';

  if (!Array.isArray(data.messages) ||
      !data.messages.length) {

    grid.innerHTML =
      '<p class="empty-state">No messages available yet.</p>';

    return;
  }

  data.messages.forEach((msg, i) => {

    const card =
      document.createElement('a');

    const youtubeId =
      msg.youtubeId || '';

    const thumb =
      youtubeId
        ? `https://img.youtube.com/vi/${encodeURIComponent(youtubeId)}/hqdefault.jpg`
        : '';

    card.href =
      youtubeId
        ? `https://youtube.com/watch?v=${encodeURIComponent(youtubeId)}`
        : '#';

    card.target = '_blank';

    card.rel = 'noopener noreferrer';

    card.className =
      'msg-card reveal';

    card.style.transitionDelay =
      `${i * 0.08}s`;

    const date =
      formatDate(msg.date);

    card.innerHTML = `
      <div class="msg-thumb">

        ${
          thumb
            ? `<img
                src="${thumb}"
                alt="${escHtml(msg.title)}"
                loading="lazy"
              />`
            : ''
        }

        <div class="play-overlay">
          <div class="play-icon">▶</div>
        </div>

      </div>

      <div class="msg-info">

        <h4>
          ${escHtml(msg.title)}
        </h4>

        ${
          date
            ? `<span class="msg-date">${date}</span>`
            : ''
        }

      </div>
    `;

    grid.appendChild(card);
  });
}


// ═══════════════════════════════════════
// BOOKS
// ═══════════════════════════════════════

function renderBooks() {

  const grid = $('booksGrid');

  if (!grid) return;

  grid.innerHTML = '';

  if (!Array.isArray(data.books) ||
      !data.books.length) {

    grid.innerHTML =
      '<p class="empty-state">No books available yet.</p>';

    return;
  }

  data.books.forEach((book, i) => {

    const card =
      document.createElement('div');

    card.className =
      'book-card reveal';

    card.style.transitionDelay =
      `${i * 0.1}s`;

    const img =
      book.image ||
      'https://placehold.co/400x300/E5E7EB/9CA3AF?text=Book';

    card.innerHTML = `
      <div class="book-cover">

        <img
          src="${escHtml(img)}"
          alt="${escHtml(book.title)}"
          loading="lazy"
        />

      </div>

      <div class="book-info">

        <h3>
          ${escHtml(book.title)}
        </h3>

        ${
          book.subtitle
            ? `<p class="book-subtitle">
                ${escHtml(book.subtitle)}
              </p>`
            : ''
        }

        ${
          book.description
            ? `<p>
                ${escHtml(book.description)}
              </p>`
            : ''
        }

        <div class="book-meta">

          ${
            book.amazon
              ? `<a
                  href="${escHtml(book.amazon)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📚 Buy on Amazon
                </a>`
              : ''
          }

          ${
            book.pdf
              ? `<a
                  href="${escHtml(book.pdf)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📄 Download PDF
                </a>`
              : ''
          }

          ${
            book.year
              ? `<span style="
                  font-size:0.78rem;
                  color:var(--text-muted);
                  margin-left:auto;
                ">
                  ${escHtml(book.year)}
                </span>`
              : ''
          }

        </div>

      </div>
    `;

    grid.appendChild(card);
  });
}


// ═══════════════════════════════════════
// VERSES
// ═══════════════════════════════════════

function renderVerses() {

  const grid = $('versesGrid');

  if (!grid) return;

  grid.innerHTML = '';

  if (!Array.isArray(data.verses) ||
      !data.verses.length) {

    grid.innerHTML =
      '<p class="empty-state">No verses added yet.</p>';

    return;
  }

  data.verses.forEach((verse, i) => {

    const card =
      document.createElement('div');

    card.className =
      `verse-card reveal${
        verse.featured
          ? ' featured'
          : ''
      }`;

    card.style.transitionDelay =
      `${i * 0.08}s`;

    card.innerHTML = `
      <div class="quote-mark">
        "
      </div>

      <p class="verse-text">
        ${escHtml(verse.text)}
      </p>

      <cite class="verse-ref">
        — ${escHtml(verse.ref)}
      </cite>

      ${
        verse.featured
          ? '<span class="verse-badge">Featured</span>'
          : ''
      }

      ${
        verse.category
          ? `<span style="
              display:block;
              font-size:0.7rem;
              color:var(--text-muted);
              margin-top:0.75rem;
              text-transform:capitalize;
            ">
              #${escHtml(verse.category)}
            </span>`
          : ''
      }
    `;

    grid.appendChild(card);
  });
}


// ═══════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════

function renderEvents() {

  const list = $('eventsList');

  if (!list) return;

  list.innerHTML = '';

  if (!Array.isArray(data.events) ||
      !data.events.length) {

    list.innerHTML =
      '<p class="empty-state">No upcoming events at this time.</p>';

    return;
  }

  data.events.forEach((event, i) => {

    if (!event.date) return;

    const date =
      parseDate(event.date);

    if (!date) return;

    const month =
      date.toLocaleDateString(
        'en-US',
        { month: 'short' }
      );

    const day =
      date.getDate();

    const card =
      document.createElement('div');

    card.className =
      'event-card reveal';

    card.style.transitionDelay =
      `${i * 0.1}s`;

    const timeHtml =
      event.time
        ? `<span>🕐 ${escHtml(event.time)}</span>`
        : '';

    const locationHtml =
      event.location
        ? `<span>📍 ${escHtml(event.location)}</span>`
        : '';

    card.innerHTML = `
      <div class="event-date-box">

        <span class="month">
          ${month}
        </span>

        <span class="day">
          ${day}
        </span>

      </div>

      <div class="event-info">

        <h3>
          ${escHtml(event.title)}
        </h3>

        <div class="event-details">

          ${timeHtml}

          ${locationHtml}

        </div>

        ${
          event.description
            ? `<p>
                ${escHtml(event.description)}
              </p>`
            : ''
        }

        ${
          event.registrationLink
            ? `<a
                href="${escHtml(event.registrationLink)}"
                target="_blank"
                rel="noopener noreferrer"
                class="event-link"
              >
                📝 Register Now →
              </a>`
            : ''
        }

      </div>
    `;

    list.appendChild(card);
  });

  if (!list.children.length) {

    list.innerHTML =
      '<p class="empty-state">No upcoming events at this time.</p>';
  }
}


// ═══════════════════════════════════════
// SOCIAL LINKS
// ═══════════════════════════════════════

function renderSocialLinks() {

  const container =
    $('socialLinks');

  if (!container) return;

  container.innerHTML = '';

  const links = [
    {
      url: data.site?.youtube,
      label: 'YouTube',
      svg: `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 5.545 16.297 5.545 12 5.545s-7.505 0-9.376.505A3.016 3.016 0 00.502 8.186C0 10.057 0 12 0 12s0 1.943.502 3.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.015 3.015 0 002.122-2.136C24 13.943 24 12 24 12s0-1.943-.502-3.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      `
    },
    {
      url: data.site?.facebook,
      label: 'Facebook',
      svg: `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      `
    },
    {
      url: data.site?.instagram,
      label: 'Instagram',
      svg: `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      `
    },
    {
      url: data.site?.x,
      label: 'X (Twitter)',
      svg: `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      `
    }
  ];

  links.forEach(link => {

    if (!link.url) return;

    const a =
      document.createElement('a');

    a.href = link.url;

    a.target = '_blank';

    a.rel =
      'noopener noreferrer';

    a.title = link.label;

    a.setAttribute(
      'aria-label',
      link.label
    );

    a.innerHTML = link.svg;

    container.appendChild(a);
  });
}


// ═══════════════════════════════════════
// SCROLL REVEAL
// ═══════════════════════════════════════

function initRevealObserver() {

  if (!('IntersectionObserver' in window)) {

    document
      .querySelectorAll('.reveal')
      .forEach(el =>
        el.classList.add('visible')
      );

    return;
  }

  const observer =
    new IntersectionObserver(
      (entries) => {

        entries.forEach(entry => {

          if (entry.isIntersecting) {

            entry.target.classList.add(
              'visible'
            );

            observer.unobserve(
              entry.target
            );
          }

        });

      },
      {
        threshold: 0.1,
        rootMargin:
          '0px 0px -50px 0px'
      }
    );

  document
    .querySelectorAll('.reveal')
    .forEach(el =>
      observer.observe(el)
    );
}


// ═══════════════════════════════════════
// NAVIGATION SCROLL
// ═══════════════════════════════════════

function initNavScroll() {

  const nav =
    document.querySelector('.glass-nav');

  if (!nav) return;

  const updateNav =
    () => {
      nav.classList.toggle(
        'scrolled',
        window.scrollY > 50
      );
    };

  updateNav();

  window.addEventListener(
    'scroll',
    updateNav,
    { passive: true }
  );
}


// ═══════════════════════════════════════
// HAMBURGER MENU
// ═══════════════════════════════════════

function initHamburger() {

  const ham =
    $('hamburger');

  const links =
    $('navLinks');

  if (!ham || !links) return;

  ham.addEventListener(
    'click',
    () => {

      ham.classList.toggle(
        'active'
      );

      links.classList.toggle(
        'open'
      );

    }
  );

  links
    .querySelectorAll('a')
    .forEach(a => {

      a.addEventListener(
        'click',
        () => {

          ham.classList.remove(
            'active'
          );

          links.classList.remove(
            'open'
          );

        }
      );

    });

  document.addEventListener(
    'click',
    (event) => {

      if (
        !ham.contains(event.target) &&
        !links.contains(event.target)
      ) {

        ham.classList.remove(
          'active'
        );

        links.classList.remove(
          'open'
        );
      }

    }
  );
}


// ═══════════════════════════════════════
// DATE HELPERS
// ═══════════════════════════════════════

function parseDate(value) {

  if (!value) return null;

  const date =
    new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}


function formatDate(value) {

  const date =
    parseDate(value);

  if (!date) return '';

  return date.toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
  );
}


// ═══════════════════════════════════════
// HTML ESCAPE
// ═══════════════════════════════════════

function escHtml(value) {

  if (
    value === undefined ||
    value === null
  ) {
    return '';
  }

  const div =
    document.createElement('div');

  div.textContent =
    String(value);

  return div.innerHTML;
}
