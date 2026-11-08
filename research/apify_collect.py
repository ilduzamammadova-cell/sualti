"""Instagram + TikTok datası Apify actor-ları ilə (rəsmi API başqa hesabların şərhlərini vermir).
Token: research/.env faylında APIFY_TOKEN=... (fayl gitignore-dadır, ekrana çıxarılmır).
Xərc: Apify nəticə sayına görə ödəniş alır — limitlər aşağıdadır, kiçik saxlanılıb."""
import json, os, sys, urllib.request
from pathlib import Path

env = Path(__file__).with_name(".env")
if env.exists():
    for line in env.read_text().splitlines():
        if "=" in line and not line.strip().startswith("#"):
            k, v = line.split("=", 1); os.environ.setdefault(k.strip(), v.strip().strip("'\""))
TOKEN = os.environ.get("APIFY_TOKEN")
if not TOKEN:
    sys.exit("APIFY_TOKEN yoxdur: research/.env faylına APIFY_TOKEN=... yazın")

def run(actor, payload, limit_note):
    url = f"https://api.apify.com/v2/acts/{actor.replace('/', '~')}/run-sync-get-dataset-items?timeout=300"
    req = urllib.request.Request(url, data=json.dumps(payload).encode(), method="POST",
                                 headers={"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}"})
    try:
        with urllib.request.urlopen(req, timeout=330) as r:
            items = json.load(r)
    except Exception as e:
        print(f"  {actor}: xəta {str(e)[:120]}"); return []
    print(f"  {actor} ({limit_note}): {len(items)} nəticə", flush=True)
    return items

out = {}
# 1) Instagram: Azərbaycan / Bakı quiz heşteqləri
out["ig_hashtags"] = run("apify/instagram-hashtag-scraper",
    {"hashtags": ["viktorina", "bilikyarisi", "quizbaku", "квизбаку", "intellektualoyun"], "resultsLimit": 30}, "5 heşteq × 30")
# 2) Instagram: rəqib hesabların son postları
out["ig_competitors"] = run("apify/instagram-scraper",
    {"directUrls": ["https://www.instagram.com/triviacrack/", "https://www.instagram.com/kahoot/",
                    "https://www.instagram.com/quizzland/", "https://www.instagram.com/duolingo/"],
     "resultsType": "posts", "resultsLimit": 12}, "4 hesab × 12 post")
# 3) Ən çox şərh alan 6 postun şərhləri
top = sorted(out["ig_competitors"], key=lambda p: p.get("commentsCount") or 0, reverse=True)[:6]
out["ig_comments"] = run("apify/instagram-comment-scraper",
    {"directUrls": [p["url"] for p in top if p.get("url")], "resultsLimit": 50}, "6 post × 50 şərh") if top else []
# 4) TikTok: quiz heşteqləri (qlobal + Azərbaycan)
out["tiktok"] = run("clockworks/tiktok-scraper",
    {"hashtags": ["quiz", "trivia", "viktorina", "streetquiz", "bilikyarışı"], "resultsPerPage": 25,
     "shouldDownloadVideos": False, "shouldDownloadCovers": False}, "5 heşteq × 25")

json.dump(out, open(Path(__file__).with_name("social_raw.json"), "w"), ensure_ascii=False, indent=1)
print("hazır: social_raw.json")
