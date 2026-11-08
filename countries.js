// Ölkələr, paytaxtlar və bayraq sualları generatoru.
// Bayraqlar art.js-də özümüz çəkirik (flagSVG); çəkilməyən bayraqlı ölkələr yalnız paytaxt sualında iştirak edir.
// region: distraktorlar (səhv variantlar) eyni regiondan seçilir ki, sual çətin olsun.
window.COUNTRIES = [
  // Avropa
  ['de', 'Almaniya', 'Berlin', 'eu'], ['fr', 'Fransa', 'Paris', 'eu'], ['it', 'İtaliya', 'Roma', 'eu'],
  ['es', 'İspaniya', 'Madrid', 'eu'], ['pt', 'Portuqaliya', 'Lissabon', 'eu'], ['gb', 'Böyük Britaniya', 'London', 'eu'],
  ['ie', 'İrlandiya', 'Dublin', 'eu'], ['nl', 'Niderland', 'Amsterdam', 'eu'], ['be', 'Belçika', 'Brüssel', 'eu'],
  ['ch', 'İsveçrə', 'Bern', 'eu'], ['at', 'Avstriya', 'Vyana', 'eu'], ['pl', 'Polşa', 'Varşava', 'eu'],
  ['cz', 'Çexiya', 'Praqa', 'eu'], ['hu', 'Macarıstan', 'Budapeşt', 'eu'], ['ro', 'Rumıniya', 'Buxarest', 'eu'],
  ['bg', 'Bolqarıstan', 'Sofiya', 'eu'], ['gr', 'Yunanıstan', 'Afina', 'eu'], ['ua', 'Ukrayna', 'Kiyev', 'eu'],
  ['no', 'Norveç', 'Oslo', 'eu'], ['se', 'İsveç', 'Stokholm', 'eu'], ['fi', 'Finlandiya', 'Helsinki', 'eu'],
  ['dk', 'Danimarka', 'Kopenhagen', 'eu'], ['is', 'İslandiya', 'Reykyavik', 'eu'], ['ee', 'Estoniya', 'Tallin', 'eu'],
  ['lv', 'Latviya', 'Riqa', 'eu'], ['lt', 'Litva', 'Vilnüs', 'eu'], ['rs', 'Serbiya', 'Belqrad', 'eu'],
  ['hr', 'Xorvatiya', 'Zaqreb', 'eu'],
  // Qafqaz, Mərkəzi Asiya, qonşular
  ['az', 'Azərbaycan', 'Bakı', 'ca'], ['tr', 'Türkiyə', 'Ankara', 'ca'], ['ge', 'Gürcüstan', 'Tbilisi', 'ca'],
  ['ir', 'İran', 'Tehran', 'ca'], ['ru', 'Rusiya', 'Moskva', 'ca'], ['kz', 'Qazaxıstan', 'Astana', 'ca'],
  ['uz', 'Özbəkistan', 'Daşkənd', 'ca'], ['tm', 'Türkmənistan', 'Aşqabad', 'ca'], ['kg', 'Qırğızıstan', 'Bişkek', 'ca'],
  ['tj', 'Tacikistan', 'Düşənbə', 'ca'],
  // Asiya
  ['jp', 'Yaponiya', 'Tokio', 'as'], ['cn', 'Çin', 'Pekin', 'as'], ['kr', 'Cənubi Koreya', 'Seul', 'as'],
  ['in', 'Hindistan', 'Yeni Dehli', 'as'], ['pk', 'Pakistan', 'İslamabad', 'as'], ['th', 'Tailand', 'Banqkok', 'as'],
  ['vn', 'Vyetnam', 'Hanoy', 'as'], ['ph', 'Filippin', 'Manila', 'as'], ['my', 'Malayziya', 'Kuala-Lumpur', 'as'],
  ['sa', 'Səudiyyə Ərəbistanı', 'Ər-Riyad', 'as'], ['ae', 'Birləşmiş Ərəb Əmirlikləri', 'Əbu-Dabi', 'as'], ['qa', 'Qətər', 'Doha', 'as'],
  // Afrika
  ['eg', 'Misir', 'Qahirə', 'af'], ['ma', 'Mərakeş', 'Rabat', 'af'], ['tn', 'Tunis', 'Tunis', 'af'],
  ['ng', 'Nigeriya', 'Abuca', 'af'], ['ke', 'Keniya', 'Nayrobi', 'af'], ['et', 'Efiopiya', 'Əddis-Əbəbə', 'af'],
  // Amerika və Okeaniya
  ['us', 'ABŞ', 'Vaşinqton', 'am'], ['ca', 'Kanada', 'Ottava', 'am'], ['mx', 'Meksika', 'Mexiko', 'am'],
  ['br', 'Braziliya', 'Braziliya', 'am'], ['ar', 'Argentina', 'Buenos-Ayres', 'am'], ['cl', 'Çili', 'Santyaqo', 'am'],
  ['co', 'Kolumbiya', 'Boqota', 'am'], ['pe', 'Peru', 'Lima', 'am'], ['cu', 'Kuba', 'Havana', 'am'],
  ['au', 'Avstraliya', 'Kanberra', 'oc'], ['nz', 'Yeni Zelandiya', 'Vellinqton', 'oc'],
].map(([code, name, capital, region]) => ({ code, name, capital, region }));

window.makeCountryQuestions = function () {
  const C = window.COUNTRIES;
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const pick = (pool, n, not) => {
    const out = [];
    const p = pool.filter(x => !not.includes(x)).sort(() => Math.random() - 0.5);
    while (out.length < n && p.length) out.push(p.pop());
    return out;
  };
  const opts = (c, key) => {
    let same = C.filter(x => x.region === c.region && x !== c && x[key] !== c[key]);
    if (same.length < 3) same = same.concat(C.filter(x => x.region !== c.region && x[key] !== c[key]));
    const wrong = pick(same, 3, [c]);
    const all = [c, ...wrong].sort(() => Math.random() - 0.5);
    return { opts: all.map(x => x[key]), a: all.indexOf(c), codes: all.map(x => x.code) };
  };
  const qs = [];
  const has = c => window.hasFlag && window.hasFlag(c);
  C.forEach(c => {
    if (has(c.code)) {
      const f = opts(c, 'name');
      qs.push({ id: 'flag-' + c.code, lens: 'olkeler', topic: 'bayraqlar', kind: 'k', flag: c.code,
        q: 'Bu bayraq hansı ölkənindir?', opts: f.opts, a: f.a, optFlags: null,
        ex: `${c.name} bayrağı. Paytaxtı — ${c.capital}.` });
    }
    if (c.name !== c.capital) {
      const k = opts(c, 'capital');
      qs.push({ id: 'cap-' + c.code, lens: 'olkeler', topic: 'paytaxtlar', kind: 'k', flag: has(c.code) ? c.code : null, flagSmall: true,
        q: `${c.name} ölkəsinin paytaxtı hansı şəhərdir?`, opts: k.opts, a: k.a,
        ex: `${c.name} — paytaxtı ${c.capital}.` });
      const r = opts(c, 'name');
      qs.push({ id: 'capr-' + c.code, lens: 'olkeler', topic: 'paytaxtlar', kind: 'k',
        q: `${c.capital} hansı ölkənin paytaxtıdır?`, opts: r.opts, a: r.a, optFlags: r.codes.every(has) ? r.codes : null,
        ex: `${c.capital} — ${c.name} ölkəsinin paytaxtıdır.` });
    }
  });
  return qs;
};
