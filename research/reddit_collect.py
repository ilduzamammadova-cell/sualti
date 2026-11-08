"""Reddit postları və şərhləri — Arctic Shift (açıq mənbəli Reddit arxivi, https://github.com/ArthurHeitmann/arctic_shift).
Xam data reddit_raw.json-a yazılır, hər qeyd öz permalink-i ilə."""
import json, sys, time, urllib.parse, urllib.request

BASE = "https://arctic-shift.photon-reddit.com/api"
UA = {"User-Agent": "sualti-research/0.1 (open research)"}

# (subreddit, axtarış sözü) — sözsüz = subredditin hamısı
POST_QUERIES = [
    ("QuizUp", None), ("hqtrivia", None), ("trivia", "app"), ("trivia", "trivia crack"),
    ("AndroidGaming", "trivia"), ("AndroidGaming", "quiz"), ("iosgaming", "trivia"), ("iosgaming", "quiz"),
    ("Kahoot", None), ("duolingo", "streak"), ("duolingo", "league"),
]
COMMENT_QUERIES = [
    ("AndroidGaming", "trivia crack"), ("iosgaming", "trivia crack"), ("AndroidGaming", "quizup"),
    ("iosgaming", "quizup"), ("trivia", "quizup"), ("trivia", "trivia crack"), ("hqtrivia", "shut down"),
    ("duolingo", "streak"), ("AndroidGaming", "quiz game"), ("Teachers", "kahoot"),
]

def get(path, params, tries=4):
    url = f"{BASE}/{path}?{urllib.parse.urlencode(params)}"
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                d = json.load(r)
            if d.get("error"):
                raise RuntimeError(d["error"])
            return d.get("data") or []
        except Exception as e:
            print("  retry", i + 1, path, params.get("subreddit"), str(e)[:60], flush=True)
            time.sleep(4 * (i + 1))
    return []

out = {"source": "Arctic Shift Reddit archive", "collected_at": time.strftime("%Y-%m-%d"), "posts": [], "comments": []}
for sub, q in POST_QUERIES:
    p = {"subreddit": sub, "limit": 100, "sort": "desc"}
    if q: p["query"] = q
    rows = get("posts/search", p)
    for x in rows:
        out["posts"].append({"sub": sub, "q": q, "id": x.get("id"), "title": x.get("title"), "text": (x.get("selftext") or "")[:2000],
                             "score": x.get("score"), "comments": x.get("num_comments"), "created": x.get("created_utc"),
                             "url": "https://www.reddit.com" + (x.get("permalink") or "")})
    print(f"posts {sub}/{q}: {len(rows)}", flush=True); time.sleep(2)
for sub, q in COMMENT_QUERIES:
    rows = get("comments/search", {"subreddit": sub, "body": q, "limit": 100, "sort": "desc"})
    for x in rows:
        out["comments"].append({"sub": sub, "q": q, "id": x.get("id"), "body": (x.get("body") or "")[:2000], "score": x.get("score"),
                                "created": x.get("created_utc"),
                                "url": f"https://www.reddit.com/r/{sub}/comments/{(x.get('link_id') or '')[3:]}/_/{x.get('id')}/"})
    print(f"comments {sub}/{q}: {len(rows)}", flush=True); time.sleep(2)

json.dump(out, open(sys.argv[1], "w"), ensure_ascii=False, indent=1)
print("posts", len(out["posts"]), "comments", len(out["comments"]))
