# Bazar araşdırması (2026-11-08)

Quiz / trivia tətbiqləri haqqında real data və onu yığan açıq skriptlər.

| Fayl | Nə |
|---|---|
| `report.html` | Hesabat (xam datadan `build_report.py` ilə qurulur) |
| `data/quiz_research.json` | 7 qlobal tətbiq: Google Play məlumatı, 400 rəy təhlili, AZ axtarış nəticələri |
| `data/az_local_apps.json` | 14 yerli tətbiq və 683 Azərbaycan dilində rəy |
| `data/reddit_raw.json` | 918 post + 1 486 şərh (Arctic Shift arxivi), hər biri linki ilə |
| `data/social_summary.json` | Instagram + TikTok (Apify), şərh yazanların kimliyi çıxarılıb |
| `data/pain_categories_config.json` | Şikayət kateqoriyaları (market_researcher formatı) |

Yenidən yığmaq: `pip install google-play-scraper`, sonra `python collect.py data/pain_categories_config.json data/quiz_research.json`,
`python reddit_collect.py data/reddit_raw.json && python reddit_comments.py`, Apify üçün `.env`-də `APIFY_TOKEN` (git-ə düşmür).
