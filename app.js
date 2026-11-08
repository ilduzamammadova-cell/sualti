/* Sualtı — demo tətbiq */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const IMG = id => `img/${id}.jpg`; // Unsplash şəkilləri lokal saxlanılır
  const LENS = Object.fromEntries(LENSES.map(l => [l.slug, l]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fmt = n => n.toLocaleString('az-AZ').replace(/,/g, ' ');

  /* ── İkonlar ── */
  const ICON = {
    pearl: `<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#F4F1FF" stroke="#0B2A5B" stroke-width="2"/><circle cx="9" cy="8.5" r="3" fill="#fff"/><path d="M6 15a7 7 0 0 0 11 1" stroke="#C9C2F2" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
    streak: `<svg class="ico" viewBox="0 0 24 24"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z" fill="#FF7A45" stroke="#0B2A5B" stroke-width="2" stroke-linejoin="round"/><path d="M12 13c1 1.5 3 2.5 3 5a3 3 0 0 1-6 0c0-1.5 1-2.5 3-5z" fill="#FFD43B"/></svg>`,
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>`,
    grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><rect x="3" y="3" width="7.5" height="7.5" rx="2.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2.5"/></svg>`,
    trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 13v4M8 21h8M9 17h6"/></svg>`,
    user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/></svg>`,
    sound: `<svg viewBox="0 0 24 24" fill="none" stroke="#0B2A5B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#2EC5F5"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>`,
    mute: `<svg viewBox="0 0 24 24" fill="none" stroke="#0B2A5B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#C9D6EA"/><path d="M17 9l5 6M22 9l-5 6"/></svg>`,
    speak: `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#fff"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="#0B2A5B" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
    tank: `<svg class="ox-ico" viewBox="0 0 24 24"><rect x="7" y="5" width="10" height="17" rx="5" fill="#2EC5F5" stroke="#0B2A5B" stroke-width="2"/><rect x="10" y="1.5" width="4" height="4" rx="1" fill="#0B2A5B"/><rect x="9" y="9" width="2.4" height="8" rx="1.2" fill="#fff" opacity=".7"/></svg>`,
    crown: `<svg class="crown" viewBox="0 0 40 28"><path d="M3 8l8 7 9-12 9 12 8-7-3 18H6z" fill="#FFD43B" stroke="#0B2A5B" stroke-width="2.5" stroke-linejoin="round"/><circle cx="20" cy="17" r="3" fill="#FF7A59"/></svg>`,
    sparkle: `<svg class="sparkle" viewBox="0 0 24 24"><path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12z" fill="#fff"/></svg>`,
  };

  const AV_COLORS = ['#FF7A59', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#14B8A6', '#EF4444'];
  const avatar = (name, i) => `<span class="avatar" style="background:${AV_COLORS[i % AV_COLORS.length]}">${name.trim()[0]}</span>`;

  /* ── Dərinlik səviyyələri ── */
  const ZONES = [
    { name: 'Səth', m: 0 }, { name: 'Mərcan rifi', m: 100 }, { name: 'Alaqaranlıq zonası', m: 300 },
    { name: 'Gecə zonası', m: 1000 }, { name: 'Uçurum', m: 4000 }, { name: 'Mariana', m: 11000 },
  ];
  const zoneOf = d => { let i = 0; while (i < ZONES.length - 1 && d >= ZONES[i + 1].m) i++; return { cur: ZONES[i], next: ZONES[i + 1], idx: i }; };

  /* ── Vəziyyət ── */
  const S = {
    screen: 'home', pearls: 1240, depth: 340, streak: 6, weekly: 980, dailyDone: false,
    lensStats: { elm: [14, 11], tarix: [9, 6], cografiya: [12, 10], incesenet: [5, 3], edebiyyat: [8, 6], felsefe: [3, 2], medeniyyet: [10, 8], pop: [6, 5], idman: [4, 2], texnologiya: [7, 6] },
    quiz: null, lb: 'league',
  };

  /* ── Fon qabarcıqları ── */
  (function bubbles() {
    const host = $('#bubbles');
    for (let i = 0; i < 26; i++) {
      const b = document.createElement('span');
      const s = 6 + Math.random() * 26;
      Object.assign(b.style, { left: Math.random() * 100 + '%', width: s + 'px', height: s + 'px', animationDuration: 9 + Math.random() * 14 + 's', animationDelay: -Math.random() * 20 + 's' });
      host.appendChild(b);
    }
  })();

  $('#brandLogo').innerHTML = `${logoMark(84)}<span class="chunky mid" style="font-size:52px">sualtı</span>`;

  /* ── Üst panel / alt menyu ── */
  function topbar() {
    const t = $('#topbar');
    if (S.screen === 'quiz' || S.screen === 'result') { t.innerHTML = ''; t.style.display = 'none'; return; }
    t.style.display = '';
    t.innerHTML = `
      <div class="wordmark">${logoMark(40)}<span class="wordmark-text">sual<span class="t2">tı</span></span></div>
      <div class="pills">
        <button class="pill snd" data-act="sound" aria-label="Səsi aç/bağla">${SFX.on ? ICON.sound : ICON.mute}</button>
        <span class="pill" id="pStreak" title="Seriya">${ICON.streak}${S.streak}</span>
        <span class="pill" id="pPearl" title="İnci">${ICON.pearl}${fmt(S.pearls)}</span>
      </div>`;
  }
  function tabbar() {
    const tb = $('#tabbar');
    tb.classList.toggle('hidden', S.screen === 'quiz' || S.screen === 'result');
    const tabs = [['home', 'Əsas', ICON.home], ['lenses', 'Linzalar', ICON.grid], ['board', 'Reytinq', ICON.trophy], ['profile', 'Profil', ICON.user]];
    tb.innerHTML = tabs.map(([k, l, i]) => `<button class="tab ${S.screen === k ? 'active' : ''}" data-go="${k}">${i}<span>${l}</span></button>`).join('');
  }

  function go(screen) { stopTimer(); SFX.stopSpeak(); if (screen !== S.screen) SFX.play('swoosh'); S.screen = screen; render(); $('#view').scrollTop = 0; }
  function render() {
    topbar(); tabbar();
    const v = $('#view');
    v.innerHTML = `<div class="screen">${SCREENS[S.screen]()}</div>`;
    after[S.screen] && after[S.screen]();
  }

  /* ── Ekranlar ── */
  const SCREENS = {
    home() {
      const z = zoneOf(S.depth);
      const pct = z.next ? Math.round((S.depth - z.cur.m) / (z.next.m - z.cur.m) * 100) : 100;
      const featured = ['elm', 'tarix', 'medeniyyet', 'cografiya', 'pop'];
      return `
        <div class="card depth-card">
          <div class="depth-gauge" style="--p:${pct}%"><span>${S.depth}m</span></div>
          <div class="depth-meta">
            <small>Dərinliyin</small>
            <b>${z.cur.name}</b>
            <div class="bar"><i data-w="${pct}%"></i></div>
            <small>${z.next ? `Növbəti: ${z.next.name} · ${z.next.m - S.depth} m qalıb` : 'Ən dərin nöqtədəsən!'}</small>
          </div>
        </div>

        <div class="hero" style="background-image:url('${IMG('photo-1583212292454-1fe6229603b7', 800)}')">
          <div class="hero-mascot">${mascot('happy')}</div>
          <span class="tag">${S.dailyDone ? 'Tamamlandı ✓' : 'Günün dalışı'}</span>
          <h2 class="chunky mid">Gündəlik<br><span class="yellow">20 sual</span></h2>
          <p>${S.dailyDone ? 'Sabah yeni suallar gələcək. Linzalarda dalmağa davam et!' : 'Hər linzadan 2 sual — hamı üçün eyni 20 sual.'}</p>
          <button class="btn ${S.dailyDone ? 'white' : 'pulse'}" data-act="${S.dailyDone ? 'lenses' : 'daily'}">${S.dailyDone ? 'Linzalara keç' : 'Dal! 🤿'}</button>
        </div>

        <div class="h2">Linzalar <small data-go="lenses">Hamısı →</small></div>
        <div class="scroller">${featured.map((s, i) => tile(LENS[s], i)).join('')}</div>

        <div class="card row-card teaser">
          <div class="grow">
            <span class="big-pct">71%</span>
            <b>bu suala səhv cavab verdi</b>
            <small style="color:#C9DCFF">Xəzər dənizi hansı ölkə ilə həmsərhəd deyil?</small>
          </div>
          <button class="btn sm" data-act="hard">Bəs sən?</button>
        </div>

        <div class="card row-card">
          ${avatar('Murad', 1)}
          <div class="grow"><b>Murad səni duelə çağırdı</b><small>Coğrafiya · 5 sual · Gəncə</small></div>
          <button class="btn sm blue" data-act="duel">Qəbul</button>
        </div>`;
    },

    lenses() {
      return `
        <div class="h2" style="margin-top:6px">Linzanı seç</div>
        <p class="muted" style="margin:-4px 2px 14px;font-weight:700">Eyni dünyaya 10 fərqli baxış. Zəif linzada oynasan — <b style="color:#1E6BFF">2× dərinlik</b>.</p>
        <div class="tiles">${LENSES.map((l, i) => tile(l, i)).join('')}</div>`;
    },

    quiz() {
      const Q = S.quiz, q = Q.items[Q.i], L = LENS[q.lens];
      const kindLbl = { k: 'Bilik', o: 'Baxış', e: 'Təxmin' }[q.kind];
      const dots = Q.items.map((_, j) => `<i class="${j < Q.i ? (Q.res[j] ? 'done' : 'miss') : j === Q.i ? 'cur' : ''}"></i>`).join('');
      let body;
      if (q.kind === 'e') {
        const mid = Math.round((q.min + q.max) / 2 / q.step) * q.step;
        body = `<div class="estimate">
            <div class="val"><span id="estVal">${fmt(mid)}</span> <small>${q.unit}</small></div>
            <input type="range" id="est" min="${q.min}" max="${q.max}" step="${q.step}" value="${mid}" aria-label="Təxmin">
            <div class="scale"><span>${fmt(q.min)}</span><span>${fmt(q.max)}</span></div>
            <button class="btn blue block" data-act="estimate" style="margin-top:16px">Təsdiqlə</button>
          </div>`;
      } else {
        body = `<div class="opts">${q.opts.map((o, j) => `
            <button class="opt" data-opt="${j}" style="animation-delay:${0.05 + j * 0.06}s">
              <span class="pct-fill"></span><span class="key">${'ABCD'[j]}</span><span class="lbl">${o}</span><span class="pct"></span>
            </button>`).join('')}</div>`;
      }
      return `
        <div class="quiz-top">
          <button class="icon-btn" data-act="quit" aria-label="Çıx">${ICON.close}</button>
          <button class="icon-btn snd" data-act="sound" aria-label="Səsi aç/bağla">${SFX.on ? ICON.sound : ICON.mute}</button>
          ${Q.items.length > 8
            ? `<div class="qprog"><div class="qprog-bar"><i style="width:${Q.i / Q.items.length * 100}%"></i></div><b>${Q.i + 1}/${Q.items.length}</b></div>`
            : `<div class="progress-dots">${dots}</div>`}
        </div>
        <div class="oxygen" id="ox">${ICON.tank}<div class="ox-bar"><i id="oxBar"></i></div><b id="oxSec">${Q.time}</b></div>
        <div class="card q-card" style="margin-top:58px">
          <div class="q-mascot" id="qMascot">${mascot('think')}</div>
          <span class="q-lens" style="--c:${L.color}">${L.name}</span><span class="q-kind">${kindLbl}</span>
          <button class="read-btn" data-act="read" aria-label="Sualı səsli oxu">${ICON.speak}<span>Dinlə</span></button>
          <div class="q-text">${q.q}</div>
        </div>
        ${body}
        <div id="fb"></div>`;
    },

    result() {
      const Q = S.quiz, ok = Q.res.filter(Boolean).length, n = Q.items.length;
      const mood = ok >= 4 ? 'party' : ok >= 2 ? 'happy' : 'sad';
      const title = ok >= 4 ? 'Əla dalış!' : ok >= 2 ? 'Yaxşı dalış!' : 'Yenə dal!';
      return `
        <div class="result">
          <div class="sun">${mascot(mood)}</div>
          <h2 class="chunky mid" style="margin-top:6px">${title}</h2>
          <p class="muted" style="font-weight:800;margin:10px 0 0">${Q.title}</p>
          <div class="stats">
            <div class="card stat"><b data-count="${ok}">0</b><small>/ ${n} düzgün</small></div>
            <div class="card stat"><b data-count="${Q.gainP}" data-plus>0</b><small>inci</small></div>
            <div class="card stat"><b data-count="${Q.gainD}" data-plus data-unit="m">0</b><small>dərinlik</small></div>
          </div>
          <div class="card" style="text-align:left;display:flex;gap:12px;align-items:center;margin-bottom:18px">
            ${ICON.pearl.replace('class="ico"', 'style="width:40px;height:40px;flex:none"')}
            <div><b style="font-family:var(--display);font-size:17px">İndi ${S.depth} m dərinlikdəsən</b><br>
            <small class="muted" style="font-weight:700">${zoneOf(S.depth).cur.name}</small></div>
          </div>
          <div style="display:grid;gap:14px">
            <button class="btn blue block" data-go="board">Reytinqə bax</button>
            <button class="btn white block" data-go="home">Əsas səhifə</button>
          </div>
        </div>`;
    },

    board() {
      const league = [
        ['Aysel', 'Bakı', 1460], ['Tural', 'Gəncə', 1325], ['Leyla', 'Şəki', 1210], ['Nigar', 'Sumqayıt', 1105],
        ['Elvin', 'Bakı', 1040], ['Günay', 'Lənkəran', 990], ['Rauf', 'Quba', 870], ['Səbinə', 'Mingəçevir', 760],
        ['Orxan', 'Bakı', 690], ['Kamran', 'Naxçıvan', 610], ['Lalə', 'Şamaxı', 540],
      ].map(([n, c, s]) => ({ n, c, s }));
      league.push({ n: 'Sən', c: 'Bakı', s: S.weekly, me: true });
      league.sort((a, b) => b.s - a.s);
      const cities = [
        ['Bakı', 48210], ['Gəncə', 21460], ['Sumqayıt', 17930], ['Şəki', 9820], ['Lənkəran', 8740],
        ['Naxçıvan', 8120], ['Quba', 6350], ['Mingəçevir', 5980], ['Şamaxı', 4410],
      ].map(([n, s]) => ({ n, c: 'şəhər', s }));
      const list = S.lb === 'league' ? league : cities;
      const top = list.slice(0, 3), rest = list.slice(3);
      const pod = (p, r, delay) => p ? `
        <div class="pod p${r}">
          ${r === 1 ? ICON.crown : ''}
          <div style="animation-delay:${delay}s" class="pod-av">${avatar(p.n, list.indexOf(p))}</div>
          <div class="nm">${p.n}</div>
          <div class="sc">${ICON.pearl.replace('class="ico"', 'style="width:14px;height:14px"')}${fmt(p.s)}</div>
          <div class="block" style="animation-delay:${delay - .2}s">${r}</div>
        </div>` : '';
      return `
        <div class="seg">
          <button class="${S.lb === 'league' ? 'on' : ''}" data-lb="league">Həftəlik liqa</button>
          <button class="${S.lb === 'city' ? 'on' : ''}" data-lb="city">Şəhərlər</button>
        </div>
        ${S.lb === 'league' ? `
        <div class="card league-banner">
          <span style="font-size:30px">🪸</span>
          <div class="grow" style="flex:1"><small class="muted" style="font-weight:800">Mərcan liqası bitir</small><div class="timer" id="lbTimer">2g 14:05:30</div></div>
        </div>` : `<p class="muted" style="font-weight:700;margin:0 2px">Şəhərinin xalları bütün oyunçuların cəmidir. Oyna — şəhərini qaldır!</p>`}
        <div class="podium">${pod(top[1], 2, .5)}${pod(top[0], 1, .3)}${pod(top[2], 3, .7)}</div>
        <div class="card rank-list" style="padding:0">
          ${S.lb === 'league' ? '<div class="zone">▲ Top 5 Alaqaranlıq liqasına yüksəlir</div>' : ''}
          ${rest.map((p, i) => {
            const idx = i + 4;
            const row = `<div class="rank-row ${p.me ? 'me' : ''}" style="animation-delay:${0.05 * i}s">
              <span class="n">${idx}</span>${avatar(p.n, idx)}
              <span>${p.n}${p.me ? ' 👈' : ''}<span class="city">${p.c}</span></span>
              <span class="s">${ICON.pearl.replace('class="ico"', 'style="width:16px;height:16px"')}${fmt(p.s)}</span></div>`;
            return (S.lb === 'league' && idx === 10 ? '<div class="zone down">▼ Enmə zonası</div>' : '') + row;
          }).join('')}
        </div>`;
    },

    profile() {
      const z = zoneOf(S.depth);
      const badges = [
        ['İlk dalış', '#2EC5F5', true, '<path d="M12 3v12M7 10l5 5 5-5M5 21h14" stroke="#0B2A5B" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'],
        ['7 gün seriya', '#FF7A45', S.streak >= 7, '<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z" fill="#FFD43B" stroke="#0B2A5B" stroke-width="2"/>'],
        ['Rif kəşfiyyatçısı', '#22C55E', true, '<path d="M6 21v-7a3 3 0 0 1 6 0M12 21V9a3 3 0 0 1 6 0v12M3 21h18" stroke="#0B2A5B" stroke-width="2.6" fill="none" stroke-linecap="round"/>'],
        ['10 linza', '#8B5CF6', false, '<circle cx="12" cy="12" r="8" stroke="#0B2A5B" stroke-width="2.6" fill="none"/><circle cx="12" cy="12" r="3" fill="#0B2A5B"/>'],
        ['Filosof', '#14B8A6', false, '<path d="M4 6h16M4 12h10M4 18h13" stroke="#0B2A5B" stroke-width="2.6" stroke-linecap="round"/>'],
        ['Duel ustası', '#EF4444', false, '<path d="M5 19L19 5M14 5h5v5M5 5l5 5M14 14l5 5" stroke="#0B2A5B" stroke-width="2.6" fill="none" stroke-linecap="round"/>'],
        ['Mərcan liqası', '#F59E0B', true, '<path d="M12 21V11M12 11c-4 0-6-3-6-7M12 11c4 0 6-3 6-7M12 15c-3 0-5-1-6-3M12 15c3 0 5-1 6-3" stroke="#0B2A5B" stroke-width="2.6" fill="none" stroke-linecap="round"/>'],
        ['Gecə zonası', '#3B82F6', false, '<path d="M19 14A8 8 0 0 1 10 5a8 8 0 1 0 9 9z" fill="#FFD43B" stroke="#0B2A5B" stroke-width="2"/>'],
      ];
      return `
        <div class="profile-head">
          <span class="logo-mark pm">${mascot('happy', 'in-logo')}</span>
          <div>
            <small class="muted" style="font-weight:800">Dalğıc</small>
            <h3>Sən</h3>
            <small style="font-weight:800;color:#1E6BFF">${S.depth} m · ${z.cur.name}</small>
          </div>
        </div>
        <div class="h2">Dünyagörüş xəritəsi</div>
        <div class="card radar-wrap">${radar()}
          <p class="muted" style="font-weight:700;font-size:13px;margin:6px 0 0;text-align:center">Məqsəd ən çox bilmək yox — <b style="color:#0B2A5B">ən geniş baxmaqdır</b>.</p>
        </div>
        <div class="h2">Nişanlar <small>${badges.filter(b => b[2]).length}/${badges.length}</small></div>
        <div class="badges">${badges.map(([n, c, on, svg], i) => `
          <div class="badge ${on ? '' : 'locked'}"><div class="b-ico" style="background:${c};animation-delay:${i * .05}s"><svg viewBox="0 0 24 24">${svg}</svg></div>${n}</div>`).join('')}
        </div>`;
    },
  };

  function tile(l, i) {
    const n = QUESTIONS.filter(q => q.lens === l.slug).length;
    return `<button class="tile" data-lens="${l.slug}" style="--c:${l.color};background-image:url('${IMG(l.img, 400)}');animation-delay:${i * 0.05}s">
      <span class="count">${n} sual</span><span class="chunky">${l.name}</span></button>`;
  }

  function radar() {
    const cx = 160, cy = 160, R = 112, n = LENSES.length;
    const pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
    const vals = LENSES.map(l => { const [a, c] = S.lensStats[l.slug]; return Math.min(1, 0.15 + a / 20 * 0.6 + (a ? c / a : 0) * 0.25); });
    const rings = [0.25, 0.5, 0.75, 1].map(f => `<polygon points="${LENSES.map((_, i) => pt(i, R * f).join(',')).join(' ')}" fill="none" stroke="#D5E4F7" stroke-width="1.5"/>`).join('');
    const axes = LENSES.map((_, i) => { const [x, y] = pt(i, R); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#D5E4F7" stroke-width="1.5"/>`; }).join('');
    const poly = vals.map((v, i) => pt(i, R * v).join(',')).join(' ');
    const dots = vals.map((v, i) => { const [x, y] = pt(i, R * v); return `<circle cx="${x}" cy="${y}" r="5" fill="${LENSES[i].color}" stroke="#0B2A5B" stroke-width="2"/>`; }).join('');
    const labels = LENSES.map((l, i) => { const [x, y] = pt(i, R + 26); const short = l.name.split(' ')[0]; return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="Nunito" font-weight="800" font-size="12" fill="#0B2A5B">${short}</text>`; }).join('');
    return `<svg class="radar" viewBox="-34 0 388 320">${rings}${axes}
      <g class="poly"><polygon points="${poly}" fill="rgba(30,107,255,.25)" stroke="#1E6BFF" stroke-width="3" stroke-linejoin="round"/>${dots}</g>${labels}</svg>`;
  }

  /* ── Ekrandan sonrakı işlər ── */
  let lbInt;
  const after = {
    home() { requestAnimationFrame(() => document.querySelectorAll('.bar i').forEach(b => b.style.width = b.dataset.w)); },
    quiz() { startQuestion(); },
    result() {
      document.querySelectorAll('[data-count]').forEach(el => countUp(el, +el.dataset.count, el.hasAttribute('data-plus') ? '+' : '', el.dataset.unit || ''));
      SFX.play('fanfare');
      if (S.quiz.daily && !S.quiz.streakShown) { S.quiz.streakShown = true; setTimeout(showStreak, 1400); }
    },
    board() {
      clearInterval(lbInt);
      let t = 2 * 86400 + 14 * 3600 + 5 * 60 + 30;
      lbInt = setInterval(() => {
        const el = $('#lbTimer'); if (!el) return clearInterval(lbInt);
        t--; const d = Math.floor(t / 86400), h = Math.floor(t % 86400 / 3600), m = Math.floor(t % 3600 / 60), s = t % 60;
        el.textContent = `${d}g ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }, 1000);
    },
  };

  function countUp(el, to, pre, unit) {
    const t0 = performance.now(), dur = 900;
    const step = now => { const p = Math.min(1, (now - t0) / dur); const v = Math.round(to * (1 - Math.pow(1 - p, 3))); el.textContent = pre + v + (unit ? ' ' + unit : ''); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* ── Quiz məntiqi ── */
  function startQuiz(items, title, daily = false) {
    S.quiz = { items, i: 0, res: [], title, daily, gainP: 0, gainD: 0, time: 20 };
    go('quiz');
  }
  function dailyItems() {
    // Hər linzadan 2 sual = 20 sual; təxmin sualı ən çox 3 dənə
    let est = 0;
    const picked = LENSES.flatMap(l => {
      const pool = shuffle(QUESTIONS.filter(q => q.lens === l.slug));
      const out = [];
      for (const q of pool) {
        if (q.kind === 'e' && est >= 3) continue;
        if (q.kind === 'e') est++;
        out.push(q); if (out.length === 2) break;
      }
      return out;
    });
    return shuffle(picked);
  }

  let timer, tLeft;
  function stopTimer() { clearInterval(timer); timer = null; }
  function startQuestion() {
    const Q = S.quiz, q = Q.items[Q.i];
    Q.time = q.kind === 'e' ? 25 : 20; Q.locked = false;
    tLeft = Q.time * 10;
    const bar = $('#oxBar'), sec = $('#oxSec'), ox = $('#ox');
    stopTimer();
    timer = setInterval(() => {
      tLeft--;
      if (tLeft < 50 && tLeft % 10 === 0) SFX.play('tick');
      bar.style.transform = `scaleX(${tLeft / (Q.time * 10)})`;
      sec.textContent = Math.ceil(tLeft / 10);
      ox.classList.toggle('low', tLeft < 50);
      if (tLeft <= 0) { stopTimer(); answer(null); }
    }, 100);
    if (q.kind === 'e') {
      const r = $('#est'), v = $('#estVal');
      let last = 0;
      r.addEventListener('input', () => { v.textContent = fmt(+r.value); const n = performance.now(); if (n - last > 60) { SFX.play('slide'); last = n; } });
    }
  }

  function answer(choice, srcEl) {
    const Q = S.quiz, q = Q.items[Q.i];
    if (Q.locked) return; Q.locked = true; stopTimer();
    const opts = [...document.querySelectorAll('.opt')];
    opts.forEach(o => o.disabled = true);
    let ok = false, html = '', p = 0, d = 0;
    const timeout = choice === null;

    if (q.kind === 'k') {
      ok = choice === q.a;
      opts.forEach((o, j) => { if (j === q.a) o.classList.add('correct'); else if (j === choice) o.classList.add('wrong'); else o.classList.add('dim'); });
      if (ok) { p = 10; d = 25; }
      html = `<div class="feedback ${ok ? 'ok' : 'no'}"><h4>${ok ? 'Düz tapdın! 🎉' : timeout ? 'Oksigen bitdi! 🫧' : 'Bu dəfə yox 🙈'}</h4><p>${q.ex}</p>`;
    } else if (q.kind === 'o') {
      ok = !timeout;
      const total = q.pct.reduce((a, b) => a + b, 0);
      opts.forEach((o, j) => {
        o.classList.add('show-pct'); if (j === choice) o.classList.add('mine');
        o.querySelector('.pct').textContent = q.pct[j] + '%';
        requestAnimationFrame(() => o.querySelector('.pct-fill').style.width = (q.pct[j] / total * 100) + '%');
      });
      if (ok) { p = 5; d = 10; }
      const max = Math.max(...q.pct);
      html = `<div class="feedback view"><h4>${timeout ? 'Cavab vermədin' : `Sənin kimi düşünənlər: ${q.pct[choice]}%`}</h4>
        <p>${timeout ? 'Baxış suallarında düzgün cavab yoxdur — sadəcə öz fikrini paylaş.' : q.pct[choice] === max ? 'Çoxluqla eyni fikirdəsən.' : 'Azlıqdasan — fərqli baxış dəyərlidir!'} <span class="muted">(demo statistika)</span></p>`;
    } else {
      const val = timeout ? null : +$('#est').value;
      $('#est').disabled = true;
      const err = val === null ? 1 : Math.abs(val - q.ans) / (q.max - q.min);
      ok = err <= 0.08;
      if (err <= 0.03) { p = 10; d = 25; } else if (ok) { p = 6; d = 15; }
      html = `<div class="feedback ${ok ? 'ok' : 'no'}"><h4>Düzgün cavab: ${fmt(q.ans)} ${q.unit}</h4>
        <p>${val === null ? 'Oksigen bitdi!' : `Sənin təxminin: ${fmt(val)} ${q.unit}. ${ok ? 'Çox yaxın!' : 'Uzaq düşdün.'}`} ${q.ex}</p>`;
    }
    html += `<button class="btn blue block" data-act="next">${Q.i < Q.items.length - 1 ? 'Davam et' : 'Nəticəyə bax'}</button></div>`;

    Q.res.push(ok); Q.gainP += p; Q.gainD += d;
    SFX.stopSpeak(); SFX.play(ok ? 'correct' : 'wrong');
    S.pearls += p; S.depth += d; S.weekly += p * 3;
    const st = S.lensStats[q.lens]; st[0]++; if (ok && q.kind !== 'o') st[1]++;

    $('#qMascot').innerHTML = mascot(q.kind === 'o' ? 'wow' : ok ? 'party' : 'sad');
    $('#fb').innerHTML = html;
    setTimeout(() => $('#fb .feedback') && $('#fb .feedback').scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120);
    if (p && srcEl) { burst(srcEl); floatNum(srcEl, `+${p}`); }
  }

  function burst(el) {
    const app = $('#app').getBoundingClientRect(), r = el.getBoundingClientRect();
    const b = document.createElement('div'); b.className = 'burst';
    b.style.left = (r.left - app.left + r.width / 2) + 'px'; b.style.top = (r.top - app.top + r.height / 2) + 'px';
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI * 2, dist = 50 + Math.random() * 70, s = 6 + Math.random() * 12;
      const dot = document.createElement('i');
      Object.assign(dot.style, { width: s + 'px', height: s + 'px', '--x': Math.cos(a) * dist + 'px', '--y': Math.sin(a) * dist - 30 + 'px', animationDelay: Math.random() * .1 + 's' });
      dot.style.setProperty('--x', Math.cos(a) * dist + 'px'); dot.style.setProperty('--y', Math.sin(a) * dist - 30 + 'px');
      b.appendChild(dot);
    }
    $('#app').appendChild(b); setTimeout(() => b.remove(), 1000);
  }
  function floatNum(el, txt) {
    const app = $('#app').getBoundingClientRect(), r = el.getBoundingClientRect();
    const f = document.createElement('div'); f.className = 'float-num'; f.textContent = txt + ' inci';
    f.style.left = (r.right - app.left - 110) + 'px'; f.style.top = (r.top - app.top - 10) + 'px';
    $('#app').appendChild(f); setTimeout(() => f.remove(), 1000);
  }

  function nextQuestion() {
    const Q = S.quiz;
    Q.i++;
    if (Q.i >= Q.items.length) {
      if (Q.daily && !S.dailyDone) { S.dailyDone = true; S.streak++; }
      return go('result');
    }
    render(); $('#view').scrollTop = 0;
  }

  /* ── Seriya modalı ── */
  function showStreak() {
    SFX.play('fanfare');
    const m = $('#modal'); m.classList.add('open');
    const days = ['B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş', 'B'];
    m.innerHTML = `<div class="streak-modal">
      <div class="rays2"></div>
      <div class="speech">Ardıcıl ${S.streak} gün dalırsan! Sən əsl dalğıcsan! 🤿</div>
      <div class="star-wrap">
        <svg class="star" viewBox="0 0 200 200"><path d="M100 8l25 55 60 7-45 41 13 59-53-31-53 31 13-59-45-41 60-7z" fill="#FFD43B" stroke="#fff" stroke-width="10" stroke-linejoin="round"/></svg>
        ${mascot('party')}
        ${ICON.sparkle.replace('class="sparkle"', 'class="sparkle" style="left:6px;top:40px"')}
        ${ICON.sparkle.replace('class="sparkle"', 'class="sparkle" style="right:0;top:110px;animation-delay:.5s"')}
        ${ICON.sparkle.replace('class="sparkle"', 'class="sparkle" style="left:40px;bottom:10px;animation-delay:1s"')}
      </div>
      <div class="streak-num" data-count="${S.streak}">0</div>
      <div class="streak-label">GÜNLÜK SERİYA</div>
      <div class="week">${days.map((d, i) => `<span class="${i < S.streak ? 'on' : ''}" style="animation-delay:${0.6 + i * .08}s">${d}</span>`).join('')}</div>
      <button class="btn" data-act="closeModal" style="position:relative">Super! 🎉</button>
    </div>`;
    countUp($('.streak-num'), S.streak, '', '');
  }

  /* ── Hadisələr ── */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-go],[data-act],[data-lens],[data-opt],[data-lb]');
    if (!t) return;
    if (t.dataset.opt === undefined && !['sound', 'estimate', 'enter', 'logo'].includes(t.dataset.act)) SFX.play('tap');
    if (t.dataset.go) return go(t.dataset.go);
    if (t.dataset.lb) { S.lb = t.dataset.lb; return render(); }
    if (t.dataset.lens) {
      const l = LENS[t.dataset.lens];
      return startQuiz(shuffle(QUESTIONS.filter(q => q.lens === l.slug)).slice(0, 5), `${l.name} linzası`);
    }
    if (t.dataset.opt !== undefined) return answer(+t.dataset.opt, t);
    const a = t.dataset.act;
    if (a === 'daily') startQuiz(dailyItems(), 'Gündəlik 20 sual', true);
    else if (a === 'lenses') go('lenses');
    else if (a === 'hard') {
      const first = QUESTIONS.find(q => q.q.startsWith('Xəzər dənizi hansı ölkə'));
      startQuiz([first, ...shuffle(QUESTIONS.filter(q => q.kind === 'k' && q !== first)).slice(0, 4)], 'Çətin suallar');
    }
    else if (a === 'duel') startQuiz(shuffle(QUESTIONS.filter(q => q.lens === 'cografiya')).slice(0, 5), 'Duel: Murad ilə · Coğrafiya');
    else if (a === 'estimate') answer('est', t);
    else if (a === 'next') nextQuestion();
    else if (a === 'quit') go('home');
    else if (a === 'sound') { SFX.toggle(); document.querySelectorAll('[data-act=sound]').forEach(b => b.innerHTML = SFX.on ? ICON.sound : ICON.mute); }
    else if (a === 'read') {
      const q = S.quiz.items[S.quiz.i];
      const text = q.q + (q.opts ? '. ' + q.opts.map((o, j) => 'ABCD'[j] + ': ' + o).join('. ') : '');
      if (!SFX.speak(text)) t.querySelector('span').textContent = 'Dəstəklənmir';
    }
    else if (a === 'enter') enterApp();
    else if (a === 'logo') { SFX.play('logo'); const mk = document.querySelector('.brand-logo .logo-mark'); mk && (mk.classList.remove('ping'), void mk.offsetWidth, mk.classList.add('ping')); }
    else if (a === 'closeModal') { const m = $('#modal'); m.classList.remove('open'); m.innerHTML = ''; }
  });

  /* ── Açılış ekranı (səs loqosu burada səslənir) ── */
  function enterApp() {
    const sp = $('#splash'); if (!sp || sp.classList.contains('out')) return;
    SFX.play('logo');
    sp.classList.add('out');
    try { sessionStorage.setItem('sualti-entered', '1'); } catch (e) {}
    setTimeout(() => sp.remove(), 1100);
  }
  (function splash() {
    let seen = false;
    try { seen = sessionStorage.getItem('sualti-entered') === '1'; } catch (e) {}
    const sp = $('#splash');
    if (seen) { sp.remove(); return; }
    sp.innerHTML = `
      <div class="splash-rays"></div>
      <div class="splash-in">
        <div class="splash-mascot">${mascot('happy')}</div>
        <div class="chunky big splash-word">sual<span class="yellow">tı</span></div>
        <p class="splash-tag">Sualın dərinliyinə dal</p>
        <button class="btn pulse splash-btn" data-act="enter">Dal! 🤿</button>
        <small class="splash-hint">🔊 səsi aç</small>
      </div>
      <div class="splash-bubbles">${Array.from({ length: 14 }, (_, i) => `<i style="left:${5 + i * 6.7}%;animation-delay:${(i % 5) * .12}s;width:${10 + (i * 7) % 22}px;height:${10 + (i * 7) % 22}px"></i>`).join('')}</div>`;
  })();

  render();
})();
