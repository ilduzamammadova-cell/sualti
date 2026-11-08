/* Sualtı: canlı dost dueli (1-ə-1, eyni anda).
   Çağıran link yaradır və gözləyir; dost linki açıb "Qəbul et" deyir; çağıran da qəbul edəndə 3-2-1 və oyun başlayır.
   Hər ikisi eyni suala eyni anda cavab verir. Hər sualdan sonra hər kəs öz cavabını və rəqibin düz/səhv olduğunu görür;
   xal yalnız sonda açılır. Sonda qalibə və uduzana zarafatlı atmaca.
   Əlaqə: PeerJS (WebRTC). Çağıran tərəf həqiqətin mənbəyidir: suallar, vaxt, xal. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const PEER_JS = 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js';
  const QSEC = 20, REVEAL_MS = 2800;
  const MARKS = [['shell', '#FF7A59'], ['fish', '#14B8D6'], ['jelly', '#8B5CF6'], ['star', '#F5A700']];
  const mark = (j, s = 40) => `<span class="cre" style="width:${s}px;height:${s}px">${window.creatureSVG ? creatureSVG(MARKS[j][0], '#FFFFFF') : ''}</span>`;
  const sfx = n => window.SFX && SFX.play(n);
  const loadScript = src => new Promise((res, rej) => {
    if (window.Peer) return res();
    const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
  });
  const code5 = () => Array.from({ length: 5 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
  // "da/də" ahəngi: adın son saitinə görə (İlduza da, Kamil də)
  const da = n => { const v = String(n).toLowerCase().match(/[aıoueəiöü](?=[^aıoueəiöü]*$)/); return v && 'eəiöü'.includes(v[0]) ? 'də' : 'da'; };
  const pts = (ok, ms) => ok ? 10 + Math.round(10 * Math.max(0, 1 - ms / 1000 / QSEC)) : 0;

  // Sonda atmacalar. {op}: rəqibin adı, {me}/{them}: düz cavab sayı, {w}: səhv sayı
  const TAUNTS = {
    win: [
      'Bugünün qalibi sənsən! 🏆 {op} hələ də başa düşmür ki, nə oldu.',
      'Bu gün ən dərinə sən daldın 🤿 {op} isə səthdə qalıb qabarcıq buraxır 🫧',
      '{me} düz cavab! {op} indi deyəcək ki, şans idi. Sən sadəcə gülümsə 😎',
      'Bilik bu gün sənin tərəfində idi. {op}, kitabları tozdan təmizləmək vaxtıdır 📚',
    ],
    lose: [
      'Bu gün qalib sən olmadın. {w} səhvin oldu, {op} səni sualtında qabaqladı 🐟 Yenə hazırlaş!',
      '{w} səhv... Deyəsən oksigenin tez bitdi 🫧 {op} bu gün səndən dərinə daldı. Revanş səni gözləyir!',
      'Bu dəfə {op} bir addım öndə idi. Sən {w} dəfə yolu azdın 🧭 Bir az məşq et, güclü qayıt!',
      '{op} bu nəticəni indi hamıya göstərəcək 😅 Onu susdurmağın bir yolu var: revanş!',
    ],
    draw: [
      'Heç-heçə! İki dalğıc, eyni dərinlik 🤝 Bu iş revanşsız bitməz 😄',
      'Bərabər bitdi! {op} ilə eyni dərinlikdəsiniz. Görək növbəti dəfə kim batacaq 🌊',
    ],
  };
  const taunt = (k, v) => { const a = TAUNTS[k]; return esc(a[Math.floor(Math.random() * a.length)]).replace(/\{(\w+)\}/g, (_, x) => esc(v[x] ?? '')); };

  let G = null;
  /* ── Su altı səhnəsi: şüalar, qabarcıqlar, üzən balıqlar ── */
  const FISH_C = ['#FFD43B', '#FF7A59', '#4FC3FF', '#8B5CF6', '#4ADE80', '#F472B6'];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const fishSVG = (c, s) => `<span class="duo-fish-in" style="width:${s}px;height:${s}px">${window.creatureSVG ? creatureSVG('fish', c) : ''}</span>`;
  function sea() {
    const bub = Array.from({ length: 18 }, () => { const s = rnd(6, 22); return `<i class="duo-bub" style="left:${rnd(2, 98)}%;width:${s}px;height:${s}px;animation-duration:${rnd(7, 15)}s;animation-delay:-${rnd(0, 15)}s"></i>`; }).join('');
    const fish = Array.from({ length: 5 }, (_, i) => { const rtl = i % 2; return `<span class="duo-fish ${rtl ? 'rtl' : ''}" style="top:${rnd(8, 88)}%;animation-duration:${rnd(16, 28)}s;animation-delay:-${rnd(0, 28)}s;opacity:${rnd(.35, .7)}">${fishSVG(FISH_C[i % FISH_C.length], rnd(26, 46))}</span>`; }).join('');
    return `<div class="duo-sea" aria-hidden="true"><div class="duo-rays"></div>${bub}${fish}<div class="duo-weed l"></div><div class="duo-weed r"></div></div>`;
  }
  function overlay(cls = '') {
    let o = $('#duo');
    if (!o) {
      o = document.createElement('div'); o.id = 'duo'; document.body.appendChild(o);
      o.innerHTML = `${sea()}<div class="duo-fx" id="duoFx" aria-hidden="true"></div><div class="duo-stage" id="duoStage"></div>`;
      o.addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (b) act(b.dataset.d, b); });
    }
    o.className = 'party player duo ' + cls; return o;
  }
  // Keçid: qabarcıq dalğası ekranı yuyub keçir
  function wipe() {
    const fx = $('#duoFx'); if (!fx) return;
    const w = document.createElement('div'); w.className = 'duo-wipe';
    w.innerHTML = Array.from({ length: 26 }, () => { const s = rnd(14, 46); return `<i style="left:${rnd(0, 100)}%;width:${s}px;height:${s}px;animation-delay:${rnd(0, .25)}s"></i>`; }).join('');
    fx.appendChild(w); setTimeout(() => w.remove(), 1300);
  }
  const screen = (html, cls = '', fx = true) => {
    overlay(cls); if (fx) wipe();
    $('#duoStage').innerHTML = `<div class="pp ${fx ? 'duo-in' : ''}">${html}</div>`;
  };
  // Effektlər: düz cavab qabarcıq partlayışı, qələbə bayramı, məğlubiyyətdə dibə enmə
  function burst(n = 22) {
    const fx = $('#duoFx'); if (!fx) return;
    const b = document.createElement('div'); b.className = 'duo-burst';
    b.innerHTML = Array.from({ length: n }, () => { const a = rnd(0, Math.PI * 2), d = rnd(90, 210), s = rnd(8, 22);
      return `<i style="--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d}px;width:${s}px;height:${s}px;animation-delay:${rnd(0, .12)}s"></i>`; }).join('');
    fx.appendChild(b); setTimeout(() => b.remove(), 1400);
  }
  function celebrate() {
    const fx = $('#duoFx'); if (!fx) return;
    const c = document.createElement('div'); c.className = 'duo-party';
    const kinds = ['star', 'shell', 'jelly'];
    const rain = Array.from({ length: 22 }, (_, i) => `<span class="duo-drop" style="left:${rnd(0, 96)}%;animation-duration:${rnd(2.6, 4.6)}s;animation-delay:${rnd(0, 1.6)}s;--r:${rnd(-200, 200)}deg"><span style="width:${rnd(22, 34)}px;height:${rnd(22, 34)}px;display:block">${window.creatureSVG ? creatureSVG(kinds[i % 3], FISH_C[i % FISH_C.length]) : ''}</span></span>`).join('');
    const school = Array.from({ length: 9 }, (_, i) => `<span class="duo-school" style="top:${18 + (i % 3) * 9 + rnd(-3, 3)}%;animation-delay:${Math.floor(i / 3) * .25 + rnd(0, .15)}s">${fishSVG(FISH_C[i % FISH_C.length], rnd(30, 44))}</span>`).join('');
    const bubs = Array.from({ length: 30 }, () => { const s = rnd(8, 26); return `<i class="duo-up" style="left:${rnd(0, 100)}%;width:${s}px;height:${s}px;animation-delay:${rnd(0, 1.4)}s;animation-duration:${rnd(1.8, 3.2)}s"></i>`; }).join('');
    c.innerHTML = rain + school + bubs;
    fx.appendChild(c); setTimeout(() => c.remove(), 6500);
  }
  function sink() {
    const fx = $('#duo .duo-sea'); if (!fx) return; // mətnin arxasında batsın
    const c = document.createElement('div'); c.className = 'duo-sink';
    c.innerHTML = Array.from({ length: 10 }, () => { const s = rnd(6, 16); return `<i class="duo-up slow" style="left:${rnd(10, 90)}%;width:${s}px;height:${s}px;animation-delay:${rnd(0, 2)}s"></i>`; }).join('')
      + `<span class="duo-sadfish">${fishSVG('#94A3B8', 54)}</span>`;
    fx.appendChild(c); setTimeout(() => c.remove(), 6000);
  }
  const clearT = () => { if (!G) return; G.timers.forEach(t => { clearTimeout(t); clearInterval(t); }); G.timers = []; };
  const send = m => { try { G && G.conn && G.conn.open && G.conn.send(m); } catch (e) {} };
  const link = () => `${location.origin}${location.pathname}?oyun=${encodeURIComponent(G.key)}&duel=${G.code}&f=${encodeURIComponent(G.me)}`;
  const qPayload = (q, i) => ({ i, n: i + 1, total: G.qs.length, q: q.q, opts: q.opts, flag: q.flag || null, flagSmall: !!q.flagSmall });

  /* ════════ ÇAĞIRAN (host) ════════ */
  function host({ f, key, items }) {
    close(true);
    G = { role: 'host', me: f, op: 'Rəqib', key, base: items.filter(q => q.kind !== 'e' && q.opts), code: code5(), timers: [], conn: null, peer: null, phase: 'wait', opIn: false };
    waitScreen();
    loadScript(PEER_JS).then(() => openRoom()).catch(() => waitStatus('Əlaqə kitabxanası yüklənmədi. İnterneti yoxla.', true));
  }
  function openRoom(tries = 0) {
    try {
      const peer = new Peer('sualti-duo-' + G.code, { debug: 0 }); G.peer = peer;
      peer.on('open', () => { G.online = true; waitScreen(); });
      peer.on('error', e => {
        if (e.type === 'unavailable-id' && tries < 3) { peer.destroy(); G.code = code5(); openRoom(tries + 1); }
        else if (!G.online) waitStatus('Canlı əlaqə qurulmadı. Səhifəni yenilə və yenidən cəhd et.', true);
      });
      peer.on('connection', conn => {
        if (G.conn && G.conn.open) { conn.on('open', () => { conn.send({ t: 'busy' }); setTimeout(() => conn.close(), 300); }); return; }
        G.conn = conn;
        conn.on('data', onGuest);
        conn.on('close', lost);
      });
    } catch (e) { waitStatus('Canlı əlaqə qurulmadı.', true); }
  }
  function waitScreen() {
    if (G.phase !== 'wait') return;
    const ready = G.online;
    screen(`<div class="pp-logo">${window.mascot ? mascot('think') : ''}</div>
      <h2>Duel otağı ${ready ? 'hazırdır' : 'açılır…'}</h2>
      <p>Linki dostuna göndər. O, adını yazıb “Qəbul et” deyəndə burada görəcəksən.</p>
      ${ready ? `<div class="duo-link"><span id="duoLink">${esc(link())}</span></div>
      <button class="btn block" data-d="share">Linki göndər 🔗</button>
      <button class="btn white block" data-d="copy">Linki kopyala</button>` : '<div class="pp-wait"><i></i><i></i><i></i></div>'}
      <div class="duo-pills"><span class="on">✓ ${esc(G.me)}</span><span>⏳ rəqib gözlənilir</span></div>
      <p class="pp-small" id="duoStatus">${ready ? 'Bu səhifəni bağlama, duel buradan idarə olunur.' : ''}</p>
      <button class="mk-solo" data-d="close">Ləğv et</button>`);
  }
  function waitStatus(t, bad) { const s = $('#duoStatus'); if (s) { s.textContent = t; s.classList.toggle('bad', !!bad); } }
  function onGuest(d) {
    if (!d || !d.t) return;
    if (d.t === 'hello') {
      if (d.name) G.op = String(d.name).slice(0, 24);
      G.opIn = true; G.phase = 'accept'; sfx('correct');
      send({ t: 'hi', host: G.me, you: G.op });
      screen(`<div class="pp-logo">${window.mascot ? mascot('wow') : ''}</div>
        <h2>${esc(G.op)} qəbul etdi! ⚔️</h2>
        <p>20 çətin sual, hər suala 20 saniyə. Sən də qəbul edən kimi başlayırıq.</p>
        <div class="duo-pills"><span>⏳ ${esc(G.me)}</span><span class="on">✓ ${esc(G.op)}</span></div>
        <button class="btn block pulse" data-d="accept">Qəbul et ⚔️</button>
        <button class="mk-solo" data-d="close">İmtina et</button>`);
    }
    if (d.t === 'ans' && G.phase === 'q' && d.i === G.qi && !G.ans.op) {
      G.ans.op = { c: d.c, ms: performance.now() - G.t0 };
      const el = $('#duoOp'); if (el) el.classList.add('on');
      if (G.ans.me) G.timers.push(setTimeout(reveal, 350));
    }
    if (d.t === 'rematch' && G.phase === 'end') start(true);
    if (d.t === 'bye') lost();
  }
  function start(rematch) {
    clearT();
    G.qs = rematch ? shuffle(G.base) : G.base.slice();
    G.qi = -1; G.score = { me: 0, op: 0 }; G.right = { me: 0, op: 0 }; G.log = [];
    G.phase = 'count'; send({ t: 'count' }); countdown(() => nextQ());
  }
  function nextQ() {
    clearT(); G.qi++;
    if (G.qi >= G.qs.length) return finish();
    G.phase = 'q'; G.ans = { me: null, op: null }; G.t0 = performance.now();
    const p = qPayload(G.qs[G.qi], G.qi);
    send({ t: 'q', ...p, left: QSEC });
    showQ(p, QSEC);
    G.timers.push(setInterval(() => { if (performance.now() - G.t0 >= QSEC * 1000) reveal(); }, 200));
  }
  function reveal() {
    if (G.phase !== 'q') return; G.phase = 'rev'; clearT();
    const q = G.qs[G.qi], A = G.ans;
    const okMe = !!A.me && A.me.c === q.a, okOp = !!A.op && A.op.c === q.a;
    G.score.me += pts(okMe, A.me ? A.me.ms : 0); G.score.op += pts(okOp, A.op ? A.op.ms : 0);
    if (okMe) G.right.me++; if (okOp) G.right.op++;
    G.log.push({ q: q.q, correct: q.opts[q.a], me: A.me ? q.opts[A.me.c] : null, op: A.op ? q.opts[A.op.c] : null, okMe, okOp });
    const last = G.qi + 1 >= G.qs.length;
    send({ t: 'rev', correct: q.opts[q.a], a: q.a, mine: A.op ? A.op.c : null, ok: okOp, opOk: okMe, opAns: !!A.me, last });
    showRev({ correct: q.opts[q.a], a: q.a, mine: A.me ? A.me.c : null, ok: okMe, opOk: okOp, opAns: !!A.op, last });
    G.timers.push(setTimeout(nextQ, REVEAL_MS));
  }
  function finish() {
    G.phase = 'end';
    const flip = l => l.map(r => ({ q: r.q, correct: r.correct, me: r.op, op: r.me, okMe: r.okOp, okOp: r.okMe }));
    send({ t: 'end', me: { name: G.op, score: G.score.op, right: G.right.op }, op: { name: G.me, score: G.score.me, right: G.right.me }, log: flip(G.log), n: G.qs.length });
    showEnd({ me: { name: G.me, score: G.score.me, right: G.right.me }, op: { name: G.op, score: G.score.op, right: G.right.op }, log: G.log, n: G.qs.length });
  }

  /* ════════ ÇAĞIRILAN (guest) ════════ */
  function join({ code, f, t }) {
    close(true);
    G = { role: 'guest', me: t || 'Mən', op: f || 'Dostun', code, timers: [], conn: null, peer: null, phase: 'join' };
    screen(`<div class="pp-logo">${window.mascot ? mascot('happy') : ''}</div><h2>Qoşulur…</h2>
      <p>${esc(G.op)} ilə əlaqə qurulur</p><div class="pp-wait"><i></i><i></i><i></i></div><p class="pp-small" id="duoStatus"></p>`);
    loadScript(PEER_JS).then(() => {
      G.peer = new Peer({ debug: 0 });
      G.peer.on('open', () => {
        G.conn = G.peer.connect('sualti-duo-' + G.code, { reliable: true });
        G.conn.on('open', () => send({ t: 'hello', name: G.me }));
        G.conn.on('data', onHost);
        G.conn.on('close', lost);
      });
      G.peer.on('error', e => fail(e.type === 'peer-unavailable'
        ? `Duel otağı tapılmadı. ${esc(G.op)} duel səhifəsini bağlamış ola bilər. Ondan yeni link istə.`
        : 'Qoşulmaq alınmadı. İnterneti yoxla və yenidən cəhd et.'));
    }).catch(() => fail('Əlaqə kitabxanası yüklənmədi. İnterneti yoxla.'));
  }
  function fail(msg) {
    if (!G || G.phase !== 'join') return;
    screen(`<div class="pp-logo">${window.mascot ? mascot('sad') : ''}</div><h2>Alınmadı 😕</h2><p>${msg}</p>
      <button class="btn block" data-d="retry">Yenidən cəhd et</button><button class="mk-solo" data-d="close">Bağla</button>`);
  }
  function onHost(d) {
    if (!d || !d.t) return;
    if (d.t === 'busy') { G.phase = 'join'; return fail('Bu duelə artıq başqası qoşulub.'); }
    if (d.t === 'hi') {
      G.op = d.host || G.op; G.phase = 'accepted'; sfx('correct');
      screen(`<div class="pp-logo">${window.mascot ? mascot('party') : ''}</div><h2>Qəbul etdin ✓</h2>
        <p>${esc(G.op)} ${da(G.op)} qəbul edən kimi duel başlayacaq.</p>
        <div class="duo-pills"><span>⏳ ${esc(G.op)}</span><span class="on">✓ ${esc(G.me)}</span></div>
        <div class="pp-wait"><i></i><i></i><i></i></div>`);
    }
    if (d.t === 'count') { clearT(); G.phase = 'count'; countdown(); }
    if (d.t === 'q') { G.phase = 'q'; showQ(d, d.left); }
    if (d.t === 'opdone') { const el = $('#duoOp'); if (el) el.classList.add('on'); }
    if (d.t === 'rev') { G.phase = 'rev'; showRev(d); }
    if (d.t === 'end') { G.phase = 'end'; showEnd(d); }
  }

  /* ════════ Ortaq ekranlar ════════ */
  function countdown(done) {
    let n = 3; sfx('swoosh');
    const draw = () => screen(`<p class="duo-vs"><b>${esc(G.me)}</b> <i>VS</i> <b>${esc(G.op)}</b></p><div class="duo-count" key="${n}">${n}</div><p>Hazırlaş! Dərindən nəfəs al 🫧</p>`, '', n === 3);
    draw();
    const t = setInterval(() => { n--; if (n <= 0) { clearInterval(t); done && done(); } else { draw(); sfx('tick'); } }, 900);
    G.timers.push(t);
  }
  function showQ(d, left) {
    G.qi = d.i; G.locked = false; G.t0g = performance.now();
    screen(`<div class="pp-qtop"><span>Sual ${d.n}/${d.total}</span><span class="pp-sec" id="duoSec">${Math.ceil(left)}</span></div>
      <div class="duo-pills sm"><span class="on">${esc(G.me)}</span><span id="duoOp">${esc(G.op)} ✓</span></div>
      ${d.flag && !d.flagSmall && window.flagSVG ? `<div class="pp-flag">${flagSVG(d.flag)}</div>` : ''}
      <p class="pp-q">${d.flag && d.flagSmall && window.flagSVG ? flagSVG(d.flag, 'inline-flag') : ''}${esc(d.q)}</p>
      <div class="pp-opts">${d.opts.map((o, j) => `<button type="button" class="pp-opt" data-d="ans" data-c="${j}" style="--c:${MARKS[j][1]};animation-delay:${j * .06}s">${mark(j)}<span class="ot">${esc(o)}</span></button>`).join('')}</div>`, 'q');
    const end = performance.now() + left * 1000;
    G.timers.push(setInterval(() => { const s = $('#duoSec'); if (s) s.textContent = Math.max(0, Math.ceil((end - performance.now()) / 1000)); }, 250));
  }
  function showRev(d) {
    clearT();
    sfx(d.ok ? 'correct' : 'wrong');
    const opLine = d.opAns ? (d.opOk ? `${esc(G.op)} ${da(G.op)} düz tapdı ✓` : `${esc(G.op)} səhv etdi ✗`) : `${esc(G.op)} cavab vermədi ⏱`;
    screen(`<div class="pp-res ${d.ok ? 'ok' : 'no'}"><div class="pp-big">${d.ok ? '✓' : d.mine != null ? '✗' : '⏱'}</div>
      <h2>${d.ok ? 'Düzdür!' : d.mine != null ? 'Səhv' : 'Vaxt bitdi'}</h2>
      ${d.ok ? '' : `<p>Düzgün cavab: <b>${esc(d.correct)}</b></p>`}
      <div class="duo-opline ${d.opOk ? 'y' : 'n'}">${opLine}</div>
      <p class="pp-small">${d.last ? 'Nəticə hesablanır 🏆' : 'Xallar sonda açılacaq 🤫 Növbəti sual gəlir'}</p></div>`, d.ok ? 'ok' : 'no');
    if (d.ok) setTimeout(() => burst(), 180);
  }
  function showEnd(d) {
    clearT();
    const me = d.me, op = d.op, win = me.score > op.score, draw = me.score === op.score;
    sfx(win ? 'fanfare' : draw ? 'logo' : 'wrong');
    const line = taunt(draw ? 'draw' : win ? 'win' : 'lose', { op: op.name, me: me.right, them: op.right, w: d.n - me.right });
    setTimeout(() => (win ? celebrate() : draw ? burst(30) : sink()), 250);
    const card = (p, w) => `<div class="duo-p ${w ? 'won' : ''}"><small>${esc(p.name)}</small><b>${p.score}</b><span>${p.right}/${d.n} düz</span>${w ? '<i>👑</i>' : ''}</div>`;
    screen(`<div class="pp-logo">${window.mascot ? mascot(win ? 'party' : draw ? 'happy' : 'sad') : ''}</div>
      <h2>${draw ? 'Heç-heçə! 🤝' : win ? 'Bugünün qalibi sənsən! 🏆' : 'Bu gün qalib sən olmadın 🙈'}</h2>
      <div class="duo-score">${card(me, win)}<span>:</span>${card(op, !win && !draw)}</div>
      <div class="duo-taunt ${win ? 'win' : draw ? '' : 'lose'}">${line}</div>
      <button class="btn block" data-d="rematch">Revanş ⚔️</button>
      <details class="pp-log"><summary>Cavablara bax</summary>${(d.log || []).map((r, i) => `<div class="pp-lr ${r.okMe ? 'y' : 'n'}"><span>${i + 1}</span><p>${esc(r.q)}<small>${r.okMe ? '✓ ' + esc(r.correct) : `✗ ${r.me ? esc(r.me) : 'cavab yox'} · düz: ${esc(r.correct)}`}</small><small class="duo-their">${esc(op.name)}: ${r.okOp ? '✓' : '✗'}</small></p></div>`).join('')}</details>
      <button class="btn white block" data-d="close">Sualtını kəşf et 🤿</button>`, win ? 'end win' : draw ? 'end' : 'end lose');
  }
  function lost() {
    if (!G || G.phase === 'end' || G.closing) return;
    clearT(); G.phase = 'lost';
    screen(`<div class="pp-logo">${window.mascot ? mascot('sad') : ''}</div><h2>Əlaqə kəsildi 😕</h2>
      <p>${esc(G.op)} oyundan çıxdı və ya internet kəsildi.</p><button class="btn white block" data-d="close">Bağla</button>`);
  }
  function close(silent) {
    if (G) { G.closing = true; clearT(); if (!silent) send({ t: 'bye' }); try { G.peer && G.peer.destroy(); } catch (e) {} }
    G = null; const o = $('#duo'); if (o && !silent) o.remove();
  }
  async function shareLink() {
    const text = `Hey! 👋 ${G.me} səni Sualtı canlı quiz duelinə çağırır ⚔️\n20 çətin sual, eyni anda oynayırıq. Cəsarətin var?\nQəbul et:`;
    try { if (navigator.share) { await navigator.share({ text, url: link() }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    copyLink(text);
  }
  async function copyLink(text) {
    const full = text ? `${text}\n${link()}` : link();
    try { await navigator.clipboard.writeText(full); waitStatus('Kopyalandı ✓ WhatsApp və ya Telegram-a yapışdır. Bu səhifəni bağlama.'); }
    catch (e) { const r = document.createRange(), el = $('#duoLink'); if (el) { r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } waitStatus('Linki seçib kopyala.'); }
  }
  function act(a, el) {
    if (!G && a !== 'close') return;
    if (a === 'share') return shareLink();
    if (a === 'copy') return copyLink();
    if (a === 'accept' && G.role === 'host' && G.phase === 'accept') { sfx('tap'); return start(false); }
    if (a === 'ans' && G.phase === 'q' && !G.locked) {
      G.locked = true; const c = +el.dataset.c; sfx('tap');
      document.querySelectorAll('#duo .pp-opt').forEach((b, j) => { b.classList.add(j === c ? 'picked' : 'off'); b.disabled = true; });
      if (G.role === 'host') {
        G.ans.me = { c, ms: performance.now() - G.t0 }; send({ t: 'opdone' });
        if (G.ans.op) G.timers.push(setTimeout(reveal, 350));
      } else send({ t: 'ans', i: G.qi, c });
      const q = $('#duo .pp-q'); if (q) q.insertAdjacentHTML('afterend', `<p class="pp-small duo-sent">Cavabın getdi ✓ İndi ${esc(G.op)} düşünür...</p>`);
      return;
    }
    if (a === 'rematch') {
      if (G.role === 'host') return start(true);
      send({ t: 'rematch' }); el.textContent = 'Revanş istəyi göndərildi…'; el.disabled = true; return;
    }
    if (a === 'retry') { const g = G; return join({ code: g.code, f: g.op, t: g.me }); }
    if (a === 'close') { close(false); if (window.__sualti) history.replaceState(null, '', location.pathname); }
  }
  window.Duo = { host, join, _state: () => G }; // _state: yalnız test üçün
})();
