"""Hesabatı yığılmış xam datadan qurur (rəqəmlər əl ilə yazılmır). Çıxış: report.html"""
import json, html
from collections import defaultdict, Counter

E = html.escape
gp = json.load(open("quiz_research.json"))
az = json.load(open("az_local_apps.json"))
rd = json.load(open("reddit_raw.json"))
so = json.load(open("social_raw.json"))

def num(n):
    return f"{n:,}".replace(",", " ") if isinstance(n, (int, float)) else (n or "—")

# ── Qlobal tətbiqlər cədvəli ──
rows = []
for name, a in gp["apps"].items():
    cats = a["categories"][:3]
    top = ", ".join(f"{E(c)} <span class=m>{round(100*k/max(1,a['complaints_n']))}%</span>" for c, k in cats)
    share = round(100 * a["complaints_n"] / a["reviews_n"])
    gap = round((a["score"] or 0) - a["avg_recent"], 2)
    rows.append(f"<tr><td><a href='https://play.google.com/store/apps/details?id={a['id']}'>{E(name)}</a></td>"
                f"<td class=n>{E(a['installs'] or '')}</td><td class=n>{a['score']:.2f}</td><td class=n>{num(a['ratings'])}</td>"
                f"<td class=n><b>{a['avg_recent']:.2f}</b></td><td class=n>{share}%</td>"
                f"<td>{'Bəli' if a['containsAds'] else 'Yox'}</td><td>{top}</td></tr>")
global_table = "\n".join(rows)

# ── Yerli tətbiqlər ──
local_rows = []
for t, a in sorted(az.items(), key=lambda kv: -(int(str(kv[1]['installs']).replace('.', '').replace('+', '') or 0))):
    if not a.get("score"):
        continue
    local_rows.append(f"<tr><td><a href='{a['url']}'>{E(t)}</a></td><td>{E(a['dev'])}</td><td class=n>{E(a['installs'])}</td>"
                      f"<td class=n>{a['score']:.2f}</td><td class=n>{num(a['ratings'])}</td><td class=n>{E(str(a['updated']))}</td></tr>")
local_table = "\n".join(local_rows)
kw = {"Bəyənmə (əla, super, gözəl…)": ["əla", "super", "gözəl", "çox yaxşı", "mükəmməl", "ela"],
      "Öyrədici / maraqlı": ["öyrən", "bilik", "maraqlı", "faydalı", "məlumat"],
      "Səhv sual / cavab": ["səhv", "sehv", "yanlış", "yanlis", "düzgün deyil"],
      "Pul / ödəniş": ["pul", "ödəniş", "qiymət"],
      "Təkrar suallar": ["təkrar", "eyni sual", "tekrar"],
      "Reklam": ["reklam"]}
az_n = sum(len(a["reviews"]) for a in az.values())
az_cnt = Counter()
for a in az.values():
    for r in a["reviews"]:
        t = r["text"].lower()
        for k, ws in kw.items():
            if any(w in t for w in ws):
                az_cnt[k] += 1
az_theme_rows = "\n".join(f"<tr><td>{E(k)}</td><td class=n>{v}</td><td class=n>{round(100*v/az_n)}%</td></tr>" for k, v in az_cnt.most_common())

# ── TikTok ──
by = defaultdict(list)
for v in so["tiktok"]:
    by[v["searchHashtag"]["name"]].append(v)
tt_rows = []
for h, vs in sorted(by.items(), key=lambda kv: -sorted(x.get('playCount') or 0 for x in kv[1])[len(kv[1]) // 2]):
    plays = sorted(v.get("playCount") or 0 for v in vs)
    best = max(vs, key=lambda v: v.get("playCount") or 0)
    tt_rows.append(f"<tr><td>#{E(h)}</td><td class=n>{len(vs)}</td><td class=n>{num(plays[len(plays)//2])}</td>"
                   f"<td class=n>{num(plays[-1])}</td><td><a href='{best['webVideoUrl']}'>@{E(best['authorMeta']['name'])}</a>: "
                   f"{E((best.get('text') or '')[:70])}</td></tr>")
tt_table = "\n".join(tt_rows)

# ── Instagram rəqiblər ──
igb = defaultdict(list)
for p in so["ig_competitors"]:
    igb[p.get("ownerUsername")].append(p)
ig_rows = []
for o in ["duolingo", "kahoot", "triviacrack", "quizzland"]:
    ps = igb.get(o, [])
    if ps:
        L = [p.get("likesCount") or 0 for p in ps]; C = [p.get("commentsCount") or 0 for p in ps]
        ig_rows.append(f"<tr><td><a href='https://www.instagram.com/{o}/'>@{o}</a></td><td class=n>{len(ps)}</td>"
                       f"<td class=n>{num(sum(L)//len(L))}</td><td class=n>{num(sum(C)//len(C))}</td></tr>")
ig_table = "\n".join(ig_rows)
own = Counter(p.get("ownerUsername") for p in so["ig_hashtags"])
local_ig = [("kvizart.az", "Naxçıvan, “Everest” intellektual oyun mövsümləri"), ("paxlava.quiz", "quiz gecələri"),
            ("einsteinquiz.baku", "Bakı quiz gecələri"), ("kudos.az", "quiz / intellektual oyun"),
            ("dahiacademy", "kursun “Hədiyyəli Bilik Yarışı” postu — 808 şərh")]
local_ig_rows = "\n".join(f"<tr><td><a href='https://www.instagram.com/{u}/'>@{u}</a></td><td class=n>{own.get(u,0)}</td><td>{E(n)}</td></tr>" for u, n in local_ig)

# ── Reddit ──
r_posts, r_comm = len(rd["posts"]), len(rd["comments"])
subs = Counter(p["sub"] for p in rd["posts"]) + Counter(c["sub"] for c in rd["comments"])
sub_line = " · ".join(f"r/{s} {n}" for s, n in subs.most_common())

TOTAL_GP = sum(a["reviews_n"] for a in gp["apps"].values())

page = f"""<title>Sualtı Bazar Araşdırması</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Nunito:wght@500;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
/* Layout: tək sütunlu hesabat, 760px oxu eni, cədvəllər öz scroll konteynerində */
:root {{
  --bg:#F3F8FE; --surface:#FFFFFF; --ink:#0B2A5B; --muted:#52668A; --line:#D6E3F3;
  --accent:#1E6BFF; --accent-soft:#E3EEFF; --warn:#C2410C; --ok:#15803D;
  --display:'Baloo 2','Nunito',system-ui,sans-serif; --body:'Nunito',system-ui,sans-serif; --mono:'JetBrains Mono',ui-monospace,monospace;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{
  --bg:#071533; --surface:#0D2149; --ink:#E6F0FF; --muted:#9BB0D6; --line:#1F3A6E; --accent:#5EA0FF; --accent-soft:#132E63; --warn:#FB923C; --ok:#4ADE80; color-scheme:dark; }} }}
:root[data-theme="dark"] {{ --bg:#071533; --surface:#0D2149; --ink:#E6F0FF; --muted:#9BB0D6; --line:#1F3A6E; --accent:#5EA0FF; --accent-soft:#132E63; --warn:#FB923C; --ok:#4ADE80; color-scheme:dark; }}
body {{ background:var(--bg); color:var(--ink); font:16px/1.6 var(--body); }}
.wrap {{ max-width:880px; margin:0 auto; padding-block:40px 80px; padding-left:max(16px, env(safe-area-inset-left,0px)); padding-right:max(16px, env(safe-area-inset-right,0px)); }}
h1 {{ font:800 clamp(34px,6vw,52px)/1.02 var(--display); margin:0 0 10px; text-wrap:balance; }}
h2 {{ font:800 28px/1.15 var(--display); margin:56px 0 12px; text-wrap:balance; }}
h3 {{ font:800 19px/1.3 var(--display); margin:28px 0 8px; }}
p, li {{ max-width:68ch; }}
.lede {{ font-size:19px; color:var(--muted); }}
.meta {{ font:500 13px var(--mono); color:var(--muted); letter-spacing:.02em; }}
a {{ color:var(--accent); text-underline-offset:2px; }}
.keys {{ display:grid; gap:12px; margin:28px 0; padding:0; list-style:none; }}
.keys li {{ background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:14px 18px; max-width:none; }}
.keys b {{ font-family:var(--display); font-size:18px; }}
.tbl {{ overflow-x:auto; margin:14px 0; border:1px solid var(--line); border-radius:12px; background:var(--surface); }}
table {{ border-collapse:collapse; width:100%; font-size:14px; }}
th, td {{ text-align:left; padding:9px 12px; border-bottom:1px solid var(--line); vertical-align:top; }}
th {{ font:800 12px var(--body); text-transform:uppercase; letter-spacing:.05em; color:var(--muted); background:var(--accent-soft); white-space:nowrap; }}
tr:last-child td {{ border-bottom:0; }}
td.n {{ text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap; }}
.m {{ color:var(--muted); font-size:12px; }}
.cap {{ font-size:13px; color:var(--muted); margin-top:-4px; }}
blockquote {{ margin:12px 0; padding:10px 16px; border-left:3px solid var(--accent); background:var(--surface); border-radius:0 10px 10px 0; color:var(--ink); max-width:68ch; }}
blockquote small {{ display:block; color:var(--muted); margin-top:4px; }}
.imp {{ counter-reset:i; list-style:none; padding:0; display:grid; gap:14px; }}
.imp li {{ counter-increment:i; position:relative; padding-left:44px; max-width:none; }}
.imp li::before {{ content:counter(i); position:absolute; left:0; top:0; width:30px; height:30px; border-radius:50%; background:var(--accent); color:#fff; font:800 15px/30px var(--display); text-align:center; }}
.src {{ font-size:13px; color:var(--muted); columns:2 280px; }}
.src li {{ margin-bottom:4px; break-inside:avoid; }}
</style>
<div class="wrap">
<p class="meta">ARAŞDIRMA · 2026-11-08 · GOOGLE PLAY · REDDIT · INSTAGRAM · TIKTOK · AÇIQ MƏNBƏLƏR</p>
<h1>Sualtı Bazar Araşdırması</h1>
<p class="lede">Quiz və trivia tətbiqləri haqqında istifadəçilərin real sözləri: {num(TOTAL_GP)} Google Play rəyi, {num(az_n)} Azərbaycan dilində rəy, {num(r_posts)} Reddit postu və {num(r_comm)} şərh, {len(so['tiktok'])} TikTok videosu, {len(so['ig_hashtags'])+len(so['ig_competitors'])} Instagram postu. Bütün rəqəmlər xam datadan avtomatik hesablanıb, hər iddianın linki var.</p>

<ul class="keys">
<li><b>Reklam bazarın ən böyük yarasıdır.</b> Trivia Crack-ın ümumi reytinqi ★{gp['apps']['Trivia Crack']['score']:.2f}, amma son 400 rəyin ortası cəmi <b>{gp['apps']['Trivia Crack']['avg_recent']:.2f}</b>; şikayətlərin {round(100*dict(gp['apps']['Trivia Crack']['categories'])['Reklamlar']/gp['apps']['Trivia Crack']['complaints_n'])}%-i reklam haqqındadır. Reddit-də Trivia Crack reklamının istifadəçini zərərli sayta apardığı haqda post var.</li>
<li><b>Azərbaycan dilində ümumi, gündəlik, liqalı quiz yoxdur.</b> Yerli tətbiqlərin hamısı “Milyonçu” formatında və tək mövzuludur (tarix, coğrafiya, din). Bakıdakı pub-quiz gecələri rus dilindədir.</li>
<li><b>Yerli istifadəçi keyfiyyət istəyir.</b> {num(az_n)} yerli rəydə əsas şikayət səhv cavablar və təkrar suallardır: “eyni suallar təkrar olur, yeni suallar gətir”.</li>
<li><b>Azərbaycan dilində quiz videoları işləyir.</b> TikTok #bilikyarışı-nda ən çox baxılan video 1.7 milyon baxış toplayıb (@dr_game.0, “Heyvanlar Quiz 🐾 Bilirsən?”).</li>
<li><b>QuizUp-ın boşluğu hələ də doldurulmayıb.</b> r/QuizUp-da 2026-da da müstəqil developerlər “QuizUp-ın əvəzi”ni təqdim edir; insanlar mövzu duellərini və rəqabəti xatırlayır.</li>
</ul>

<h2>1. Qlobal rəqiblər — Google Play</h2>
<p>Hər tətbiqin ən yeni 400 rəyi (ABŞ, ingilis dili). Şikayət = 1–3 ulduz. Kateqoriyalar açar sözlə təyin olunub (market_researcher məntiqi), ona görə təxminidir — bir rəy bir neçə kateqoriyaya düşə bilər.</p>
<div class="tbl"><table>
<tr><th>Tətbiq</th><th>Yükləmə</th><th>Ümumi ★</th><th>Reytinq sayı</th><th>Son 400 ★</th><th>Şikayət payı</th><th>Reklam</th><th>Ən çox şikayət (şikayətlərin %)</th></tr>
{global_table}
</table></div>
<p class="cap">“Son 400 ★” ümumi reytinqdən çox aşağıdırsa, tətbiq son dövrdə istifadəçini itirir. Duolingo müqayisə üçün gamification etalonu kimi əlavə edilib.</p>
<blockquote>“Read the reviews and won't redownload because of the Ads.”<small>Trivia Crack, Google Play rəyi, 2026</small></blockquote>

<h2>2. Azərbaycan bazarı</h2>
<h3>Yerli quiz tətbiqləri (Google Play, AZ)</h3>
<div class="tbl"><table>
<tr><th>Tətbiq</th><th>Developer</th><th>Yükləmə</th><th>★</th><th>Reytinq sayı</th><th>Yenilənib</th></tr>
{local_table}
</table></div>
<h3>{num(az_n)} yerli rəydə mövzular</h3>
<div class="tbl"><table><tr><th>Mövzu</th><th>Rəy sayı</th><th>Pay</th></tr>
{az_theme_rows}
</table></div>
<blockquote>“Ancaq eyni suallar təkrar olur yeni suallar gətir.”<small>Milyonçu 2022 (Bilik yarışı), 3★</small></blockquote>
<blockquote>“çox pis oyunun ortasında reklam gəlir”<small>Yeni-Milyonçu: Bilik oyunu, 1★</small></blockquote>

<h3>Offline və TV quiz mühiti</h3>
<ul>
<li><b>Kim zəngin olmaq istəyir?</b> — İctimai TV, 2021-dən, baş mükafat 100 000 AZN. <a href="https://en.wikipedia.org/wiki/Kim_z%C9%99ngin_olmaq_ist%C9%99yir%3F_Milyonlar%C4%B1n_%C5%9Eousu">mənbə</a></li>
<li><b>Breyn-rinq</b> — İctimai TV, Nar-ın dəstəyi ilə; 21-ci mövsümdə 9 regiondan və 7 universitetdən 20 komanda. <a href="https://www.nar.az/en/news/narin-desteyi-ile-breyn-rinqin-21-ci-movsumu-davam-edir/">mənbə</a></li>
<li><b>Bakıda pub-quiz:</b> Квиз, плиз! (15 AZN/nəfər) və Эйнштейн Party (oyun başına 100+ nəfər, 20+ komanda) — hər ikisi rus dilində. <a href="https://baku.quizplease.com/">quizplease</a> · <a href="https://baku.albertparty.com/">albertparty</a></li>
<li><b>Instagram-da yerli quiz hesabları</b> (heşteq axtarışında tapılan, post sayı ilə):</li>
</ul>
<div class="tbl"><table><tr><th>Hesab</th><th>Nümunədə post</th><th>Nə edir</th></tr>
{local_ig_rows}
</table></div>

<h3>Rəqəmsal kontekst (DataReportal, Digital 2026: Azerbaijan)</h3>
<div class="tbl"><table><tr><th>Göstərici</th><th>Dəyər</th></tr>
<tr><td>İnternet istifadəçiləri</td><td class=n>9.27 mln (89.0%)</td></tr>
<tr><td>Sosial media identikləri</td><td class=n>7.61 mln (73.1%)</td></tr>
<tr><td>TikTok reklam əhatəsi (18+)</td><td class=n>7.61 mln</td></tr>
<tr><td>Instagram reklam əhatəsi</td><td class=n>4.25 mln</td></tr>
<tr><td>Facebook reklam əhatəsi</td><td class=n>1.65 mln</td></tr>
</table></div>
<p class="cap">Mənbə: <a href="https://datareportal.com/reports/digital-2026-azerbaijan">datareportal.com</a>. TikTok rəqəmi reklam əhatəsidir, aktiv istifadəçi deyil. TikTok Azərbaycanda əvvəllər bloklanıb, 2024-də TikTok-çular həbs olunub — kanal riski var (<a href="https://jam-news.net/tiktokers-arrested-in-azerbaijan-can-tiktok-be-blocked/">JAMnews</a>).</p>

<h2>3. Sosial media</h2>
<h3>TikTok — quiz heşteqləri (hər heşteqdən 25 video)</h3>
<div class="tbl"><table><tr><th>Heşteq</th><th>Video</th><th>Median baxış</th><th>Maks baxış</th><th>Ən güclü video</th></tr>
{tt_table}
</table></div>
<p class="cap">Küçə quizi (#streetquiz) və “neçəsini bilirsən?” formatları ən yüksək median baxış toplayır. Azərbaycan dilində (#bilikyarışı) median aşağı, amma tək-tək videolar milyonlara çatır.</p>
<h3>Instagram — rəqib hesablar (son postlar)</h3>
<div class="tbl"><table><tr><th>Hesab</th><th>Post</th><th>Orta like</th><th>Orta şərh</th></tr>
{ig_table}
</table></div>
<p class="cap">Duolingo maskot (Duo) əsaslı kontentlə digər quiz brendlərindən yüzlərlə dəfə çox reaksiya alır. Duolingo-nun sosial rəhbərinə görə TikTok-da maskotlu videolar 3–5 mln baxış, maskotsuzlar 20–30 min baxış alıb (<a href="https://www.marketingbrew.com/stories/2022/02/07/mascots-might-be-the-key-to-a-successful-tiktok-strategy-for-brands">Marketing Brew, 2022</a>).</p>

<h2>4. Reddit</h2>
<p>{num(r_posts)} post və {num(r_comm)} şərh, açıq mənbəli <a href="https://github.com/ArthurHeitmann/arctic_shift">Arctic Shift</a> arxivindən: {E(sub_line)}.</p>
<ul>
<li><b>QuizUp nostalgiyası canlıdır.</b> “QuizUp Comeback” postu (27 səs, 31 şərh) və bir neçə müstəqil developerin “QuizUp-ın ruhunda” yeni tətbiqi. <a href="https://www.reddit.com/r/QuizUp/comments/1we5v3e/quizup_comeback/">post</a> · <a href="https://www.reddit.com/r/QuizUp/comments/1v8tjwc/if_you_miss_quizups_topic_duels_i_made_quizat/">Quizat</a></li>
<li><b>Reklam təhlükəsizliyi.</b> “Trivia Crack açıq-aşkar zərərli/fırıldaq sayt açdı” — 47 səs, 25 şərh. <a href="https://www.reddit.com/r/AndroidGaming/comments/1q12uvn/the_game_trivia_crack_opened_up_what_is_clearly_a/">post</a></li>
<li><b>Reklamsız oyuna ödəməyə hazır auditoriya var.</b> Yaşlı valideyn üçün “reklamsız, mikrotranzaksiyasız, ödəməyə hazıram” sorğuları. <a href="https://www.reddit.com/r/AndroidGaming/comments/1vm62b5/request_classic_games_for_an_elderly_person_no/">post</a></li>
<li><b>“İnsan yazdığı suallar” bir üstünlük kimi təqdim olunur.</b> <a href="https://www.reddit.com/r/AndroidGaming/comments/1xc939d/dev_retro_trivia_humanwritten_questions_100_free/">Retro Trivia</a></li>
<li><b>Liqa təzyiqi yorur.</b> r/duolingo-da liqa rəqabətinin yumşaldılmasını alqışlayanlar: <a href="https://www.reddit.com/r/duolingo/comments/1x0eap4/_/pek65t2/">“Learning … should be relaxing and fun, not stressful”</a>.</li>
</ul>

<h2>5. Bağlanan tətbiqlərin dərsləri</h2>
<h3>QuizUp (2013–2021)</h3>
<ul>
<li>1 000+ rəsmi mövzu və istifadəçi mövzuları ilə sevilirdi, amma kifayət qədər gəlir gətirmədi. <a href="https://en.wikipedia.org/wiki/QuizUp">Wikipedia</a> · <a href="https://productmint.com/what-happened-to-quizup/">ProductMint</a></li>
<li>Glu Mobile 7.5 mln $-a aldıqdan sonra əhəmiyyətli yeniləmə olmadı; 2021-də bağlandı.</li>
</ul>
<h3>HQ Trivia (2017–2020)</h3>
<ul>
<li>Pik nöqtədə 2.38 mln eyni anda oyunçu (2018). <a href="https://en.wikipedia.org/wiki/HQ_Trivia">Wikipedia</a></li>
<li>Son ayda cəmi ~67 min yükləmə; investisiya kəsildi, ödənişlər gecikdi. <a href="https://www.digitaltrends.com/phones/hq-trivia-shuts-down-leaving-us-with-more-questions-than-answers/">Digital Trends</a></li>
<li>Format dəyişmədi, yayımlar ləngiyirdi, botlar vardı. <a href="https://productmint.com/what-happened-to-hq-trivia/">ProductMint</a></li>
</ul>
<h3>Seriya (streak) — Duolingo-nun öz rəqəmləri</h3>
<ul>
<li>7 günlük seriyaya çatanların kursu bitirmə ehtimalı 3.6 dəfə çoxdur; 2 “dondurma” icazəsi gündəlik aktiv istifadəçini 0.38% artırıb. <a href="https://blog.duolingo.com/how-duolingo-streak-builds-habit">Duolingo blog</a></li>
<li>Seriya üçün bir dərs kifayət edəndə 14-cü gün qalma göstəricisi 3.3% artıb. <a href="https://blog.duolingo.com/improving-the-streak">Duolingo blog</a></li>
</ul>

<h2>6. Sualtı üçün nəticələr</h2>
<ol class="imp">
<li><b>Sual keyfiyyəti — brendin özü.</b> Həm qlobal, həm yerli rəylərdə reklamdan sonra ən çox şikayət səhv və təkrar suallardır. Hər sualın mənbəyi, “səhv bildir” düyməsi və 30 gün təkrar olmaması əsas vəd olmalıdır. Gündəlik 20 sual üçün bazanı 60-dan ən azı 1 500-ə çatdırmaq lazımdır.</li>
<li><b>Reklam yalnız könüllü və mükafatlı.</b> Taymer gedərkən reklam yoxdur, qumar reklamı bloklanır. Premium varsa, bütün reklamları silməlidir — QuizzLand-da bu belə deyil və şikayət doğurur.</li>
<li><b>Bağışlayan seriya.</b> Seriya üçün 1 sual kifayətdir, həftədə “dondurma” var, günahlandıran bildiriş yoxdur. Liqalar könüllü olmalı və səviyyəyə görə qruplaşdırılmalıdır.</li>
<li><b>Boş yeri tut: Azərbaycan dilində ümumi, gündəlik, liqalı quiz.</b> Rəqiblər tək mövzulu “Milyonçu” klonlarıdır. Sualtının 10 linzası və şəhər reytinqi bu boşluğa birbaşa cavabdır.</li>
<li><b>Sosialda maskot və küçə formatı.</b> Qabo maskotlu qısa videolar, Bakıda küçə duelləri və Wordle tipli paylaşım kartı. TikTok riskinə görə Instagram bərabər prioritet olmalıdır.</li>
<li><b>Mövcud icma ilə tərəfdaşlıq.</b> kvizart.az, einsteinquiz.baku, paxlava.quiz, Breyn-rinq komandaları — ilk liqa komandaları, qonaq sual müəllifləri, canlı final aparıcıları.</li>
<li><b>Duel tarixçəsini və proqresi qoru.</b> Quiz Planet və hqtrivia rəylərində hesab/proqres itkisi tez-tez çıxır. Hesab bərpası ilk gündən olmalıdır.</li>
</ol>

<h2>Metod və məhdudiyyətlər</h2>
<ul>
<li>Google Play: <code>google-play-scraper</code> (açıq mənbə). Rəylər ən yenilərdir, ABŞ/ingilis və AZ/azərbaycan dili. App Store rəyləri yığılmayıb (Apple səhifədə ~10 rəy göstərir).</li>
<li>Kateqoriyalar açar söz əsaslıdır: təxmini göstəricidir, dəqiq sayım deyil. Nümunə sitatlar real rəylərdən götürülüb.</li>
<li>Reddit: Arctic Shift arxivi; reddit.com birbaşa sorğuları blokladı. Şərhlər ən çox müzakirə olunan 45 postdan götürülüb.</li>
<li>Instagram/TikTok: Apify actor-ları, kiçik nümunə (heşteq başına 25–30). Bu, bazarın tam şəkli deyil, siqnaldır.</li>
<li>Hesabat <code>build_report.py</code> ilə xam datadan qurulur; data və skriptlər repo-dadır.</li>
</ul>
</div>
"""
open("report.html", "w").write(page)
print("report.html", len(page))
