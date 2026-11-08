/* Sualtı — demo tətbiq (v3)
   Yeniliklər: Ölkələr (bayraq/paytaxt), QuizUp ilhamlı canlı duel, mövzu səviyyələri və izləmə,
   "Sənin Rifin", "Sabahın sirri", səhv bildir, təkrarsız suallar, paylaşım kartı, yaddaşda saxlama. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const IMG = id => `img/${id}.jpg`;
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fmt = n => Math.round(n).toLocaleString('az-AZ').replace(/[,.]/g, ' ');
  const today = (off = 0) => { const d = new Date(Date.now() + off * 864e5); return d.toISOString().slice(0, 10); };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ── Mövzular ── */
  if (!LENSES.find(l => l.slug === 'olkeler'))
    LENSES.push({ slug: 'olkeler', name: 'Ölkələr', color: '#0EA5E9', flags: ['az', 'jp', 'br', 'ca'] });
  const ALLQ = [...QUESTIONS.map((q, i) => ({ ...q, id: q.id || 'q' + i })), ...makeCountryQuestions()];
  const TOPICS = [
    ...LENSES.map(l => ({ ...l, filter: q => q.lens === l.slug })),
    { slug: 'bayraqlar', name: 'Bayraqlar', color: '#F97316', parent: 'olkeler', flags: ['de', 'kr', 'br', 'gb'], filter: q => q.topic === 'bayraqlar' },
    { slug: 'paytaxtlar', name: 'Paytaxtlar', color: '#6366F1', parent: 'olkeler', flags: ['fr', 'it', 'jp', 'us'], filter: q => q.topic === 'paytaxtlar' },
  ];
  const T = Object.fromEntries(TOPICS.map(t => [t.slug, t]));
  const topicQs = slug => ALLQ.filter(T[slug].filter);
  const TITLES = ['Yeni dalğıc', 'Həvəskar', 'Bilici', 'Usta', 'Ekspert', 'Dahi', 'Əfsanə'];
  function level(xp = 0) {
    const lvl = Math.floor(Math.sqrt(xp / 60)) + 1, cur = 60 * (lvl - 1) ** 2, next = 60 * lvl ** 2;
    return { lvl, title: TITLES[Math.min(TITLES.length - 1, Math.floor((lvl - 1) / 2))], pct: Math.round((xp - cur) / (next - cur) * 100), toNext: next - xp };
  }

  /* ── İkonlar ── */
  const ICON = {
    pearl: `<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#F4F1FF" stroke="#0B2A5B" stroke-width="2"/><circle cx="9" cy="8.5" r="3" fill="#fff"/><path d="M6 15a7 7 0 0 0 11 1" stroke="#C9C2F2" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
    streak: `<svg class="ico" viewBox="0 0 24 24"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z" fill="#FF7A45" stroke="#0B2A5B" stroke-width="2" stroke-linejoin="round"/><path d="M12 13c1 1.5 3 2.5 3 5a3 3 0 0 1-6 0c0-1.5 1-2.5 3-5z" fill="#FFD43B"/></svg>`,
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>`,
    grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><rect x="3" y="3" width="7.5" height="7.5" rx="2.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2.5"/></svg>`,
    trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 13v4M8 21h8M9 17h6"/></svg>`,
    user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/></svg>`,
    reef: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18M7 20v-6a2 2 0 0 1 4 0M11 20v-9a2 2 0 0 1 4 0v9M15 20v-4a2 2 0 0 1 4 0"/><path d="M5 8c2-2 4-2 6 0s4 2 6 0"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="#0B2A5B" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
    back: `<svg viewBox="0 0 24 24" fill="none" stroke="#0B2A5B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>`,
    sound: `<svg viewBox="0 0 24 24" fill="none" stroke="#0B2A5B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#2EC5F5"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>`,
    mute: `<svg viewBox="0 0 24 24" fill="none" stroke="#0B2A5B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#C9D6EA"/><path d="M17 9l5 6M22 9l-5 6"/></svg>`,
    speak: `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#fff"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>`,
    flagRep: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>`,
    tank: `<svg class="ox-ico" viewBox="0 0 24 24"><rect x="7" y="5" width="10" height="17" rx="5" fill="#2EC5F5" stroke="#0B2A5B" stroke-width="2"/><rect x="10" y="1.5" width="4" height="4" rx="1" fill="#0B2A5B"/><rect x="9" y="9" width="2.4" height="8" rx="1.2" fill="#fff" opacity=".7"/></svg>`,
    crown: `<svg class="crown" viewBox="0 0 40 28"><path d="M3 8l8 7 9-12 9 12 8-7-3 18H6z" fill="#FFD43B" stroke="#0B2A5B" stroke-width="2.5" stroke-linejoin="round"/><circle cx="20" cy="17" r="3" fill="#FF7A59"/></svg>`,
    sparkle: `<svg class="sparkle" viewBox="0 0 24 24"><path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12z" fill="#fff"/></svg>`,
    swords: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/><path d="M9.5 6.5L13 3h3v3l-3.5 3.5M5 14l-2 2 3 3 2-2"/></svg>`,
    gem: `<svg viewBox="0 0 24 24"><path d="M6 3h12l4 6-10 12L2 9z" fill="#FFD43B" stroke="#0B2A5B" stroke-width="2" stroke-linejoin="round"/><path d="M2 9h20M9 3 7 9l5 12 5-12-2-6" fill="none" stroke="#0B2A5B" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
    lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`,
  };
  const AV_COLORS = ['#FF7A59', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#14B8A6', '#EF4444'];
  const avatar = (name, i, cls = '') => `<span class="avatar ${cls}" style="background:${AV_COLORS[i % AV_COLORS.length]}">${esc(name.trim()[0])}</span>`;
  const pearlSm = s => ICON.pearl.replace('class="ico"', `style="width:${s}px;height:${s}px"`);

  /* ── Dərinlik zonaları ── */
  const ZONES = [{ name: 'Səth', m: 0 }, { name: 'Mərcan rifi', m: 100 }, { name: 'Alaqaranlıq zonası', m: 300 },
    { name: 'Gecə zonası', m: 1000 }, { name: 'Uçurum', m: 4000 }, { name: 'Mariana', m: 11000 }];
  const zoneOf = d => { let i = 0; while (i < ZONES.length - 1 && d >= ZONES[i + 1].m) i++; return { cur: ZONES[i], next: ZONES[i + 1] }; };

  /* ── Vəziyyət (brauzerdə saxlanılır) ── */
  const KEY = 'sualti-v3';
  const DEFAULT = () => ({
    pearls: 1240, depth: 340, streak: 6, freezes: 2, lastDay: today(-1), weekly: 980, dailyDoneOn: '',
    lensStats: { elm: [14, 11], tarix: [9, 6], cografiya: [12, 10], incesenet: [5, 3], edebiyyat: [8, 6], felsefe: [3, 2], medeniyyet: [10, 8], pop: [6, 5], idman: [4, 2], texnologiya: [7, 6], olkeler: [0, 0] },
    topicXP: { elm: 420, cografiya: 610, tarix: 180, medeniyyet: 300, bayraqlar: 90 },
    follows: ['cografiya', 'bayraqlar', 'elm'], seen: {}, duels: { w: 4, l: 2, d: 0 }, reports: [], league: true,
    plus: false, duelDay: { d: '', n: 0 },
  });
  let S;
  try { S = Object.assign(DEFAULT(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = DEFAULT(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const UI = { screen: 'home', topic: null, quiz: null, duel: null, lb: 'league', streakBumped: false };

  /* ── Təkrarsız sual seçimi: görülməyənlər əvvəl, sonra ən köhnə görülənlər ── */
  function pickQs(pool, n) {
    const fresh = shuffle(pool.filter(q => !S.seen[q.id]));
    const old = pool.filter(q => S.seen[q.id]).sort((a, b) => S.seen[a.id] - S.seen[b.id]);
    return [...fresh, ...old].slice(0, n);
  }
  const markSeen = q => { S.seen[q.id] = Date.now(); };

  /* ── Rif: hər linza bir canlı növü; hər 3 düzgün cavab bir canlı gətirir ── */
  const CREATURE = { elm: 'jelly', tarix: 'shell', cografiya: 'fish', incesenet: 'coral', edebiyyat: 'fish', felsefe: 'jelly',
    medeniyyet: 'coral', pop: 'star', idman: 'fish', texnologiya: 'shell', olkeler: 'star' };
  const CNAME = { jelly: 'meduza', shell: 'balıqqulağı', fish: 'balıq', coral: 'mərcan', star: 'dəniz ulduzu' };
  const reefCount = slug => Math.min(3, Math.floor(((S.lensStats[slug] || [0, 0])[1]) / 3));

  /* ── Gün və seriya (bağışlayan: gündə 1 sual kifayətdir) ── */
  function touchDay() {
    if (S.lastDay === today()) return;
    S.streak = S.lastDay === today(-1) ? S.streak + 1 : 1;
    S.lastDay = today(); UI.streakBumped = true;
  }
  function recordAnswer(q, ok, gainXP) {
    markSeen(q);
    const before = reefCount(q.lens);
    const st = S.lensStats[q.lens] || (S.lensStats[q.lens] = [0, 0]);
    st[0]++; if (ok) st[1]++;
    if (gainXP) { S.topicXP[q.lens] = (S.topicXP[q.lens] || 0) + gainXP; if (q.topic) S.topicXP[q.topic] = (S.topicXP[q.topic] || 0) + gainXP; }
    touchDay(); save();
    if (reefCount(q.lens) > before) later(() => toast(`${creatureSVG(CREATURE[q.lens], T[q.lens].color, 'toast-c')}<span>Rifinə yeni <b>${CNAME[CREATURE[q.lens]]}</b> gəldi!</span>`, 'reef'), 700, true);
  }

  /* ── Fon qabarcıqları ── */
  (function bubbles() {
    const host = $('#bubbles');
    for (let i = 0; i < 26; i++) {
      const b = document.createElement('span'), s = 6 + Math.random() * 26;
      Object.assign(b.style, { left: Math.random() * 100 + '%', width: s + 'px', height: s + 'px', animationDuration: 9 + Math.random() * 14 + 's', animationDelay: -Math.random() * 20 + 's' });
      host.appendChild(b);
    }
  })();
  $('#brandLogo').innerHTML = `${logoMark(84)}<span class="chunky mid" style="font-size:52px">sualtı</span>`;

  /* ── Taymerlər ── */
  let timers = [], tick = null, tLeft = 0;
  const stopTick = () => { clearInterval(tick); tick = null; };
  function later(fn, ms, keep = false) { const id = setTimeout(fn, ms); if (!keep) timers.push(id); return id; }
  function clearTimers() { timers.forEach(id => { clearTimeout(id); clearInterval(id); }); timers = []; stopTick(); }

  /* ── Üst / alt panel ── */
  const FULL = ['quiz', 'result', 'duel'];
  function topbar() {
    const t = $('#topbar');
    if (FULL.includes(UI.screen)) { t.style.display = 'none'; return; }
    t.style.display = '';
    t.innerHTML = `
      <div class="wordmark">${logoMark(40)}<span class="wordmark-text">sual<span class="t2">tı</span></span>${S.plus ? '<span class="plus-badge">PLUS</span>' : ''}</div>
      <div class="pills">
        <button class="pill snd" data-act="sound" aria-label="Səsi aç/bağla">${SFX.on ? ICON.sound : ICON.mute}</button>
        <span class="pill" title="Seriya">${ICON.streak}${S.streak}</span>
        <span class="pill" title="İnci">${ICON.pearl}${fmt(S.pearls)}</span>
      </div>`;
  }
  function tabbar() {
    const tb = $('#tabbar');
    tb.classList.toggle('hidden', FULL.includes(UI.screen));
    const cur = { topic: 'topics', plus: 'profile' }[UI.screen] || UI.screen;
    const tabs = [['home', 'Əsas', ICON.home], ['topics', 'Mövzular', ICON.grid], ['reef', 'Rifim', ICON.reef], ['board', 'Reytinq', ICON.trophy], ['profile', 'Profil', ICON.user]];
    tb.style.gridTemplateColumns = `repeat(${tabs.length}, 1fr)`;
    tb.innerHTML = tabs.map(([k, l, i]) => `<button class="tab ${cur === k ? 'active' : ''}" data-go="${k}">${i}<span>${l}</span></button>`).join('');
  }
  function go(screen, opts = {}) {
    clearTimers(); SFX.stopSpeak();
    if (screen !== UI.screen) SFX.play('swoosh');
    Object.assign(UI, opts); UI.screen = screen; render(); $('#view').scrollTop = 0;
  }
  function render() {
    topbar(); tabbar();
    $('#view').innerHTML = `<div class="screen">${SCREENS[UI.screen]()}</div>`;
    AFTER[UI.screen] && AFTER[UI.screen]();
  }

  /* ── Kiçik komponentlər ── */
  const mosaic = t => t.flags ? `<span class="mosaic">${t.flags.map(c => flagSVG(c)).join('')}</span>` : '';
  function tile(t, i) {
    const n = topicQs(t.slug).length, lv = level(S.topicXP[t.slug]);
    return `<button class="tile ${t.img ? '' : 'has-mosaic'}" data-topic="${t.slug}" style="--c:${t.color};${t.img ? `background-image:url('${IMG(t.img)}');` : ''}animation-delay:${i * 0.04}s">
      ${t.img ? '' : mosaic(t)}
      <span class="tile-ico">${LENS_ICONS[t.slug] || ''}</span>
      <span class="count">Səv. ${lv.lvl}</span>
      <span class="tile-txt"><span class="chunky">${esc(t.name)}</span><span class="tile-n">${n} sual</span></span></button>`;
  }

  /* ── Rif səhnəsi ── */
  function creatureSVG(kind, color, cls = '') {
    const body = {
      fish: `<path d="M6 12c4-6 14-6 18 0-4 6-14 6-18 0z" fill="${color}" stroke="#0B2A5B" stroke-width="1.6"/><path d="M6 12 1 7v10z" fill="${color}" stroke="#0B2A5B" stroke-width="1.6" stroke-linejoin="round"/><circle cx="19" cy="11" r="1.6" fill="#0B2A5B"/>`,
      jelly: `<path d="M4 12a8 8 0 0 1 16 0z" fill="${color}" stroke="#0B2A5B" stroke-width="1.6"/><path d="M7 12c0 4-1 6 0 9M12 12c0 4 1 6 0 10M17 12c0 4-1 6 0 9" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="9.5" cy="9" r="1" fill="#0B2A5B"/><circle cx="14.5" cy="9" r="1" fill="#0B2A5B"/>`,
      coral: `<path d="M12 23V12M12 15 7 10V5M12 13l5-5V3M7 10 4 7M17 8l3-2" stroke="${color}" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      shell: `<path d="M12 4 3 20h18z" fill="${color}" stroke="#0B2A5B" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 4v16M12 4 8 20M12 4l4 16" stroke="#0B2A5B" stroke-width="1.1"/>`,
      star: `<path d="M12 2l2.6 6.4L21 9l-5 4.4 1.6 6.6L12 16.5 6.4 20 8 13.4 3 9l6.4-.6z" fill="${color}" stroke="#0B2A5B" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="11" r="1" fill="#0B2A5B"/>`,
    }[kind];
    return cls === 'raw' ? body : `<svg class="${cls}" viewBox="0 0 24 24" overflow="visible">${body}</svg>`;
  }
  function reefScene(h = 230) {
    const W = 360, H = 230, out = [];
    let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    LENSES.forEach((l, li) => {
      const kind = CREATURE[l.slug], n = reefCount(l.slug), swim = kind === 'fish' || kind === 'jelly';
      for (let k = 0; k < 3; k++) {
        const x = 14 + ((li * 31 + k * 97) % 300) + rnd() * 10, y = swim ? 24 + rnd() * 118 : 168 + rnd() * 24;
        const s = swim ? 26 + rnd() * 10 : 24 + rnd() * 8;
        if (k < n) out.push(`<g class="rc rc-${kind}" style="animation-delay:${(-rnd() * 6).toFixed(2)}s;--dx:${((rnd() * 40 + 20) * (rnd() > .5 ? 1 : -1)).toFixed(0)}px">
          <svg x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${s.toFixed(1)}" height="${s.toFixed(1)}" viewBox="0 0 24 24" overflow="visible">${creatureSVG(kind, l.color, 'raw')}</svg></g>`);
        else if (k === n) out.push(`<g class="rc-ghost"><circle cx="${(x + s / 2).toFixed(1)}" cy="${(y + s / 2).toFixed(1)}" r="${(s / 2.2).toFixed(1)}" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="2" stroke-dasharray="4 4"/>
          <text x="${(x + s / 2).toFixed(1)}" y="${(y + s / 2 + 5).toFixed(1)}" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="14" fill="#fff" fill-opacity=".5">?</text></g>`);
      }
    });
    return `<svg class="reef-svg" viewBox="0 0 ${W} ${H}" style="height:${h}px" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="rw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4FC3FF"/><stop offset=".55" stop-color="#1E6BFF"/><stop offset="1" stop-color="#123A8C"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#rw)"/>
      <g opacity=".18">${[40, 120, 200, 280].map((x, i) => `<polygon class="ray" style="animation-delay:${i * .7}s" points="${x},0 ${x + 30},0 ${x + 80},${H} ${x + 20},${H}" fill="#fff"/>`).join('')}</g>
      <path d="M0 190 Q60 172 120 186 T240 182 T360 188 V230 H0z" fill="#F6D9A0"/><path d="M0 205 Q90 194 180 204 T360 202 V230 H0z" fill="#E8C27E"/>
      ${out.join('')}
      ${[30, 150, 300].map((x, i) => `<circle class="rb" style="animation-delay:${i * 1.3}s" cx="${x}" cy="200" r="4" fill="#fff" fill-opacity=".6"/>`).join('')}
    </svg>`;
  }

  /* ── Sabahın sirri ── */
  function secretQ() {
    const pool = ALLQ.filter(q => !S.seen[q.id] && q.kind === 'k');
    const d = +today(1).replace(/-/g, '');
    return pool[d % pool.length] || ALLQ[0];
  }
  function secretCard() {
    const q = secretQ(), t = T[q.lens];
    return `<div class="card secret">
      <div class="secret-top"><span class="secret-lock">${ICON.lock}</span><div class="grow"><small>Sabahın sirri</small><b>${esc(t.name)}</b></div><span class="secret-time" id="secretTime"></span></div>
      <p class="secret-q" aria-hidden="true">${esc(q.q)}</p>
      <small class="muted">Sabahkı ilk sual gecə yarısı açılır. Seriyanı qorumaq üçün 1 sual kifayətdir.</small></div>`;
  }

  /* ── Sual görünüşü ── */
  const qVisual = q => q.flag && !q.flagSmall ? `<div class="q-flag">${flagSVG(q.flag, 'flip-in')}</div>` : '';
  function optionsHTML(q, cls = '') {
    return `<div class="opts ${cls}">${q.opts.map((o, j) => `
      <button class="opt" data-opt="${j}" style="animation-delay:${0.05 + j * 0.06}s">
        <span class="key ${q.optFlags ? 'flagkey' : ''}">${q.optFlags ? flagSVG(q.optFlags[j], 'opt-flag') : 'ABCD'[j]}</span><span class="lbl">${esc(o)}</span><span class="marks"></span>
      </button>`).join('')}</div>`;
  }

  /* ════════════ EKRANLAR ════════════ */
  const SCREENS = {
    home() {
      const z = zoneOf(S.depth), pct = z.next ? Math.round((S.depth - z.cur.m) / (z.next.m - z.cur.m) * 100) : 100;
      const done = S.dailyDoneOn === today();
      const fol = S.follows.map(s => T[s]).filter(Boolean);
      const emptyLenses = LENSES.filter(l => reefCount(l.slug) === 0).length;
      return `
        <div class="card depth-card">
          <div class="depth-gauge" style="--p:${pct}%"><span>${S.depth}m</span></div>
          <div class="depth-meta"><small>Dərinliyin</small><b>${z.cur.name}</b>
            <div class="bar"><i data-w="${pct}%"></i></div>
            <small>${z.next ? `Növbəti: ${z.next.name} · ${z.next.m - S.depth} m qalıb` : 'Ən dərin nöqtədəsən!'}</small></div>
        </div>
        <div class="hero" style="background-image:url('${IMG('photo-1583212292454-1fe6229603b7')}')">
          <div class="hero-mascot">${mascot('happy')}</div>
          <span class="tag">${done ? 'Tamamlandı ✓' : 'Günün dalışı'}</span>
          <h2 class="chunky mid">Gündəlik<br><span class="yellow">20 sual</span></h2>
          <p>${done ? 'Sabah yeni suallar. İndi duel et və ya rifini böyüt!' : 'Hər mövzudan 2 sual — hamı üçün eyni 20 sual.'}</p>
          <button class="btn ${done ? 'white' : 'pulse'}" data-act="${done ? 'quickduel' : 'daily'}">${done ? 'Duel et ⚔️' : 'Dal! 🤿'}</button>
        </div>
        <button class="duel-cta" data-act="quickduel">
          <span class="duel-cta-flags">${['tr', 'jp', 'br'].map(c => flagSVG(c)).join('')}</span>
          <span class="duel-cta-txt"><small>Canlı duel</small><b>Bayraq duelı</b><em>7 sual · 10 saniyə · sürət xalı${S.plus ? ' · limitsiz' : ` · bu gün ${Math.max(0, duelsLeft())}/${FREE_DUELS} pulsuz`}</em></span>
          <span class="btn sm">Oyna</span>
        </button>
        <button class="party-cta" data-act="party">
          <span class="party-cta-art">${['shell', 'fish', 'jelly', 'star'].map(k => `<span class="pq">${creatureSVG(k, '#fff')}</span>`).join('')}</span>
          <span class="party-cta-txt"><small>Dostlarla · 2–50 nəfər</small><b>Party rejimi</b><em>QR ilə qoşul · 20 sual · uduzana cəza kartı</em></span>
          <span class="btn sm white">Otaq aç</span>
        </button>
        <div class="h2">İzlədiyin mövzular <small data-go="topics">Hamısı →</small></div>
        <div class="scroller">${fol.map((t, i) => tile(t, i)).join('')}</div>
        <button class="card reef-mini" data-go="reef">
          <div class="reef-mini-art">${reefScene(120)}</div>
          <div class="reef-mini-txt"><b>Sənin rifin</b><small>${emptyLenses ? `${emptyLenses} mövzunun canlısı hələ gəlməyib` : 'Rifin tam canlıdır!'}</small></div>
        </button>
        ${secretCard()}
        <div class="card row-card">
          ${avatar('Murad', 4)}
          <div class="grow"><b>Murad səni duelə çağırdı</b><small>Paytaxtlar · Gəncə</small></div>
          <button class="btn sm blue" data-act="duelinvite">Qəbul</button>
        </div>`;
    },

    topics() {
      const groups = [['Ölkələr', ['bayraqlar', 'paytaxtlar', 'olkeler']], ['Bütün linzalar', LENSES.filter(l => l.slug !== 'olkeler').map(l => l.slug)]];
      return groups.map(([g, list], gi) => `
        <div class="h2" ${gi === 0 ? 'style="margin-top:6px"' : ''}>${g}</div>
        ${gi === 0 ? '<p class="muted sub">Bayrağı tanı, paytaxtı tap. Hər mövzunun öz səviyyəsi və reytinqi var.</p>' : ''}
        <div class="tiles">${list.map((s, i) => tile(T[s], i)).join('')}</div>`).join('');
    },

    topic() {
      const t = T[UI.topic], lv = level(S.topicXP[t.slug]), n = topicQs(t.slug).length, following = S.follows.includes(t.slug);
      const board = [['Aysel', 'Bakı', 3120], ['Tural', 'Gəncə', 2890], ['Leyla', 'Şəki', 2410], ['Sən', 'Bakı', S.topicXP[t.slug] || 0], ['Nigar', 'Sumqayıt', 1180], ['Elvin', 'Lənkəran', 640]]
        .sort((a, b) => b[2] - a[2]);
      return `
        <div class="topic-head ${t.img ? '' : 'has-mosaic'}" style="--c:${t.color};${t.img ? `background-image:url('${IMG(t.img)}')` : ''}">
          ${t.img ? '' : mosaic(t)}
          <button class="icon-btn back" data-go="topics" aria-label="Geri">${ICON.back}</button>
          <button class="follow ${following ? 'on' : ''}" data-act="follow">${following ? '✓ İzləyirsən' : '+ İzlə'}</button>
          <span class="topic-ico">${LENS_ICONS[t.slug] || ''}</span>
          <div class="topic-title"><h2 class="chunky mid">${esc(t.name)}</h2><small>${n} sual</small></div>
        </div>
        <div class="card lvl-card">
          <div class="lvl-badge" style="--c:${t.color}"><b>${lv.lvl}</b><small>səv.</small></div>
          <div class="grow"><b>${lv.title}</b><div class="bar"><i data-w="${lv.pct}%" style="background:${t.color}"></i></div>
            <small class="muted">${lv.toNext} XP sonra Səviyyə ${lv.lvl + 1}</small></div>
        </div>
        <div class="topic-actions">
          <button class="btn block" data-act="topicduel">${ICON.swords.replace('<svg', '<svg width="22" height="22"')} Duel</button>
          <button class="btn white block" data-act="topicsolo">Tək oyun</button>
        </div>
        <div class="h2">${esc(t.name)} reytinqi <small>Demo</small></div>
        <div class="card rank-list" style="padding:0">
          ${board.map(([nm, c, s], i) => `<div class="rank-row ${nm === 'Sən' ? 'me' : ''}" style="animation-delay:${i * .05}s">
            <span class="n">${i + 1}</span>${avatar(nm, i)}<span>${nm}<span class="city">${c} · Səv. ${level(s).lvl}</span></span>
            <span class="s">${fmt(s)} XP</span></div>`).join('')}
        </div>`;
    },

    quiz() {
      const Q = UI.quiz, q = Q.items[Q.i], L = T[q.lens];
      const kindLbl = q.kind === 'e' ? 'Təxmin' : q.flag && !q.flagSmall ? 'Bayraq' : 'Bilik';
      const prog = Q.items.length > 8
        ? `<div class="qprog"><div class="qprog-bar"><i style="width:${Q.i / Q.items.length * 100}%"></i></div><b>${Q.i + 1}/${Q.items.length}</b></div>`
        : `<div class="progress-dots">${Q.items.map((_, j) => `<i class="${j < Q.i ? (Q.res[j] ? 'done' : 'miss') : j === Q.i ? 'cur' : ''}"></i>`).join('')}</div>`;
      let body;
      if (q.kind === 'e') {
        const mid = Math.round((q.min + q.max) / 2 / q.step) * q.step;
        body = `<div class="estimate"><div class="val"><span id="estVal">${fmt(mid)}</span> <small>${q.unit}</small></div>
          <input type="range" id="est" min="${q.min}" max="${q.max}" step="${q.step}" value="${mid}" aria-label="Təxmin">
          <div class="scale"><span>${fmt(q.min)}</span><span>${fmt(q.max)}</span></div>
          <button class="btn blue block" data-act="estimate" style="margin-top:16px">Təsdiqlə</button></div>`;
      } else body = optionsHTML(q);
      return `
        <div class="quiz-top">
          <button class="icon-btn" data-act="quit" aria-label="Çıx">${ICON.close}</button>
          <button class="icon-btn snd" data-act="sound" aria-label="Səsi aç/bağla">${SFX.on ? ICON.sound : ICON.mute}</button>
          ${prog}
        </div>
        <div class="oxygen" id="ox">${ICON.tank}<div class="ox-bar"><i id="oxBar"></i></div><b id="oxSec">${Q.time}</b></div>
        <div class="card q-card" style="margin-top:58px">
          <div class="q-mascot" id="qMascot">${mascot('think')}</div>
          <span class="q-lens" style="--c:${L.color}">${esc(L.name)}</span><span class="q-kind">${kindLbl}</span>
          <button class="read-btn" data-act="read" aria-label="Sualı səsli oxu">${ICON.speak}<span>Dinlə</span></button>
          ${qVisual(q)}
          <div class="q-text">${q.flagSmall && q.flag ? flagSVG(q.flag, 'inline-flag') : ''}${esc(q.q)}</div>
        </div>
        ${body}
        <div id="fb"></div>`;
    },

    result() {
      const Q = UI.quiz, ok = Q.res.filter(Boolean).length, n = Q.items.length, r = ok / n;
      const mood = r >= .7 ? 'party' : r >= .4 ? 'happy' : 'sad';
      return `
        <div class="result">
          <div class="sun">${mascot(mood)}</div>
          <h2 class="chunky mid" style="margin-top:6px">${r >= .7 ? 'Əla dalış!' : r >= .4 ? 'Yaxşı dalış!' : 'Yenə dal!'}</h2>
          <p class="muted" style="font-weight:800;margin:10px 0 0">${esc(Q.title)}</p>
          <div class="stats">
            <div class="card stat"><b data-count="${ok}">0</b><small>/ ${n} düzgün</small></div>
            <div class="card stat"><b data-count="${Q.gainP}" data-plus>0</b><small>inci</small></div>
            <div class="card stat"><b data-count="${Q.gainD}" data-plus data-unit="m">0</b><small>dərinlik</small></div>
          </div>
          ${Q.daily ? `<div class="share-grid" aria-label="Nəticə şəbəkəsi">${Q.res.map((x, i) => `<i class="${x ? 'y' : 'n'}" style="animation-delay:${i * .04}s"></i>`).join('')}</div>
            <button class="btn white block" data-act="share" style="margin-bottom:14px">Nəticəni paylaş</button>` : ''}
          <div style="display:grid;gap:14px">
            <button class="btn blue block" data-act="quickduel">Duel et ⚔️</button>
            <button class="btn white block" data-go="home">Əsas səhifə</button>
          </div>
          <div style="margin-top:18px;text-align:left">${secretCard()}</div>
        </div>`;
    },

    duel() { return duelView(); },

    plus() {
      const rows = [
        ['Bütün mövzular və suallar', '✓', '✓'], ['Gündəlik 20 sual', '✓', '✓'], ['Rif, seriya, liqa', '✓', '✓'],
        ['Canlı duel', `gündə ${FREE_DUELS}`, 'limitsiz'], ['Seriya dondurması', 'həftədə 1', 'limitsiz'],
        ['Ətraflı statistika (səhv etdiyin suallar, mövzu üzrə inkişaf)', '—', '✓'], ['Xüsusi rif canlıları və dekor', '—', '✓'],
        ['Ailə planı (4 hesab)', '—', '✓'], ['Reklam', 'yalnız könüllü', 'heç vaxt'],
      ];
      return `
        <button class="icon-btn back-inline" data-go="profile" aria-label="Geri">${ICON.back}</button>
        <div class="plus-hero">
          <div class="plus-hero-art">${mascot('party')}</div>
          <h2 class="chunky mid">Sualtı <span class="yellow">Plus</span></h2>
          <p>Dərinliyə limitsiz dal. Pulla qələbə yoxdur: Plus duel xalına təsir etmir.</p>
        </div>
        <div class="card plus-promise"><b>Mövzular kilidlənmir.</b> Bütün suallar və mövzular hamı üçün həmişə pulsuzdur. Plus rahatlıq və dərinlik verir, bilik satmır.</div>
        <div class="tbl-plus"><table>
          <tr><th></th><th>Pulsuz</th><th class="p">Plus</th></tr>
          ${rows.map(([f, a, b]) => `<tr><td>${f}</td><td>${a}</td><td class="p">${b}</td></tr>`).join('')}
        </table></div>
        <div class="price-row">
          <div class="price-card"><small>Aylıq</small><b>2.99 AZN</b><em>A testi</em></div>
          <div class="price-card best"><span class="ribbon">2 ay pulsuz</span><small>İllik</small><b>29.90 AZN</b><em>ayda ~2.49 AZN</em></div>
        </div>
        <p class="muted sub" style="margin-top:8px">Qiymətlər demo və fərziyyədir; real qiymət A/B testi ilə seçiləcək.</p>
        <button class="btn block ${S.plus ? 'white' : 'pulse'}" data-act="tryplus">${S.plus ? 'Plus-u söndür (demo)' : 'Plus-u sına — demo, ödəniş yoxdur'}</button>
        <div class="h2">Komandalar üçün</div>
        <div class="b2b">
          <div class="card b2b-card"><b>🏫 Məktəblər</b><small>Sinif duelləri, müəllimin öz sualları, şagird hesabatları.</small></div>
          <div class="card b2b-card"><b>🏢 Şirkətlər</b><small>Komanda quizləri, korporativ liqa, canlı final.</small></div>
          <div class="card b2b-card"><b>📣 Sponsorlu mövzu</b><small>“Həftənin mövzusu — X ilə birlikdə”. Suallar neytral qalır, sponsor açıq yazılır.</small></div>
        </div>`;
    },

    reef() {
      const rows = LENSES.map(l => {
        const n = reefCount(l.slug), st = S.lensStats[l.slug] || [0, 0];
        return `<div class="reef-row">${creatureSVG(CREATURE[l.slug], n ? l.color : '#C9D6EA', 'reef-row-c')}
          <span class="grow"><b>${esc(l.name)}</b><small>${CNAME[CREATURE[l.slug]]} · ${st[1]} düzgün cavab</small></span>
          <span class="reef-dots">${[0, 1, 2].map(k => `<i class="${k < n ? 'on' : ''}" style="--c:${l.color}"></i>`).join('')}</span>
          ${n < 3 ? `<button class="btn sm white" data-topic="${l.slug}">Dal</button>` : '<span class="full">Tam ✓</span>'}</div>`;
      }).join('');
      const total = LENSES.reduce((a, l) => a + reefCount(l.slug), 0);
      return `
        <div class="h2" style="margin-top:6px">Sənin rifin <small>${total}/${LENSES.length * 3} canlı</small></div>
        <div class="reef-big">${reefScene(260)}</div>
        <p class="muted sub">Hər mövzunun öz canlısı var. Hər 3 düzgün cavab rifinə bir canlı gətirir. Boş yerlərdə “?” görünür — həmin mövzuda dal və rifini tamamla.</p>
        <div class="card reef-list">${rows}</div>`;
    },

    board() {
      if (!S.league && UI.lb === 'league') return `<div class="seg"><button class="on" data-lb="league">Həftəlik liqa</button><button data-lb="city">Şəhərlər</button></div>
        <div class="card" style="text-align:center"><b>Liqada iştirak etmirsən</b><p class="muted">Profil → “Həftəlik liqa” ilə istədiyin vaxt qoşula bilərsən. Seriya və rif liqasız da işləyir.</p></div>`;
      const league = [['Aysel', 'Bakı', 1460], ['Tural', 'Gəncə', 1325], ['Leyla', 'Şəki', 1210], ['Nigar', 'Sumqayıt', 1105], ['Elvin', 'Bakı', 1040],
        ['Günay', 'Lənkəran', 990], ['Rauf', 'Quba', 870], ['Səbinə', 'Mingəçevir', 760], ['Orxan', 'Bakı', 690], ['Kamran', 'Naxçıvan', 610], ['Lalə', 'Şamaxı', 540]]
        .map(([n, c, s]) => ({ n, c, s }));
      league.push({ n: 'Sən', c: 'Bakı', s: S.weekly, me: true });
      league.sort((a, b) => b.s - a.s);
      const cities = [['Bakı', 48210], ['Gəncə', 21460], ['Sumqayıt', 17930], ['Şəki', 9820], ['Lənkəran', 8740], ['Naxçıvan', 8120], ['Quba', 6350], ['Mingəçevir', 5980], ['Şamaxı', 4410]]
        .map(([n, s]) => ({ n, c: 'şəhər', s }));
      const list = UI.lb === 'league' ? league : cities, top = list.slice(0, 3), rest = list.slice(3);
      const pod = (p, r, delay) => p ? `<div class="pod p${r}">${r === 1 ? ICON.crown : ''}
          <div style="animation-delay:${delay}s" class="pod-av">${avatar(p.n, list.indexOf(p))}</div>
          <div class="nm">${p.n}</div><div class="sc">${pearlSm(14)}${fmt(p.s)}</div>
          <div class="block" style="animation-delay:${delay - .2}s">${r}</div></div>` : '';
      return `
        <div class="seg"><button class="${UI.lb === 'league' ? 'on' : ''}" data-lb="league">Həftəlik liqa</button><button class="${UI.lb === 'city' ? 'on' : ''}" data-lb="city">Şəhərlər</button></div>
        ${UI.lb === 'league' ? `<div class="card league-banner"><span style="font-size:30px">🪸</span><div style="flex:1"><small class="muted" style="font-weight:800">Mərcan liqası bitir · səviyyəyə görə qrup</small><div class="timer" id="lbTimer">2g 14:05:30</div></div></div>`
          : `<p class="muted" style="font-weight:700;margin:0 2px">Demo rəqəmlər. Real versiyada şəhər xalı oyunçu başına orta xal olacaq — böyük şəhər avtomatik qalib gəlməyəcək.</p>`}
        <div class="podium">${pod(top[1], 2, .5)}${pod(top[0], 1, .3)}${pod(top[2], 3, .7)}</div>
        <div class="card rank-list" style="padding:0">
          ${UI.lb === 'league' ? '<div class="zone">▲ Top 5 Alaqaranlıq liqasına yüksəlir</div>' : ''}
          ${rest.map((p, i) => { const idx = i + 4; return (UI.lb === 'league' && idx === 10 ? '<div class="zone down">▼ Enmə zonası</div>' : '') +
            `<div class="rank-row ${p.me ? 'me' : ''}" style="animation-delay:${0.05 * i}s"><span class="n">${idx}</span>${avatar(p.n, idx)}
            <span>${p.n}${p.me ? ' 👈' : ''}<span class="city">${p.c}</span></span><span class="s">${pearlSm(16)}${fmt(p.s)}</span></div>`; }).join('')}
        </div>`;
    },

    profile() {
      const z = zoneOf(S.depth);
      const lv = TOPICS.map(t => ({ t, xp: S.topicXP[t.slug] || 0 })).filter(x => x.xp > 0).sort((a, b) => b.xp - a.xp);
      return `
        <div class="profile-head">
          <span class="logo-mark pm">${mascot('happy', 'in-logo')}</span>
          <div><small class="muted" style="font-weight:800">Dalğıc</small><h3>Sən</h3>
            <small style="font-weight:800;color:#1E6BFF">${S.depth} m · ${z.cur.name}</small></div>
        </div>
        <button class="plus-card" data-go="plus">
          <span class="plus-gem">${ICON.gem}</span>
          <span class="grow"><b>${S.plus ? 'Sualtı Plus aktivdir' : 'Sualtı Plus'}</b><small>${S.plus ? 'Limitsiz duel, ətraflı statistika, rif dekoru' : 'Limitsiz duel və dərinlik. Mövzular hamı üçün pulsuz qalır.'}</small></span>
          <span class="plus-go">→</span></button>
        <div class="stats" style="margin-top:16px">
          <div class="card stat"><b>${S.duels.w}</b><small>duel qələbəsi</small></div>
          <div class="card stat"><b>${S.streak}</b><small>gün seriya</small></div>
          <div class="card stat"><b>${S.freezes}</b><small>dondurma</small></div>
        </div>
        <div class="h2">Dünyagörüş xəritəsi</div>
        <div class="card radar-wrap">${radar()}<p class="muted" style="font-weight:700;font-size:13px;margin:6px 0 0;text-align:center">Məqsəd ən çox bilmək yox — <b style="color:#0B2A5B">ən geniş baxmaqdır</b>.</p></div>
        <div class="h2">Mövzu titulların</div>
        <div class="card titles">${lv.map(({ t, xp }) => { const L = level(xp); return `<button class="title-row" data-topic="${t.slug}"><span class="ti" style="--c:${t.color}">${LENS_ICONS[t.slug] || ''}</span>
          <span class="grow"><b>${esc(t.name)}</b><small>${L.title}</small></span><span class="lvl-pill" style="--c:${t.color}">Səv. ${L.lvl}</span></button>`; }).join('')}</div>
        <div class="h2">Seçimlər</div>
        <div class="card settings">
          <label class="set" for="leagueToggle"><span><b>Həftəlik liqa</b><small>Rəqabət istəmirsənsə söndür. Seriya və rif yenə işləyir.</small></span>
            <input type="checkbox" id="leagueToggle" ${S.league ? 'checked' : ''}></label>
          <div class="set"><span><b>Seriya qaydası</b><small>Gündə 1 sual kifayətdir. Ehtiyatda ${S.freezes} dondurma var.</small></span></div>
          <div class="set"><span><b>Səhv bildirişlərin</b><small>${S.reports.length} sual yoxlanışa göndərilib</small></span></div>
          <div class="set"><span><b>Reklamsız</b><small>Taymer gedərkən heç vaxt reklam yoxdur.</small></span></div>
          <button class="btn white sm" data-act="reset">Demonu sıfırla</button>
        </div>`;
    },
  };

  function radar() {
    const L = LENSES, cx = 160, cy = 160, R = 108, n = L.length;
    const pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
    const vals = L.map(l => { const [a, c] = S.lensStats[l.slug] || [0, 0]; return Math.min(1, 0.12 + a / 20 * 0.6 + (a ? c / a : 0) * 0.25); });
    const rings = [.25, .5, .75, 1].map(f => `<polygon points="${L.map((_, i) => pt(i, R * f).join(',')).join(' ')}" fill="none" stroke="#D5E4F7" stroke-width="1.5"/>`).join('');
    const axes = L.map((_, i) => { const [x, y] = pt(i, R); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#D5E4F7" stroke-width="1.5"/>`; }).join('');
    const dots = vals.map((v, i) => { const [x, y] = pt(i, R * v); return `<circle cx="${x}" cy="${y}" r="5" fill="${L[i].color}" stroke="#0B2A5B" stroke-width="2"/>`; }).join('');
    const labels = L.map((l, i) => { const [x, y] = pt(i, R + 26); return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="Nunito, sans-serif" font-weight="800" font-size="12" fill="#0B2A5B">${l.name.split(' ')[0]}</text>`; }).join('');
    return `<svg class="radar" viewBox="-34 0 388 320">${rings}${axes}<g class="poly"><polygon points="${vals.map((v, i) => pt(i, R * v).join(',')).join(' ')}" fill="rgba(30,107,255,.25)" stroke="#1E6BFF" stroke-width="3" stroke-linejoin="round"/>${dots}</g>${labels}</svg>`;
  }

  /* ════════════ TƏK OYUN ════════════ */
  function startQuiz(items, title, daily = false) {
    UI.quiz = { items, i: 0, res: [], title, daily, gainP: 0, gainD: 0, time: 20 };
    UI.streakBumped = false; go('quiz');
  }
  function startQuestion() {
    const Q = UI.quiz, q = Q.items[Q.i];
    Q.time = q.kind === 'e' ? 25 : 20; Q.locked = false; tLeft = Q.time * 10;
    const bar = $('#oxBar'), sec = $('#oxSec'), ox = $('#ox');
    stopTick();
    tick = setInterval(() => {
      tLeft--;
      if (tLeft < 50 && tLeft % 10 === 0) SFX.play('tick');
      bar.style.transform = `scaleX(${tLeft / (Q.time * 10)})`; sec.textContent = Math.ceil(tLeft / 10);
      ox.classList.toggle('low', tLeft < 50);
      if (tLeft <= 0) { stopTick(); answer(null); }
    }, 100);
    if (q.kind === 'e') { const r = $('#est'), v = $('#estVal'); let last = 0;
      r.addEventListener('input', () => { v.textContent = fmt(+r.value); const n = performance.now(); if (n - last > 60) { SFX.play('slide'); last = n; } }); }
  }
  function answer(choice, srcEl) {
    const Q = UI.quiz, q = Q.items[Q.i];
    if (Q.locked) return; Q.locked = true; stopTick(); SFX.stopSpeak();
    const opts = $$('.opt'); opts.forEach(o => o.disabled = true);
    let ok = false, p = 0, d = 0, html;
    if (q.kind === 'k') {
      ok = choice === q.a;
      opts.forEach((o, j) => o.classList.add(j === q.a ? 'correct' : j === choice ? 'wrong' : 'dim'));
      if (ok) { p = 10; d = 25; }
      html = `<div class="feedback ${ok ? 'ok' : 'no'}"><h4>${ok ? 'Düz tapdın! 🎉' : choice === null ? 'Oksigen bitdi! 🫧' : 'Bu dəfə yox 🙈'}</h4><p>${esc(q.ex)}</p>`;
    } else {
      const val = choice === null ? null : +$('#est').value; $('#est').disabled = true;
      const err = val === null ? 1 : Math.abs(val - q.ans) / (q.max - q.min);
      ok = err <= 0.08; if (err <= 0.03) { p = 10; d = 25; } else if (ok) { p = 6; d = 15; }
      html = `<div class="feedback ${ok ? 'ok' : 'no'}"><h4>Düzgün cavab: ${fmt(q.ans)} ${q.unit}</h4><p>${val === null ? 'Oksigen bitdi!' : `Sənin təxminin: ${fmt(val)} ${q.unit}. ${ok ? 'Çox yaxın!' : 'Uzaq düşdün.'}`} ${esc(q.ex)}</p>`;
    }
    html += `<div class="fb-actions"><button class="report-btn" data-act="report">${ICON.flagRep}Səhv bildir</button>
      <button class="btn blue" data-act="next">${Q.i < Q.items.length - 1 ? 'Davam et' : 'Nəticəyə bax'}</button></div></div>`;
    SFX.play(ok ? 'correct' : 'wrong');
    Q.res.push(ok); Q.gainP += p; Q.gainD += d;
    S.pearls += p; S.depth += d; S.weekly += p * 3;
    recordAnswer(q, ok, ok ? 10 : 2);
    $('#qMascot').innerHTML = mascot(ok ? 'party' : 'sad');
    $('#fb').innerHTML = html;
    later(() => $('#fb .feedback') && $('#fb .feedback').scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120);
    if (p && srcEl) { burst(srcEl); floatNum(srcEl, `+${p} inci`); }
  }
  function nextQuestion() {
    const Q = UI.quiz; Q.i++;
    if (Q.i >= Q.items.length) { if (Q.daily) S.dailyDoneOn = today(); save(); return go('result'); }
    clearTimers(); render(); $('#view').scrollTop = 0;
  }
  function dailyItems() {
    let est = 0;
    return shuffle(shuffle(LENSES).slice(0, 10).flatMap(l => {
      const out = [];
      for (const q of pickQs(ALLQ.filter(q => q.lens === l.slug), 8)) {
        if (q.kind === 'e' && est >= 2) continue; if (q.kind === 'e') est++;
        out.push(q); if (out.length === 2) break;
      }
      return out;
    }));
  }

  /* ════════════ CANLI DUEL (QuizUp ilhamlı: 7 sual, 10 san, sürət xalı, son sual ×2) ════════════ */
  const BOTS = [['Aysel', 'Bakı'], ['Tural', 'Gəncə'], ['Leyla', 'Şəki'], ['Murad', 'Gəncə'], ['Nigar', 'Sumqayıt'], ['Elvin', 'Lənkəran'], ['Günay', 'Quba'], ['Rauf', 'Naxçıvan'], ['Səbinə', 'Mingəçevir']];
  const ROUNDS = 7, QTIME = 10, MAXP = ROUNDS * 20 + 20, FREE_DUELS = 5;
  function duelsLeft() { if (S.duelDay.d !== today()) S.duelDay = { d: today(), n: 0 }; return S.plus ? Infinity : FREE_DUELS - S.duelDay.n; }
  function startDuel(slug, opp) {
    if (duelsLeft() <= 0) return showLimit();
    if (!S.plus) { S.duelDay.n++; save(); }
    const myLv = level(S.topicXP[slug]).lvl;
    const b = opp || BOTS[Math.floor(Math.random() * BOTS.length)];
    const oLv = clamp(myLv + Math.floor(Math.random() * 3) - 1, 1, 12);
    UI.duel = { slug, phase: 'search', i: 0, my: 0, op: 0, log: [],
      opp: { name: b[0], city: b[1], lvl: oLv, color: BOTS.indexOf(b) + 1, acc: clamp(0.5 + oLv * 0.04 + Math.random() * 0.1, 0.45, 0.9) },
      qs: pickQs(topicQs(slug).filter(q => q.kind === 'k'), ROUNDS) };
    go('duel');
  }
  function duelView() {
    const D = UI.duel, t = T[D.slug], me = level(S.topicXP[D.slug]);
    if (D.phase === 'search') return `
      <div class="duel-full search">
        <button class="icon-btn quit" data-act="quitduel" aria-label="Çıx">${ICON.close}</button>
        <p class="duel-topic">${esc(t.name)}</p>
        <div class="sonar"><i></i><i></i><i></i><span class="sonar-me">${mascot('think')}</span></div>
        <h2 class="chunky mid">Rəqib axtarılır…</h2>
        <div class="search-names" id="searchNames">${BOTS.map((b, i) => `<span>${avatar(b[0], i + 1)}${b[0]}</span>`).join('')}</div>
      </div>`;
    if (D.phase === 'vs') return `
      <div class="duel-full vs">
        <p class="duel-topic">${esc(t.name)} · ${ROUNDS} sual</p>
        <div class="vs-card left"><span class="vs-av">${mascot('happy')}</span><b>Sən</b><small>Bakı · Səv. ${me.lvl}</small><em>${me.title}</em></div>
        <div class="vs-mark">VS</div>
        <div class="vs-card right">${avatar(D.opp.name, D.opp.color, 'vs-bot')}<b>${D.opp.name}</b><small>${D.opp.city} · Səv. ${D.opp.lvl}</small><em>Demo rəqib</em></div>
      </div>`;
    if (D.phase === 'play') {
      const q = D.qs[D.i], bonus = D.i === ROUNDS - 1;
      return `
        <div class="duel-play">
          <div class="duel-top">
            <button class="icon-btn" data-act="askquit" aria-label="Dueldən çıx">${ICON.close}</button>
            <span class="duel-top-t">${esc(t.name)} · Duel</span>
            <button class="icon-btn snd" data-act="sound" aria-label="Səsi aç/bağla">${SFX.on ? ICON.sound : ICON.mute}</button>
          </div>
          <div class="duel-score">
            <div class="ds me"><span class="ds-av">${mascot('happy')}</span><div class="ds-info"><small>Sən</small><b id="myScore">${D.my}</b></div><div class="ds-bar"><i style="width:${D.my / MAXP * 100}%"></i></div></div>
            <div class="ds-mid">
              <div class="ring" id="ring"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" class="ring-bg"/><circle cx="24" cy="24" r="20" class="ring-fg" id="ringFg"/></svg><b id="ringN">${QTIME}</b></div>
              <small>${bonus ? '<span class="bonus">BONUS ×2</span>' : `${D.i + 1}/${ROUNDS}`}</small>
            </div>
            <div class="ds op"><span class="ds-av">${avatar(D.opp.name, D.opp.color)}<span class="op-done" id="opDone">✓</span></span><div class="ds-info"><small>${D.opp.name}</small><b id="opScore">${D.op}</b></div><div class="ds-bar"><i style="width:${D.op / MAXP * 100}%"></i></div></div>
          </div>
          <div class="round-banner ${bonus ? 'bonus' : ''}" id="roundBanner">${bonus ? 'BONUS SUAL ×2' : `SUAL ${D.i + 1}`}</div>
          <div class="card q-card duel-q">
            ${qVisual(q)}
            <div class="q-text">${q.flagSmall && q.flag ? flagSVG(q.flag, 'inline-flag') : ''}${esc(q.q)}</div>
          </div>
          ${optionsHTML(q, 'duel-opts')}
        </div>`;
    }
    const win = D.my > D.op, draw = D.my === D.op, bonusXP = win ? 100 : draw ? 50 : 20;
    return `
      <div class="duel-result ${win ? 'win' : draw ? 'draw' : 'lose'}">
        <div class="res-rays"></div>
        <h2 class="chunky big res-title">${win ? 'Qələbə!' : draw ? 'Heç-heçə' : 'Məğlubiyyət'}</h2>
        <div class="res-vs">
          <div><span class="res-av">${mascot(win ? 'party' : draw ? 'happy' : 'sad')}</span><b data-count="${D.my}">0</b><small>Sən</small></div>
          <span class="res-dash">:</span>
          <div>${avatar(D.opp.name, D.opp.color, 'res-bot')}<b data-count="${D.op}">0</b><small>${D.opp.name}</small></div>
        </div>
        <div class="card xp-card">
          <div class="xp-row"><span>Duel xalı</span><b>+${D.my}</b></div>
          <div class="xp-row"><span>${win ? 'Qələbə bonusu' : draw ? 'Heç-heçə bonusu' : 'İştirak bonusu'}</span><b>+${bonusXP}</b></div>
          <div class="xp-lvl"><span class="lvl-badge sm" style="--c:${t.color}"><b id="lvlNum">${D.lvlBefore}</b></span>
            <div class="grow"><b>${esc(t.name)}</b><div class="bar"><i id="xpBar" style="width:${D.pctBefore}%;background:${t.color}"></i></div></div>
            <b class="xp-total">+${D.my + bonusXP} XP</b></div>
          ${D.levelUp ? `<div class="lvl-up">Yeni səviyyə! ${level(S.topicXP[D.slug]).lvl} · ${level(S.topicXP[D.slug]).title}</div>` : ''}
        </div>
        <div class="review">
          <div class="rv head"><span></span><span>Düzgün cavab</span><span>Sən</span><span>${D.opp.name}</span></div>
          ${D.log.map((r, i) => `<div class="rv"><span class="rv-n">${i + 1}</span><span class="rv-q">${r.q.flag && !r.q.flagSmall ? flagSVG(r.q.flag, 'rv-flag') : ''}<b>${esc(r.q.opts[r.q.a])}</b></span>
            <span class="rv-m ${r.me ? 'y' : 'n'}">${r.me ? '+' + r.mp : '✗'}</span><span class="rv-m ${r.op ? 'y' : 'n'}">${r.op ? '+' + r.opp : '✗'}</span></div>`).join('')}
        </div>
        <div class="res-actions">
          <button class="btn block" data-act="rematch">Revanş</button>
          <button class="btn blue block" data-act="newopp">Yeni rəqib</button>
          <button class="btn white block" data-act="backtopic">Mövzuya qayıt</button>
        </div>
      </div>`;
  }
  const AFTER_DUEL = {
    search() {
      let k = 0; const names = $$('#searchNames span');
      const spin = setInterval(() => { names.forEach((n, i) => n.classList.toggle('on', i === k % names.length)); k++; SFX.play('tick'); }, 140);
      timers.push(spin);
      later(() => { clearInterval(spin); UI.duel.phase = 'vs'; render(); }, 2000);
    },
    vs() { SFX.play('correct'); later(() => { UI.duel.phase = 'play'; render(); }, 2300); },
    play() {
      const D = UI.duel, q = D.qs[D.i], bonus = D.i === ROUNDS - 1;
      D.locked = false; D.t0 = performance.now(); D.myAns = undefined; D.opAns = undefined; D.lastTick = null;
      const fg = $('#ringFg'), num = $('#ringN'), C = 2 * Math.PI * 20;
      fg.style.strokeDasharray = C;
      if (bonus) SFX.play('fanfare');
      const opTime = 1.8 + Math.random() * 6.5, opOk = Math.random() < D.opp.acc;
      const wrongs = [0, 1, 2, 3].filter(j => j !== q.a);
      D.opPlan = { t: opTime, choice: opOk ? q.a : wrongs[Math.floor(Math.random() * 3)] };
      D.opTimer = later(opAnswer, opTime * 1000);
      stopTick();
      tick = setInterval(() => {
        const el = (performance.now() - D.t0) / 1000, left = Math.max(0, QTIME - el);
        fg.style.strokeDashoffset = C * (1 - left / QTIME);
        num.textContent = Math.ceil(left);
        $('#ring').classList.toggle('low', left < 3.5);
        if (left < 3.5 && Math.ceil(left) !== D.lastTick) { D.lastTick = Math.ceil(left); SFX.play('tick'); }
        if (left <= 0) { stopTick(); if (D.myAns === undefined) duelAnswer(null); }
      }, 50);
    },
    done() {
      $$('[data-count]').forEach(el => countUp(el, +el.dataset.count, '', ''));
      const D = UI.duel;
      later(() => { const b = $('#xpBar'); if (b) b.style.width = (D.levelUp ? 100 : D.pctAfter) + '%'; }, 500);
      if (D.levelUp) later(() => { const n = $('#lvlNum'), b = $('#xpBar'); if (n) n.textContent = level(S.topicXP[D.slug]).lvl; if (b) { b.style.transition = 'none'; b.style.width = '0%'; void b.offsetWidth; b.style.transition = ''; b.style.width = D.pctAfter + '%'; } SFX.play('fanfare'); }, 1700);
      if (D.my > D.op) { SFX.play('fanfare'); later(confetti, 300); }
      else if (D.my < D.op) SFX.play('wrong');
    },
  };
  const pts = (el, bonus) => Math.max(10, Math.round(20 - el)) * (bonus ? 2 : 1);
  function opAnswer() {
    const D = UI.duel; if (!D || D.phase !== 'play' || D.opAns !== undefined) return;
    D.opAns = D.opPlan.choice; D.opT = Math.min(QTIME, (performance.now() - D.t0) / 1000);
    const od = $('#opDone'); od && od.classList.add('show');
    if (D.myAns !== undefined) reveal();
  }
  function duelAnswer(choice, el) {
    const D = UI.duel; if (D.locked) return; D.locked = true;
    const q = D.qs[D.i], t = (performance.now() - D.t0) / 1000, bonus = D.i === ROUNDS - 1;
    D.myAns = choice;
    const opts = $$('.opt'); opts.forEach(o => o.disabled = true);
    const ok = choice === q.a;
    if (choice !== null) opts[choice].classList.add(ok ? 'correct' : 'wrong');
    SFX.play(ok ? 'correct' : 'wrong');
    D.mp = ok ? pts(t, bonus) : 0; D.my += D.mp;
    if (ok && el) { burst(el); floatNum(el, `+${D.mp}`); }
    animateScore('#myScore', D.my - D.mp, D.my);
    $('.ds.me .ds-bar i').style.width = (D.my / MAXP * 100) + '%';
    recordAnswer(q, ok, 0);
    if (D.opAns === undefined) { clearTimeout(D.opTimer); D.opTimer = later(opAnswer, 500 + Math.random() * 900); }
    else reveal();
  }
  function reveal() {
    const D = UI.duel, q = D.qs[D.i], bonus = D.i === ROUNDS - 1;
    stopTick();
    const opts = $$('.opt'), opOk = D.opAns === q.a;
    opts[q.a].classList.add('correct');
    if (D.opAns !== null && opts[D.opAns]) opts[D.opAns].querySelector('.marks').insertAdjacentHTML('beforeend', `<span class="mark-op">${avatar(D.opp.name, D.opp.color)}</span>`);
    if (D.myAns !== null && D.myAns !== undefined) opts[D.myAns].querySelector('.marks').insertAdjacentHTML('afterbegin', `<span class="mark-me">${mascot('happy')}</span>`);
    const op = opOk ? pts(D.opT, bonus) : 0;
    D.op += op; animateScore('#opScore', D.op - op, D.op);
    $('.ds.op .ds-bar i').style.width = (D.op / MAXP * 100) + '%';
    D.log.push({ q, me: D.myAns === q.a, mp: D.mp, op: opOk, opp: op });
    later(() => { D.i++; if (D.i < ROUNDS) { clearTimers(); render(); } else finishDuel(); }, 1700);
  }
  function finishDuel() {
    const D = UI.duel, win = D.my > D.op, draw = D.my === D.op;
    const before = level(S.topicXP[D.slug]);
    D.lvlBefore = before.lvl; D.pctBefore = before.pct;
    const gain = D.my + (win ? 100 : draw ? 50 : 20);
    S.topicXP[D.slug] = (S.topicXP[D.slug] || 0) + gain;
    const parent = T[D.slug].parent; if (parent) S.topicXP[parent] = (S.topicXP[parent] || 0) + Math.round(gain / 2);
    const after = level(S.topicXP[D.slug]);
    D.levelUp = after.lvl > before.lvl; D.pctAfter = after.pct;
    S.duels[win ? 'w' : draw ? 'd' : 'l']++;
    if (win) S.pearls += 15;
    S.weekly += Math.round(D.my / 2);
    if (!S.follows.includes(D.slug)) S.follows.push(D.slug);
    save(); D.phase = 'done'; clearTimers(); render();
  }
  function animateScore(sel, from, to) {
    const el = $(sel); if (!el) return; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
    const t0 = performance.now();
    const st = now => { const p = Math.min(1, (now - t0) / 500); el.textContent = Math.round(from + (to - from) * p); if (p < 1) requestAnimationFrame(st); };
    requestAnimationFrame(st);
  }

  /* ── Effektlər ── */
  function burst(el, n = 16) {
    const app = $('#app').getBoundingClientRect(), r = el.getBoundingClientRect();
    const b = document.createElement('div'); b.className = 'burst';
    b.style.left = (r.left - app.left + r.width / 2) + 'px'; b.style.top = (r.top - app.top + r.height / 2) + 'px';
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, dist = 50 + Math.random() * 70, s = 6 + Math.random() * 12, dot = document.createElement('i');
      dot.style.width = dot.style.height = s + 'px'; dot.style.animationDelay = Math.random() * .1 + 's';
      dot.style.setProperty('--x', Math.cos(a) * dist + 'px'); dot.style.setProperty('--y', Math.sin(a) * dist - 30 + 'px');
      b.appendChild(dot);
    }
    $('#app').appendChild(b); setTimeout(() => b.remove(), 1000);
  }
  function floatNum(el, txt) {
    const app = $('#app').getBoundingClientRect(), r = el.getBoundingClientRect();
    const f = document.createElement('div'); f.className = 'float-num'; f.textContent = txt;
    f.style.left = (r.right - app.left - 110) + 'px'; f.style.top = (r.top - app.top - 10) + 'px';
    $('#app').appendChild(f); setTimeout(() => f.remove(), 1000);
  }
  function confetti() {
    const host = document.createElement('div'); host.className = 'confetti';
    const cols = ['#FFD43B', '#2EC5F5', '#FF7A59', '#22C55E', '#fff', '#8B5CF6'];
    for (let i = 0; i < 46; i++) {
      const c = document.createElement('i'), s = 6 + Math.random() * 10;
      Object.assign(c.style, { left: Math.random() * 100 + '%', width: s + 'px', height: s + 'px', background: cols[i % cols.length],
        borderRadius: Math.random() > .5 ? '50%' : '3px', animationDuration: 1.6 + Math.random() * 1.6 + 's', animationDelay: Math.random() * .4 + 's' });
      c.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      host.appendChild(c);
    }
    $('#app').appendChild(host); setTimeout(() => host.remove(), 3600);
  }
  function countUp(el, to, pre, unit) {
    const t0 = performance.now(), dur = 900;
    const step = now => { const p = Math.min(1, (now - t0) / dur); el.textContent = pre + Math.round(to * (1 - Math.pow(1 - p, 3))) + (unit ? ' ' + unit : ''); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  function toast(html, kind = '') {
    const t = document.createElement('div'); t.className = 'toast ' + kind; t.innerHTML = html;
    $('#app').appendChild(t); SFX.play(kind === 'reef' ? 'correct' : 'tap');
    setTimeout(() => t.classList.add('out'), 2600); setTimeout(() => t.remove(), 3100);
  }

  /* ── Ekrandan sonra ── */
  const fillBars = () => requestAnimationFrame(() => $$('.bar i[data-w]').forEach(b => b.style.width = b.dataset.w));
  const AFTER = {
    home() { fillBars(); secretTimer(); },
    topic() { fillBars(); },
    quiz() { startQuestion(); },
    result() {
      $$('[data-count]').forEach(el => countUp(el, +el.dataset.count, el.hasAttribute('data-plus') ? '+' : '', el.dataset.unit || ''));
      SFX.play('fanfare'); secretTimer();
      if (UI.streakBumped) { UI.streakBumped = false; later(showStreak, 1400); }
    },
    duel() { const f = AFTER_DUEL[UI.duel.phase]; f && f(); },
    board() {
      let t = 2 * 86400 + 14 * 3600 + 5 * 60 + 30;
      timers.push(setInterval(() => { const el = $('#lbTimer'); if (!el) return; t--;
        el.textContent = `${Math.floor(t / 86400)}g ${String(Math.floor(t % 86400 / 3600)).padStart(2, '0')}:${String(Math.floor(t % 3600 / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; }, 1000));
    },
    profile() { const tg = $('#leagueToggle'); tg && tg.addEventListener('change', () => { S.league = tg.checked; save(); toast(S.league ? 'Liqaya qoşuldun' : 'Liqadan çıxdın — seriya və rif davam edir'); }); },
  };
  function secretTimer() {
    const el = $('#secretTime'); if (!el) return;
    const upd = () => { const now = new Date(), mid = new Date(now); mid.setHours(24, 0, 0, 0); const s = Math.floor((mid - now) / 1000);
      el.textContent = `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s % 3600 / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
    upd(); timers.push(setInterval(upd, 1000));
  }

  /* ── Modallar ── */
  function showStreak() {
    SFX.play('fanfare');
    const m = $('#modal'); m.classList.add('open');
    const days = ['B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş', 'B'];
    m.innerHTML = `<div class="streak-modal"><div class="rays2"></div>
      <div class="speech">Ardıcıl ${S.streak} gün dalırsan! Sabah 1 sual da kifayətdir 🤿</div>
      <div class="star-wrap"><svg class="star" viewBox="0 0 200 200"><path d="M100 8l25 55 60 7-45 41 13 59-53-31-53 31 13-59-45-41 60-7z" fill="#FFD43B" stroke="#fff" stroke-width="10" stroke-linejoin="round"/></svg>
        ${mascot('party')}${ICON.sparkle.replace('class="sparkle"', 'class="sparkle" style="left:6px;top:40px"')}${ICON.sparkle.replace('class="sparkle"', 'class="sparkle" style="right:0;top:110px;animation-delay:.5s"')}</div>
      <div class="streak-num" id="streakNum">0</div><div class="streak-label">GÜNLÜK SERİYA</div>
      <div class="week">${days.map((d, i) => `<span class="${i < Math.min(7, S.streak) ? 'on' : ''}" style="animation-delay:${0.6 + i * .08}s">${d}</span>`).join('')}</div>
      <p class="freeze-note">❄️ ${S.freezes} dondurma ehtiyatda — bir gün buraxsan seriya qorunur</p>
      <button class="btn" data-act="closeModal" style="position:relative">Super! 🎉</button></div>`;
    countUp($('#streakNum'), S.streak, '', '');
  }
  function showReport() {
    const m = $('#modal'); m.classList.add('open');
    m.innerHTML = `<div class="modal-bg" data-act="closeModal"></div><div class="sheet">
      <h3>Bu sualda nə səhvdir?</h3><p class="muted">Hər bildiriş redaktora gedir. 3 bildiriş toplanan sual dərhal yoxlanışa düşür.</p>
      ${['Cavab səhvdir', 'Sual köhnəlib', 'Yazı / orfoqrafiya səhvi', 'Bayraq və ya şəkil səhvdir', 'Başqa səbəb'].map(r => `<button class="sheet-opt" data-reason="${r}">${r}</button>`).join('')}
      <button class="btn white block" data-act="closeModal">Ləğv et</button></div>`;
  }
  function showLimit() {
    const m = $('#modal'); m.classList.add('open');
    m.innerHTML = `<div class="modal-bg" data-act="closeModal"></div><div class="sheet">
      <div class="sheet-mascot">${mascot('think')}</div>
      <h3>Bu günün ${FREE_DUELS} pulsuz duelı bitdi</h3>
      <p class="muted">Sabah yenə ${FREE_DUELS} duel. Gündəlik 20 sual, tək oyun və rif isə limitsizdir.</p>
      <button class="btn block" data-act="openplus">Plus ilə limitsiz duel</button>
      <button class="btn white block" data-act="closeModal">Sabaha qədər gözləyərəm</button></div>`;
  }
  function closeModal() { const m = $('#modal'); m.classList.remove('open'); m.innerHTML = ''; }
  async function share() {
    const Q = UI.quiz, ok = Q.res.filter(Boolean).length;
    const rows = []; for (let i = 0; i < Q.res.length; i += 10) rows.push(Q.res.slice(i, i + 10).map(x => x ? '🟦' : '⬜').join(''));
    const d = new Date().toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' });
    const text = `Sualtı · Gündəlik 20 · ${d}\n${rows.join('\n')}\n${ok}/${Q.res.length} · 🔥${S.streak} · ${S.depth} m\nilduzamammadova-cell.github.io/sualti`;
    try { if (navigator.share) { await navigator.share({ text }); return; } } catch (e) {}
    try { await navigator.clipboard.writeText(text); toast('Nəticə kopyalandı — WhatsApp, Telegram və ya Story-yə yapışdır'); }
    catch (e) { toast('Kopyalamaq alınmadı'); }
  }

  /* ── Hadisələr ── */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-go],[data-act],[data-topic],[data-opt],[data-lb],[data-reason]');
    if (!t) return;
    if (t.dataset.opt === undefined && !['sound', 'estimate', 'enter', 'logo'].includes(t.dataset.act)) SFX.play('tap');
    if (t.dataset.go) return go(t.dataset.go);
    if (t.dataset.lb) { UI.lb = t.dataset.lb; return render(); }
    if (t.dataset.topic) return go('topic', { topic: t.dataset.topic });
    if (t.dataset.reason) { const q = UI.quiz && UI.quiz.items[UI.quiz.i]; S.reports.push({ id: q && q.id, reason: t.dataset.reason, at: Date.now() }); save(); closeModal(); return toast('Təşəkkürlər! Sual yoxlanışa göndərildi'); }
    if (t.dataset.opt !== undefined) return UI.screen === 'duel' ? duelAnswer(+t.dataset.opt, t) : answer(+t.dataset.opt, t);
    const a = t.dataset.act, D = UI.duel;
    const acts = {
      daily: () => startQuiz(dailyItems(), 'Gündəlik 20 sual', true),
      quickduel: () => startDuel('bayraqlar'),
      duelinvite: () => startDuel('paytaxtlar', BOTS[3]),
      topicduel: () => startDuel(UI.topic),
      topicsolo: () => startQuiz(pickQs(topicQs(UI.topic), 10), `${T[UI.topic].name} · tək oyun`),
      follow: () => { const s = UI.topic; S.follows = S.follows.includes(s) ? S.follows.filter(x => x !== s) : [...S.follows, s]; save(); render(); },
      rematch: () => startDuel(D.slug, BOTS.find(b => b[0] === D.opp.name)),
      newopp: () => startDuel(D.slug),
      backtopic: () => go('topic', { topic: D.slug }),
      quitduel: () => go('home'),
      askquit: () => {
        const m = $('#modal'); m.classList.add('open');
        m.innerHTML = `<div class="modal-bg" data-act="closeModal"></div><div class="sheet">
          <h3>Dueldən çıxırsan?</h3><p class="muted">Duel yarımçıq qalsa, məğlubiyyət sayılır. Rifin və seriyan qorunur.</p>
          <button class="btn block" data-act="closeModal">Davam et</button>
          <button class="btn white block" data-act="forfeit">Çıx, əsas ekrana qayıt</button></div>`;
      },
      forfeit: () => { closeModal(); S.duels.l++; save(); go('home'); },
      quit: () => go('home'),
      estimate: () => answer('est', t),
      next: () => nextQuestion(),
      report: () => showReport(),
      share: () => share(),
      reset: () => { try { localStorage.removeItem(KEY); } catch (e) {} S = DEFAULT(); save(); toast('Demo sıfırlandı'); go('home'); },
      sound: () => { SFX.toggle(); $$('[data-act=sound]').forEach(b => b.innerHTML = SFX.on ? ICON.sound : ICON.mute); },
      read: () => { const q = UI.quiz.items[UI.quiz.i]; if (!SFX.speak(q.q + (q.opts ? '. ' + q.opts.map((o, j) => 'ABCD'[j] + ': ' + o).join('. ') : ''))) t.querySelector('span').textContent = 'Dəstəklənmir'; },
      enter: () => enterApp(),
      logo: () => { SFX.play('logo'); const mk = $('.brand-logo .logo-mark'); mk && (mk.classList.remove('ping'), void mk.offsetWidth, mk.classList.add('ping')); },
      closeModal: () => closeModal(),
      party: () => window.Party && Party.host(),
      openplus: () => { closeModal(); go('plus'); },
      tryplus: () => { S.plus = !S.plus; save(); toast(S.plus ? 'Plus aktivdir (demo) — duellər limitsizdir' : 'Plus söndürüldü (demo)'); render(); },
    };
    acts[a] && acts[a]();
  });

  /* ── Açılış ekranı ── */
  function enterApp() {
    const sp = $('#splash'); if (!sp || sp.classList.contains('out')) return;
    SFX.play('logo'); sp.classList.add('out');
    try { sessionStorage.setItem('sualti-entered', '1'); } catch (e) {}
    setTimeout(() => sp.remove(), 1100);
  }
  (function splash() {
    let seen = false; try { seen = sessionStorage.getItem('sualti-entered') === '1'; } catch (e) {}
    const sp = $('#splash'); if (seen) { sp.remove(); return; }
    sp.innerHTML = `<div class="splash-rays"></div><div class="splash-in">
        <div class="splash-mascot">${mascot('happy')}</div>
        <div class="chunky big splash-word">sual<span class="yellow">tı</span></div>
        <p class="splash-tag">Sualın dərinliyinə dal</p>
        <button class="btn pulse splash-btn" data-act="enter">Dal! 🤿</button><small class="splash-hint">🔊 səsi aç</small></div>
      <div class="splash-bubbles">${Array.from({ length: 14 }, (_, i) => `<i style="left:${5 + i * 6.7}%;animation-delay:${(i % 5) * .12}s;width:${10 + (i * 7) % 22}px;height:${10 + (i * 7) % 22}px"></i>`).join('')}</div>`;
  })();

  window.creatureSVG = creatureSVG;
  window.__sualti = { get S() { return S; }, ALLQ, TOPICS, UI }; // demo/test üçün
  render();
})();
