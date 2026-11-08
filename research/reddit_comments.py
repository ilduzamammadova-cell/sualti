"""Ən çox müzakirə olunan uyğun Reddit postlarının şərhləri (Arctic Shift, link_id ilə — tam mətn axtarışı timeout verir)."""
import json, re, time, urllib.parse, urllib.request

UA = {"User-Agent": "sualti-research/0.1 (open research)"}
d = json.load(open("reddit_raw.json"))
KEY = re.compile(r"quiz|trivia|kahoot|quizup|hq|streak|league|duel|millionaire", re.I)
posts = [p for p in d["posts"] if KEY.search((p["title"] or "") + " " + (p["text"] or ""))]
seen, top = set(), []
for p in sorted(posts, key=lambda p: p.get("comments") or 0, reverse=True):
    if p["id"] not in seen:
        seen.add(p["id"]); top.append(p)
top = top[:45]
comments = []
for p in top:
    url = "https://arctic-shift.photon-reddit.com/api/comments/search?" + urllib.parse.urlencode({"link_id": p["id"], "limit": 100})
    for i in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                rows = json.load(r).get("data") or []
            break
        except Exception as e:
            rows = []; time.sleep(5 * (i + 1))
    for x in rows:
        if x.get("body") and x["body"] not in ("[deleted]", "[removed]"):
            comments.append({"post_id": p["id"], "post_title": p["title"], "sub": p["sub"], "body": x["body"][:2000],
                             "score": x.get("score"), "created": x.get("created_utc"),
                             "url": f"https://www.reddit.com/r/{p['sub']}/comments/{p['id']}/_/{x.get('id')}/"})
    print(f"{p['sub']:14} {p['comments'] or 0:5} şərh  → {len(rows):3} alındı | {p['title'][:60]}", flush=True)
    time.sleep(1.5)
d["comments"] = comments
json.dump(d, open("reddit_raw.json", "w"), ensure_ascii=False, indent=1)
print("cəmi şərh", len(comments))
