// Sualtı — demo sual bankı
// kind: 'k' = bilik (düzgün cavab var), 'e' = təxmin (rəqəm)

window.LENSES = [
  { slug: 'elm',         name: 'Elm',                   color: '#3B82F6', img: 'photo-1614935151651-0bea6508db6b' },
  { slug: 'tarix',       name: 'Tarix',                 color: '#F59E0B', img: 'photo-1513733582371-0adb4dac50f6' },
  { slug: 'cografiya',   name: 'Coğrafiya',             color: '#10B981', img: 'photo-1464822759023-fed622ff2c3b' },
  { slug: 'incesenet',   name: 'İncəsənət və musiqi',   color: '#EC4899', img: 'photo-1579783928621-7a13d66a62d1' },
  { slug: 'edebiyyat',   name: 'Ədəbiyyat',             color: '#8B5CF6', img: 'photo-1610116306796-6fea9f4fae38' },
  { slug: 'felsefe',     name: 'Din və fəlsəfə',        color: '#14B8A6', img: 'photo-1464802686167-b939a6910659' },
  { slug: 'medeniyyet',  name: 'Mədəniyyət və folklor', color: '#EF4444', img: 'photo-1596306499398-8d88944a5ec4' },
  { slug: 'pop',         name: 'Pop-kultura',           color: '#F97316', img: 'photo-1543007168-5fa9b3c5f5fb' },
  { slug: 'idman',       name: 'İdman',                 color: '#22C55E', img: 'photo-1579952363873-27f3bade9f55' },
  { slug: 'texnologiya', name: 'Texnologiya',           color: '#64748B', img: 'photo-1451187580459-43490279c0fa' },
];

window.QUESTIONS = [
  // ── Elm ──
  { lens: 'elm', kind: 'k', q: 'Suyun kimyəvi formulu hansıdır?', opts: ['CO₂', 'H₂O', 'O₂', 'NaCl'], a: 1, ex: 'Su molekulu iki hidrogen və bir oksigen atomundan ibarətdir.' },
  { lens: 'elm', kind: 'k', q: 'Günəş sistemində ən böyük planet hansıdır?', opts: ['Saturn', 'Neptun', 'Yupiter', 'Yer'], a: 2, ex: 'Yupiter digər planetlərin hamısından birlikdə daha ağırdır.' },
  { lens: 'elm', kind: 'k', q: 'Okeanın ən dərin nöqtəsi harada yerləşir?', opts: ['Mariana çökəkliyi', 'Puerto-Riko çökəkliyi', 'Yava çökəkliyi', 'Tonqa çökəkliyi'], a: 0, ex: 'Mariana çökəkliyindəki Çellencer dərinliyi təxminən 10 900 metrdir.' },
  { lens: 'elm', kind: 'k', q: 'İnsan bədəninin ən böyük orqanı hansıdır?', opts: ['Qaraciyər', 'Beyin', 'Ağciyər', 'Dəri'], a: 3, ex: 'Dəri bədəni tamamilə örtür və ən böyük orqan sayılır.' },
  { lens: 'elm', kind: 'k', q: 'Ahtapotun neçə ürəyi var?', opts: ['1', '2', '3', '8'], a: 2, ex: 'İki ürək qəlsəmələrə, biri isə bütün bədənə qan vurur.' },
  { lens: 'elm', kind: 'e', q: 'Səs havada saniyədə təxminən neçə metr yol gedir?', min: 0, max: 1000, step: 1, ans: 343, unit: 'm/s', ex: '20 °C-də səsin havada sürəti təxminən 343 m/s-dir.' },

  // ── Tarix ──
  { lens: 'tarix', kind: 'k', q: 'Azərbaycan Xalq Cümhuriyyəti neçənci ildə elan edilib?', opts: ['1905', '1918', '1920', '1991'], a: 1, ex: 'AXC 28 may 1918-ci ildə elan edilib — Şərqdə ilk demokratik respublika.' },
  { lens: 'tarix', kind: 'k', q: 'Azərbaycan dövlət müstəqilliyini hansı ildə bərpa edib?', opts: ['1989', '1991', '1993', '1995'], a: 1, ex: '18 oktyabr 1991-ci ildə Dövlət Müstəqilliyi haqqında Konstitusiya Aktı qəbul edilib.' },
  { lens: 'tarix', kind: 'k', q: 'Qız qalası hansı şəhərdədir?', opts: ['Şəki', 'Gəncə', 'Bakı', 'Naxçıvan'], a: 2, ex: 'Qız qalası Bakının İçərişəhər hissəsindədir və UNESCO irs siyahısına daxildir.' },
  { lens: 'tarix', kind: 'k', q: 'Möminə Xatın türbəsi hansı şəhərdədir?', opts: ['Bərdə', 'Naxçıvan', 'Şamaxı', 'Quba'], a: 1, ex: 'Türbə 1186-cı ildə memar Əcəmi Naxçıvani tərəfindən tikilib.' },
  { lens: 'tarix', kind: 'k', q: 'Şəki Xan Sarayı hansı əsrdə tikilib?', opts: ['XV əsr', 'XVI əsr', 'XVIII əsr', 'XX əsr'], a: 2, ex: 'Saray XVIII əsrdə tikilib; şəbəkə pəncərələri ilə məşhurdur.' },
  { lens: 'tarix', kind: 'e', q: 'Xeops piramidası təxminən neçə il əvvəl tikilib?', min: 0, max: 10000, step: 50, ans: 4500, unit: 'il', ex: 'Piramida eramızdan əvvəl təxminən 2560-cı ildə, yəni ~4500 il əvvəl tikilib.' },

  // ── Coğrafiya ──
  { lens: 'cografiya', kind: 'k', q: 'Xəzər dənizi hansı ölkə ilə həmsərhəd DEYİL?', opts: ['Qazaxıstan', 'İran', 'Türkmənistan', 'Gürcüstan'], a: 3, ex: 'Xəzər Azərbaycan, Rusiya, Qazaxıstan, Türkmənistan və İranla həmsərhəddir.' },
  { lens: 'cografiya', kind: 'k', q: 'Azərbaycanın ən yüksək zirvəsi hansıdır?', opts: ['Şahdağ', 'Bazardüzü', 'Tufandağ', 'Babadağ'], a: 1, ex: 'Bazardüzünün hündürlüyü 4466 metrdir.' },
  { lens: 'cografiya', kind: 'k', q: 'Azərbaycan ərazisindən keçən ən uzun çay hansıdır?', opts: ['Araz', 'Samur', 'Kür', 'Qudyalçay'], a: 2, ex: 'Kür Cənubi Qafqazın ən uzun çayıdır və Xəzərə tökülür.' },
  { lens: 'cografiya', kind: 'k', q: 'Dünyanın ən böyük okeanı hansıdır?', opts: ['Atlantik', 'Hind', 'Şimal Buzlu', 'Sakit'], a: 3, ex: 'Sakit okean Yer səthinin təxminən üçdə birini tutur.' },
  { lens: 'cografiya', kind: 'k', q: 'Dünyanın ən böyük gölü hansıdır?', opts: ['Baykal', 'Xəzər', 'Viktoriya', 'Superior'], a: 1, ex: 'Xəzər sahəsinə görə dünyanın ən böyük qapalı su hövzəsidir.' },
  { lens: 'cografiya', kind: 'e', q: 'Xəzər dənizinin ən dərin nöqtəsi təxminən neçə metrdir?', min: 0, max: 3000, step: 5, ans: 1025, unit: 'm', ex: 'Xəzərin ən dərin nöqtəsi cənub hissədədir: təxminən 1025 m.' },

  // ── İncəsənət və musiqi ──
  { lens: 'incesenet', kind: 'k', q: 'Şərqin ilk operası "Leyli və Məcnun"un bəstəkarı kimdir?', opts: ['Qara Qarayev', 'Üzeyir Hacıbəyli', 'Fikrət Əmirov', 'Müslüm Maqomayev'], a: 1, ex: 'Opera 1908-ci ildə Bakıda səhnəyə qoyulub.' },
  { lens: 'incesenet', kind: 'k', q: '"Mona Liza" tablosunun müəllifi kimdir?', opts: ['Mikelancelo', 'Rafael', 'Leonardo da Vinçi', 'Rembrandt'], a: 2, ex: 'Tablo Parisdəki Luvr muzeyində saxlanılır.' },
  { lens: 'incesenet', kind: 'k', q: 'Tar hansı növ musiqi alətidir?', opts: ['Simli', 'Nəfəs', 'Zərb', 'Klavişli'], a: 0, ex: 'Azərbaycan tarının ifaçılıq sənəti UNESCO irs siyahısındadır.' },
  { lens: 'incesenet', kind: 'k', q: 'Kamança necə çalınır?', opts: ['Mizrabla', 'Kamanla (yayla)', 'Üfürməklə', 'Barmaqla vurmaqla'], a: 1, ex: 'Kamança simli-kamanlı alətdir: səs yayın simə sürtülməsi ilə yaranır.' },
  { lens: 'incesenet', kind: 'k', q: 'Vinsent van Qoq hansı ölkənin rəssamıdır?', opts: ['Fransa', 'Niderland', 'İspaniya', 'İtaliya'], a: 1, ex: 'Van Qoq Niderlandda doğulub, son illərini Fransada keçirib.' },
  { lens: 'incesenet', kind: 'k', q: 'Azərbaycan muğamı UNESCO-nun Qeyri-maddi Mədəni İrs siyahısındadır.', opts: ['Doğru', 'Yanlış'], a: 0, ex: 'Muğam 2008-ci ildə siyahıya daxil edilib.' },

  // ── Ədəbiyyat ──
  { lens: 'edebiyyat', kind: 'k', q: '"Xəmsə"nin müəllifi kimdir?', opts: ['Nizami Gəncəvi', 'Məhəmməd Füzuli', 'İmadəddin Nəsimi', 'Molla Pənah Vaqif'], a: 0, ex: '"Xəmsə" beş poemadan ibarətdir, o cümlədən "Sirlər xəzinəsi" və "Leyli və Məcnun".' },
  { lens: 'edebiyyat', kind: 'k', q: 'XVI əsrdə Azərbaycan dilində "Leyli və Məcnun" poemasını kim yazıb?', opts: ['Nizami Gəncəvi', 'Məhəmməd Füzuli', 'Xətai', 'Nəsimi'], a: 1, ex: 'Füzulinin poeması Azərbaycan dilində klassik əsərlərdəndir.' },
  { lens: 'edebiyyat', kind: 'k', q: '"Əli və Nino" romanı hansı imza ilə nəşr olunub?', opts: ['Qurban Səid', 'Anar', 'Elçin', 'Cəlil Məmmədquluzadə'], a: 0, ex: 'Roman 1937-ci ildə Vyanada Qurban Səid imzası ilə çıxıb.' },
  { lens: 'edebiyyat', kind: 'k', q: '"Molla Nəsrəddin" jurnalının əsasını kim qoyub?', opts: ['Mirzə Ələkbər Sabir', 'Cəlil Məmmədquluzadə', 'Hüseyn Cavid', 'Üzeyir Hacıbəyli'], a: 1, ex: 'Jurnal 1906-cı ildə Tiflisdə nəşrə başlayıb.' },
  { lens: 'edebiyyat', kind: 'k', q: 'Mirzə Ələkbər Sabirin satirik şeirlər toplusu necə adlanır?', opts: ['Divan', 'Hophopnamə', 'Xəmsə', 'Qanun'], a: 1, ex: '"Hophopnamə" Sabirin ölümündən sonra kitab halında nəşr olunub.' },
  { lens: 'edebiyyat', kind: 'k', q: '"Don Kixot" romanının müəllifi kimdir?', opts: ['Servantes', 'Şekspir', 'Dante', 'Hüqo'], a: 0, ex: 'Migel de Servantesin romanı ilk müasir romanlardan sayılır.' },

  // ── Din və fəlsəfə ──
  { lens: 'felsefe', kind: 'k', q: 'Sokrat hansı ölkənin filosofu idi?', opts: ['Qədim Roma', 'Qədim Yunanıstan', 'Qədim Misir', 'Qədim Çin'], a: 1, ex: 'Sokrat Afinada yaşayıb; özü yazı qoymayıb, fikirlərini Platon yazıb.' },
  { lens: 'felsefe', kind: 'k', q: 'Platon kimin tələbəsi idi?', opts: ['Aristotel', 'Pifaqor', 'Sokrat', 'Heraklit'], a: 2, ex: 'Aristotel isə Platonun tələbəsi olub.' },
  { lens: 'felsefe', kind: 'k', q: 'Konfutsi təlimi hansı ölkədə yaranıb?', opts: ['Hindistan', 'Yaponiya', 'Çin', 'Koreya'], a: 2, ex: 'Konfutsi eramızdan əvvəl VI–V əsrlərdə Çində yaşayıb.' },
  { lens: 'felsefe', kind: 'k', q: '"Düşünürəm, deməli, varam" fikri kimə məxsusdur?', opts: ['Kant', 'Dekart', 'Nitsşe', 'Spinoza'], a: 1, ex: 'Rene Dekart bu fikri XVII əsrdə irəli sürüb.' },
  { lens: 'felsefe', kind: 'k', q: '"Tibb qanunu" əsərinin müəllifi kimdir?', opts: ['Fərabi', 'İbn Sina', 'Biruni', 'Nəsirəddin Tusi'], a: 1, ex: 'İbn Sinanın bu əsəri əsrlər boyu Şərqdə və Avropada tibb dərsliyi olub.' },
  { lens: 'felsefe', kind: 'k', q: 'Marağa rəsədxanasının əsasını kim qoyub?', opts: ['Uluqbəy', 'Nəsirəddin Tusi', 'Ömər Xəyyam', 'İbn Sina'], a: 1, ex: 'Rəsədxana 1259-cu ildə Nəsirəddin Tusinin rəhbərliyi ilə tikilməyə başlanıb.' },

  // ── Mədəniyyət və folklor ──
  { lens: 'medeniyyet', kind: 'k', q: 'Novruz bayramı hansı astronomik hadisə ilə bağlıdır?', opts: ['Yay gündönümü', 'Yaz gecə-gündüz bərabərliyi', 'Ay tutulması', 'Qış gündönümü'], a: 1, ex: 'Novruz yaz gecə-gündüz bərabərliyi ilə, adətən 20–21 martda gəlir.' },
  { lens: 'medeniyyet', kind: 'k', q: 'Novruzdan əvvəlki axır çərşənbə hansıdır?', opts: ['Su çərşənbəsi', 'Od çərşənbəsi', 'Yel çərşənbəsi', 'Torpaq çərşənbəsi'], a: 3, ex: 'Ardıcıllıq belədir: Su, Od, Yel, Torpaq.' },
  { lens: 'medeniyyet', kind: 'k', q: 'Səməni ən çox hansı dəndən göyərdilir?', opts: ['Buğda', 'Düyü', 'Qarğıdalı', 'Lobya'], a: 0, ex: 'Səməni yazın, bərəkətin və oyanışın simvoludur.' },
  { lens: 'medeniyyet', kind: 'k', q: 'Kəlağayı nədir?', opts: ['Şirniyyat', 'Musiqi aləti', 'İpək baş örtüyü', 'Xalq rəqsi'], a: 2, ex: 'Kəlağayı sənəti 2014-cü ildə UNESCO irs siyahısına daxil edilib.' },
  { lens: 'medeniyyet', kind: 'k', q: 'Yallı nədir?', opts: ['Kollektiv xalq rəqsi', 'Bayram yeməyi', 'Xalça növü', 'Nəfəs aləti'], a: 0, ex: 'Naxçıvanın Köçəri, Tənzərə yallıları UNESCO siyahısındadır.' },
  { lens: 'medeniyyet', kind: 'k', q: 'Azərbaycan xalçaçılıq sənəti UNESCO siyahısına hansı ildə daxil edilib?', opts: ['2003', '2008', '2010', '2016'], a: 2, ex: 'Azərbaycan xalçası 2010-cu ildə UNESCO-nun Qeyri-maddi Mədəni İrs siyahısına daxil edilib.' },

  // ── Pop-kultura ──
  { lens: 'pop', kind: 'k', q: 'Azərbaycan Eurovision-da hansı mahnı ilə qalib gəlib?', opts: ['Running Scared', 'Always', 'Drip Drop', 'Day After Day'], a: 0, ex: 'Ell & Nikki 2011-ci ildə Düsseldorfda qalib gəlib; 2012 müsabiqəsi Bakıda keçib.' },
  { lens: 'pop', kind: 'k', q: '"Uzaq sahillərdə" filmi kimin həyatından bəhs edir?', opts: ['Həzi Aslanov', 'Mehdi Hüseynzadə', 'Nəcəf bəy Vəzirov', 'Səttarxan'], a: 1, ex: 'Film 1958-ci ildə çəkilib; Mehdi Hüseynzadə İtaliyada partizan olub.' },
  { lens: 'pop', kind: 'k', q: '"Arşın mal alan" operettasının müəllifi kimdir?', opts: ['Üzeyir Hacıbəyli', 'Qara Qarayev', 'Niyazi', 'Tofiq Quliyev'], a: 0, ex: 'Operetta 1913-cü ildə yazılıb və dəfələrlə ekranlaşdırılıb.' },
  { lens: 'pop', kind: 'k', q: '"Harri Potter" kitablarının müəllifi kimdir?', opts: ['C. R. R. Tolkin', 'C. K. Roulinq', 'Stiven Kinq', 'Rold Dal'], a: 1, ex: 'Seriyanın ilk kitabı 1997-ci ildə nəşr olunub.' },
  { lens: 'pop', kind: 'k', q: 'Disney-in "Balaca su pərisi" cizgi filmindəki su pərisinin adı nədir?', opts: ['Elza', 'Ariel', 'Moana', 'Bel'], a: 1, ex: 'Film Hans Kristian Andersenin nağılı əsasında çəkilib.' },
  { lens: 'pop', kind: 'k', q: '"Bəxtiyar" filmində baş rolu hansı müğənni oynayıb?', opts: ['Müslüm Maqomayev', 'Rəşid Behbudov', 'Polad Bülbüloğlu', 'Bülbül'], a: 1, ex: 'Film 1955-ci ildə çəkilib; Rəşid Behbudov həm oynayıb, həm oxuyub.' },

  // ── İdman ──
  { lens: 'idman', kind: 'k', q: 'Futbolda bir komandadan meydanda eyni anda neçə oyunçu olur?', opts: ['9', '10', '11', '12'], a: 2, ex: '10 oyunçu və 1 qapıçı.' },
  { lens: 'idman', kind: 'k', q: 'İlk Avropa Oyunları 2015-ci ildə harada keçirilib?', opts: ['Minsk', 'Bakı', 'Krakov', 'İstanbul'], a: 1, ex: 'Birinci Avropa Oyunları iyun 2015-də Bakıda keçirilib.' },
  { lens: 'idman', kind: 'k', q: 'Teymur Rəcəbov hansı idman növündə tanınır?', opts: ['Güləş', 'Cüdo', 'Şahmat', 'Boks'], a: 2, ex: 'Rəcəbov Azərbaycanın tanınmış qrossmeysteridir.' },
  { lens: 'idman', kind: 'k', q: 'Olimpiya bayrağında neçə halqa var?', opts: ['4', '5', '6', '7'], a: 1, ex: 'Beş halqa beş qitənin birliyini simvolizə edir.' },
  { lens: 'idman', kind: 'k', q: 'Formula 1 Azərbaycan Qran-prisi hansı şəhərdə keçirilir?', opts: ['Bakı', 'Gəncə', 'Sumqayıt', 'Qəbələ'], a: 0, ex: 'Yarış Bakı küçələrində, İçərişəhərin yanından keçən şəhər trasında olur.' },
  { lens: 'idman', kind: 'e', q: 'Marafon qaçışı təxminən neçə kilometrdir?', min: 0, max: 100, step: 1, ans: 42, unit: 'km', ex: 'Rəsmi marafon məsafəsi 42,195 km-dir.' },

  // ── Texnologiya ──
  { lens: 'texnologiya', kind: 'k', q: 'Ümumdünya hörümçək torunu (WWW) kim icad edib?', opts: ['Bill Qeyts', 'Tim Berners-Li', 'Stiv Cobs', 'Alan Türinq'], a: 1, ex: 'Tim Berners-Li WWW-ni 1989-cu ildə CERN-də təklif edib.' },
  { lens: 'texnologiya', kind: 'k', q: '1 baytda neçə bit var?', opts: ['4', '8', '16', '10'], a: 1, ex: 'Bir bayt 8 bitdən ibarətdir.' },
  { lens: 'texnologiya', kind: 'k', q: 'Azərbaycanın ilk telekommunikasiya peyki hansıdır?', opts: ['Azersky', 'Azerspace-1', 'Türksat', 'Sputnik-1'], a: 1, ex: 'Azerspace-1 2013-cü ildə orbitə çıxarılıb.' },
  { lens: 'texnologiya', kind: 'k', q: 'Kompüterdə CPU nədir?', opts: ['Mərkəzi prosessor', 'Operativ yaddaş', 'Videokart', 'Sərt disk'], a: 0, ex: 'CPU — Central Processing Unit, əmrləri icra edən əsas çip.' },
  { lens: 'texnologiya', kind: 'k', q: 'Azərbaycanın ilk Yer müşahidə peyki hansıdır?', opts: ['Azerspace-1', 'Azersky', 'Azerspace-2', 'Türksat-4A'], a: 1, ex: 'Azersky 2014-cü ildən Azərbaycanın istifadəsindədir.' },
  { lens: 'texnologiya', kind: 'e', q: 'Bakı–Tbilisi–Qars dəmir yolu neçənci ildə açılıb?', min: 1990, max: 2025, step: 1, ans: 2017, unit: '', ex: 'Xətt 30 oktyabr 2017-ci ildə istifadəyə verilib.' },
];
