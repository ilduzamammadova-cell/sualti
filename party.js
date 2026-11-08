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
  // Variant nişanları: Sualtının öz canlıları (Kahoot fiqurları yox)
  const MARKS = [['shell', '#FF7A59', 'Balıqqulağı'], ['fish', '#14B8D6', 'Balıq'], ['jelly', '#8B5CF6', 'Meduza'], ['star', '#F5A700', 'Ulduz']];
  const mark = (j, s = 34) => `<span class="cre" style="width:${s}px;height:${s}px">${window.creatureSVG ? creatureSVG(MARKS[j][0], '#FFFFFF') : ''}</span>`;
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
    H = { code: code6(), peer: null, online: false, players: new Map(), phase: 'lobby', topic: 'mix', dares: true, hostPlays: true, hostName: 'Host', qs: [], qi: -1, rounds: 0, timers: [] };
    syncHostPlayer();
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
  function syncHostPlayer() {
    if (H.hostPlays) { const old = H.players.get('host'); H.players.set('host', { id: 'host', name: H.hostName || 'Host', me: true, score: old ? old.score : 0, color: '#0EA5E9' }); }
    else H.players.delete('host');
  }
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
            <div class="ph-hostplay"><label class="ph-check"><input type="checkbox" id="phHostPlays" ${H.hostPlays ? 'checked' : ''}> Mən də bu ekrandan oynayıram</label>
              <input id="phHostName" maxlength="16" value="${esc(H.hostName)}" aria-label="Sənin adın" ${H.hostPlays ? '' : 'hidden'}></div>
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
    $('#phHostPlays').onchange = e => { H.hostPlays = e.target.checked; $('#phHostName').hidden = !H.hostPlays; syncHostPlayer(); renderPlayers(); };
    $('#phHostName').oninput = e => { H.hostName = e.target.value.trim() || 'Host'; syncHostPlayer(); renderPlayers(); };
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
    L.innerHTML = ps.length ? ps.map(p => `<span class="ph-chip" style="--c:${p.color}">${esc(p.name)}${p.bot ? ' 🤖' : ''}${p.me ? ' 🖥️' : ''}</span>`).join('') : '<p class="ph-empty">Oyunçular qoşulduqca burada görünəcək…</p>';
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
          <span class="ph-ans"><b id="phAns">0</b>/${live().length} cavab<em class="ph-mine" id="phMine" hidden>✓ Sənin cavabın qəbul olundu</em></span></div>
        <div class="ph-qcard card">${q.flag && !q.flagSmall && window.flagSVG ? `<div class="ph-flag">${flagSVG(q.flag, 'flip-in')}</div>` : ''}
          <h2>${q.flagSmall && q.flag && window.flagSVG ? flagSVG(q.flag, 'inline-flag') : ''}${esc(q.q)}</h2></div>
        <div class="ph-opts">${q.opts.map((o, j) => `<button type="button" class="ph-opt" style="--c:${MARKS[j][1]};animation-delay:${j * .08}s" data-p="hostans" data-c="${j}" ${H.hostPlays ? '' : 'disabled'}>${mark(j, 46)}<span class="ot">${esc(o)}</span></button>`).join('')}</div>
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
    send(p, { t: 'q', qi: H.qi, n: (H.qi % ROUND) + 1, total: ROUND, q: q.q, opts: q.opts, flag: q.flag || null, flagSmall: !!q.flagSmall, sec: QSEC, left: Math.max(1, QSEC - (performance.now() - H.t0) / 1000) });
  }
  function updateAnswered() {
    const ps = live(), n = ps.filter(p => p.ans != null).length;
    const el = $('#phAns'); if (el) el.textContent = n;
    if (n >= ps.length) setTimeout(reveal, 400);
  }
  function reveal() {
    if (H.phase !== 'q') return; H.phase = 'reveal'; clearT();
    const q = H.qs[H.qi], ps = live();
    ps.forEach(p => {
      p.gain = p.ans === q.a ? pts(p.ms) : 0; p.score += p.gain;
      if (p.ans === q.a) p.right = (p.right || 0) + 1;
      (p.log || (p.log = [])).push({ q: q.q, correct: q.opts[q.a], mine: p.ans == null ? null : q.opts[p.ans], ok: p.ans === q.a });
      send(p, { t: 'wait', n: (H.qi % ROUND) + 1, total: ROUND, ok: p.ans === q.a, answered: p.ans != null, correct: q.opts[q.a] });
    });
    // Suallar arasında heç bir nəticə göstərilmir — hamısı oyunun sonunda açılır
    const last = (H.qi + 1) % ROUND === 0 || H.qi + 1 >= H.qs.length;
    document.querySelectorAll('.ph-opt').forEach(el => el.disabled = true);
    const me = H.players.get('host');
    // Hər oyunçu yalnız öz cavabının düz/səhv olduğunu görür; xal və reytinq sonda açılır
    if (me) {
      document.querySelectorAll('.ph-opt').forEach((el, j) => el.classList.add(j === q.a ? 'right' : j === me.ans ? 'wrongpick' : 'dim'));
      sfx(me.ans === q.a ? 'correct' : 'wrong');
    } else sfx('swoosh');
    const box = document.querySelector('.ph-q');
    const verdict = me ? (me.ans === q.a ? '<b class="v-ok">✓ Düzdür!</b>' : me.ans == null ? '<b class="v-no">⏱ Vaxt bitdi</b>' : '<b class="v-no">✗ Səhv</b>') : '';
    if (box) box.insertAdjacentHTML('beforeend', `<div class="ph-between">${verdict}<span>${last ? 'Nəticələr hesablanır… 🏆' : 'Növbəti sual gəlir… 🫧'}</span></div>`);
    H.timers.push(setTimeout(() => (last ? final() : nextQ()), me ? 2400 : 1600));
  }
  function final() {
    clearT(); H.phase = 'final';
    const ranked = live().slice().sort((a, b) => b.score - a.score);
    const minS = ranked[ranked.length - 1].score, lows = ranked.filter(p => p.score === minS);
    const loser = lows[Math.floor(Math.random() * lows.length)]; // bərabər xalda təsadüfi
    const dare = DARES[Math.floor(Math.random() * DARES.length)];
    const nQ = Math.min(H.qs.length, H.qi + 1);
    const table = ranked.map(p => ({ name: p.name, score: p.score, right: p.right || 0, color: p.color }));
    ranked.forEach((p, i) => send(p, { t: 'end', rank: i + 1, of: ranked.length, score: p.score, right: p.right || 0, nQ, table, log: (p.log || []).slice(-ROUND), loser: H.dares && p === loser, dare: H.dares ? dare : null, loserName: loser.name }));
    const pod = (p, r) => p ? `<div class="ph-pod p${r}" style="--c:${p.color}"><span class="ph-pav">${esc(p.name[0])}</span><b>${esc(p.name)}</b><small>${p.score}</small><div class="blk">${r}</div></div>` : '';
    $('#phBody').innerHTML = `
      <div class="ph-final">
        <h2 class="chunky big">${esc(ranked[0].name)} qalib gəldi!</h2>
        <div class="ph-podium">${pod(ranked[1], 2)}${pod(ranked[0], 1)}${pod(ranked[2], 3)}</div>
        <div class="ph-rank ph-full">${ranked.map((p, i) => `<div class="ph-row" style="animation-delay:${.6 + i * .07}s;--c:${p.color}">
          <span class="n">${i + 1}</span><b>${esc(p.name)}${p.bot ? ' 🤖' : ''}</b><em>${p.right || 0}/${nQ} düz</em><span class="s">${p.score}</span></div>`).join('')}</div>
        ${H.dares ? `<div class="ph-dare" id="phDare">
          <div class="ph-dare-in"><div class="ph-dare-front">🎴<b>Cəza kartı</b><small>Ən az xal: ${esc(loser.name)} (${loser.score})</small></div>
          <div class="ph-dare-back"><small>${esc(loser.name)}, sənin cəzan:</small><b>${esc(dare)}</b></div></div></div>` : ''}
        ${H.players.get('host') ? `<details class="pp-log ph-mylog"><summary>Cavablarıma bax</summary>${(H.players.get('host').log || []).slice(-ROUND).map((r, i) => `<div class="pp-lr ${r.ok ? 'y' : 'n'}"><span>${i + 1}</span><p>${esc(r.q)}<small>${r.ok ? '✓ ' + esc(r.correct) : `✗ ${r.mine ? esc(r.mine) : 'cavab yox'} · düz: ${esc(r.correct)}`}</small></p></div>`).join('')}</details>` : ''}
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
      hostans: () => {
        const me = H.players.get('host'); if (!me || H.phase !== 'q' || me.ans != null) return;
        me.ans = +el.dataset.c; me.ms = performance.now() - H.t0; sfx('tap');
        const m = $('#phMine'); if (m) m.hidden = false;
        updateAnswered();
      },
      start: () => { if (live().length >= 2) { H.qs = []; H.qi = -1; H.rounds = 0; live().forEach(p => { p.score = 0; p.right = 0; p.log = []; }); startRound(); } },
      more: () => morePaywall(),
      buy: () => { H.bought = (H.bought || 0) + 1; document.querySelector('.ph-modal')?.remove(); startRound(); },
      nobuy: () => document.querySelector('.ph-modal')?.remove(),
      again: () => { clearT(); live().forEach(p => { p.score = 0; p.right = 0; p.log = []; send(p, { t: 'welcome', name: p.name, phase: 'lobby' }); }); H.qs = []; H.qi = -1; H.rounds = 0; lobby(); },
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
    if (d.t === 'welcome') { sfx('correct'); pscreen(`<div class="pp-logo">${mascot('party')}</div><h2>Sən içəridəsən, ${esc(d.name)}!</h2><p>Otağı açan oyunu başladanda suallar burada görünəcək.</p><div class="pp-wait"><i></i><i></i><i></i></div>`); }
    if (d.t === 'q') {
      J.qi = d.qi; J.locked = false;
      pscreen(`<div class="pp-qtop"><span>Sual ${d.n}/${d.total}</span><span class="pp-sec" id="ppSec">${Math.ceil(d.left)}</span></div>
        ${d.flag && !d.flagSmall && window.flagSVG ? `<div class="pp-flag">${flagSVG(d.flag)}</div>` : ''}
        <p class="pp-q">${d.flag && d.flagSmall && window.flagSVG ? flagSVG(d.flag, 'inline-flag') : ''}${esc(d.q)}</p>
        <div class="pp-opts">${d.opts.map((o, j) => `<button type="button" class="pp-opt" data-j="ans" data-c="${j}" style="--c:${MARKS[j][1]};animation-delay:${j * .06}s">${mark(j, 40)}<span class="ot">${esc(o)}</span></button>`).join('')}</div>`, 'q');
      const end = performance.now() + d.left * 1000;
      clearInterval(J.tick); J.tick = setInterval(() => { const s = $('#ppSec'); if (!s) return clearInterval(J.tick); s.textContent = Math.max(0, Math.ceil((end - performance.now()) / 1000)); }, 250);
    }
    if (d.t === 'wait') {
      clearInterval(J.tick);
      sfx(d.ok ? 'correct' : 'wrong');
      pscreen(`<div class="pp-res ${d.ok ? 'ok' : 'no'}"><div class="pp-big">${d.ok ? '✓' : d.answered ? '✗' : '⏱'}</div>
        <h2>${d.ok ? 'Düzdür!' : d.answered ? 'Səhv' : 'Vaxt bitdi'}</h2>
        ${d.ok ? '' : `<p>Düzgün cavab: <b>${esc(d.correct)}</b></p>`}
        <p class="pp-small">Xallar və reytinq oyunun sonunda açılacaq · ${d.n}/${d.total}</p></div>`, d.ok ? 'ok' : 'no');
    }
    if (d.t === 'end') {
      sfx(d.rank === 1 ? 'fanfare' : 'logo');
      const head = d.loser
        ? `<div class="pp-logo">${mascot('wow')}</div><h2>Cəza sənə düşdü! 😅</h2><div class="pp-dare">${esc(d.dare)}</div>`
        : `<div class="pp-logo">${mascot(d.rank <= 3 ? 'party' : 'happy')}</div><h2>${d.rank === 1 ? 'Qalib sənsən! 🏆' : `${d.rank}-ci yer`}</h2>`;
      const pod = (r, k) => r ? `<div class="pp-pod p${k}"><span style="--c:${r.color}">${esc(r.name[0])}</span><b>${esc(r.name)}</b><small>${r.score}</small><i>${k}</i></div>` : '';
      const T = d.table || [];
      pscreen(`${head}<div class="pp-podium">${pod(T[1], 2)}${pod(T[0], 1)}${pod(T[2], 3)}</div>
        <div class="pp-table">${T.map((r, i) => `<div class="pp-tr ${i + 1 === d.rank ? 'me' : ''}"><span>${i + 1}</span><b>${esc(r.name)}</b><em>${r.right}/${d.nQ}</em><strong>${r.score}</strong></div>`).join('')}</div>
        <div class="pp-stats"><div><b>${d.score}</b><small>xal</small></div><div><b>${d.right}/${d.nQ}</b><small>düz</small></div><div><b>${d.rank}/${d.of}</b><small>yer</small></div></div>
        ${!d.loser && d.dare ? `<p class="pp-small">Cəza ${esc(d.loserName)}-a düşdü: ${esc(d.dare)}</p>` : ''}
        <details class="pp-log"><summary>Cavablarıma bax</summary>${(d.log || []).map((r, i) => `<div class="pp-lr ${r.ok ? 'y' : 'n'}"><span>${i + 1}</span><p>${esc(r.q)}<small>${r.ok ? '✓ ' + esc(r.correct) : `✗ ${r.mine ? esc(r.mine) : 'cavab yox'} · düz: ${esc(r.correct)}`}</small></p></div>`).join('')}</details>`, 'end');
    }
  }
  function playerAct(a, el) {
    if (a === 'ans' && !J.locked) {
      J.locked = true; const c = +el.dataset.c;
      J.conn && J.conn.send({ t: 'ans', qi: J.qi, choice: c }); sfx('tap');
      document.querySelectorAll('.pp-opt').forEach((b, j) => b.classList.add(j === c ? 'picked' : 'off'));
      const q = document.querySelector('.pp-q'); q && (q.textContent = 'Cavab göndərildi ✓ Digərləri cavab verir…');
    }
    if (a === 'retry') join(J.code);
  }

  window.Party = { host, join, _state: () => H }; // _state: yalnız test üçün
  const p = new URLSearchParams(location.search).get('party');
  if (p) { try { sessionStorage.setItem('sualti-entered', '1'); } catch (e) {} document.addEventListener('DOMContentLoaded', () => { document.getElementById('splash')?.remove(); join(p); }); }
})();
