/* ═══════════════════════════════════════
   Admin Panel v2 — Full Manager Dashboard
   ═══════════════════════════════════════ */

const ADMIN_PIN = '202608'; // ← CHANGE THIS TO YOUR OWN 6-DIGIT PIN
const DATA_URL = '../data.json';

// ── DOM ──
const $ = (id) => document.getElementById(id);
let data = null;

// ── Auth ──
function checkAuth() {
  const authed = sessionStorage.getItem('admin_authed');
  if (authed === 'true') showDashboard();
}

$('loginBtn').addEventListener('click', () => {
  const pin = $('pinInput').value.trim();
  if (pin === ADMIN_PIN) {
    sessionStorage.setItem('admin_authed', 'true');
    showDashboard();
  } else {
    $('loginError').textContent = '❌ Incorrect PIN. Try again.';
    $('pinInput').value = '';
    $('pinInput').focus();
  }
});

$('pinInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') $('loginBtn').click();
});

$('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('admin_authed');
  location.reload();
});

function showDashboard() {
  $('loginOverlay').classList.add('hidden');
  loadData();
}

// ── Sidebar Navigation ──
function initSidebar() {
  document.querySelectorAll('.sidebar-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById('panel-' + btn.dataset.panel);
      if (panel) panel.classList.add('active');
      const sidebar = document.getElementById('adminSidebar');
      if (sidebar) sidebar.classList.remove('open');
    });
  });
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('adminSidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
}

// ── Load Data ──
async function loadData() {
  try {
    const res = await fetch(DATA_URL + '?t=' + Date.now());
    if (!res.ok) throw new Error('Failed to load');
    data = await res.json();
    initSidebar();
    populateForms();
  } catch (e) {
    console.error(e);
    data = getDefaultData();
    populateForms();
  }
}

function getDefaultData() {
  return {
    site: {}, hero: {}, aboutPreview: '', aboutImage: '', aboutImageAlt: '', aboutSections: [],
    messages: [], books: [], verses: [], events: [],
    uploads: [], contact: {}, seo: {}
  };
}

// ── Populate Forms ──
function populateForms() {
  if (!data) return;

  // Site
  $('ad-name').value = data.site?.name || '';
  $('ad-title').value = data.site?.title || '';
  $('ad-tagline').value = data.site?.tagline || '';
  $('ad-location').value = data.site?.location || '';
  $('ad-whatsapp').value = data.site?.whatsapp || '';
  $('ad-displayPhone').value = data.site?.displayPhone || '';
  $('ad-email').value = data.site?.email || '';
  $('ad-footer').value = data.site?.footer || '';
  $('ad-ogImage').value = data.site?.ogImage || '';
  $('ad-youtube').value = data.site?.youtube || '';
  $('ad-facebook').value = data.site?.facebook || '';
  $('ad-instagram').value = data.site?.instagram || '';
  $('ad-x').value = data.site?.x || '';
  $('ad-seoDesc').value = data.seo?.description || '';
  $('ad-seoKeywords').value = data.seo?.keywords || '';
  $('ad-ga').value = data.seo?.googleAnalytics || '';

  // Hero
  $('ad-heroTitle').value = data.hero?.title || '';
  $('ad-heroSubtitle').value = data.hero?.subtitle || '';
  $('ad-verseText').value = data.hero?.verseText || '';
  $('ad-verseRef').value = data.hero?.verseRef || '';
  $('ad-ctaText').value = data.hero?.ctaText || '';
  $('ad-ctaLink').value = data.hero?.ctaLink || '';
  $('ad-heroImage').value = data.hero?.image || '';
  $('ad-heroImageAlt').value = data.hero?.imageAlt || '';

  // About
  $('ad-aboutPreview').value = data.aboutPreview || '';
  $('ad-aboutImage').value = data.aboutImage || '';
  $('ad-aboutImageAlt').value = data.aboutImageAlt || '';

  renderAboutList();
  renderMessagesList();
  renderBooksList();
  renderVersesList();
  renderEventsList();
  renderUploadsList();
}

// ═══ ABOUT SECTIONS ═══
function renderAboutList() {
  const list = $('aboutAdminList');
  const count = $('aboutCount');
  if (!list) return;
  list.innerHTML = '';
  const items = data.aboutSections || [];
  count.textContent = items.length;
  if (!items.length) {
    list.innerHTML = '<p style="color:#64748B;font-size:0.82rem;">No sections yet.</p>';
    return;
  }
  items.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'item-admin';
    div.innerHTML = `
      <div class="item-info">
        <div class="item-title">${escHtml(s.heading)}</div>
        <div class="item-sub">${escHtml(s.body).slice(0, 80)}${s.body?.length > 80 ? '...' : ''}</div>
      </div>
      <button class="btn-remove" data-index="${i}">&times;</button>`;
    div.querySelector('.btn-remove').addEventListener('click', () => {
      data.aboutSections.splice(i, 1);
      renderAboutList();
    });
    list.appendChild(div);
  });
}

$('addAboutBtn')?.addEventListener('click', () => {
  const h = $('newAboutHeading').value.trim();
  const b = $('newAboutBody').value.trim();
  if (!h && !b) return;
  if (!data.aboutSections) data.aboutSections = [];
  data.aboutSections.push({ heading: h || 'New Section', body: b || '' });
  $('newAboutHeading').value = '';
  $('newAboutBody').value = '';
  renderAboutList();
});

// ═══ MESSAGES ═══
function renderMessagesList() {
  const list = $('messagesAdminList');
  const count = $('msgCount');
  if (!list) return;
  list.innerHTML = '';
  const items = data.messages || [];
  count.textContent = items.length;
  if (!items.length) {
    list.innerHTML = '<p style="color:#64748B;font-size:0.82rem;">No messages yet.</p>';
    return;
  }
  items.forEach((m, i) => {
    const div = document.createElement('div');
    div.className = 'item-admin';
    div.innerHTML = `
      <div class="item-info">
        <div class="item-title">${escHtml(m.title)}</div>
        <div class="item-sub">${m.date || 'no date'} ${m.youtubeId ? '· ID: ' + m.youtubeId : ''}</div>
      </div>
      <button class="btn-remove" data-index="${i}">&times;</button>`;
    div.querySelector('.btn-remove').addEventListener('click', () => {
      data.messages.splice(i, 1);
      renderMessagesList();
    });
    list.appendChild(div);
  });
}

$('addMsgBtn')?.addEventListener('click', () => {
  const title = $('newMsgTitle').value.trim();
  const ytId = $('newMsgId').value.trim();
  if (!title && !ytId) return;
  if (!data.messages) data.messages = [];
  const maxId = data.messages.reduce((max, m) => Math.max(max, m.id || 0), 0);
  data.messages.push({
    id: maxId + 1,
    title: title || 'New Message',
    youtubeId: ytId || '',
    date: new Date().toISOString().slice(0, 10)
  });
  $('newMsgTitle').value = '';
  $('newMsgId').value = '';
  renderMessagesList();
});

// ═══ BOOKS ═══
function renderBooksList() {
  const list = $('booksAdminList');
  const count = $('bookCount');
  if (!list) return;
  list.innerHTML = '';
  const items = data.books || [];
  count.textContent = items.length;
  if (!items.length) {
    list.innerHTML = '<p style="color:#64748B;font-size:0.82rem;">No books yet.</p>';
    return;
  }
  items.forEach((b, i) => {
    const div = document.createElement('div');
    div.className = 'item-admin';
    div.innerHTML = `
      <div class="item-info">
        <div class="item-title">${escHtml(b.title)}</div>
        <div class="item-sub">${b.year || ''} ${b.amazon ? '· Amazon ✓' : ''}</div>
      </div>
      <button class="btn-remove" data-index="${i}">&times;</button>`;
    div.querySelector('.btn-remove').addEventListener('click', () => {
      data.books.splice(i, 1);
      renderBooksList();
    });
    list.appendChild(div);
  });
}

$('addBookBtn')?.addEventListener('click', () => {
  const title = $('newBookTitle').value.trim();
  if (!title) return alert('Enter a book title.');
  if (!data.books) data.books = [];
  const maxId = data.books.reduce((max, b) => Math.max(max, b.id || 0), 0);
  data.books.push({
    id: maxId + 1,
    title,
    subtitle: $('newBookSub').value.trim(),
    description: $('newBookDesc').value.trim(),
    image: $('newBookImage').value.trim() || '',
    amazon: $('newBookAmazon').value.trim(),
    pdf: $('newBookPdf').value.trim(),
    year: new Date().getFullYear().toString()
  });
  ['newBookTitle','newBookSub','newBookImage','newBookDesc','newBookAmazon','newBookPdf'].forEach(id => $(id).value = '');
  renderBooksList();
});

// ═══ VERSES ═══
function renderVersesList() {
  const list = $('versesAdminList');
  const count = $('verseCount');
  if (!list) return;
  list.innerHTML = '';
  const items = data.verses || [];
  count.textContent = items.length;
  if (!items.length) {
    list.innerHTML = '<p style="color:#64748B;font-size:0.82rem;">No verses yet.</p>';
    return;
  }
  items.forEach((v, i) => {
    const div = document.createElement('div');
    div.className = 'item-admin';
    div.innerHTML = `
      <div class="item-info">
        <div class="item-title">${escHtml(v.ref) || 'No ref'}</div>
        <div class="item-sub">${escHtml(v.text).slice(0, 60)}${v.text?.length > 60 ? '...' : ''} ${v.featured ? '⭐' : ''}</div>
      </div>
      <button class="btn-remove" data-index="${i}">&times;</button>`;
    div.querySelector('.btn-remove').addEventListener('click', () => {
      data.verses.splice(i, 1);
      renderVersesList();
    });
    list.appendChild(div);
  });
}

$('addVerseBtn')?.addEventListener('click', () => {
  const text = $('newVerseText').value.trim();
  const ref = $('newVerseRef').value.trim();
  if (!text && !ref) return alert('Enter verse text or reference.');
  if (!data.verses) data.verses = [];
  const maxId = data.verses.reduce((max, v) => Math.max(max, v.id || 0), 0);
  data.verses.push({
    id: maxId + 1,
    text: text || 'Scripture text...',
    ref: ref || 'Unknown',
    category: $('newVerseCategory').value.trim() || '',
    featured: $('newVerseFeatured').checked
  });
  $('newVerseText').value = '';
  $('newVerseRef').value = '';
  $('newVerseCategory').value = '';
  $('newVerseFeatured').checked = false;
  renderVersesList();
});

// ═══ EVENTS ═══
function renderEventsList() {
  const list = $('eventsAdminList');
  const count = $('eventCount');
  if (!list) return;
  list.innerHTML = '';
  const items = data.events || [];
  count.textContent = items.length;
  if (!items.length) {
    list.innerHTML = '<p style="color:#64748B;font-size:0.82rem;">No events yet.</p>';
    return;
  }
  items.forEach((ev, i) => {
    const div = document.createElement('div');
    div.className = 'item-admin';
    const d = ev.date ? new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'no date';
    div.innerHTML = `
      <div class="item-info">
        <div class="item-title">${escHtml(ev.title)}</div>
        <div class="item-sub">${d} · ${escHtml(ev.location || 'TBD')}</div>
      </div>
      <button class="btn-remove" data-index="${i}">&times;</button>`;
    div.querySelector('.btn-remove').addEventListener('click', () => {
      data.events.splice(i, 1);
      renderEventsList();
    });
    list.appendChild(div);
  });
}

$('addEventBtn')?.addEventListener('click', () => {
  const title = $('newEventTitle').value.trim();
  const date = $('newEventDate').value;
  if (!title) return alert('Enter an event title.');
  if (!data.events) data.events = [];
  const maxId = data.events.reduce((max, e) => Math.max(max, e.id || 0), 0);
  data.events.push({
    id: maxId + 1,
    title,
    date: date || new Date().toISOString().slice(0, 10),
    endDate: $('newEventEnd').value || '',
    time: $('newEventTime').value.trim(),
    location: $('newEventLocation').value.trim(),
    description: $('newEventDesc').value.trim(),
    registrationLink: $('newEventReg').value.trim()
  });
  ['newEventTitle','newEventDate','newEventEnd','newEventTime','newEventLocation','newEventDesc','newEventReg'].forEach(id => $(id).value = '');
  renderEventsList();
});

// ═══ UPLOADS ═══
function renderUploadsList() {
  const list = $('uploadsAdminList');
  const count = $('uploadCount');
  if (!list) return;
  list.innerHTML = '';
  const items = data.uploads || [];
  count.textContent = items.length;
  if (!items.length) {
    list.innerHTML = '<p style="color:#64748B;font-size:0.82rem;">No uploads yet.</p>';
    return;
  }
  items.forEach((u, i) => {
    const div = document.createElement('div');
    div.className = 'item-admin';
    const typeIcon = u.type === 'pdf' ? '📄' : u.type === 'image' ? '🖼️' : u.type === 'audio' ? '🎵' : u.type === 'video' ? '🎬' : '📁';
    div.innerHTML = `
      <div class="upload-thumb">${typeIcon}</div>
      <div class="item-info">
        <div class="item-title">${escHtml(u.name)}</div>
        <div class="item-sub">${u.type?.toUpperCase() || 'FILE'} · ${u.size || 'Unknown size'} · ${escHtml(u.category || 'General')}</div>
      </div>
      <button class="btn-remove" data-index="${i}">&times;</button>`;
    div.querySelector('.btn-remove').addEventListener('click', () => {
      data.uploads.splice(i, 1);
      renderUploadsList();
    });
    list.appendChild(div);
  });
}

$('addUploadBtn')?.addEventListener('click', () => {
  const name = $('newUploadName').value.trim();
  const url = $('newUploadUrl').value.trim();
  if (!name) return alert('Enter a file name.');
  if (!data.uploads) data.uploads = [];
  const maxId = data.uploads.reduce((max, u) => Math.max(max, u.id || 0), 0);
  data.uploads.push({
    id: maxId + 1,
    name,
    type: $('newUploadType').value,
    url: url || '',
    size: '—',
    category: $('newUploadCategory').value.trim() || 'resource',
    description: $('newUploadDesc').value.trim()
  });
  $('newUploadName').value = '';
  $('newUploadUrl').value = '';
  $('newUploadCategory').value = '';
  $('newUploadDesc').value = '';
  renderUploadsList();
});

// ═══ GATHER FORM DATA (FIXED) ═══
function gatherFormData() {
  const site = {
    name: $('ad-name').value,
    title: $('ad-title').value || $('ad-name').value + ' — Grace Assembly Ministries',
    ministry: $('ad-name').value,
    tagline: $('ad-tagline').value,
    location: $('ad-location').value,
    whatsapp: $('ad-whatsapp').value,
    displayPhone: $('ad-displayPhone').value,
    email: $('ad-email').value,
    youtube: $('ad-youtube').value,
    facebook: $('ad-facebook').value,
    instagram: $('ad-instagram').value,
    x: $('ad-x').value,
    footer: $('ad-footer').value || `© ${new Date().getFullYear()} ${$('ad-name').value || 'Grace Assembly Ministries'}. All rights reserved.`,
    ogImage: $('ad-ogImage').value
  };

  return {
    site,
    hero: {
      title: $('ad-heroTitle').value,
      subtitle: $('ad-heroSubtitle').value,
      verseText: $('ad-verseText').value,
      verseRef: $('ad-verseRef').value,
      ctaText: $('ad-ctaText').value || 'Watch Messages',
      ctaLink: $('ad-ctaLink').value || '#messages',
      image: $('ad-heroImage').value,
      imageAlt: $('ad-heroImageAlt').value || 'Apostle Gabriel Olu Akintan'
    },
    aboutPreview: $('ad-aboutPreview').value,
    aboutImage: $('ad-aboutImage').value,
    aboutImageAlt: $('ad-aboutImageAlt').value || 'Apostle Gabriel Olu Akintan',
    aboutSections: data.aboutSections || [],
    messages: data.messages || [],
    books: data.books || [],
    verses: data.verses || [],
    events: data.events || [],
    uploads: data.uploads || [],
    contact: {
      heading: 'Get in Touch',
      subtext: 'Reach out via WhatsApp messages only'
    },
    seo: {
      description: $('ad-seoDesc').value,
      keywords: $('ad-seoKeywords').value,
      googleAnalytics: $('ad-ga').value
    }
  };
}

// ═══ PREVIEW ═══
$('previewBtn').addEventListener('click', () => {
  const formData = gatherFormData();
  const json = JSON.stringify(formData, null, 2);
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(`
      <!DOCTYPE html><html><head><title>Preview — data.json</title>
      <style>
        body { font-family: 'Courier New', monospace; background: #0f172a; color: #e2e8f0; padding: 2rem; }
        pre { white-space: pre-wrap; word-break: break-word; }
        .info { background: #1e293b; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-family: system-ui, sans-serif; }
      </style></head><body>
      <div class="info">
        <strong>📋 Preview — data.json</strong> &middot;
        <span style="color:#94a3b8;">${json.length.toLocaleString()} bytes</span>
      </div>
      <pre>${escHtml(json)}</pre></body></html>
    `);
  }
});

// ═══ PUBLISH ═══
$('publishBtn').addEventListener('click', async () => {
  const formData = gatherFormData();
  const btn = $('publishBtn');
  btn.disabled = true;
  btn.innerHTML = '<span>⏳</span><span>Publishing...</span>';

  try {
    const res = await fetch('/.netlify/functions/updateJson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: formData })
    });
    const result = await res.json();
    if (res.ok && result.success) {
      showStatus('✅ Published! Site will auto-rebuild.', 'success');
      data = formData;
    } else {
      showStatus('❌ ' + (result.error || 'Publish failed.'), 'error');
      console.error(result);
    }
  } catch (err) {
    showStatus('❌ Network error: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>📤</span><span>Publish Changes</span>';
  }
});

// ═══ STATUS TOAST ═══
function showStatus(msg, type) {
  const existing = document.querySelector('.publish-status');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = `publish-status ${type}`;
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div?.remove(), 4000);
}

// ═══ UTILITY ═══
function escHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ═══ INIT ═══
checkAuth();   
  renderAboutList();

  // Messages
  renderMessagesList();

  // Books
  renderBooksList();

  // Verses
  renderVersesList();

  // Events
  renderEventsList();

  // Uploads
  renderUploadsList();
}

// ═══ ABOUT SECTIONS ═══
function renderAboutList() {
  const list = $('aboutAdminList');
  const count = $('aboutCount');
  if (!list) return;
  list.innerHTML = '';
  const items = data.aboutSections || [];
  count.textContent = items.length;
  if (!items.length) {
    list.innerHTML = '<p style="color:#64748B;font-size:0.82rem;">No sections yet.</p>';
    return;
  }
  items.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'item-admin';
    div.innerHTML = `
      <div class="item-info">
        <div class="item-title">${escHtml(s.heading)}</div>
        <div class="item-sub">${escHtml(s.body).slice(0, 80)}${s.body?.length > 80 ? '...' : ''}</div>
      </div>
      <button class="btn-remove" data-index="${i}">&times;</button>`;
    div.querySelector('.btn-remove').addEventListener('click', () => {
      data.aboutSections.splice(i, 1);
      renderAboutList();
    });
    list.appendChild(div);
  });
}

$('addAboutBtn')?.addEventListener('click', () => {
  const h = $('newAboutHeading').value.trim();
  const b = $('newAboutBody').value.trim();
  if (!h && !b) return;
  if (!data.aboutSections) data.aboutSections = [];
  data.aboutSections.push({ heading: h || 'New Section', body: b || '' });
  $('newAboutHeading').value = '';
  $('newAboutBody').value = '';
  renderAboutList();
});

// ═══ MESSAGES ═══
function renderMessagesList() {
  const list = $('messagesAdminList');
  const count = $('msgCount');
  if (!list) return;
  list.innerHTML = '';
  const items = data.messages || [];
  count.textContent = items.length;
  if (!items.length) {
    list.innerHTML = '<p style="color:#64748B;font-size:0.82rem;">No messages yet.</p>';
    return;
  }
  items.forEach((m, i) => {
    const div = document.createElement('div');
    div.className = 'item-admin';
    div.innerHTML = `
      <div class="item-info">
        <div class="item-title">${escHtml(m.title)}</div>
        <div class="item-sub">${m.date || 'no date'} ${m.youtubeId ? '· ID: ' + m.youtubeId : ''}</div>
      </div>
      <button class="btn-remove" data-index="${i}">&times;</button>`;
    div.querySelector('.btn-remove').addEventListener('click', () => {
      data.messages.splice(i, 1);
      renderMessagesList();
    });
    list.appendChild(div);
  });
}

$('addMsgBtn')?.addEventListener('click', () => {
  const title = $('newMsgTitle').value.trim();
  const ytId = $('newMsgId').value.trim();
  if (!title && !ytId) return;
  if (!data.messages) data.messages = [];
  const maxId = data.messages.reduce((max, m) => Math.max(max, m.id || 0), 0);
  data.messages.push({
    id: maxId + 1,
    title: title || 'New Message',
    youtubeId: ytId || '',
    date: new Date().toISOString().slice(0, 10)
  });
  $('newMsgTitle').value = '';
  $('newMsgId').value = '';
  renderMessagesList();
});

// ═══ BOOKS ═══
function renderBooksList() {
  const list = $('booksAdminList');
  const count = $('bookCount');
  if (!list) return;
  list.innerHTML = '';
  const items = data.books || [];
  count.textContent = items.length;
  if (!items.length) {
    list.innerHTML = '<p style="color:#64748B;font-size:0.82rem;">No books yet.</p>';
    return;
  }
  items.forEach((b, i) => {
    const div = document.createElement('div');
    div.className = 'item-admin';
    div.innerHTML = `
      <div class="item-info">
        <div class="item-title">${escHtml(b.title)}</div>
        <div class="item-sub">${b.year || ''} ${b.amazon ? '· Amazon ✓' : ''}</div>
      </div>
      <button class="btn-remove" data-index="${i}">&times;</button>`;
    div.querySelector('.btn-remove').addEventListener('click', () => {
      data.books.splice(i, 1);
      renderBooksList();
    });
    list.appendChild(div);
  });
}

$('addBookBtn')?.addEventListener('click', () => {
  const title = $('newBookTitle').value.trim();
  if (!title) return alert('Enter a book title.');
  if (!data.books) data.books = [];
  const maxId = data.books.reduce((max, b) => Math.max(max, b.id || 0), 0);
  data.books.push({
    id: maxId + 1,
    title,
    subtitle: $('newBookSub').value.trim(),
    description: $('newBookDesc').value.trim(),
    image: $('newBookImage').value.trim() || '',
    amazon: $('newBookAmazon').value.trim(),
    pdf: $('newBookPdf').value.trim(),
    year: new Date().getFullYear().toString()
  });
  ['newBookTitle','newBookSub','newBookImage','newBookDesc','newBookAmazon','newBookPdf'].forEach(id => $(id).value = '');
  renderBooksList();
});

// ═══ VERSES ═══
function renderVersesList() {
  const list = $('versesAdminList');
  const count = $('verseCount');
  if (!list) return;
  list.innerHTML = '';
  const items = data.verses || [];
  count.textContent = items.length;
  if (!items.length) {
    list.innerHTML = '<p style="color:#64748B;font-size:0.82rem;">No verses yet.</p>';
    return;
  }
  items.forEach((v, i) => {
    const div = document.createElement('div');
    div.className = 'item-admin';
    div.innerHTML = `
      <div class="item-info">
        <div class="item-title">${escHtml(v.ref) || 'No ref'}</div>
        <div class="item-sub">${escHtml(v.text).slice(0, 60)}${v.text?.length > 60 ? '...' : ''} ${v.featured ? '⭐' : ''}</div>
      </div>
      <button class="btn-remove" data-index="${i}">&times;</button>`;
    div.querySelector('.btn-remove').addEventListener('click', () => {
      data.verses.splice(i, 1);
      renderVersesList();
    });
    list.appendChild(div);
  });
}

$('addVerseBtn')?.addEventListener('click', () => {
  const text = $('newVerseText').value.trim();
  const ref = $('newVerseRef').value.trim();
  if (!text && !ref) return alert('Enter verse text or reference.');
  if (!data.verses) data.verses = [];
  const maxId = data.verses.reduce((max, v) => Math.max(max, v.id || 0), 0);
  data.verses.push({
    id: maxId + 1,
    text: text || 'Scripture text...',
    ref: ref || 'Unknown',
    category: $('newVerseCategory').value.trim() || '',
    featured: $('newVerseFeatured').checked
  });
  $('newVerseText').value = '';
  $('newVerseRef').value = '';
  $('newVerseCategory').value = '';
  $('newVerseFeatured').checked = false;
  renderVersesList();
});

// ═══ EVENTS ═══
function renderEventsList() {
  const list = $('eventsAdminList');
  const count = $('eventCount');
  if (!list) return;
  list.innerHTML = '';
  const items = data.events || [];
  count.textContent = items.length;
  if (!items.length) {
    list.innerHTML = '<p style="color:#64748B;font-size:0.82rem;">No events yet.</p>';
    return;
  }
  items.forEach((ev, i) => {
    const div = document.createElement('div');
    div.className = 'item-admin';
    const d = ev.date ? new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'no date';
    div.innerHTML = `
      <div class="item-info">
        <div class="item-title">${escHtml(ev.title)}</div>
        <div class="item-sub">${d} · ${escHtml(ev.location || 'TBD')}</div>
      </div>
      <button class="btn-remove" data-index="${i}">&times;</button>`;
    div.querySelector('.btn-remove').addEventListener('click', () => {
      data.events.splice(i, 1);
      renderEventsList();
    });
    list.appendChild(div);
  });
}

$('addEventBtn')?.addEventListener('click', () => {
  const title = $('newEventTitle').value.trim();
  const date = $('newEventDate').value;
  if (!title) return alert('Enter an event title.');
  if (!data.events) data.events = [];
  const maxId = data.events.reduce((max, e) => Math.max(max, e.id || 0), 0);
  data.events.push({
    id: maxId + 1,
    title,
    date: date || new Date().toISOString().slice(0, 10),
    endDate: $('newEventEnd').value || '',
    time: $('newEventTime').value.trim(),
    location: $('newEventLocation').value.trim(),
    description: $('newEventDesc').value.trim(),
    registrationLink: $('newEventReg').value.trim()
  });
  ['newEventTitle','newEventDate','newEventEnd','newEventTime','newEventLocation','newEventDesc','newEventReg'].forEach(id => $(id).value = '');
  renderEventsList();
});

// ═══ UPLOADS ═══
function renderUploadsList() {
  const list = $('uploadsAdminList');
  const count = $('uploadCount');
  if (!list) return;
  list.innerHTML = '';
  const items = data.uploads || [];
  count.textContent = items.length;
  if (!items.length) {
    list.innerHTML = '<p style="color:#64748B;font-size:0.82rem;">No uploads yet.</p>';
    return;
  }
  items.forEach((u, i) => {
    const div = document.createElement('div');
    div.className = 'item-admin';
    const typeIcon = u.type === 'pdf' ? '📄' : u.type === 'image' ? '🖼️' : u.type === 'audio' ? '🎵' : u.type === 'video' ? '🎬' : '📁';
    div.innerHTML = `
      <div class="upload-thumb">${typeIcon}</div>
      <div class="item-info">
        <div class="item-title">${escHtml(u.name)}</div>
        <div class="item-sub">${u.type?.toUpperCase() || 'FILE'} · ${u.size || 'Unknown size'} · ${escHtml(u.category || 'General')}</div>
      </div>
      <button class="btn-remove" data-index="${i}">&times;</button>`;
    div.querySelector('.btn-remove').addEventListener('click', () => {
      data.uploads.splice(i, 1);
      renderUploadsList();
    });
    list.appendChild(div);
  });
}

$('addUploadBtn')?.addEventListener('click', () => {
  const name = $('newUploadName').value.trim();
  const url = $('newUploadUrl').value.trim();
  if (!name) return alert('Enter a file name.');
  if (!data.uploads) data.uploads = [];
  const maxId = data.uploads.reduce((max, u) => Math.max(max, u.id || 0), 0);
  data.uploads.push({
    id: maxId + 1,
    name,
    type: $('newUploadType').value,
    url: url || '',
    size: '—',
    category: $('newUploadCategory').value.trim() || 'resource',
    description: $('newUploadDesc').value.trim()
  });
  $('newUploadName').value = '';
  $('newUploadUrl').value = '';
  $('newUploadCategory').value = '';
  $('newUploadDesc').value = '';
  renderUploadsList();
});

// ═══ GATHER FORM DATA ═══
function gatherFormData() {
  const site = {
    name: $('ad-name').value,
    title: $('ad-title').value || $('ad-name').value + ' — Grace Assembly Ministries',
    ministry: $('ad-name').value,
    tagline: $('ad-tagline').value,
    location: $('ad-location').value,
    whatsapp: $('ad-whatsapp').value,
    displayPhone: $('ad-displayPhone').value,
    email: $('ad-email').value,
    youtube: $('ad-youtube').value,
    facebook: $('ad-facebook').value,
    instagram: $('ad-instagram').value,
    x: $('ad-x').value,
    footer: $('ad-footer').value || `© ${new Date().getFullYear()} ${$('ad-name').value || 'Grace Assembly Ministries'}. All rights reserved.`,
    ogImage: $('ad-ogImage').value,
     hero: {
      title: $('ad-heroTitle').value,
      subtitle: $('ad-heroSubtitle').value,
      verseText: $('ad-verseText').value,
      verseRef: $('ad-verseRef').value,
      ctaText: $('ad-ctaText').value || 'Watch Messages',
      ctaLink: $('ad-ctaLink').value || '#messages',
      image: $('ad-heroImage').value,
      imageAlt: $('ad-heroImageAlt').value || 'Apostle Gabriel Olu Akintan'
    }
  };

  return {
    site,
    hero: {
      title: $('ad-heroTitle').value,
      subtitle: $('ad-heroSubtitle').value,
      verseText: $('ad-verseText').value,
      verseRef: $('ad-verseRef').value,
      ctaText: $('ad-ctaText').value || 'Watch Messages',
      ctaLink: $('ad-ctaLink').value || '#messages'
    },
    aboutPreview: $('ad-aboutPreview').value,
     aboutPreview: $('ad-aboutPreview').value,
    aboutImage: $('ad-aboutImage').value,
    aboutImageAlt: $('ad-aboutImageAlt').value || 'Apostle Gabriel Olu Akintan',
    aboutSections: data.aboutSections || [],
    messages: data.messages || [],
    books: data.books || [],
    verses: data.verses || [],
    events: data.events || [],
    uploads: data.uploads || [],
    contact: {
      heading: 'Get in Touch',
      subtext: 'Reach out via WhatsApp messages only'
    },
    seo: {
      description: $('ad-seoDesc').value,
      keywords: $('ad-seoKeywords').value,
      googleAnalytics: $('ad-ga').value
    }
  };
}

// ═══ PREVIEW ═══
$('previewBtn').addEventListener('click', () => {
  const formData = gatherFormData();
  const json = JSON.stringify(formData, null, 2);
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(`
      <!DOCTYPE html><html><head><title>Preview — data.json</title>
      <style>
        body { font-family: 'Courier New', monospace; background: #0f172a; color: #e2e8f0; padding: 2rem; }
        pre { white-space: pre-wrap; word-break: break-word; }
        .info { background: #1e293b; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-family: system-ui, sans-serif; }
      </style></head><body>
      <div class="info">
        <strong>📋 Preview — data.json</strong> &middot;
        <span style="color:#94a3b8;">${json.length.toLocaleString()} bytes</span>
      </div>
      <pre>${escHtml(json)}</pre></body></html>
    `);
  }
});

// ═══ PUBLISH ═══
$('publishBtn').addEventListener('click', async () => {
  const formData = gatherFormData();
  const btn = $('publishBtn');
  btn.disabled = true;
  btn.innerHTML = '<span>⏳</span><span>Publishing...</span>';

  try {
    const res = await fetch('/.netlify/functions/updateJson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: formData })
    });
    const result = await res.json();
    if (res.ok && result.success) {
      showStatus('✅ Published! Site will auto-rebuild.', 'success');
      data = formData;
    } else {
      showStatus('❌ ' + (result.error || 'Publish failed.'), 'error');
      console.error(result);
    }
  } catch (err) {
    showStatus('❌ Network error: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>📤</span><span>Publish Changes</span>';
  }
});

// ═══ STATUS TOAST ═══
function showStatus(msg, type) {
  const existing = document.querySelector('.publish-status');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = `publish-status ${type}`;
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div?.remove(), 4000);
}

// ═══ UTILITY ═══
function escHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ═══ INIT ═══
checkAuth();
