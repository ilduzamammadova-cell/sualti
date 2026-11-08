# Sualtı

Azərbaycan dilində quiz oyunu: 240+ sual, 13 mövzu, öz çəkdiyimiz 56 bayraq, paytaxtlar, canlı duel, Party rejimi (QR ilə qrup oyunu), Sualtı Plus, mövzu səviyyələri, "Sənin Rifin", gündəlik 20 sual, seriya, reytinq və öz səs loqosu ("su · al · tı").

**Oyna:** https://ilduzamammadova-cell.github.io/sualti/
**Bazar araşdırması:** https://ilduzamammadova-cell.github.io/sualti/research/report.html

## Repoda nə var

| Yer | Nədir |
|---|---|
| `index.html`, `*.js`, `styles.css`, `assets/`, `img/` | Oyunun özü (GitHub Pages bu kökdən açılır); `assets/flags/` — 56 bayraq SVG |
| [BRIEF.md](BRIEF.md) | Layihə brifi: konsepsiya, ad, loqo, dizayn, quiz məntiqi, gamification, psixoloji marketinq, biznes modeli |
| [db/schema.sql](db/schema.sql) | Sual bankı və oyun data bazası sxemi (SQLite) |
| [db/seed_questions.sql](db/seed_questions.sql) | 246 sual (60 əsas + 56 bayraq + 130 paytaxt) və 67 ölkə |
| [research/](research/) | Bazar araşdırması: Google Play rəyləri, Reddit, Instagram/TikTok (Apify) — açıq mənbəli, real data, skriptlər və hesabat |
| [tools/](tools/) | Loqo/seed generatoru (`build.mjs`) və sayt dərc skripti |

## Lokal işə salmaq

```bash
python3 -m http.server 5178
```

Sonra: http://localhost:5178

Data bazası:

```bash
sqlite3 quiz.db < db/schema.sql && sqlite3 quiz.db < db/seed_questions.sql
```

Araşdırma skriptləri üçün Apify açarı `research/.env` faylına yazılır (`APIFY_TOKEN=...`); bu fayl `.gitignore`-dadır və repoya düşmür.

Şəkillər: [Unsplash](https://unsplash.com).
