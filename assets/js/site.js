/* ═══════════════════════════════════════
   Site Renderer v3
   Fetches data.json & builds EVERYTHING
   ═══════════════════════════════════════ */

const SITE_DATA_URL = '../data.json';

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
    data.site?.ministry || 'Grace Assembly Ministries';

  const desc =
    data.seo?.description ||
    data.hero?.subtitle ||
    ministry;

  const img =
    data.site?.ogImage ||
    'https://placehold.co/1200x630/065F46/FFFFFF?text=Grace+Assembly';

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
      data.site?.ministry ||
      data.site?.name ||
      '';
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
    'Grace Assembly Ministries';


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
        data.site?.ministry || ''
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
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
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
