-- Quiz platforması — sual bankı və oyun data bazası
-- SQLite (lokal MVP). PostgreSQL-ə köçürmək üçün: INTEGER PRIMARY KEY -> SERIAL/IDENTITY,
-- TEXT tarixlər -> TIMESTAMPTZ.

PRAGMA foreign_keys = ON;

-- Linzalar (mövzu / dünyagörüş baxış bucağı)
CREATE TABLE lenses (
  id          INTEGER PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,          -- 'elm', 'tarix', ...
  name        TEXT NOT NULL,                 -- 'Elm'
  color_hex   TEXT NOT NULL,
  icon        TEXT
);

-- Mənbələr
CREATE TABLE sources (
  id          INTEGER PRIMARY KEY,
  title       TEXT NOT NULL,
  url         TEXT,
  checked_at  TEXT                           -- son yoxlama tarixi
);

-- Suallar
CREATE TABLE questions (
  id            INTEGER PRIMARY KEY,
  text          TEXT NOT NULL,
  kind          TEXT NOT NULL CHECK (kind IN
                  ('knowledge','opinion','estimate','order','map','media','two_truths')),
  explanation   TEXT,                        -- düzgün cavabdan sonra 1 cümlə izah
  media_url     TEXT,                        -- şəkil/səs
  numeric_answer REAL,                       -- 'estimate' növü üçün
  elo_rating    INTEGER NOT NULL DEFAULT 1200,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN
                  ('draft','review','approved','archived')),
  sensitive     INTEGER NOT NULL DEFAULT 0,  -- 1 = yalnız faktoloji, rəy sualı qadağan
  source_id     INTEGER REFERENCES sources(id),
  author_user_id INTEGER REFERENCES users(id), -- istifadəçi sualları üçün
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  approved_at   TEXT
);

CREATE TABLE question_lenses (
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  lens_id     INTEGER NOT NULL REFERENCES lenses(id),
  PRIMARY KEY (question_id, lens_id)
);

CREATE TABLE answer_options (
  id          INTEGER PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  is_correct  INTEGER NOT NULL DEFAULT 0,    -- 'opinion' suallarında hamısı 0
  sort_order  INTEGER NOT NULL DEFAULT 0     -- 'order' növündə düzgün sıra
);

-- İstifadəçilər
CREATE TABLE users (
  id          INTEGER PRIMARY KEY,
  username    TEXT NOT NULL UNIQUE,
  city        TEXT,                          -- regional reytinq üçün
  birth_year  INTEGER,
  elo_rating  INTEGER NOT NULL DEFAULT 1200,
  xp          INTEGER NOT NULL DEFAULT 0,
  level       INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Oyun sessiyaları
CREATE TABLE quiz_sessions (
  id          INTEGER PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  mode        TEXT NOT NULL CHECK (mode IN ('daily','lens','duel','adaptive')),
  lens_id     INTEGER REFERENCES lenses(id),
  opponent_session_id INTEGER REFERENCES quiz_sessions(id), -- duel
  score       INTEGER NOT NULL DEFAULT 0,
  started_at  TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at TEXT
);

-- Hər cavab
CREATE TABLE user_answers (
  id              INTEGER PRIMARY KEY,
  session_id      INTEGER NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id     INTEGER NOT NULL REFERENCES questions(id),
  option_id       INTEGER REFERENCES answer_options(id),
  numeric_value   REAL,                      -- 'estimate'
  confidence_bet  INTEGER CHECK (confidence_bet BETWEEN 1 AND 3),
  is_correct      INTEGER,                   -- 'opinion' üçün NULL
  time_ms         INTEGER,
  answered_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_user_answers_question ON user_answers(question_id);

-- Linza üzrə statistika -> Dünyagörüş xəritəsi
CREATE TABLE user_lens_stats (
  user_id   INTEGER NOT NULL REFERENCES users(id),
  lens_id   INTEGER NOT NULL REFERENCES lenses(id),
  answered  INTEGER NOT NULL DEFAULT 0,
  correct   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, lens_id)
);

-- Gamification
CREATE TABLE badges (
  id          INTEGER PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT
);

CREATE TABLE user_badges (
  user_id   INTEGER NOT NULL REFERENCES users(id),
  badge_id  INTEGER NOT NULL REFERENCES badges(id),
  earned_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE streaks (
  user_id        INTEGER PRIMARY KEY REFERENCES users(id),
  current_days   INTEGER NOT NULL DEFAULT 0,
  longest_days   INTEGER NOT NULL DEFAULT 0,
  freezes_left   INTEGER NOT NULL DEFAULT 1,
  last_played_on TEXT
);

-- Səhv bildirişləri (3 bildiriş -> sual 'review' statusuna)
CREATE TABLE question_reports (
  id          INTEGER PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id),
  user_id     INTEGER REFERENCES users(id),
  reason      TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Başlanğıc linzalar
INSERT INTO lenses (slug, name, color_hex) VALUES
  ('elm','Elm','#2563EB'),
  ('tarix','Tarix','#B45309'),
  ('cografiya','Coğrafiya','#059669'),
  ('incesenet','İncəsənət və musiqi','#DB2777'),
  ('edebiyyat','Ədəbiyyat','#7C3AED'),
  ('din-felsefe','Din və fəlsəfə','#0F766E'),
  ('medeniyyet','Mədəniyyət və folklor','#DC2626'),
  ('pop','Pop-kultura','#EA580C'),
  ('idman','İdman','#16A34A'),
  ('texnologiya','Texnologiya və gündəlik həyat','#475569');
