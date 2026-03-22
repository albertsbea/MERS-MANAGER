-- ============================================================
-- MERS Manager — Schéma Pasteurs + Données de test enrichies
-- Coller dans Supabase SQL Editor → Run
-- ============================================================

-- ── TABLE PASTEURS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pasteurs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id     UUID REFERENCES branches(id) ON DELETE SET NULL,
  nom           TEXT NOT NULL,
  prenom        TEXT NOT NULL,
  telephone     TEXT,
  email         TEXT,
  ministere     TEXT DEFAULT 'Pasteur' CHECK (
    ministere IN ('Apôtre','Prophète','Évangéliste','Pasteur','Docteur')
  ),
  role_eglise   TEXT DEFAULT 'Pasteur Titulaire' CHECK (
    role_eglise IN ('Pasteur Titulaire','Pasteur Assistant')
  ),
  date_ordination DATE,
  bio           TEXT,
  photo_url     TEXT,
  actif         BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pasteurs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON pasteurs FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_pasteurs_branch ON pasteurs(branch_id);

-- ── NETTOYER LES DONNÉES EXISTANTES (pour repartir propre) ────
DELETE FROM presences;
DELETE FROM collectes;
DELETE FROM depenses;
DELETE FROM cultes;
DELETE FROM fideles;
DELETE FROM branches;

-- ── BRANCHES ─────────────────────────────────────────────────
INSERT INTO branches (id, nom, region, adresse, telephone, pasteur_nom, statut) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'MERS Conakry Centre',  'Conakry',   'Commune de Kaloum, Rue KA-017',         '+224 624 001 001', 'Apôtre Samuel Kourouma',     'active'),
  ('b1000000-0000-0000-0000-000000000002', 'MERS Ratoma',          'Conakry',   'Commune de Ratoma, Quartier Enco5',     '+224 624 001 002', 'Pasteur Jean-Marc Camara',    'active'),
  ('b1000000-0000-0000-0000-000000000003', 'MERS Matoto',          'Conakry',   'Commune de Matoto, Cimenterie',         '+224 624 001 003', 'Pasteur Awa Diallo',          'active'),
  ('b1000000-0000-0000-0000-000000000004', 'MERS Dixinn',          'Conakry',   'Commune de Dixinn, près Université',   '+224 624 001 004', 'Pasteur Ibrahim Soumah',      'active'),
  ('b1000000-0000-0000-0000-000000000005', 'MERS Kindia',          'Kindia',    'Centre-ville Kindia',                   '+224 624 001 005', 'Pasteur Pierre Bah',          'active'),
  ('b1000000-0000-0000-0000-000000000006', 'MERS Coyah',           'Coyah',     'Quartier Central, Coyah',               '+224 624 001 006', 'Pasteur Hawa Keïta',          'active'),
  ('b1000000-0000-0000-0000-000000000007', 'MERS Labé',            'Labé',      'Centre Labé, Route de Pita',            '+224 624 001 007', 'Pasteur Mamadou Diallo',      'active'),
  ('b1000000-0000-0000-0000-000000000008', 'MERS Mamou',           'Mamou',     'Quartier Mosquée, Mamou',               '+224 624 001 008', 'Pasteur Fatoumata Barry',     'active'),
  ('b1000000-0000-0000-0000-000000000009', 'MERS Kankan',          'Kankan',    'Quartier Kabada, Kankan',               '+224 624 001 009', 'Pasteur Oumar Condé',         'active'),
  ('b1000000-0000-0000-0000-000000000010', 'MERS Nzérékoré',       'Nzérékoré', 'Centre Nzérékoré, Rue Principale',    '+224 624 001 010', 'Pasteur Rose Guilavogui',     'active'),
  ('b1000000-0000-0000-0000-000000000011', 'MERS Dubréka',         'Dubréka',   'Quartier Centre, Dubréka',              '+224 624 001 011', 'Pasteur Michel Kouyaté',      'active'),
  ('b1000000-0000-0000-0000-000000000012', 'MERS Guéckédou',       'Guéckédou','Quartier Administratif',                '+224 624 001 012', 'Pasteur Alice Loua',          'active');

-- ── PASTEURS ──────────────────────────────────────────────────
INSERT INTO pasteurs (branch_id, nom, prenom, telephone, email, ministere, role_eglise, date_ordination, bio) VALUES
  ('b1000000-0000-0000-0000-000000000001','Kourouma','Samuel',    '+224 624 100 001','s.kourouma@mers.gn', 'Apôtre',    'Pasteur Titulaire', '2005-03-15', 'Fondateur de la branche Conakry Centre, 20 ans de ministère.'),
  ('b1000000-0000-0000-0000-000000000001','Soumah',  'Agnès',     '+224 624 100 002','a.soumah@mers.gn',   'Pasteur',   'Pasteur Assistant', '2018-06-20', 'Responsable du département Mamans et jeunes mères.'),
  ('b1000000-0000-0000-0000-000000000002','Camara',  'Jean-Marc', '+224 624 100 003','jm.camara@mers.gn',  'Pasteur',   'Pasteur Titulaire', '2012-11-08', 'Pasteur de Ratoma depuis 12 ans, fort en évangélisation.'),
  ('b1000000-0000-0000-0000-000000000003','Diallo',  'Awa',       '+224 624 100 004','a.diallo@mers.gn',   'Évangéliste','Pasteur Titulaire','2015-04-22', 'Pasteure pionnière à Matoto.'),
  ('b1000000-0000-0000-0000-000000000004','Soumah',  'Ibrahim',   '+224 624 100 005','i.soumah@mers.gn',   'Docteur',   'Pasteur Titulaire', '2010-09-14', 'Théologien et enseignant, responsable de Dixinn.'),
  ('b1000000-0000-0000-0000-000000000005','Bah',     'Pierre',    '+224 624 100 006','p.bah@mers.gn',      'Pasteur',   'Pasteur Titulaire', '2013-01-30', 'Pasteur à Kindia, région de la Basse Guinée.'),
  ('b1000000-0000-0000-0000-000000000007','Diallo',  'Mamadou',   '+224 624 100 007','m.diallo@mers.gn',   'Prophète',  'Pasteur Titulaire', '2009-07-11', 'Responsable de toute la zone Moyenne Guinée.'),
  ('b1000000-0000-0000-0000-000000000009','Condé',   'Oumar',     '+224 624 100 008','o.conde@mers.gn',    'Pasteur',   'Pasteur Titulaire', '2016-02-18', 'Pasteur de Kankan, portant la vision en Haute Guinée.'),
  ('b1000000-0000-0000-0000-000000000010','Guilavogui','Rose',    '+224 624 100 009','r.guilavogui@mers.gn','Évangéliste','Pasteur Titulaire','2014-10-05','Pasteure en Guinée Forestière, spécialisée en jeunesse.');

-- ── FIDÈLES (80 membres répartis) ────────────────────────────
DO $$
DECLARE
  noms TEXT[] := ARRAY['Soumah','Camara','Diallo','Bah','Kouyaté','Condé','Barry','Keïta','Touré','Sylla','Guilavogui','Loua','Kourouma','Traoré','Cissé','Bangoura','Sacko','Doumbouya','Fofana','Konaté'];
  prenoms_h TEXT[] := ARRAY['Ibrahim','Mamadou','Oumar','Alpha','Mohamed','Ibrahima','Sekou','Aboubacar','Boubacar','Lansana','Thierno','Fodé','Elhadj','Mamadi','Amadou'];
  prenoms_f TEXT[] := ARRAY['Fatoumata','Aissatou','Mariama','Kadiatou','Hawa','Aminata','Binta','Djenab','Mariam','Rougui','Fanta','Safiatou','Oumou','Adama','Ramatoulaye'];
  depts TEXT[] := ARRAY['papas','mamans','jeunes','enfants'];
  discs TEXT[] := ARRAY['non_commence','en_cours','complete'];
  branches UUID[] := ARRAY[
    'b1000000-0000-0000-0000-000000000001'::UUID,
    'b1000000-0000-0000-0000-000000000002'::UUID,
    'b1000000-0000-0000-0000-000000000003'::UUID,
    'b1000000-0000-0000-0000-000000000004'::UUID,
    'b1000000-0000-0000-0000-000000000005'::UUID,
    'b1000000-0000-0000-0000-000000000007'::UUID,
    'b1000000-0000-0000-0000-000000000009'::UUID,
    'b1000000-0000-0000-0000-000000000010'::UUID
  ];
  i INT;
BEGIN
  FOR i IN 1..80 LOOP
    INSERT INTO fideles (branch_id, nom, prenom, genre, departement, baptise, discipolat, telephone, statut)
    VALUES (
      branches[1 + (i % array_length(branches,1))],
      noms[1 + (random()*array_length(noms,1)-1)::INT % array_length(noms,1)],
      CASE WHEN i % 2 = 0 THEN prenoms_f[1 + (random()*14)::INT % 15] ELSE prenoms_h[1 + (random()*14)::INT % 15] END,
      CASE WHEN i % 2 = 0 THEN 'F' ELSE 'M' END,
      depts[1 + (i % array_length(depts,1))],
      (random() > 0.35),
      discs[1 + (random()*2.99)::INT % 3],
      '+224 6' || (20 + (random()*9)::INT)::TEXT || ' ' || (100 + (random()*899)::INT)::TEXT || ' ' || (100 + (random()*899)::INT)::TEXT,
      'actif'
    );
  END LOOP;
END $$;

-- ── CULTES (24 cultes sur 3 mois) ─────────────────────────────
INSERT INTO cultes (id, branch_id, date_culte, type_culte, predicateur, texte_biblique, theme) VALUES
-- Janvier
('c1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001','2026-01-05','dimanche','Apôtre Samuel Kourouma','Jean 1:1-14','La Parole faite chair'),
('c1000000-0000-0000-0000-000000000002','b1000000-0000-0000-0000-000000000002','2026-01-05','dimanche','Pasteur Jean-Marc Camara','Psaume 23','L''Éternel est mon berger'),
('c1000000-0000-0000-0000-000000000003','b1000000-0000-0000-0000-000000000001','2026-01-12','dimanche','Pasteur Agnès Soumah','Matthieu 5:1-12','Les Béatitudes'),
('c1000000-0000-0000-0000-000000000004','b1000000-0000-0000-0000-000000000003','2026-01-12','dimanche','Pasteure Awa Diallo','Romains 8:28','Tout concourt au bien'),
('c1000000-0000-0000-0000-000000000005','b1000000-0000-0000-0000-000000000001','2026-01-15','semaine','Apôtre Samuel Kourouma','Éphésiens 6:10-18','L''armure de Dieu'),
('c1000000-0000-0000-0000-000000000006','b1000000-0000-0000-0000-000000000002','2026-01-19','dimanche','Pasteur Jean-Marc Camara','Actes 2:1-41','La Pentecôte'),
('c1000000-0000-0000-0000-000000000007','b1000000-0000-0000-0000-000000000001','2026-01-26','dimanche','Dr Ibrahim Soumah','Hébreux 11','La foi des anciens'),
('c1000000-0000-0000-0000-000000000008','b1000000-0000-0000-0000-000000000005','2026-01-26','dimanche','Pasteur Pierre Bah','Esaïe 40:31','Renouveler ses forces'),
('c1000000-0000-0000-0000-000000000009','b1000000-0000-0000-0000-000000000001','2026-01-20','special','Apôtre Samuel Kourouma','Joël 2:28-32','Conférence de début d''année — Vision 2026'),
-- Février
('c1000000-0000-0000-0000-000000000010','b1000000-0000-0000-0000-000000000001','2026-02-02','dimanche','Apôtre Samuel Kourouma','Luc 15:11-32','Le fils prodigue'),
('c1000000-0000-0000-0000-000000000011','b1000000-0000-0000-0000-000000000002','2026-02-02','dimanche','Pasteur Jean-Marc Camara','1 Corinthiens 13','L''hymne à l''amour'),
('c1000000-0000-0000-0000-000000000012','b1000000-0000-0000-0000-000000000003','2026-02-09','dimanche','Pasteure Awa Diallo','Proverbes 31','La femme vertueuse'),
('c1000000-0000-0000-0000-000000000013','b1000000-0000-0000-0000-000000000001','2026-02-09','dimanche','Pasteur Agnès Soumah','Galates 5:22-23','Le fruit de l''Esprit'),
('c1000000-0000-0000-0000-000000000014','b1000000-0000-0000-0000-000000000004','2026-02-16','dimanche','Dr Ibrahim Soumah','Daniel 3','Les trois hébreux dans la fournaise'),
('c1000000-0000-0000-0000-000000000015','b1000000-0000-0000-0000-000000000001','2026-02-16','dimanche','Apôtre Samuel Kourouma','Apocalypse 3:20','Voici je me tiens à la porte'),
('c1000000-0000-0000-0000-000000000016','b1000000-0000-0000-0000-000000000007','2026-02-16','dimanche','Prophète Mamadou Diallo','Jérémie 29:11','Les plans de l''Éternel'),
('c1000000-0000-0000-0000-000000000017','b1000000-0000-0000-0000-000000000001','2026-02-19','semaine','Pasteur Agnès Soumah','Jacques 5:16','La prière du juste'),
('c1000000-0000-0000-0000-000000000018','b1000000-0000-0000-0000-000000000002','2026-02-23','dimanche','Pasteur Jean-Marc Camara','Jean 3:16','Dieu a tant aimé le monde'),
-- Mars
('c1000000-0000-0000-0000-000000000019','b1000000-0000-0000-0000-000000000001','2026-03-02','dimanche','Apôtre Samuel Kourouma','Philippiens 4:13','Je puis tout par Christ'),
('c1000000-0000-0000-0000-000000000020','b1000000-0000-0000-0000-000000000003','2026-03-02','dimanche','Pasteure Awa Diallo','Exode 14:13-14','L''Éternel combattra pour vous'),
('c1000000-0000-0000-0000-000000000021','b1000000-0000-0000-0000-000000000002','2026-03-08','semaine','Pasteur Jean-Marc Camara','Michée 6:8','Marcher humblement avec ton Dieu'),
('c1000000-0000-0000-0000-000000000022','b1000000-0000-0000-0000-000000000001','2026-03-09','dimanche','Dr Ibrahim Soumah','2 Timothée 3:16-17','Toute Écriture est inspirée'),
('c1000000-0000-0000-0000-000000000023','b1000000-0000-0000-0000-000000000001','2026-03-15','dimanche','Apôtre Samuel Kourouma','Actes 1:8','Vous recevrez une puissance'),
('c1000000-0000-0000-0000-000000000024','b1000000-0000-0000-0000-000000000005','2026-03-15','dimanche','Pasteur Pierre Bah','Nombres 23:19','Dieu n''est pas un homme');

-- ── PRÉSENCES ────────────────────────────────────────────────
INSERT INTO presences (culte_id, papas, mamans, jeunes, enfants, visiteurs) VALUES
('c1000000-0000-0000-0000-000000000001', 42, 58, 35, 18, 12),
('c1000000-0000-0000-0000-000000000002', 28, 34, 22, 14, 8),
('c1000000-0000-0000-0000-000000000003', 38, 52, 30, 15, 9),
('c1000000-0000-0000-0000-000000000004', 25, 38, 28, 12, 6),
('c1000000-0000-0000-0000-000000000005', 35, 44, 25, 0,  5),
('c1000000-0000-0000-0000-000000000006', 32, 41, 27, 16, 10),
('c1000000-0000-0000-0000-000000000007', 45, 61, 38, 20, 14),
('c1000000-0000-0000-0000-000000000008', 18, 24, 15, 10, 5),
('c1000000-0000-0000-0000-000000000009', 85, 112, 78, 42, 55),
('c1000000-0000-0000-0000-000000000010', 40, 55, 32, 17, 11),
('c1000000-0000-0000-0000-000000000011', 30, 42, 24, 14, 7),
('c1000000-0000-0000-0000-000000000012', 22, 35, 20, 11, 5),
('c1000000-0000-0000-0000-000000000013', 36, 48, 28, 16, 8),
('c1000000-0000-0000-0000-000000000014', 28, 40, 35, 12, 6),
('c1000000-0000-0000-0000-000000000015', 44, 58, 36, 19, 13),
('c1000000-0000-0000-0000-000000000016', 20, 28, 18, 8,  4),
('c1000000-0000-0000-0000-000000000017', 30, 40, 22, 0,  6),
('c1000000-0000-0000-0000-000000000018', 35, 46, 29, 15, 9),
('c1000000-0000-0000-0000-000000000019', 46, 62, 40, 21, 15),
('c1000000-0000-0000-0000-000000000020', 24, 36, 22, 13, 7),
('c1000000-0000-0000-0000-000000000021', 28, 38, 20, 0,  5),
('c1000000-0000-0000-0000-000000000022', 42, 56, 33, 18, 10),
('c1000000-0000-0000-0000-000000000023', 48, 65, 42, 22, 17),
('c1000000-0000-0000-0000-000000000024', 20, 30, 18, 10, 6);

-- ── COLLECTES (financier complet) ────────────────────────────
INSERT INTO collectes (culte_id, branch_id, dimes, offrandes_ordinaires, offrande_speciale, autres_dons, mode_reception) VALUES
('c1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001', 450000, 380000, 0,      50000,  'especes'),
('c1000000-0000-0000-0000-000000000002','b1000000-0000-0000-0000-000000000002', 180000, 150000, 0,      20000,  'especes'),
('c1000000-0000-0000-0000-000000000003','b1000000-0000-0000-0000-000000000001', 420000, 360000, 100000, 40000,  'especes'),
('c1000000-0000-0000-0000-000000000004','b1000000-0000-0000-0000-000000000003', 160000, 140000, 0,      15000,  'especes'),
('c1000000-0000-0000-0000-000000000005','b1000000-0000-0000-0000-000000000001', 200000, 180000, 0,      0,      'especes'),
('c1000000-0000-0000-0000-000000000006','b1000000-0000-0000-0000-000000000002', 200000, 170000, 50000,  25000,  'orange_money'),
('c1000000-0000-0000-0000-000000000007','b1000000-0000-0000-0000-000000000001', 480000, 420000, 200000, 80000,  'especes'),
('c1000000-0000-0000-0000-000000000008','b1000000-0000-0000-0000-000000000005', 90000,  80000,  0,      10000,  'especes'),
('c1000000-0000-0000-0000-000000000009','b1000000-0000-0000-0000-000000000001', 800000, 650000, 500000, 200000, 'especes'),
('c1000000-0000-0000-0000-000000000010','b1000000-0000-0000-0000-000000000001', 440000, 370000, 0,      45000,  'especes'),
('c1000000-0000-0000-0000-000000000011','b1000000-0000-0000-0000-000000000002', 190000, 160000, 80000,  22000,  'mtn_momo'),
('c1000000-0000-0000-0000-000000000012','b1000000-0000-0000-0000-000000000003', 170000, 145000, 0,      18000,  'especes'),
('c1000000-0000-0000-0000-000000000013','b1000000-0000-0000-0000-000000000001', 460000, 390000, 120000, 55000,  'especes'),
('c1000000-0000-0000-0000-000000000014','b1000000-0000-0000-0000-000000000004', 200000, 170000, 60000,  20000,  'especes'),
('c1000000-0000-0000-0000-000000000015','b1000000-0000-0000-0000-000000000001', 500000, 420000, 0,      60000,  'especes'),
('c1000000-0000-0000-0000-000000000016','b1000000-0000-0000-0000-000000000007', 120000, 100000, 40000,  15000,  'especes'),
('c1000000-0000-0000-0000-000000000017','b1000000-0000-0000-0000-000000000001', 230000, 200000, 0,      0,      'especes'),
('c1000000-0000-0000-0000-000000000018','b1000000-0000-0000-0000-000000000002', 220000, 185000, 70000,  28000,  'orange_money'),
('c1000000-0000-0000-0000-000000000019','b1000000-0000-0000-0000-000000000001', 510000, 440000, 150000, 70000,  'especes'),
('c1000000-0000-0000-0000-000000000020','b1000000-0000-0000-0000-000000000003', 175000, 148000, 0,      20000,  'especes'),
('c1000000-0000-0000-0000-000000000021','b1000000-0000-0000-0000-000000000002', 240000, 210000, 0,      0,      'especes'),
('c1000000-0000-0000-0000-000000000022','b1000000-0000-0000-0000-000000000001', 470000, 400000, 200000, 65000,  'especes'),
('c1000000-0000-0000-0000-000000000023','b1000000-0000-0000-0000-000000000001', 530000, 460000, 250000, 90000,  'especes'),
('c1000000-0000-0000-0000-000000000024','b1000000-0000-0000-0000-000000000005', 100000, 85000,  30000,  12000,  'especes');

-- ── DÉPENSES (sorties d'argent variées) ───────────────────────
INSERT INTO depenses (branch_id, date_dep, description, montant, categorie) VALUES
-- Conakry Centre
('b1000000-0000-0000-0000-000000000001','2026-01-08', 'Achat de Bibles pour nouveaux membres',       350000, 'pastoral'),
('b1000000-0000-0000-0000-000000000001','2026-01-10', 'Électricité janvier',                         180000, 'fonctionnement'),
('b1000000-0000-0000-0000-000000000001','2026-01-15', 'Prime mensuelle pasteur titulaire',           500000, 'prime_pasteur'),
('b1000000-0000-0000-0000-000000000001','2026-01-15', 'Prime mensuelle pasteur assistant',           250000, 'prime_pasteur'),
('b1000000-0000-0000-0000-000000000001','2026-01-20', 'Achat chaises salle culte',                   800000, 'investissement'),
('b1000000-0000-0000-0000-000000000001','2026-01-25', 'Eau et nettoyage',                             60000, 'fonctionnement'),
('b1000000-0000-0000-0000-000000000001','2026-02-05', 'Transport pour conférence régionale',         120000, 'pastoral'),
('b1000000-0000-0000-0000-000000000001','2026-02-10', 'Électricité février',                         175000, 'fonctionnement'),
('b1000000-0000-0000-0000-000000000001','2026-02-15', 'Prime mensuelle pasteur titulaire',           500000, 'prime_pasteur'),
('b1000000-0000-0000-0000-000000000001','2026-02-15', 'Prime mensuelle pasteur assistant',           250000, 'prime_pasteur'),
('b1000000-0000-0000-0000-000000000001','2026-02-18', 'Matériel de sonorisation (micro)',            450000, 'investissement'),
('b1000000-0000-0000-0000-000000000001','2026-02-28', 'Eau et nettoyage',                             60000, 'fonctionnement'),
('b1000000-0000-0000-0000-000000000001','2026-03-05', 'Impression fascicules convention',             95000, 'pastoral'),
('b1000000-0000-0000-0000-000000000001','2026-03-10', 'Électricité mars',                            180000, 'fonctionnement'),
('b1000000-0000-0000-0000-000000000001','2026-03-15', 'Prime mensuelle pasteur titulaire',           500000, 'prime_pasteur'),
('b1000000-0000-0000-0000-000000000001','2026-03-15', 'Prime mensuelle pasteur assistant',           250000, 'prime_pasteur'),
('b1000000-0000-0000-0000-000000000001','2026-03-20', 'Aide famille dans le besoin',                 200000, 'pastoral'),
-- Ratoma
('b1000000-0000-0000-0000-000000000002','2026-01-10', 'Loyer salle janvier',                         300000, 'fonctionnement'),
('b1000000-0000-0000-0000-000000000002','2026-01-15', 'Prime pasteur Ratoma',                        400000, 'prime_pasteur'),
('b1000000-0000-0000-0000-000000000002','2026-02-10', 'Loyer salle février',                         300000, 'fonctionnement'),
('b1000000-0000-0000-0000-000000000002','2026-02-15', 'Prime pasteur Ratoma',                        400000, 'prime_pasteur'),
('b1000000-0000-0000-0000-000000000002','2026-03-10', 'Loyer salle mars',                            300000, 'fonctionnement'),
('b1000000-0000-0000-0000-000000000002','2026-03-15', 'Prime pasteur Ratoma',                        400000, 'prime_pasteur'),
('b1000000-0000-0000-0000-000000000002','2026-03-18', 'Matériel évangélisation quartier',             80000, 'pastoral'),
-- Matoto
('b1000000-0000-0000-0000-000000000003','2026-01-15', 'Prime pasteure Matoto',                       380000, 'prime_pasteur'),
('b1000000-0000-0000-0000-000000000003','2026-02-15', 'Prime pasteure Matoto',                       380000, 'prime_pasteur'),
('b1000000-0000-0000-0000-000000000003','2026-03-15', 'Prime pasteure Matoto',                       380000, 'prime_pasteur'),
-- Kindia
('b1000000-0000-0000-0000-000000000005','2026-01-15', 'Prime pasteur Kindia',                        350000, 'prime_pasteur'),
('b1000000-0000-0000-0000-000000000005','2026-02-15', 'Prime pasteur Kindia',                        350000, 'prime_pasteur'),
('b1000000-0000-0000-0000-000000000005','2026-03-12', 'Achat nécessaire culte spécial',               75000, 'fonctionnement'),
('b1000000-0000-0000-0000-000000000005','2026-03-15', 'Prime pasteur Kindia',                        350000, 'prime_pasteur'),
-- Labé
('b1000000-0000-0000-0000-000000000007','2026-01-15', 'Prime pasteur Labé',                          400000, 'prime_pasteur'),
('b1000000-0000-0000-0000-000000000007','2026-02-15', 'Prime pasteur Labé',                          400000, 'prime_pasteur'),
('b1000000-0000-0000-0000-000000000007','2026-03-15', 'Prime pasteur Labé',                          400000, 'prime_pasteur');

SELECT
  (SELECT COUNT(*) FROM branches)  AS branches,
  (SELECT COUNT(*) FROM pasteurs)  AS pasteurs,
  (SELECT COUNT(*) FROM fideles)   AS fideles,
  (SELECT COUNT(*) FROM cultes)    AS cultes,
  (SELECT COUNT(*) FROM presences) AS presences,
  (SELECT COUNT(*) FROM collectes) AS collectes,
  (SELECT COUNT(*) FROM depenses)  AS depenses;
