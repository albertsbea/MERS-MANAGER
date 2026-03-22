-- ============================================================
-- MERS MANAGER — Schéma PostgreSQL Supabase
-- Coller dans : Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── Extensions ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. BRANCHES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS branches (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom         TEXT NOT NULL,
  region      TEXT NOT NULL,
  adresse     TEXT,
  telephone   TEXT,
  pasteur_nom TEXT,
  statut      TEXT NOT NULL DEFAULT 'active' CHECK (statut IN ('active','suspendue','fermee')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. FIDÈLES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fideles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id       UUID REFERENCES branches(id) ON DELETE SET NULL,
  nom             TEXT NOT NULL,
  prenom          TEXT NOT NULL,
  date_naissance  DATE,
  genre           TEXT CHECK (genre IN ('M','F')),
  telephone       TEXT,
  adresse         TEXT,
  profession      TEXT,
  situation       TEXT CHECK (situation IN ('celibataire','marie','veuf')) DEFAULT 'celibataire',
  departement     TEXT CHECK (departement IN ('papas','mamans','jeunes','enfants')),
  baptise         BOOLEAN DEFAULT FALSE,
  discipolat      TEXT CHECK (discipolat IN ('non_commence','en_cours','complete')) DEFAULT 'non_commence',
  statut          TEXT NOT NULL DEFAULT 'actif' CHECK (statut IN ('actif','inactif')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. CULTES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cultes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id       UUID REFERENCES branches(id) ON DELETE CASCADE,
  date_culte      DATE NOT NULL,
  type_culte      TEXT NOT NULL CHECK (type_culte IN ('dimanche','semaine','special')),
  predicateur     TEXT,
  texte_biblique  TEXT,
  theme           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. PRÉSENCES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS presences (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  culte_id    UUID REFERENCES cultes(id) ON DELETE CASCADE,
  papas       INTEGER DEFAULT 0,
  mamans      INTEGER DEFAULT 0,
  jeunes      INTEGER DEFAULT 0,
  enfants     INTEGER DEFAULT 0,
  visiteurs   INTEGER DEFAULT 0,
  total       INTEGER GENERATED ALWAYS AS (papas + mamans + jeunes + enfants + visiteurs) STORED,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. COLLECTES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS collectes (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  culte_id            UUID REFERENCES cultes(id) ON DELETE CASCADE,
  branch_id           UUID REFERENCES branches(id) ON DELETE CASCADE,
  dimes               BIGINT DEFAULT 0,
  offrandes_ordinaires BIGINT DEFAULT 0,
  offrande_speciale   BIGINT DEFAULT 0,
  autres_dons         BIGINT DEFAULT 0,
  total               BIGINT GENERATED ALWAYS AS
                        (dimes + offrandes_ordinaires + offrande_speciale + autres_dons) STORED,
  mode_reception      TEXT DEFAULT 'especes' CHECK (mode_reception IN ('especes','orange_money','mtn_momo','virement')),
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. DÉPENSES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS depenses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id   UUID REFERENCES branches(id) ON DELETE CASCADE,
  date_dep    DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  montant     BIGINT NOT NULL,
  categorie   TEXT DEFAULT 'fonctionnement' CHECK (
    categorie IN ('fonctionnement','pastoral','investissement','prime_pasteur','autre')
  ),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Index pour les performances ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_fideles_branch ON fideles(branch_id);
CREATE INDEX IF NOT EXISTS idx_cultes_branch ON cultes(branch_id);
CREATE INDEX IF NOT EXISTS idx_collectes_branch ON collectes(branch_id);
CREATE INDEX IF NOT EXISTS idx_depenses_branch ON depenses(branch_id);
CREATE INDEX IF NOT EXISTS idx_presences_culte ON presences(culte_id);

-- ── Row Level Security (activer après configuration Auth) ─────
ALTER TABLE branches  ENABLE ROW LEVEL SECURITY;
ALTER TABLE fideles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE presences ENABLE ROW LEVEL SECURITY;
ALTER TABLE collectes ENABLE ROW LEVEL SECURITY;
ALTER TABLE depenses  ENABLE ROW LEVEL SECURITY;

-- Politique temporaire : tout accès autorisé (MVP)
-- À restreindre selon les rôles en production
CREATE POLICY "allow_all" ON branches  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON fideles   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON cultes    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON presences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON collectes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON depenses  FOR ALL USING (true) WITH CHECK (true);

-- ── Données de test ───────────────────────────────────────────
INSERT INTO branches (nom, region, adresse, telephone, pasteur_nom) VALUES
  ('MERS Conakry Centre', 'Conakry', 'Commune de Kaloum', '+224 620 000 001', 'Pasteur Jean Camara'),
  ('MERS Ratoma',         'Conakry', 'Commune de Ratoma', '+224 620 000 002', 'Pasteur Marie Diallo'),
  ('MERS Kindia',         'Kindia',  'Centre-ville Kindia','+224 620 000 003', 'Pasteur Pierre Bah');

-- Quelques fidèles d'exemple
WITH b AS (SELECT id FROM branches WHERE nom = 'MERS Conakry Centre' LIMIT 1)
INSERT INTO fideles (branch_id, nom, prenom, genre, departement, baptise, discipolat, telephone)
SELECT b.id, nom, prenom, genre, dept, bap, disc, tel FROM b,
(VALUES
  ('Soumah',   'Marie',   'F', 'mamans',  true,  'complete',     '+224 621 000 001'),
  ('Camara',   'Ibrahima','M', 'papas',   true,  'complete',     '+224 621 000 002'),
  ('Diallo',   'Fatoumata','F','jeunes',  false, 'en_cours',     '+224 621 000 003'),
  ('Bah',      'Amadou',  'M', 'jeunes',  true,  'en_cours',     '+224 621 000 004'),
  ('Kouyaté',  'Aissatou','F', 'mamans',  true,  'complete',     '+224 621 000 005'),
  ('Condé',    'Moussa',  'M', 'papas',   false, 'non_commence', '+224 621 000 006'),
  ('Sylla',    'Kadiatou','F', 'enfants', false, 'non_commence', '+224 621 000 007')
) AS v(nom, prenom, genre, dept, bap, disc, tel);

SELECT 'Schéma MERS Manager créé avec succès ✅' AS status;
