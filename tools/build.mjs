// Loqo SVG fayllarını, bayraq SVG fayllarını və DB seed-i demo/*.js-dən yaradır.
// İstifadə: node tools/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import vm from 'node:vm';

// Ölkə suallarında variantlar təsadüfi seçilir; seed hər dəfə eyni çıxsın deyə sabit toxumlu random.
let seed = 20261108;
const seededMath = Object.create(Math);
seededMath.random = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const ctx = { window: {}, Math: seededMath };
vm.createContext(ctx);
for (const f of ['questions', 'mascot', 'art', 'countries']) vm.runInContext(readFileSync(`demo/${f}.js`, 'utf8'), ctx);
const { LENSES, QUESTIONS, COUNTRIES, mascot, flagSVG, hasFlag, makeCountryQuestions } = ctx.window;

// ── Bayraqlar: hər biri ayrıca SVG fayl (data bazasında media_url kimi istifadə olunur) ──
mkdirSync('demo/assets/flags', { recursive: true });
const flagUrl = c => hasFlag(c) ? `assets/flags/${c}.svg` : null;
let flagCount = 0;
for (const c of COUNTRIES) if (hasFlag(c.code)) {
  const svg = flagSVG(c.code).replace('<svg class="flag "', '<svg xmlns="http://www.w3.org/2000/svg"').replace(/ id="fl\d+/g, ' id="f').replace(/#fl\d+/g, '#f');
  writeFileSync(`demo/assets/flags/${c.code}.svg`, svg); flagCount++;
}

// ── Loqo ──
mkdirSync('demo/assets', { recursive: true });
const inner = mascot('happy').replace(/<svg[^>]*>/, '').replace('</svg>', '').replace(/class="[^"]*"/g, '');
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
  <defs><radialGradient id="g" cx="50%" cy="30%" r="75%"><stop offset="0" stop-color="#4FC3FF"/><stop offset=".55" stop-color="#1E6BFF"/><stop offset="1" stop-color="#0E3C9E"/></radialGradient></defs>
  <rect x="6" y="6" width="228" height="228" rx="68" fill="url(#g)" stroke="#0B2A5B" stroke-width="10"/>
  <g transform="translate(24 34) scale(.96)">${inner}</g>
</svg>`;
writeFileSync('demo/assets/logo-icon.svg', icon);

const full = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 240">
  <style>@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@800');</style>
  <g>${icon.replace(/<svg[^>]*>/, '').replace('</svg>', '')}</g>
  <text x="270" y="170" font-family="'Baloo 2', sans-serif" font-weight="800" font-size="150" fill="#1E6BFF"
        stroke="#0B2A5B" stroke-width="16" paint-order="stroke" letter-spacing="-3">sual<tspan fill="#FFD43B">tı</tspan></text>
</svg>`;
writeFileSync('demo/assets/logo-full.svg', full);

// ── DB seed ──
const esc = s => String(s).replace(/'/g, "''");
const q_ = v => v == null ? 'NULL' : `'${esc(v)}'`;
const lensId = Object.fromEntries(LENSES.map((l, i) => [l.slug, i + 1]));
const lensSlugMap = { incesenet: 'incesenet', felsefe: 'din-felsefe', pop: 'pop' };
const kindMap = { k: 'knowledge', o: 'opinion', e: 'estimate' };
let sql = `-- Avtomatik yaradılıb: node tools/build.mjs (mənbə: demo/questions.js, demo/countries.js)\n-- Əvvəlcə db/schema.sql işlədilməlidir.\nBEGIN;\n`;
QUESTIONS.forEach((q, i) => {
  const id = i + 1;
  sql += `INSERT INTO questions (id, text, kind, explanation, numeric_answer, status, sensitive, approved_at) VALUES (${id}, '${esc(q.q)}', '${kindMap[q.kind]}', ${q.ex ? `'${esc(q.ex)}'` : 'NULL'}, ${q.kind === 'e' ? q.ans : 'NULL'}, 'approved', ${q.lens === 'felsefe' && q.kind === 'k' ? 1 : 0}, datetime('now'));\n`;
  const slug = lensSlugMap[q.lens] || q.lens;
  sql += `INSERT INTO question_lenses (question_id, lens_id) SELECT ${id}, id FROM lenses WHERE slug = '${slug}';\n`;
  (q.opts || []).forEach((o, j) => {
    sql += `INSERT INTO answer_options (question_id, text, is_correct, sort_order) VALUES (${id}, '${esc(o)}', ${q.kind === 'k' && j === q.a ? 1 : 0}, ${j});\n`;
  });
});

// ── Ölkələr, bayraq və paytaxt sualları ──
sql += `\n-- Ölkələr (${COUNTRIES.length})\n`;
COUNTRIES.forEach(c => {
  sql += `INSERT INTO countries (code, name, capital, region, flag_url) VALUES (${q_(c.code)}, ${q_(c.name)}, ${q_(c.capital)}, ${q_(c.region)}, ${q_(flagUrl(c.code))});\n`;
});
const CQ = makeCountryQuestions();
sql += `\n-- Bayraq və paytaxt sualları (${CQ.length})\n`;
let nextId = QUESTIONS.length;
CQ.forEach(q => {
  const id = ++nextId;
  const code = q.id.split('-')[1];
  const media = q.flag ? flagUrl(q.flag) : null;
  sql += `INSERT INTO questions (id, slug, text, country_code, kind, explanation, media_url, status, approved_at) VALUES (${id}, ${q_(q.id)}, ${q_(q.q)}, ${q_(code)}, '${q.flag && q.topic === 'bayraqlar' ? 'media' : 'knowledge'}', ${q_(q.ex)}, ${q_(media)}, 'approved', datetime('now'));\n`;
  sql += `INSERT INTO question_lenses (question_id, lens_id) SELECT ${id}, id FROM lenses WHERE slug IN ('olkeler', '${q.topic}');\n`;
  q.opts.forEach((o, j) => {
    const om = q.optFlags ? flagUrl(q.optFlags[j]) : null;
    sql += `INSERT INTO answer_options (question_id, text, is_correct, media_url, sort_order) VALUES (${id}, ${q_(o)}, ${j === q.a ? 1 : 0}, ${q_(om)}, ${j});\n`;
  });
});
sql += 'COMMIT;\n';
writeFileSync('db/seed_questions.sql', sql);
console.log(`logo: 2 fayl · bayraq: ${flagCount} SVG · seed: ${QUESTIONS.length} + ${CQ.length} sual, ${COUNTRIES.length} ölkə`);

// ── Artifact versiyası (claude.ai üçün): doctype/html/head/body teqləri olmadan ──
mkdirSync('dist', { recursive: true });
let page = readFileSync('demo/index.html', 'utf8')
  .replace(/<!doctype html>\s*/i, '')
  .replace(/<\/?html[^>]*>\s*/gi, '')
  .replace(/<\/?head>\s*/gi, '')
  .replace(/<\/?body>\s*/gi, '')
  .replace(/<meta charset[^>]*>\s*/i, '')
  .replace(/<meta name="viewport"[^>]*>\s*/i, '')
  .replace(/<link rel="icon"[^>]*>\s*/i, '');
writeFileSync('dist/index.html', page);
console.log('dist/index.html hazırdır');
