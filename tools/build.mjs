// Loqo SVG fayllarını və DB seed-i demo/questions.js-dən yaradır.
// İstifadə: node tools/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import vm from 'node:vm';

const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(readFileSync('demo/questions.js', 'utf8'), ctx);
vm.runInContext(readFileSync('demo/mascot.js', 'utf8'), ctx);
const { LENSES, QUESTIONS, mascot } = ctx.window;

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
const lensId = Object.fromEntries(LENSES.map((l, i) => [l.slug, i + 1]));
const lensSlugMap = { incesenet: 'incesenet', felsefe: 'din-felsefe', pop: 'pop' };
const kindMap = { k: 'knowledge', o: 'opinion', e: 'estimate' };
let sql = `-- Avtomatik yaradılıb: node tools/build.mjs (mənbə: demo/questions.js)\n-- Əvvəlcə db/schema.sql işlədilməlidir.\nBEGIN;\n`;
QUESTIONS.forEach((q, i) => {
  const id = i + 1;
  sql += `INSERT INTO questions (id, text, kind, explanation, numeric_answer, status, sensitive, approved_at) VALUES (${id}, '${esc(q.q)}', '${kindMap[q.kind]}', ${q.ex ? `'${esc(q.ex)}'` : 'NULL'}, ${q.kind === 'e' ? q.ans : 'NULL'}, 'approved', ${q.lens === 'felsefe' && q.kind === 'k' ? 1 : 0}, datetime('now'));\n`;
  const slug = lensSlugMap[q.lens] || q.lens;
  sql += `INSERT INTO question_lenses (question_id, lens_id) SELECT ${id}, id FROM lenses WHERE slug = '${slug}';\n`;
  (q.opts || []).forEach((o, j) => {
    sql += `INSERT INTO answer_options (question_id, text, is_correct, sort_order) VALUES (${id}, '${esc(o)}', ${q.kind === 'k' && j === q.a ? 1 : 0}, ${j});\n`;
  });
});
sql += 'COMMIT;\n';
writeFileSync('db/seed_questions.sql', sql);
console.log(`logo: 2 fayl · seed: ${QUESTIONS.length} sual`);

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
