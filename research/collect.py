"""Quiz tətbiqləri üzrə rəqib araşdırması: Google Play məlumatı + rəylər, şikayət kateqoriyaları.
market_researcher-in kateqoriya məntiqi əsasında, yalnız google-play-scraper ilə."""
import json, re, sys, time
from collections import Counter, defaultdict
from google_play_scraper import app, reviews, search, Sort

APPS = {
    "Trivia Crack": "com.etermax.preguntados.lite",
    "Kahoot!": "no.mobitroll.kahoot.android",
    "QuizDuel!": "se.maginteractive.quizduel2",
    "Trivia Star": "com.trivia.star.android",
    "Millionaire 2026": "com.submarineapps.mill",
    "Quiz Planet": "com.lotum.quizplanet",
    "Duolingo (gamification etalonu)": "com.duolingo",
}
CATS = json.load(open(sys.argv[1]))["pain_categories"]
OUT = sys.argv[2]

def resolve(name, pid):
    try:
        return app(pid, lang="en", country="us")
    except Exception:
        hits = search(name, lang="en", country="us", n_hits=3)
        return app(hits[0]["appId"], lang="en", country="us") if hits else None

def classify(text):
    t = " " + text.lower() + " "
    return [c for c, kws in CATS.items() if any(k in t for k in kws)]

result = {"apps": {}, "az_search": {}}
for name, pid in APPS.items():
    info = resolve(name, pid)
    if not info:
        print("not found", name); continue
    pid = info["appId"]
    revs, _ = reviews(pid, lang="en", country="us", sort=Sort.NEWEST, count=400)
    time.sleep(1)
    complaints = [r for r in revs if (r.get("score") or 5) <= 3]
    cat = Counter()
    examples = defaultdict(list)
    for r in complaints:
        for c in classify(r.get("content") or ""):
            cat[c] += 1
            if len(examples[c]) < 3 and 40 < len(r["content"] or "") < 260:
                examples[c].append(r["content"].strip())
    praise = Counter()
    for r in revs:
        if (r.get("score") or 0) >= 5:
            t = (r.get("content") or "").lower()
            for k in ["learn", "fun", "addict", "friends", "family", "brain", "challeng", "educat", "kids", "categor", "streak", "relax"]:
                if k in t: praise[k] += 1
    result["apps"][name] = {
        "id": pid, "title": info["title"], "developer": info["developer"], "installs": info.get("installs"),
        "score": info.get("score"), "ratings": info.get("ratings"), "price": info.get("price"),
        "offersIAP": info.get("offersIAP"), "containsAds": info.get("containsAds"), "genre": info.get("genre"),
        "released": info.get("released"), "updated": info.get("lastUpdatedOn"),
        "reviews_n": len(revs), "complaints_n": len(complaints),
        "avg_recent": round(sum(r["score"] for r in revs) / max(1, len(revs)), 2),
        "categories": cat.most_common(), "examples": examples, "praise": praise.most_common(8),
    }
    print(f"{name}: {len(revs)} rəy, {len(complaints)} şikayət", flush=True)

for q, lang in [("viktorina", "az"), ("bilik yarışı", "az"), ("quiz azərbaycan", "az"), ("milyoner azərbaycan", "az"), ("intellektual oyun", "az")]:
    try:
        hits = search(q, lang=lang, country="az", n_hits=8)
    except Exception as e:
        hits = []; print("search err", q, e)
    rows = []
    for h in hits:
        try:
            d = app(h["appId"], lang="az", country="az")
            rows.append({"title": d["title"], "id": d["appId"], "dev": d["developer"], "installs": d.get("installs"),
                         "score": d.get("score"), "ratings": d.get("ratings"), "updated": d.get("lastUpdatedOn")})
        except Exception:
            pass
        time.sleep(0.4)
    result["az_search"][q] = rows
    print(q, len(rows), flush=True)

json.dump(result, open(OUT, "w"), ensure_ascii=False, indent=1, default=str)
print("ok")
