// Sualtı — brend səsi
//
// SƏS LOQOSU: "su · al · tı" — üç su damcısı yuxarı qalxır (E5 → A5 → C#6),
// son damla parlayır və arxasınca qabarcıq izi gəlir. Bütün digər səslər bu motivdən törəyir:
//   • düymə        → motivin pentatonik pərdəsindən tək damcı
//   • düzgün cavab → motivin ilk iki notu ("su · al")
//   • səhv cavab   → motiv tərsinə və boğuq ("tı · al" aşağı)
//   • nəticə/seriya→ tam motiv + oktava parıltısı
// Tembr: "damcı" — sinusun sürətlə yuxarı əyilməsi + suyun altı kimi əks-səda (filtrli gecikmə).

window.SFX = (() => {
  let ctx = null, bus = null, on = true;
  try { on = localStorage.getItem('sualti-sound') !== 'off'; } catch (e) {}

  const MOTIF = [659.25, 880.0, 1108.73];            // E5, A5, C#6 — A major
  const PENTA = [880, 987.77, 1108.73, 1318.51, 1479.98]; // A major pentatonik

  function ac() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
      // Master + "su altı" əks-sədası
      const master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
      const dry = ctx.createGain(); dry.gain.value = 1; dry.connect(master);
      const delay = ctx.createDelay(1); delay.delayTime.value = 0.14;
      const fb = ctx.createGain(); fb.gain.value = 0.32;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1900;
      const wet = ctx.createGain(); wet.gain.value = 0.38;
      delay.connect(lp); lp.connect(fb); fb.connect(delay); lp.connect(wet); wet.connect(master);
      bus = ctx.createGain(); bus.connect(dry); bus.connect(delay);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Su damcısı: aşağıdan hədəf notuna sürətli sürüşmə, qısa sönmə
  function drop(freq, at = 0, { vol = 0.35, len = 0.22, muffle = false } = {}) {
    const c = ac(); if (!c || !on) return;
    const t = c.currentTime + at;
    const o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), g2 = c.createGain();
    o.type = 'sine'; o2.type = 'triangle';
    o.frequency.setValueAtTime(freq * 0.55, t);
    o.frequency.exponentialRampToValueAtTime(freq, t + 0.03);
    o.frequency.exponentialRampToValueAtTime(freq * 1.04, t + len);
    o2.frequency.setValueAtTime(freq * 2, t + 0.02);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.exponentialRampToValueAtTime(vol * 0.12, t + 0.02);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + len * 0.6);
    let out = g;
    if (muffle) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700; g.connect(f); out = f; }
    o.connect(g); o2.connect(g2); g2.connect(bus); out.connect(bus);
    o.start(t); o2.start(t); o.stop(t + len + 0.05); o2.stop(t + len + 0.05);
  }

  // Parıltı: uzadılmış yumşaq ton (son notun "işığı")
  function shimmer(freq, at, dur = 0.7, vol = 0.12) {
    const c = ac(); if (!c || !on) return;
    const t = c.currentTime + at;
    [1, 2].forEach((m, i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = freq * m;
      const lfo = c.createOscillator(), lg = c.createGain();
      lfo.frequency.value = 6; lg.gain.value = freq * m * 0.004; lfo.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol / (i + 1), t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(bus);
      o.start(t); lfo.start(t); o.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
    });
  }

  // Qabarcıq izi: yuxarı qalxan, getdikcə zəifləyən xırda damcılar
  function trail(at, n = 5) {
    for (let i = 0; i < n; i++) {
      drop(1500 + i * 220 + Math.random() * 120, at + i * 0.055 + Math.random() * 0.02, { vol: 0.12 - i * 0.018, len: 0.08 });
    }
  }

  function splash(at = 0, vol = 0.18) {
    const c = ac(); if (!c || !on) return;
    const t = c.currentTime + at, len = 0.4;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * len), c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.9;
    f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(2200, t + len);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    src.connect(f); f.connect(g); g.connect(bus); src.start(t);
  }

  const S = {
    // ★ Səs loqosu: "su · al · tı" + parıltı + qabarcıq izi
    logo() {
      drop(MOTIF[0], 0.00, { vol: 0.34, len: 0.2 });
      drop(MOTIF[1], 0.14, { vol: 0.36, len: 0.2 });
      drop(MOTIF[2], 0.28, { vol: 0.42, len: 0.45 });
      shimmer(MOTIF[2], 0.30, 0.9, 0.1);
      trail(0.55, 6);
    },
    // Düymə — pentatonikadan təsadüfi damcı (həmişə harmonik qalır)
    tap() { drop(PENTA[Math.floor(Math.random() * PENTA.length)], 0, { vol: 0.2, len: 0.12 }); },
    // Düzgün — "su · al" + kiçik iz
    correct() {
      drop(MOTIF[0] * 2, 0, { vol: 0.3, len: 0.16 });
      drop(MOTIF[1] * 2, 0.09, { vol: 0.34, len: 0.3 });
      trail(0.22, 3);
    },
    // Səhv — motiv tərsinə, aşağı registr, boğuq
    wrong() {
      drop(MOTIF[1] / 2, 0, { vol: 0.34, len: 0.22, muffle: true });
      drop(MOTIF[0] / 2 * 0.89, 0.16, { vol: 0.34, len: 0.4, muffle: true });
    },
    // Oksigen tıqqıltısı — motivin ilk notu, çox qısa
    tick() { drop(MOTIF[0] * 2, 0, { vol: 0.08, len: 0.05 }); },
    // Təxmin zolağı
    slide() { drop(PENTA[2] * 1.5, 0, { vol: 0.05, len: 0.04 }); },
    // Ekran keçidi
    swoosh() { splash(0, 0.16); },
    // Nəticə və seriya — tam loqo + oktava yuxarı cavab
    fanfare() {
      S.logo();
      drop(MOTIF[0] * 2, 0.75, { vol: 0.26, len: 0.18 });
      drop(MOTIF[1] * 2, 0.85, { vol: 0.28, len: 0.18 });
      drop(MOTIF[2] * 2, 0.95, { vol: 0.3, len: 0.5 });
      shimmer(MOTIF[2] * 2, 0.97, 1.1, 0.07);
    },
  };

  // ── Sualın səsli oxunması ──
  function pickVoice() {
    const vs = (window.speechSynthesis && speechSynthesis.getVoices()) || [];
    return vs.find(v => /^az/i.test(v.lang)) || vs.find(v => /^tr/i.test(v.lang)) || null;
  }
  function speak(text) {
    if (!('speechSynthesis' in window)) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/["“”]/g, ''));
    const v = pickVoice();
    if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = 'az-AZ'; }
    u.rate = 0.95; u.pitch = 1.05;
    speechSynthesis.speak(u);
    return true;
  }
  function stopSpeak() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => {};

  return {
    play(name) { if (on && S[name]) try { S[name](); } catch (e) {} },
    get on() { return on; },
    toggle() {
      on = !on;
      try { localStorage.setItem('sualti-sound', on ? 'on' : 'off'); } catch (e) {}
      if (!on) stopSpeak(); else S.tap();
      return on;
    },
    speak, stopSpeak,
    hasVoice: () => 'speechSynthesis' in window,
  };
})();
