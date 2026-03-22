-- ============================================================
-- MERS MANAGER — Ajout des modules Communication, Ressources,
-- Utilisateurs — coller dans SQL Editor Supabase
-- ============================================================

-- ── ANNONCES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS annonces (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre       TEXT NOT NULL,
  contenu     TEXT NOT NULL,
  type        TEXT DEFAULT 'info' CHECK (type IN ('info','urgent','evenement','priere')),
  cible       TEXT DEFAULT 'toutes' CHECK (cible IN ('toutes','basse_guinee','moyenne_guinee','haute_guinee','forestiere')),
  branch_id   UUID REFERENCES branches(id) ON DELETE SET NULL,
  auteur      TEXT NOT NULL DEFAULT 'Administration',
  publiee     BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── RESSOURCES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ressources (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre       TEXT NOT NULL,
  description TEXT,
  type        TEXT DEFAULT 'document' CHECK (type IN ('predication','document','formulaire','media')),
  url         TEXT,
  taille      TEXT,
  auteur      TEXT,
  branch_id   UUID REFERENCES branches(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── UTILISATEURS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS utilisateurs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom         TEXT NOT NULL,
  prenom      TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'secretaire' CHECK (
    role IN ('administrateur','directeur','pasteur_titulaire','pasteur_assistant','secretaire','tresorier')
  ),
  branch_id   UUID REFERENCES branches(id) ON DELETE SET NULL,
  actif       BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Policies
CREATE POLICY "allow_all" ON annonces     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON ressources   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON utilisateurs FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE annonces     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ressources   ENABLE ROW LEVEL SECURITY;
ALTER TABLE utilisateurs ENABLE ROW LEVEL SECURITY;

-- Données de démonstration
INSERT INTO annonces (titre, contenu, type, cible, auteur) VALUES
  ('Convention Nationale MERS 2026',
   'La Convention Nationale de la MERS aura lieu du 15 au 17 mai 2026 à Conakry. Toutes les branches sont invitées à participer. Inscription obligatoire avant le 30 avril.',
   'evenement', 'toutes', 'Direction Nationale'),
  ('Journée de prière et jeûne',
   'La direction appelle toutes les branches à une journée de prière et de jeûne le premier vendredi de chaque mois. Que chaque pasteur organise cette activité dans sa congrégation.',
   'priere', 'toutes', 'Direction Nationale'),
  ('Remise des rapports trimestriels',
   'Rappel urgent : tous les trésoriers doivent soumettre leur rapport financier du 1er trimestre avant le 15 avril 2026.',
   'urgent', 'toutes', 'Direction Financière');

INSERT INTO ressources (titre, description, type, auteur) VALUES
  ('Formulaire d''inscription membre', 'Fiche officielle d''inscription d''un nouveau fidèle', 'formulaire', 'Équipe Média MERS'),
  ('Prédication — Marche dans la foi', 'Message du Pasteur Jean Camara — Convention 2025', 'predication', 'Pasteur Jean Camara'),
  ('Guide du discipolat MERS', 'Manuel officiel de formation au discipolat', 'document', 'Direction Nationale'),
  ('Rapport annuel 2025', 'Bilan complet de l''année 2025', 'document', 'Direction Nationale');

INSERT INTO utilisateurs (nom, prenom, email, role) VALUES
  ('Béavogui', 'Albert Siba', 'albert@mers.gn', 'administrateur'),
  ('Camara',   'Jean',        'j.camara@mers.gn', 'pasteur_titulaire'),
  ('Diallo',   'Marie',       'm.diallo@mers.gn', 'tresorier'),
  ('Bah',      'Ibrahima',    'i.bah@mers.gn', 'secretaire');

SELECT 'Modules Communication, Ressources, Utilisateurs créés ✅' AS status;
