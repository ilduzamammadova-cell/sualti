# Quiz Platforması — Layihə Brifi

Tarix: 2026-11-08 · Status: qaralama v0.1

Azərbaycan dilində, fərqli dünyagörüşünə və bilik səviyyəsinə xitab edən, data bazası üzərində qurulan quiz platforması. Birinci mərhələ: araşdırma, ad, loqo, app dizaynı və **lokal veb sayt (MVP)**. İkinci mərhələ: gamification, fərqli quiz məntiqləri, psixoloji marketinq.

---

## 1. Konsepsiya: "Bilik + Linzalar"

Platformada yalnız **doğru cavabı olan** suallar var: bilik sualları və təxmin (rəqəm) sualları. Rəy/sorğu tipli "baxış" sualları istifadə edilmir (2026-11-08 qərarı). Fərqli dünyagörüşünə xitab linzalar vasitəsilə olur: eyni mövzu fərqli sahələrin gözü ilə verilir.

**Linzalar.** Hər sual bir və ya bir neçə "linza" ilə etiketlənir. Eyni mövzu fərqli linzalardan verilir. Məsələn, Novruz: astronomiya (gecə-gündüz bərabərliyi), tarix, mətbəx, folklor.

Təklif olunan linzalar (10): Elm · Tarix · Coğrafiya · İncəsənət və musiqi · Ədəbiyyat · Din və fəlsəfə (yalnız faktoloji) · Mədəniyyət və folklor · Pop-kultura · İdman · Texnologiya və gündəlik həyat.

**Dünyagörüş xəritəsi.** Oyunçunun profili 10 linza üzrə radar diaqramıdır. Məqsəd "ən çox bilən" yox, **"ən geniş baxan"** olmaqdır. Zəif linzaya keçmək mükafatlandırılır (bax: Gamification → Üfüq bonusu).

**Neytrallıq qaydası.** Din, siyasət, etnik mövzularda yalnız mənbəli faktoloji suallar. Hər sualın mənbəyi və redaktor təsdiqi olur.

---

## 2. Auditoriya

| Seqment | Yaş | Motivasiya | Kanal |
| --- | --- | --- | --- |
| Tələbələr | 17–24 | Rəqabət, status, dostlarla duel | TikTok, Instagram, universitet klubları |
| Gənc peşəkarlar | 25–35 | Qısa fasilədə zehni oyun, gündəlik ritual | Instagram, Telegram, LinkedIn |
| Valideynlər / ailə | 30–50 | Uşaqla birgə öyrənmə | Instagram, WhatsApp qrupları |
| Regionlar | 18–45 | Şəhər/rayon qüruru, regional reytinq | Instagram, Telegram |
| İntellektual oyun icması | 18–40 | Çətin suallar, komanda | Klublar, offline quiz gecələri |

Dil: Faza 1–2 yalnız Azərbaycan dili (Latın). Rusdilli Bakı seqmenti Faza 3-dən sonra qiymətləndirilir.

---

## 3. Araşdırma planı

**3.1 Masa araşdırması (rəqiblər və dərslər)** — rəqəmlər yoxlanılmalıdır:

| Məhsul | Nəyi öyrənirik |
| --- | --- |
| Kahoot | Sinif / qrup kontekstində canlı quiz |
| QuizUp (bağlanıb) | Mövzu icmaları güclü idi; retention və monetizasiya zəif idi |
| Trivia Crack | Duel + kateqoriya çarxı, asinxron oyun |
| HQ Trivia (bağlanıb) | Sürətli hype, pul mükafatı ilə davamsız böyümə |
| Duolingo | Seriya (streak), liqalar, push strategiyası |
| Wordle | Gündəlik 1 oyun, paylaşılan nəticə şəbəkəsi |
| 16Personalities / BuzzFeed testləri | Kimlik nəticəsi paylaşılır, viral yayılır |
| Yerli: TV intellektual oyunları, "Nə? Harada? Nə vaxt?" klubları | Yerli sual mədəniyyəti, potensial tərəfdaşlar |

**3.2 Sorğu** — 300+ cavab, Google Forms + Instagram story. Suallar: hansı mövzular, nə vaxt oynayır, nə paylaşar, rəy suallarına münasibət.

**3.3 Müsahibə** — 12–15 nəfər, hər seqmentdən 3. 30 dəqiqə. Fokus: "Son dəfə nə vaxt quiz oynadın, niyə dayandın?"

**3.4 Prototip testi** — 2 raund × 6 nəfər (Figma, sonra lokal sayt).

**Hipotezlər:**

| # | Hipotez | Necə yoxlanır | Uğur meyarı |
| --- | --- | --- | --- |
| H1 | "71% səhv cavab verdi" tipli çətin sual kartı paylaşımı artırır | Prototipdə paylaşım faizi | ≥ 1.5× adi kart |
| H2 | Dünyagörüş xəritəsi yeni linzaları sınamağa təşviq edir | Linza müxtəlifliyi / istifadəçi | ≥ 5 linza ilk həftədə |
| H3 | Regional reytinq regionlarda motivasiyanı artırır | Müsahibə + A/B | D7 retention +20% |
| H4 | Gündəlik sual vərdiş yaradır | D7 retention | ≥ 15% |

---

## 4. Ad təklifləri

Meyarlar: (1) konsepsiyaya uyğunluq, (2) asan tələffüz və yazılış, (3) ə/ı/ş kimi hərflər olmadan da yazıla bilmə (domen, handle), (4) domen boşluğu, (5) yadda qalma.

| Ad | Mənası | Konsepsiya | Yazılış (ASCII) | .az domen* | Qeyd |
| --- | --- | --- | --- | --- | --- |
| **Sualtı** | Sual + dərinə dalış söz oyunu | 4/5 | sualti | boş görünür | Yadda qalır, vizual ideyası güclü |
| **Baxış** | Perspektiv, nöqteyi-nəzər | 5/5 | baxis | boş görünür | "Bilik + Baxış" ilə birbaşa bağlı |
| **Bəs sən?** | "Sən nə düşünürsən?" | 5/5 | bessen | boş görünür | Danışıq dili, CTA kimi işləyir |
| **Üfüq** | Horizont — üfüqünü genişlət | 5/5 | ufuq | **tutulub** | Alternativ: ufuqquiz.az |
| **Mozaika** | Fərqli parçalar → bir şəkil | 4/5 | mozaika | boş görünür | Beynəlxalq söz, az yerli |
| **Dərya** | "Elm dəryası" idiomu | 3/5 | derya | **tutulub** | Çox istifadə olunan ad |

\* 2026-11-08 DNS yoxlaması. "Boş görünür" = NS qeydi yoxdur; qeydiyyatçıda (məs. nic.az) təsdiqlə. Əqli Mülkiyyət Agentliyində əmtəə nişanı axtarışı da lazımdır.

**Seçildi: Sualtı** (2026-11-08). İlkin tövsiyə **Baxış** idi — konsepsiyanı ən dəqiq ifadə edir; "Bəs sən?" isə slogan/CTA kimi: *"Baxış — bəs sən necə görürsən?"*.

---

## 5. Loqo konsepsiyaları

| Ad | Konsepsiya | Forma |
| --- | --- | --- |
| Baxış | Göz bəbəyi 10 rəngli seqmentdən (hər linza bir rəng) | Dairə, minimal; nəzərlik klişesindən qaçmaq |
| Baxış (alt.) | Sual işarəsinin nöqtəsi göz bəbəyinə çevrilir | Tək xətli monogram |
| Sualtı | Sual işarəsi + altında 3 hava qabarcığı | Dairəvi, oyunbaz; app ikonunda yaxşı oxunur |
| Üfüq | Sual işarəsinin əyrisi yarımdairə üfüq xəttinə çevrilir | Günəş doğuşu metaforu |
| Mozaika | 4–6 rəngli kafel bir "?" formalaşdırır | Xalça həndəsəsinə incə işarə (klişe olmadan) |

Tələblər: 24 px app ikonunda oxunmalı; monoxrom versiya; ağ və tünd fonda işləməli.

---

## 6. App dizaynı və lokal veb MVP (Faza 1)

**Platforma:** mobile-first veb sayt, əvvəlcə lokal (localhost) prototip, sonra hostinq. Mobil app Faza 3-dən sonra.

**Ekranlar (MVP):**

1. Onboarding — 3 maraq linzası seç + 5 sualla səviyyə təyini
2. Ana səhifə — Gündəlik sual · Davam et · Linzalar
3. Quiz ekranı — sual, 4 variant, taymer (20 san), linza rəngi
4. Nəticə — xal, düzgün cavab + 1 cümlə izah + mənbə
5. Profil — Dünyagörüş xəritəsi (radar), seriya, nişanlar
6. Reytinq — həftəlik, şəhər/rayon üzrə
7. Admin panel — sual əlavə et, redaktə, mənbə, təsdiq statusu

**Vizual dil:**
- Şrift Azərbaycan hərflərini tam dəstəkləməlidir: **Ə ə, Ğ ğ, I ı, İ i, Ö ö, Ü ü, Ç ç, Ş ş** (məs. Inter, Manrope, Noto Sans — yoxla).
- Hər linzanın sabit rəngi; doğru/yanlış yalnız rənglə deyil, ikona ilə də göstərilir.
- Cavab düymələri baş barmaq zonasında, minimum 48 px hündürlük.
- Oyuna başlamaq ≤ 3 toxunuş.

**Texnologiya (təklif):** Next.js + SQLite (lokal) → PostgreSQL / Supabase (ictimai buraxılış). ORM: Drizzle və ya Prisma. Sxem: [`db/schema.sql`](db/schema.sql).

---

## 7. Data bazası (sual bankı)

Əsas cədvəllər (tam sxem `db/schema.sql`-də):

| Cədvəl | Nə saxlayır |
| --- | --- |
| `lenses` | 10 linza: ad, rəng, ikon |
| `questions` | Mətn, növ (bilik / təxmin / sıralama...), çətinlik reytinqi, status, izah |
| `question_lenses` | Sual ↔ linza (çox-çoxa) |
| `answer_options` | Variantlar, düzgün olub-olmaması, sıra |
| `sources` | Mənbə linki, yoxlama tarixi |
| `users` | Profil, şəhər/rayon, oyunçu reytinqi (Elo) |
| `quiz_sessions` | Oyun sessiyası, rejim (gündəlik, duel, linza) |
| `user_answers` | Hər cavab: seçim, düzgünlük, vaxt (ms) |
| `user_lens_stats` | Linza üzrə statistika → Dünyagörüş xəritəsi |
| `badges`, `user_badges` | Nişanlar |
| `streaks` | Seriya |
| `question_reports` | İstifadəçi səhv bildirişi |

**Məzmun axını:** qaralama (insan və ya AI köməyi) → redaktor yoxlaması → mənbə əlavə → `approved` → oyunda. Səhv bildirişi 3-ə çatanda sual avtomatik `review`-a düşür.

**MVP hədəfi:** 500 təsdiqli sual (10 linza × 50). Demo: 60 sual (`demo/questions.js`, `db/seed_questions.sql`).

---

## 8. Quiz məntiqi

| Format | Mexanika | Nəyə xidmət edir |
| --- | --- | --- |
| Klassik | 4 variant, 1 düzgün | Əsas oyun |
| Əminlik mərcı | Cavab + 1–3 xal mərc | Kalibrasiya, risk həyəcanı |
| Təxmin | Rəqəm yaz, ən yaxın qazanır | Hamı iştirak edə bilir |
| Xronologiya | Hadisələri sırala | Tarix linzası |
| Xəritə | Xəritədə nöqtə seç | Coğrafiya |
| Şəkil / səs | Abidə, muğam parçası, rəsm tanı | İncəsənət, mədəniyyət |
| İki həqiqət, bir yalan | Yalanı tap | Sürətli, əyləncəli |
| Gündəlik 20 | Hamı üçün eyni 20 sual (hər linzadan 2), paylaşılan nəticə | Ritual, viral, linza genişliyi |
| Duel | Asinxron 1v1, eyni suallar | Sosial rəqabət |

**Adaptiv çətinlik:** hər sualın və oyunçunun Elo reytinqi var. Sistem oyunçuya ~65–70% uğur ehtimalı olan sualları seçir (flow zonası). Düzgün cavab sürəti də nəzərə alınır.

**Fırıldaq əleyhinə:** taymer, variantların təsadüfi sırası, eyni sual eyni oyunçuya 30 gün təkrarlanmır.

---

## 9. Gamification

| Element | Necə işləyir | Psixoloji əsas |
| --- | --- | --- |
| XP və səviyyə | Hər düzgün cavab XP; səviyyə adları ("Müşahidəçi" → "Bilgə") | İrəliləyiş hissi |
| Seriya (streak) | Gündəlik oynamaq; həftədə 1 "dondurma" | Vərdiş, itki qorxusu (yumşaq) |
| Həftəlik liqalar | 30 nəfərlik qrup, top 5 yüksəlir | Sosial müqayisə |
| Regional reytinq | Şəhər/rayon cədvəli: Bakı, Gəncə, Sumqayıt... | Kollektiv qürur |
| Üfüq bonusu | Zəif linzada oyna → 2× XP | Genişliyi mükafatlandırır |
| Nişanlar | "10 linzanın hamısı", "7 gün seriya" | Kolleksiya |
| Kolleksiya kartları | Şəxsiyyətlər, abidələr, şəhərlər | Tamamlama istəyi |
| Mövsümlər | Novruz, Yeni il, Dərs ili başlanğıcı | Təzəlik, FOMO |
| İstifadəçi sualları | Təsdiqlənsə müəllif adı ilə dərc | Sahiblik (IKEA effekti) |

---

## 10. Psixoloji marketinq

| Prinsip | Tətbiq |
| --- | --- |
| Maraq boşluğu | "Bakılıların 71%-i bu suala səhv cavab verdi. Bəs sən?" |
| Sosial sübut | "Bu gün 4 200 nəfər oynadı" |
| Kimlik etiketi | Nəticə profili: "Sən Kəşfiyyatçısan / Filosofsan" — paylaşılan kart |
| Bağışlanmış irəliləyiş | Qeydiyyatda ilk nişan artıq açıqdır |
| Zeigarnik effekti | "Kolleksiyanın 8/10-u tamamdır" |
| Pik-son qaydası | Sessiya həmişə uğurlu sualla bitir |
| Dəyişkən mükafat | Təsadüfi sürpriz sandıq (pulsuz, yalnız kosmetik) |
| Qarşılıqlılıq | Dostu dəvət et — hər ikiniz bonus |

**Kanallar:** Instagram Reels / TikTok ("küçə quizi" videoları), Telegram kanalı (gündəlik sual), universitet klubları, Bakı kafelərində offline quiz gecələri, mikro-influencerlər.

**Etik qırmızı xətlər:**
- Real pul ilə loot box, mərc yoxdur.
- 18 yaşdan kiçiklər üçün push limit və gecə bildirişi yoxdur.
- Qaranlıq naxışlar (gizli abunə, saxta taymer) yoxdur.
- Fərdi məlumatlar Azərbaycan qanunvericiliyinə uyğun saxlanılır; analitika anonim.

---

## 11. Mərhələlər və KPI

| Faza | Həftə | Nəticə |
| --- | --- | --- |
| 0. Araşdırma | 1–3 | Rəqib analizi, sorğu, 12–15 müsahibə, persona |
| 1. Brend + dizayn + lokal MVP | 4–9 | Ad, loqo, UI kit, lokal sayt, DB, 500 sual, admin panel |
| 2. Gamification + quiz məntiqləri | 10–14 | XP, seriya, liqa, nişan, 5+ format, adaptiv çətinlik |
| 3. Marketinq + açıq beta | 15–20 | Hostinq, kampaniya, 1 000 beta istifadəçi |
| 4. Mobil app | 21+ | PWA → native qərarı datadan asılı |

**KPI hədəfləri (beta):**

| Metrik | Hədəf |
| --- | --- |
| D1 retention | ≥ 35% |
| D7 retention | ≥ 15% |
| Sual / sessiya | ≥ 10 |
| Paylaşım faizi | ≥ 8% sessiya |
| Linza müxtəlifliyi | ≥ 5 linza / aktiv istifadəçi / həftə |
| Səhv bildirişi | < 1% sual |

---

## 12. Risklər və açıq suallar

**Risklər:**
- Faktoloji səhvlər → mənbə məcburi, redaktor təsdiqi, bildiriş sistemi.
- Həssas mövzular → neytrallıq qaydası, redaksiya şurası.
- AI-nin Azərbaycan dilində keyfiyyəti → AI yalnız qaralama, insan redaktə.
- Yenilik effekti sönür (QuizUp dərsi) → gündəlik ritual + sosial qatlar.
- Google ilə fırıldaq → taymer, Elo, sürət analizi.

**Açıq suallar:**
1. "Lokal sayt" = localhost prototip, yoxsa Azərbaycan bazarı üçün ictimai veb sayt?
2. ~~Monetizasiya~~ → həll olundu, bax: bölmə 13.
3. Minimum yaş həddi?
4. Rus dili nə vaxt?
5. Komanda: redaktorlar, dizayner, developer — kim?
6. Ad üzrə yekun qərar və əmtəə nişanı yoxlaması.

---

## 13. Biznes modeli

**Prinsip: məzmunu kilidləmirik, rahatlığı və dərinliyi satırıq.** Bütün mövzular və suallar hamı üçün pulsuzdur. Səbəblər (araşdırmadan, `research/report.html`):

- Brend ideyası "ən geniş baxmaq"dır. Kilidli mövzu rifdə doldurula bilməyən boşluq yaradır və maraq oyadan xüsusiyyəti pul tələbinə çevirir.
- Kahoot rəylərində əsas şikayət paywall-dur; QuizzLand-da "pul ödədim, reklam qaldı" şikayəti var.
- Yerli rəylərdə ən çox tələb "yeni suallar"dır. Sualları pullu etmək ən böyük ağrını satmaq olardı.
- Reddit-də reklamsız oyun üçün ödəməyə hazır auditoriya var.

| Gəlir mənbəyi | Nə daxildir | Qeyd |
| --- | --- | --- |
| **Pulsuz, həmişəlik** | Bütün mövzular və suallar, gündəlik 20 sual, gündə 5 duel, rif, seriya, liqa | Böyümə mühərriki |
| **Sualtı Plus** (abunə) | Limitsiz duel və tək oyun, limitsiz dondurma, ətraflı statistika, xüsusi rif canlıları və dekor, ailə planı | Rahatlıq və dərinlik satılır, məzmun yox |
| **Məktəb / müəllim** (B2B) | Sinif duelləri, müəllimin öz sualları, şagird hesabatları | Kahoot modeli; Azərbaycan dilində analoq yoxdur |
| **Şirkət / tədbir** (B2B) | Komanda quizləri, korporativ liqa, canlı final | Bakıda pub-quiz 15 AZN/nəfər ödənilir |
| **Sponsorlu mövzular** | "Həftənin mövzusu — X ilə birlikdə"; sual neytral, sponsor açıq yazılır | Breyn-rinq Nar sponsorluğu ilə gedir |
| **Könüllü reklam** | Yalnız mükafatlı: "izlə → dondurma". Taymer zamanı heç vaxt | Trivia Crack şikayətlərinin 69%-i reklamdır |

**Qiymət (fərziyyə, test olunmalıdır):** yeganə yerli istinad — 1Sual tətbiqi aylıq 1.99 $. Test variantları: 2.99 və 4.99 AZN/ay; illik plan ~2 ay endirimli.

**Ardıcıllıq:** 1) ilk 3 ay yalnız pulsuz — auditoriya və vərdiş; 2) Plus; 3) paralel 2–3 məktəb pilotu və 1 sponsorlu mövzu.

**Ölçülər:** Plus-a keçid ≥ 2–4% aktiv istifadəçi (hədəf, test olunmalıdır), B2B pilotlarda müəllimin 4 həftə ərzində təkrar istifadəsi, sponsorlu mövzuda adi mövzu ilə müqayisədə iştirak.

**Qırmızı xətlər:** pulla qələbə yoxdur (Plus duel xalına təsir etmir), reytinq satılmır, uşaqlara ödəniş təklifi göstərilmir.
