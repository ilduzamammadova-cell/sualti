/* Sualtı Party — Kahoot tipli qrup oyunu.
   Host (TV / noutbuk) otaq açır, QR kod göstərir; oyunçular telefonla qoşulub adlarını yazır.
   Əlaqə: PeerJS (WebRTC, açıq mənbə). Host həqiqətin yeganə mənbəyidir: suallar, vaxt, xallar.
   Şəbəkə olmasa (və ya claude.ai artifact-ında) "Botlarla sına" ilə tək cihazda oynamaq olur. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const PEER_JS = 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js';
  const QR_JS = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  const ROUND = 20, QSEC = 20, FREE_ROUNDS = 1;
  const SHAPES = [['tri', '#FF5A6E'], ['dia', '#1E6BFF'], ['cir', '#F5B400'], ['sq', '#22A55E']];
  const shape = (k, s = 30) => ({
    tri: `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><path d="M12 3 22 20H2z" fill="#fff"/></svg>`,
    dia: `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><path d="M12 2 22 12 12 22 2 12z" fill="#fff"/></svg>`,
    cir: `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><circle cx="12" cy="12" r="10" fill="#fff"/></svg>`,
    sq: `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><rect x="3" y="3" width="18" height="18" rx="3" fill="#fff"/></svg>`,
  }[k]);
  const DARES = [
    'Qrupa bir mahnının nəqəratını oxu 🎤', '10 saniyə robot kimi rəqs et 🤖', 'Növbəti çayı sən dəmlə ☕',
    'Hər kəsə bir kompliment de 💐', 'Bir dəqiqə yalnız şeirlə danış 📜', 'Qalibi 3 dəfə ucadan təriflə 🏆',
    'Ən sevdiyin heyvanın səsini çıxar 🐓', 'Növbəti raundu ayaq üstə oyna 🧍', 'Bir lətifə danış 😄',
  ];
  const BOT_NAMES = ['Aysel', 'Tural', 'Leyla', 'Murad', 'Nigar', 'Elvin', 'Günay', 'Rauf'];
  const COLORS = ['#FF7A59', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#14B8A6', '#EF4444'];
  const loadScript = src => new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
  });
  const sfx = n => window.SFX && SFX.play(n);
  function overlay(cls) {
    let o = $('#party');
    if (!o) { o = document.createElement('div'); o.id = 'party'; document.body.appendChild(o); }
    o.className = 'party ' + cls; return o;
  }
  const code6 = () => Array.from({ length: 5 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
  const joinURL = code => location.origin + location.pathname + '?party=' + code;
  const pts = (ms) => Math.round(1000 * (1 - (ms / 1000 / QSEC) / 2));

  /* ════════════ HOST ════════════ */
  let H = null;
  function host() {
    const A = window.__sualti;
    H = { code: code6(), peer: null, online: false, players: new Map(), phase: 'lobby', topic: 'mix', dares: true, qs: [], qi: -1, rounds: 0, timers: [] };
    renderHost();
    loadScript(PEER_JS).then(() => openRoom()).catch(() => offline('Əlaqə kitabxanası yüklənmədi.'));
    loadScript(QR_JS).then(drawQR).catch(() => {});
  }
  function openRoom(tries = 0) {
    try {
      const peer = new Peer('sualti-' + H.code, { debug: 0 });
      H.peer = peer;
      peer.on('open', () => { H.online = true; drawQR(); renderLobbyStatus(); });
      peer.on('error', e => {
        if (e.type === 'unavailable-id' && tries < 3) { H.code = code6(); peer.destroy(); openRoom(tries + 1); renderHost(); }
        else if (!H.online) offline('Bu mühitdə canlı əlaqə qurulmadı.');
      });
      peer.on('connection', conn => {
        conn.on('data', d => onPlayerMsg(conn, d));
        conn.on('close', () => { const p = H.players.get(conn.peer); if (p) { p.left = true; renderPlayers(); } });
      });
    } catch (e) { offline('Bu mühitdə canlı əlaqə qurulmadı.'); }
  }
  function offline(msg) { H.online = false; H.offlineMsg = msg; renderLobbyStatus(); }
  function onPlayerMsg(conn, d) {
    if (!d || !d.t) return;
    if (d.t === 'join') {
      const name = String(d.name || '').trim().slice(0, 16) || 'Oyunçu';
      const old = H.players.get(conn.peer);
      H.players.set(conn.peer, { id: conn.peer, name, conn, score: old ? old.score : 0, color: COLORS[H.players.size % COLORS.length] });
      conn.send({ t: 'welcome', name, phase: H.phase });
      sfx('tap'); renderPlayers();
      if (H.phase === 'q') sendQuestion(H.players.get(conn.peer));
    }
    if (d.t === 'ans' && H.phase === 'q' && d.qi === H.qi) {
      const p = H.players.get(conn.peer); if (!p || p.ans != null) return;
      p.ans = d.choice; p.ms = performance.now() - H.t0;
      sfx('slide'); updateAnswered();
    }
  }
  const send = (p, msg) => { if (p.conn && p.conn.open) try { p.conn.send(msg); } catch (e) {} };
  const live = () => [...H.players.values()].filter(p => !p.left);

  function renderHost() {
    const o = overlay('host');
    o.innerHTML = `
      <div class="ph-top"><span class="ph-brand">${window.logoMark ? logoMark(42) : ''}<b>sualtı</b><em>party</em></span>
        <button class="ph-x" data-p="close" aria-label="Bağla">✕</button></div>
      <div class="ph-body" id="phBody"></div>`;
    o.onclick = e => { const b = e.target.closest('[data-p]'); if (b) hostAct(b.dataset.p, b); };
    lobby();
  }
  function lobby() {
    H.phase = 'lobby';
    const A = window.__sualti;
    const topics = [['mix', 'Qarışıq'], ['bayraqlar', 'Bayraqlar'], ['paytaxtlar', 'Paytaxtlar'], ...A.TOPICS.filter(t => !['bayraqlar', 'paytaxtlar', 'olkeler'].includes(t.slug)).map(t => [t.slug, t.name])];
    $('#phBody').innerHTML = `
      <div class="ph-lobby">
        <div class="ph-join card">
          <p class="ph-step">1 · Telefonla skan et</p>
          <div class="ph-qr" id="phQR"><div class="ph-qr-wait">QR hazırlanır…</div></div>
          <p class="ph-step">və ya kodu yaz</p>
          <div class="ph-code">${H.code.split('').map(c => `<span>${c}</span>`).join('')}</div>
          <p class="ph-url" id="phStatus"></p>
        </div>
        <div class="ph-side">
          <div class="ph-players card"><div class="ph-ph"><b>Oyunçular</b><span id="phCount">0</span></div><div class="ph-list" id="phList"><p class="ph-empty">Oyunçular qoşulduqca burada görünəcək…</p></div></div>
          <div class="ph-set card">
            <label>Mövzu<select id="phTopic">${topics.map(([v, n]) => `<option value="${v}" ${v === H.topic ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>
            <label class="ph-check"><input type="checkbox" id="phDares" ${H.dares ? 'checked' : ''}> Ən az xal toplayana cəza kartı</label>
            <p class="ph-note">${ROUND} sual · hər suala ${QSEC} saniyə · tez cavab = çox xal</p>
          </div>
          <div class="ph-actions">
            <button class="btn white" data-p="bots">🤖 Botlarla sına</button>
            <button class="btn pulse" data-p="start" id="phStart" disabled>Başla ▶</button>
          </div>
        </div>
      </div>`;
    $('#phTopic').onchange = e => H.topic = e.target.value;
    $('#phDares').onchange = e => H.dares = e.target.checked;
    drawQR(); renderLobbyStatus(); renderPlayers();
  }
  function drawQR() {
    const el = $('#phQR'); if (!el || !window.QRCode || !H) return;
    el.innerHTML = '';
    new QRCode(el, { text: joinURL(H.code), width: 220, height: 220, colorDark: '#0B2A5B', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
  }
  function renderLobbyStatus() {
    const s = $('#phStatus'); if (!s) return;
    if (H.online) s.innerHTML = `<span class="ok">● Otaq açıqdır</span> · ${esc(joinURL(H.code).replace(/^https?:\/\//, ''))}`;
    else if (H.offlineMsg) s.innerHTML = `<span class="bad">● ${esc(H.offlineMsg)}</span> Telefonlarla oynamaq üçün saytı aç: <b>ilduzamammadova-cell.github.io/sualti</b>. İndi “Botlarla sına” ilə baxa bilərsən.`;
    else s.innerHTML = 'Otaq açılır…';
  }
  function renderPlayers() {
    const L = $('#phList'), c = $('#phCount'), st = $('#phStart'); if (!L) return;
    const ps = live();
    c.textContent = ps.length;
    L.innerHTML = ps.length ? ps.map(p => `<span class="ph-chip" style="--c:${p.color}">${esc(p.name)}${p.bot ? ' 🤖' : ''}</span>`).join('') : '<p class="ph-empty">Oyunçular qoşulduqca burada görünəcək…</p>';
    st.disabled = ps.length < 2;
  }
  function addBots() {
    shuffle(BOT_NAMES).slice(0, 6).forEach((n, i) => {
      const id = 'bot-' + n; if (H.players.has(id)) return;
      H.players.set(id, { id, name: n, bot: true, score: 0, color: COLORS[(H.players.size + i) % COLORS.length], skill: 0.45 + Math.random() * 0.4 });
    });
    sfx('correct'); renderPlayers();
  }
  function pickRound() {
    const A = window.__sualti;
    const pool = A.ALLQ.filter(q => q.kind === 'k' && q.opts.length === 4 && (H.topic === 'mix' || q.lens === H.topic || q.topic === H.topic));
    const used = new Set(H.qs.map(q => q.id));
    return shuffle(pool.filter(q => !used.has(q.id))).slice(0, ROUND);
  }
  function startRound() {
    const qs = pickRound(); if (qs.length < 4) return;
    H.qs = H.qs.concat(qs); H.rounds++;
    nextQ();
  }
  function clearT() { H.timers.forEach(clearTimeout); H.timers.forEach(clearInterval); H.timers = []; }
  function nextQ() {
    clearT(); H.qi++;
    if (H.qi >= H.qs.length) return final();
    const q = H.qs[H.qi]; H.phase = 'q'; H.t0 = performance.now();
    live().forEach(p => { p.ans = null; p.ms = null; p.gain = 0; });
    const inRound = (H.qi % ROUND) + 1;
    $('#phBody').innerHTML = `
      <div class="ph-q">
        <div class="ph-qtop"><span class="ph-qn">Sual ${inRound}/${ROUND}</span>
          <div class="ph-timer"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" class="ring-bg"/><circle cx="24" cy="24" r="20" class="ring-fg" id="phRing"/></svg><b id="phSec">${QSEC}</b></div>
          <span class="ph-ans"><b id="phAns">0</b>/${live().length} cavab</span></div>
        <div class="ph-qcard card">${q.flag && !q.flagSmall && window.flagSVG ? `<div class="ph-flag">${flagSVG(q.flag, 'flip-in')}</div>` : ''}
          <h2>${q.flagSmall && q.flag && window.flagSVG ? flagSVG(q.flag, 'inline-flag') : ''}${esc(q.q)}</h2></div>
        <div class="ph-opts">${q.opts.map((o, j) => `<div class="ph-opt" style="--c:${SHAPES[j][1]}" data-j="${j}">${shape(SHAPES[j][0])}<span>${esc(o)}</span><i class="ph-bar"></i><em class="ph-cnt"></em></div>`).join('')}</div>
      </div>`;
    live().forEach(p => sendQuestion(p));
    const ring = $('#phRing'), C = 2 * Math.PI * 20; ring.style.strokeDasharray = C;
    H.timers.push(setInterval(() => {
      const left = Math.max(0, QSEC - (performance.now() - H.t0) / 1000);
      ring.style.strokeDashoffset = C * (1 - left / QSEC); $('#phSec').textContent = Math.ceil(left);
      if (left <= 0) reveal();
    }, 100));
    // botlar
    live().filter(p => p.bot).forEach(p => {
      const ms = 1500 + Math.random() * 12000;
      H.timers.push(setTimeout(() => {
        if (H.phase !== 'q') return;
        p.ans = Math.random() < p.skill ? q.a : [0, 1, 2, 3].filter(j => j !== q.a)[Math.floor(Math.random() * 3)];
        p.ms = ms; updateAnswered();
      }, ms));
    });
    sfx('swoosh');
  }
  function sendQuestion(p) {
    const q = H.qs[H.qi];
    send(p, { t: 'q', qi: H.qi, n: (H.qi % ROUND) + 1, total: ROUND, q: q.q, opts: q.opts, sec: QSEC, left: Math.max(1, QSEC - (performance.now() - H.t0) / 1000) });
  }
  function updateAnswered() {
    const ps = live(), n = ps.filter(p => p.ans != null).length;
    const el = $('#phAns'); if (el) el.textContent = n;
    if (n >= ps.length) setTimeout(reveal, 400);
  }
  function reveal() {
    if (H.phase !== 'q') return; H.phase = 'reveal'; clearT();
    const q = H.qs[H.qi], ps = live();
    const counts = [0, 0, 0, 0];
    ps.forEach(p => {
      if (p.ans != null) counts[p.ans]++;
      p.gain = p.ans === q.a ? pts(p.ms) : 0; p.score += p.gain;
    });
    const ranked = ps.slice().sort((a, b) => b.score - a.score);
    ps.forEach(p => send(p, { t: 'reveal', ok: p.ans === q.a, answered: p.ans != null, gain: p.gain, score: p.score, rank: ranked.indexOf(p) + 1, of: ps.length, correct: q.opts[q.a] }));
    const max = Math.max(1, ...counts);
    document.querySelectorAll('.ph-opt').forEach((el, j) => {
      el.classList.add(j === q.a ? 'right' : 'dim');
      el.querySelector('.ph-bar').style.width = (counts[j] / max * 100) + '%';
      el.querySelector('.ph-cnt').textContent = counts[j];
    });
    sfx('correct');
    H.timers.push(setTimeout(() => board(ranked), 3200));
  }
  function board(ranked) {
    H.phase = 'board';
    const last = (H.qi + 1) % ROUND === 0;
    $('#phBody').innerHTML = `
      <div class="ph-board">
        <h2 class="chunky mid">Reytinq</h2>
        <div class="ph-rank">${ranked.slice(0, 6).map((p, i) => `<div class="ph-row" style="animation-delay:${i * .08}s;--c:${p.color}">
          <span class="n">${i + 1}</span><b>${esc(p.name)}</b>${p.gain ? `<em>+${p.gain}</em>` : '<em class="z">+0</em>'}<span class="s">${p.score}</span></div>`).join('')}</div>
        <button class="btn" data-p="next">${last ? 'Nəticələr 🏆' : 'Növbəti sual →'}</button>
      </div>`;
    H.timers.push(setTimeout(() => hostAct(last ? 'final' : 'next'), last ? 6000 : 5000));
  }
  function final() {
    clearT(); H.phase = 'final';
    const ranked = live().slice().sort((a, b) => b.score - a.score);
    const loser = ranked[ranked.length - 1];
    const dare = DARES[Math.floor(Math.random() * DARES.length)];
    ranked.forEach((p, i) => send(p, { t: 'end', rank: i + 1, of: ranked.length, score: p.score, loser: H.dares && p === loser, dare: H.dares ? dare : null, loserName: loser.name }));
    const pod = (p, r) => p ? `<div class="ph-pod p${r}" style="--c:${p.color}"><span class="ph-pav">${esc(p.name[0])}</span><b>${esc(p.name)}</b><small>${p.score}</small><div class="blk">${r}</div></div>` : '';
    $('#phBody').innerHTML = `
      <div class="ph-final">
        <h2 class="chunky big">${esc(ranked[0].name)} qalib gəldi!</h2>
        <div class="ph-podium">${pod(ranked[1], 2)}${pod(ranked[0], 1)}${pod(ranked[2], 3)}</div>
        ${H.dares ? `<div class="ph-dare" id="phDare">
          <div class="ph-dare-in"><div class="ph-dare-front">🎴<b>Cəza kartı</b><small>Ən az xal: ${esc(loser.name)} (${loser.score})</small></div>
          <div class="ph-dare-back"><small>${esc(loser.name)}, sənin cəzan:</small><b>${esc(dare)}</b></div></div></div>` : ''}
        <div class="ph-actions">
          <button class="btn" data-p="more">+${ROUND} sual daha</button>
          <button class="btn white" data-p="again">Yeni oyun</button>
          <button class="btn white" data-p="close">Bağla</button>
        </div>
      </div>`;
    sfx('fanfare');
    if (H.dares) H.timers.push(setTimeout(() => { const d = $('#phDare'); d && d.classList.add('flip'); sfx('logo'); }, 2200));
  }
  function morePaywall() {
    const A = window.__sualti;
    if (A.S.plus || H.rounds < FREE_ROUNDS + (H.bought || 0)) return startRound();
    const o = $('#party'), m = document.createElement('div'); m.className = 'ph-modal';
    m.innerHTML = `<div class="ph-sheet card">
      <h3>Əlavə raund</h3>
      <p>İlk ${ROUND} sual pulsuzdur. Davam etmək üçün <b>Party paketi</b> al və ya <b>Sualtı Plus</b> ilə limitsiz oyna.</p>
      <div class="ph-price"><div><small>Party paketi</small><b>1.99 AZN</b><em>+${ROUND} sual, bu oyun üçün</em></div><div><small>Plus</small><b>2.99 AZN/ay</b><em>limitsiz party</em></div></div>
      <p class="ph-note">Demo: ödəniş götürülmür, qiymətlər fərziyyədir.</p>
      <button class="btn block" data-p="buy">Paketi al (demo)</button>
      <button class="btn white block" data-p="nobuy">Yox, sağ ol</button></div>`;
    o.appendChild(m);
  }
  function hostAct(a, el) {
    const acts = {
      close: () => { clearT(); try { H.peer && H.peer.destroy(); } catch (e) {} $('#party').remove(); H = null; },
      bots: () => addBots(),
      start: () => { if (live().length >= 2) { H.qs = []; H.qi = -1; H.rounds = 0; live().forEach(p => p.score = 0); startRound(); } },
      next: () => { if (H.phase === 'board') nextQ(); },
      final: () => { if (H.phase === 'board') final(); },
      more: () => morePaywall(),
      buy: () => { H.bought = (H.bought || 0) + 1; document.querySelector('.ph-modal')?.remove(); startRound(); },
      nobuy: () => document.querySelector('.ph-modal')?.remove(),
      again: () => { clearT(); live().forEach(p => { p.score = 0; send(p, { t: 'welcome', name: p.name, phase: 'lobby' }); }); H.qs = []; H.qi = -1; H.rounds = 0; lobby(); },
    };
    acts[a] && acts[a]();
  }

  /* ════════════ OYUNÇU (telefon) ════════════ */
  let J = null;
  function join(code) {
    J = { code: code.toUpperCase(), peer: null, conn: null, name: '' };
    const o = overlay('player');
    o.onclick = e => { const b = e.target.closest('[data-j]'); if (b) playerAct(b.dataset.j, b); };
    let saved = ''; try { saved = localStorage.getItem('sualti-name') || ''; } catch (e) {}
    o.innerHTML = `
      <div class="pp">
        <div class="pp-logo">${window.mascot ? mascot('happy') : ''}</div>
        <h1 class="chunky mid">sual<span class="yellow">tı</span> party</h1>
        <p class="pp-code">Otaq: <b>${esc(J.code)}</b></p>
        <form class="pp-form" id="ppForm"><input id="ppName" maxlength="16" placeholder="Adın" autocomplete="nickname" value="${esc(saved)}" required>
          <button class="btn block" type="submit">Qoşul 🤿</button></form>
        <p class="pp-msg" id="ppMsg"></p>
      </div>`;
    $('#ppForm').onsubmit = e => { e.preventDefault(); J.name = $('#ppName').value.trim(); if (!J.name) return; try { localStorage.setItem('sualti-name', J.name); } catch (er) {} connect(); };
  }
  function pmsg(t) { const m = $('#ppMsg'); if (m) m.innerHTML = t; }
  function connect() {
    pmsg('Qoşulur…');
    loadScript(PEER_JS).then(() => {
      J.peer = new Peer({ debug: 0 });
      J.peer.on('open', () => {
        J.conn = J.peer.connect('sualti-' + J.code, { reliable: true });
        J.conn.on('open', () => J.conn.send({ t: 'join', name: J.name }));
        J.conn.on('data', onHostMsg);
        J.conn.on('close', () => pscreen(`<h2>Əlaqə kəsildi</h2><p>Host oyunu bağladı və ya internet kəsildi.</p><button class="btn" data-j="retry">Yenidən qoşul</button>`));
      });
      J.peer.on('error', e => pmsg(e.type === 'peer-unavailable' ? 'Bu kodla otaq tapılmadı. Ekrandakı kodu yoxla.' : 'Qoşulmaq alınmadı. İnterneti yoxla və yenidən cəhd et.'));
    }).catch(() => pmsg('Əlaqə kitabxanası yüklənmədi.'));
  }
  function pscreen(html, cls = '') { const o = $('#party'); o.className = 'party player ' + cls; o.innerHTML = `<div class="pp">${html}</div>`; }
  function onHostMsg(d) {
    if (!d || !d.t) return;
    if (d.t === 'welcome') { sfx('correct'); pscreen(`<div class="pp-logo">${mascot('party')}</div><h2>Sən içəridəsən, ${esc(d.name)}!</h2><p>Böyük ekrana bax. Host oyunu başladanda suallar burada görünəcək.</p><div class="pp-wait"><i></i><i></i><i></i></div>`); }
    if (d.t === 'q') {
      J.qi = d.qi; J.locked = false;
      pscreen(`<div class="pp-qtop"><span>Sual ${d.n}/${d.total}</span><span class="pp-sec" id="ppSec">${Math.ceil(d.left)}</span></div>
        <p class="pp-q">${esc(d.q)}</p>
        <div class="pp-opts">${d.opts.map((o, j) => `<button class="pp-opt" data-j="ans" data-c="${j}" style="--c:${SHAPES[j][1]}">${shape(SHAPES[j][0], 34)}<span>${esc(o)}</span></button>`).join('')}</div>`, 'q');
      const end = performance.now() + d.left * 1000;
      clearInterval(J.tick); J.tick = setInterval(() => { const s = $('#ppSec'); if (!s) return clearInterval(J.tick); s.textContent = Math.max(0, Math.ceil((end - performance.now()) / 1000)); }, 250);
    }
    if (d.t === 'reveal') {
      clearInterval(J.tick);
      if (d.ok) sfx('correct'); else sfx('wrong');
      pscreen(`<div class="pp-res ${d.ok ? 'ok' : 'no'}"><div class="pp-big">${d.ok ? '✓' : d.answered ? '✗' : '⏱'}</div>
        <h2>${d.ok ? 'Düzdür!' : d.answered ? 'Səhv' : 'Vaxt bitdi'}</h2><p class="pp-gain">${d.ok ? '+' + d.gain : 'Düzgün: ' + esc(d.correct)}</p>
        <p>Xalın: <b>${d.score}</b> · Sıran: <b>${d.rank}/${d.of}</b></p></div>`, d.ok ? 'ok' : 'no');
    }
    if (d.t === 'end') {
      sfx(d.rank === 1 ? 'fanfare' : 'logo');
      pscreen(d.loser
        ? `<div class="pp-logo">${mascot('wow')}</div><h2>Cəza sənə düşdü! 😅</h2><div class="pp-dare">${esc(d.dare)}</div><p>Xalın: ${d.score} · ${d.rank}/${d.of}</p>`
        : `<div class="pp-logo">${mascot(d.rank <= 3 ? 'party' : 'happy')}</div><h2>${d.rank === 1 ? 'Qalib sənsən! 🏆' : `${d.rank}-ci yer`}</h2><p>Xalın: <b>${d.score}</b> · ${d.of} oyunçudan</p>${d.dare ? `<p class="pp-small">Cəza ${esc(d.loserName)}-a düşdü: ${esc(d.dare)}</p>` : ''}`, 'end');
    }
  }
  function playerAct(a, el) {
    if (a === 'ans' && !J.locked) {
      J.locked = true; const c = +el.dataset.c;
      J.conn && J.conn.send({ t: 'ans', qi: J.qi, choice: c }); sfx('tap');
      document.querySelectorAll('.pp-opt').forEach((b, j) => b.classList.add(j === c ? 'picked' : 'off'));
      const q = document.querySelector('.pp-q'); q && (q.textContent = 'Cavab göndərildi! Ekrana bax ⏳');
    }
    if (a === 'retry') join(J.code);
  }

  window.Party = { host, join, _state: () => H }; // _state: yalnız test üçün
  const p = new URLSearchParams(location.search).get('party');
  if (p) { try { sessionStorage.setItem('sualti-entered', '1'); } catch (e) {} document.addEventListener('DOMContentLoaded', () => { document.getElementById('splash')?.remove(); join(p); }); }
})();
