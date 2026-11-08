// Sualtı — öz çəkdiyimiz bayraqlar və mövzu ikonları (xarici fayl yoxdur).
// Bayraqlar 300×200 kətanda kodla çəkilir; rənglər və quruluş rəsmi bayraqlara əsaslanır,
// üslub Sualtınındır: yuvarlaq künc, tünd göy kontur, parıltı. Mürəkkəb gerbli bayraqlar daxil edilməyib.
(() => {
  const W = 300, H = 200;
  const r = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
  const poly = (pts, c, extra = '') => `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${c}" ${extra}/>`;
  const circ = (x, y, rad, c, extra = '') => `<circle cx="${x}" cy="${y}" r="${rad}" fill="${c}" ${extra}/>`;
  function starPts(cx, cy, R, n = 5, inner = 0.382, rot = -90) {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const rad = i % 2 ? R * inner : R, a = (rot + i * 180 / n) * Math.PI / 180;
      pts.push([+(cx + rad * Math.cos(a)).toFixed(2), +(cy + rad * Math.sin(a)).toFixed(2)]);
    }
    return pts;
  }
  const star = (cx, cy, R, c, n = 5, inner = 0.382, rot = -90) => poly(starPts(cx, cy, R, n, inner, rot), c);
  const pentagram = (cx, cy, R, c, sw) => {
    const p = [0, 2, 4, 1, 3].map(i => { const a = (-90 + i * 72) * Math.PI / 180; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; });
    return `<polygon points="${p.map(q => q.join(',')).join(' ')}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  };
  function hs(cols, w = cols.map(() => 1)) {
    const t = w.reduce((a, b) => a + b, 0); let y = 0;
    return cols.map((c, i) => { const h = H * w[i] / t, s = r(0, y, W, h + 0.5, c); y += h; return s; }).join('');
  }
  function vs(cols, w = cols.map(() => 1)) {
    const t = w.reduce((a, b) => a + b, 0); let x = 0;
    return cols.map((c, i) => { const ww = W * w[i] / t, s = r(x, 0, ww + 0.5, H, c); x += ww; return s; }).join('');
  }
  function nordic(bg, c1, c2) {
    const cx = 110, w1 = c2 ? 48 : 36;
    let s = r(0, 0, W, H, bg) + r(cx - w1 / 2, 0, w1, H, c1) + r(0, 100 - w1 / 2, W, w1, c1);
    if (c2) s += r(cx - 12, 0, 24, H, c2) + r(0, 88, W, 24, c2);
    return s;
  }
  function stripes(n, a, b) { const h = H / n; let s = ''; for (let i = 0; i < n; i++) s += r(0, i * h, W, h + 0.5, i % 2 ? b : a); return s; }
  function unionJack(sc = 1) {
    const g = `<g transform="scale(${sc})">` + r(0, 0, W, H, '#012169') +
      `<path d="M0,0L300,200M300,0L0,200" stroke="#FFF" stroke-width="40"/>` +
      `<path d="M0,0L300,200M300,0L0,200" stroke="#C8102E" stroke-width="13"/>` +
      r(116.7, 0, 66.7, H, '#FFF') + r(0, 66.7, W, 66.7, '#FFF') +
      r(130, 0, 40, H, '#C8102E') + r(0, 80, W, 40, '#C8102E') + '</g>';
    return g;
  }
  const crescent = (cx, cy, R, dx, dy, k, fg, bg) => circ(cx, cy, R, fg) + circ(cx + dx, cy + dy, R * k, bg);
  function rays(cx, cy, r1, r2, n, c, w = 3) {
    let s = '';
    for (let i = 0; i < n; i++) { const a = i * 2 * Math.PI / n; s += `<line x1="${cx + r1 * Math.cos(a)}" y1="${cy + r1 * Math.sin(a)}" x2="${cx + r2 * Math.cos(a)}" y2="${cy + r2 * Math.sin(a)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`; }
    return s;
  }
  function trigram(cx, cy, ang, kind) { // kind: 3 bits, 1 = bütöv, 0 = qırıq
    let s = `<g transform="translate(${cx} ${cy}) rotate(${ang})">`;
    kind.forEach((b, i) => {
      const y = (i - 1) * 10 - 3;
      s += b ? r(-20, y, 40, 6, '#000') : r(-20, y, 18, 6, '#000') + r(2, y, 18, 6, '#000');
    });
    return s + '</g>';
  }

  const F = {
    de: () => hs(['#000000', '#DD0000', '#FFCE00']),
    nl: () => hs(['#AE1C28', '#FFFFFF', '#21468B']),
    at: () => hs(['#C8102E', '#FFFFFF', '#C8102E']),
    hu: () => hs(['#CD2A3E', '#FFFFFF', '#436F4D']),
    bg: () => hs(['#FFFFFF', '#00966E', '#D62612']),
    ru: () => hs(['#FFFFFF', '#0039A6', '#D52B1E']),
    ee: () => hs(['#0072CE', '#000000', '#FFFFFF']),
    lt: () => hs(['#FDB913', '#006A44', '#C1272D']),
    lv: () => hs(['#9E3039', '#FFFFFF', '#9E3039'], [2, 1, 2]),
    ua: () => hs(['#0057B7', '#FFD700']),
    pl: () => hs(['#FFFFFF', '#DC143C']),
    co: () => hs(['#FCD116', '#003893', '#CE1126'], [2, 1, 1]),
    th: () => hs(['#A51931', '#F4F5F8', '#2D2A4A', '#F4F5F8', '#A51931'], [1, 1, 2, 1, 1]),
    es: () => hs(['#AA151B', '#F1BF00', '#AA151B'], [1, 2, 1]),
    ar: () => hs(['#74ACDF', '#FFFFFF', '#74ACDF']) + rays(150, 100, 14, 26, 16, '#F6B40E', 3.5) + circ(150, 100, 15, '#F6B40E', 'stroke="#85340A" stroke-width="1.5"'),
    fr: () => vs(['#002395', '#FFFFFF', '#ED2939']),
    it: () => vs(['#009246', '#FFFFFF', '#CE2B37']),
    ie: () => vs(['#169B62', '#FFFFFF', '#FF883E']),
    be: () => vs(['#000000', '#FDDA24', '#EF3340']),
    ro: () => vs(['#002B7F', '#FCD116', '#CE1126']),
    ng: () => vs(['#008751', '#FFFFFF', '#008751']),
    pe: () => vs(['#D91023', '#FFFFFF', '#D91023']),
    ca: () => vs(['#D52B1E', '#FFFFFF', '#D52B1E'], [1, 2, 1]) +
      `<path d="M150,48 L160,68 L172,62 L168,92 L185,74 L190,84 L205,80 L198,104 L208,110 L182,128 L186,140 L156,136 L157,160 L143,160 L144,136 L114,140 L118,128 L92,110 L102,104 L95,80 L110,84 L115,74 L132,92 L128,62 L140,68 Z" fill="#D52B1E"/>`,
    se: () => nordic('#006AA7', '#FECC00'),
    no: () => nordic('#BA0C2F', '#FFFFFF', '#00205B'),
    dk: () => nordic('#C8102E', '#FFFFFF'),
    fi: () => nordic('#FFFFFF', '#002F6C'),
    is: () => nordic('#02529C', '#FFFFFF', '#DC1E35'),
    ch: () => r(0, 0, W, H, '#DA291C') + r(130, 45, 40, 110, '#FFF') + r(95, 80, 110, 40, '#FFF'),
    jp: () => r(0, 0, W, H, '#FFFFFF') + circ(150, 100, 60, '#BC002D'),
    gr: () => stripes(9, '#0D5EAF', '#FFFFFF') + r(0, 0, 111.1, 111.1, '#0D5EAF') + r(44.4, 0, 22.2, 111.1, '#FFF') + r(0, 44.4, 111.1, 22.2, '#FFF'),
    us: () => {
      let s = stripes(13, '#B22234', '#FFFFFF') + r(0, 0, 120, 107.7, '#3C3B6E');
      for (let row = 0; row < 9; row++) {
        const six = row % 2 === 0, n = six ? 6 : 5;
        for (let i = 0; i < n; i++) s += circ(six ? 10 + i * 20 : 20 + i * 20, 10.77 * (row + 1) - 2.5, 3.4, '#FFF');
      }
      return s;
    },
    gb: () => unionJack(),
    au: () => r(0, 0, W, H, '#012169') + unionJack(0.5) + star(75, 150, 24, '#FFF', 7, 0.45) +
      star(225, 42, 12, '#FFF', 7, 0.45) + star(225, 168, 12, '#FFF', 7, 0.45) + star(188, 98, 12, '#FFF', 7, 0.45) +
      star(258, 86, 12, '#FFF', 7, 0.45) + star(240, 118, 6, '#FFF', 5),
    nz: () => r(0, 0, W, H, '#012169') + unionJack(0.5) +
      [[225, 45, 14], [192, 96, 13], [256, 86, 12], [225, 165, 15]].map(([x, y, s]) => star(x, y, s + 3, '#FFF') + star(x, y, s, '#C8102E')).join(''),
    tr: () => r(0, 0, W, H, '#E30A17') + crescent(108, 100, 50, 12.5, 0, 0.8, '#FFF', '#E30A17') + star(168, 100, 25, '#FFF', 5, 0.382, 180),
    az: () => hs(['#00B5E2', '#EF3340', '#509E2F']) + crescent(141, 100, 26, 6.5, 0, 0.82, '#FFF', '#EF3340') + star(171, 100, 13, '#FFF', 8, 0.55, 0),
    tn: () => r(0, 0, W, H, '#E70013') + circ(150, 100, 50, '#FFF') + crescent(145, 100, 37, 9, 0, 0.8, '#E70013', '#FFF') + star(160, 100, 19, '#E70013', 5, 0.382, 180),
    pk: () => r(0, 0, W, H, '#01411C') + r(0, 0, 75, H, '#FFF') + crescent(190, 104, 55, 14, -11, 0.88, '#FFF', '#01411C') + star(214, 76, 16, '#FFF', 5, 0.382, -50),
    uz: () => r(0, 0, W, 64, '#0099B5') + r(0, 64, W, 4, '#CE1126') + r(0, 68, W, 64, '#FFF') + r(0, 132, W, 4, '#CE1126') + r(0, 136, W, 64, '#1EB53A') +
      crescent(46, 32, 21, 7, 0, 0.84, '#FFF', '#0099B5') +
      [[3, 14], [4, 32], [5, 50]].map(([n, y]) => Array.from({ length: n }, (_, i) => star(140 - i * 15, y, 5, '#FFF')).join('')).join(''),
    kg: () => r(0, 0, W, H, '#E8112D') + rays(150, 100, 30, 56, 40, '#FFEF00', 4) + circ(150, 100, 34, '#FFEF00') +
      `<circle cx="150" cy="100" r="24" fill="none" stroke="#E8112D" stroke-width="5"/><path d="M134,84 Q150,100 134,116 M150,76 V124 M166,84 Q150,100 166,116" stroke="#E8112D" stroke-width="4" fill="none"/>`,
    cn: () => r(0, 0, W, H, '#EE1C25') + star(50, 50, 30, '#FFDE00') +
      [[100, 20], [120, 40], [120, 70], [100, 90]].map(([x, y]) => star(x, y, 10, '#FFDE00', 5, 0.382, Math.atan2(50 - y, 50 - x) * 180 / Math.PI)).join(''),
    kr: () => r(0, 0, W, H, '#FFFFFF') +
      `<g transform="rotate(33.7 150 100)"><path d="M100,100 A50,50 0 0 1 200,100 Z" fill="#CD2E3A"/><path d="M100,100 A50,50 0 0 0 200,100 Z" fill="#0047A0"/>` +
      circ(125, 100, 25, '#CD2E3A') + circ(175, 100, 25, '#0047A0') + '</g>' +
      trigram(72, 48, -56.3, [1, 1, 1]) + trigram(228, 152, -56.3, [0, 0, 0]) + trigram(228, 48, 56.3, [0, 1, 0]) + trigram(72, 152, 56.3, [1, 0, 1]),
    in: () => hs(['#FF9933', '#FFFFFF', '#138808']) + `<circle cx="150" cy="100" r="26" fill="none" stroke="#000080" stroke-width="4"/>` + rays(150, 100, 0, 26, 24, '#000080', 1.6) + circ(150, 100, 5, '#000080'),
    vn: () => r(0, 0, W, H, '#DA251D') + star(150, 100, 52, '#FFFF00'),
    ph: () => r(0, 0, W, 100, '#0038A8') + r(0, 100, W, 100, '#CE1126') + poly([[0, 0], [0, 200], [173, 100]], '#FFF') +
      rays(58, 100, 18, 32, 8, '#FCD116', 6) + circ(58, 100, 17, '#FCD116') + star(16, 24, 9, '#FCD116') + star(16, 176, 9, '#FCD116') + star(146, 100, 9, '#FCD116'),
    my: () => stripes(14, '#CC0001', '#FFFFFF') + r(0, 0, 150, 114.3, '#010066') + crescent(55, 57, 35, 12, 0, 0.86, '#FFCC00', '#010066') + star(105, 57, 26, '#FFCC00', 14, 0.45),
    ae: () => r(0, 0, W, 66.7, '#00732F') + r(0, 66.7, W, 66.7, '#FFFFFF') + r(0, 133.3, W, 66.7, '#000000') + r(0, 0, 75, H, '#FF0000'),
    qa: () => r(0, 0, W, H, '#8A1538') + poly([[0, 0], [78, 0], ...Array.from({ length: 9 }, (_, i) => [[104, (i + 0.5) * 200 / 9], [78, (i + 1) * 200 / 9]]).flat(), [0, 200]], '#FFFFFF'),
    ma: () => r(0, 0, W, H, '#C1272D') + pentagram(150, 104, 48, '#006233', 8),
    et: () => hs(['#078930', '#FCDD09', '#DA121A']) + circ(150, 100, 46, '#0F47AF') + pentagram(150, 103, 31, '#FCDD09', 4) + rays(150, 103, 34, 44, 5, '#FCDD09', 3),
    br: () => r(0, 0, W, H, '#009C3B') + poly([[25, 100], [150, 18], [275, 100], [150, 182]], '#FFDF00') + circ(150, 100, 52, '#002776') +
      `<path d="M99,92 Q150,76 201,110" stroke="#FFF" stroke-width="9" fill="none"/>`,
    cl: () => r(0, 0, W, 100, '#FFFFFF') + r(0, 100, W, 100, '#D52B1E') + r(0, 0, 100, 100, '#0039A6') + star(50, 50, 24, '#FFF'),
    cu: () => stripes(5, '#002A8F', '#FFFFFF') + poly([[0, 0], [0, 200], [173, 100]], '#CF142B') + star(58, 100, 24, '#FFF'),
    cz: () => r(0, 0, W, 100, '#FFFFFF') + r(0, 100, W, 100, '#D7141A') + poly([[0, 0], [0, 200], [150, 100]], '#11457E'),
    ge: () => r(0, 0, W, H, '#FFFFFF') + r(130, 0, 40, H, '#FF0000') + r(0, 80, W, 40, '#FF0000') +
      [[65, 40], [235, 40], [65, 160], [235, 160]].map(([x, y]) => r(x - 5, y - 18, 10, 36, '#FF0000') + r(x - 18, y - 5, 36, 10, '#FF0000')).join(''),
  };

  let uid = 0;
  window.hasFlag = code => !!F[code];
  window.flagSVG = function (code, cls = '') {
    if (!F[code]) return '';
    const id = 'fl' + (++uid);
    return `<svg class="flag ${cls}" viewBox="-4 -4 308 208" role="img" aria-label="bayraq">
      <defs><clipPath id="${id}c"><rect x="0" y="0" width="300" height="200" rx="22"/></clipPath>
      <linearGradient id="${id}g" x1="0" x2="1" y1="0" y2="0.3"><stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset=".35" stop-color="#fff" stop-opacity=".28"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity=".07"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs>
      <g clip-path="url(#${id}c)">${F[code]()}<rect class="flag-shine" x="0" y="0" width="300" height="200" fill="url(#${id}g)"/></g>
      <rect x="0" y="0" width="300" height="200" rx="22" fill="none" stroke="#0B2A5B" stroke-width="7"/></svg>`;
  };

  // ── Mövzu ikonları (24×24, qalın kontur) ──
  const I = (inner) => `<svg class="lens-ico" viewBox="0 0 24 24" fill="none" stroke="#0B2A5B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  window.LENS_ICONS = {
    elm: I('<ellipse cx="12" cy="12" rx="10" ry="4" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.8" fill="#2EC5F5"/>'),
    tarix: I('<path d="M3 21h18M5 21V10M9.7 21V10M14.3 21V10M19 21V10" /><path d="M2.5 10h19L12 3.5z" fill="#FFD43B"/>'),
    cografiya: I('<circle cx="12" cy="12" r="9.5" fill="#86D6FF"/><path d="M5 7c3 1 3 4 6 4s2 4 4 5M15 3.5c-1 2 1 3 3 3.5M12 21c0-3 2-3 2-5"/>'),
    incesenet: I('<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-2 0-3 4 1 6-2A9 9 0 0 0 12 3z" fill="#FFD43B"/><circle cx="7.5" cy="11" r="1.4" fill="#EF4444"/><circle cx="10" cy="7" r="1.4" fill="#3B82F6"/><circle cx="15" cy="7.5" r="1.4" fill="#10B981"/>'),
    edebiyyat: I('<path d="M3 5.5C6 4 9 4 12 6c3-2 6-2 9-.5V19c-3-1.5-6-1.5-9 .5-3-2-6-2-9-.5z" fill="#FFF"/><path d="M12 6v13.5"/>'),
    felsefe: I('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" fill="#FFD43B"/>'),
    medeniyyet: I('<path d="M12 21c-5 0-8-4-7-9 .8-3.6 4-5 7-3.5C15 7 18.2 8.4 19 12c1 5-2 9-7 9z" fill="#FF7A8A"/><path d="M12 8.5c0-2 1-3.5 3-4.5M12 8.5c-1-1.5-2.5-2-4-2"/>'),
    pop: I('<rect x="3" y="6" width="18" height="14" rx="2.5" fill="#FFF"/><path d="M3 10h18M7 6l2 4M12 6l2 4M17 6l2 4"/>'),
    idman: I('<circle cx="12" cy="12" r="9.5" fill="#FFF"/><path d="M12 7.5l4 3-1.5 4.5h-5L8 10.5z" fill="#0B2A5B"/><path d="M12 2.5v5M16 10.5l5-1.5M14.5 15l3 4M9.5 15l-3 4M8 10.5 3 9"/>'),
    texnologiya: I('<rect x="6" y="6" width="12" height="12" rx="2" fill="#86D6FF"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/>'),
    olkeler: I('<path d="M5 21V3.5" /><path d="M5 4c3-1.5 5 1 8 0s4-1.5 6-.5v9c-2-1-3.5-.5-6 .5s-5-1.5-8 0" fill="#FF7A59"/>'),
    bayraqlar: I('<path d="M5 21V3.5" /><path d="M5 4c3-1.5 5 1 8 0s4-1.5 6-.5v9c-2-1-3.5-.5-6 .5s-5-1.5-8 0" fill="#FF7A59"/>'),
    paytaxtlar: I('<path d="M3 21h18M5 21v-8l4-3v11M9 21V6l5-3v18M14 21v-9h5v9" fill="#FFF"/><path d="M11 8h1M11 11h1M11 14h1M16 15h1M16 18h1"/>'),
  };
})();
