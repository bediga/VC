-- =========================================================
-- STRUCTURE COMPLÈTE DE LA BASE DE DONNÉES VOTE CAMEROON PWA
-- Base de données: Turso Cloud (SQLite)
-- Généré le: 1er septembre 2025
-- =========================================================

-- =========================================================
-- TABLES DE GESTION DES UTILISATEURS
-- =========================================================

-- Table des utilisateurs
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'scrutineer', 'checker', 'observer')),
    polling_station_id TEXT,
    avatarPath TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1,
    region TEXT,
    department TEXT,
    arrondissement TEXT,
    commune TEXT,
    phone_number TEXT,
    must_change_password INTEGER DEFAULT 0,
    last_login_at DATETIME,
    password_changed_at DATETIME
);

-- Table des permissions par rôle
CREATE TABLE role_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    permission TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role, permission)
);

-- Table des associations utilisateur-lieux
CREATE TABLE user_associations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    region_id INTEGER,
    department_id INTEGER,
    commune_id INTEGER,
    polling_station_id TEXT,
    association_type TEXT DEFAULT 'observer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (polling_station_id) REFERENCES polling_stations(id)
);

-- =========================================================
-- TABLES DE HIÉRARCHIE ADMINISTRATIVE
-- =========================================================

-- Table des régions
CREATE TABLE regions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des départements
CREATE TABLE departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    region_id INTEGER NOT NULL,
    code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id)
);

-- Table des arrondissements
CREATE TABLE arrondissements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    department_id INTEGER NOT NULL,
    code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Table des communes
CREATE TABLE communes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    arrondissement_id INTEGER NOT NULL,
    code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (arrondissement_id) REFERENCES arrondissements(id)
);

-- Table générique des divisions administratives
CREATE TABLE administrative_divisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('region', 'department', 'arrondissement', 'commune')),
    parent_id INTEGER,
    level INTEGER NOT NULL,
    code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES administrative_divisions(id)
);

-- =========================================================
-- TABLES D'INFRASTRUCTURE ÉLECTORALE
-- =========================================================

-- Table des centres de vote
CREATE TABLE voting_centers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    commune_id INTEGER NOT NULL,
    latitude REAL,
    longitude REAL,
    capacity INTEGER DEFAULT 0,
    polling_stations_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (commune_id) REFERENCES communes(id)
);

-- Table des bureaux de vote (structure hiérarchique)
CREATE TABLE polling_stations_hierarchy (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    voting_center_id TEXT NOT NULL,
    station_number INTEGER NOT NULL,
    registered_voters INTEGER DEFAULT 0,
    votes_submitted INTEGER DEFAULT 0,
    turnout_rate REAL DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'closed', 'results_submitted')),
    last_update DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voting_center_id) REFERENCES voting_centers(id)
);

-- Table des bureaux de vote (structure simple)
CREATE TABLE polling_stations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    region TEXT,
    department TEXT,
    commune TEXT,
    arrondissement TEXT,
    address TEXT,
    registered_voters INTEGER DEFAULT 0,
    latitude REAL,
    longitude REAL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'closed', 'results_submitted')),
    votes_submitted INTEGER DEFAULT 0,
    turnout_rate REAL DEFAULT 0,
    last_update DATETIME,
    scrutineers_count INTEGER DEFAULT 0,
    observers_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- TABLES DES CANDIDATS ET ÉLECTIONS
-- =========================================================

-- Table des candidats
CREATE TABLE candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    party TEXT NOT NULL,
    photo TEXT,
    program TEXT,
    age INTEGER,
    profession TEXT,
    education TEXT,
    experience TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    is_active INTEGER DEFAULT 1,
    total_votes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des résultats d'élection
CREATE TABLE election_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER NOT NULL,
    polling_station_id TEXT,
    votes INTEGER NOT NULL DEFAULT 0,
    percentage REAL DEFAULT 0,
    total_votes INTEGER NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT FALSE,
    verification_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);

-- =========================================================
-- TABLES DE SOUMISSION DE RÉSULTATS
-- =========================================================

-- Table des soumissions de résultats
CREATE TABLE result_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    polling_station_id TEXT NOT NULL,
    submitted_by TEXT NOT NULL,
    submission_type TEXT DEFAULT 'final' CHECK (submission_type IN ('preliminary', 'final', 'corrected')),
    total_votes INTEGER DEFAULT 0,
    registered_voters INTEGER DEFAULT 0,
    turnout_rate REAL DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'verified', 'rejected')),
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    verified_at DATETIME,
    verified_by TEXT,
    notes TEXT,
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    FOREIGN KEY (polling_station_id) REFERENCES polling_stations(id)
);

-- Table des détails de soumission par candidat
CREATE TABLE result_submission_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER NOT NULL,
    candidate_id INTEGER NOT NULL,
    votes INTEGER NOT NULL DEFAULT 0,
    percentage REAL DEFAULT 0,
    FOREIGN KEY (submission_id) REFERENCES result_submissions(id),
    FOREIGN KEY (candidate_id) REFERENCES candidates(id),
    UNIQUE(submission_id, candidate_id)
);

-- Table des résultats de soumission (alternative)
CREATE TABLE submission_results (
    id TEXT PRIMARY KEY,
    submission_id TEXT NOT NULL,
    candidate_id TEXT NOT NULL,
    votes_received INTEGER NOT NULL,
    notes TEXT,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id),
    FOREIGN KEY (submission_id) REFERENCES result_submissions(id)
);

-- Table des documents de soumission
CREATE TABLE submission_documents (
    id TEXT PRIMARY KEY,
    submission_id TEXT NOT NULL,
    document_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    checksum TEXT,
    FOREIGN KEY (submission_id) REFERENCES result_submissions(id)
);

-- Table générique des résultats
CREATE TABLE results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    polling_station_id TEXT NOT NULL,
    candidate_id INTEGER NOT NULL,
    votes INTEGER NOT NULL DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    submitted_by TEXT,
    verified INTEGER DEFAULT 0,
    verification_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    FOREIGN KEY (candidate_id) REFERENCES candidates(id),
    FOREIGN KEY (polling_station_id) REFERENCES polling_stations(id)
);

-- =========================================================
-- TABLES DE VÉRIFICATION
-- =========================================================

-- Table des tâches de vérification
CREATE TABLE verification_tasks (
    id TEXT PRIMARY KEY,
    submission_id TEXT NOT NULL,
    checker_id TEXT,
    assigned_date DATETIME,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    verification_notes TEXT,
    completion_date DATETIME,
    verification_decision TEXT CHECK (verification_decision IN ('approved', 'rejected', 'needs_review')),
    rejection_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (checker_id) REFERENCES users(id),
    FOREIGN KEY (submission_id) REFERENCES result_submissions(id)
);

-- Table de l'historique de vérification
CREATE TABLE verification_history (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    checker_id TEXT NOT NULL,
    action TEXT NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (checker_id) REFERENCES users(id),
    FOREIGN KEY (task_id) REFERENCES verification_tasks(id)
);

-- =========================================================
-- TABLES DE MONITORING ET STATISTIQUES
-- =========================================================

-- Table du taux de participation horaire
CREATE TABLE hourly_turnout (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    polling_station_id TEXT NOT NULL,
    hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
    voters_count INTEGER NOT NULL DEFAULT 0,
    cumulative_count INTEGER NOT NULL DEFAULT 0,
    turnout_rate REAL DEFAULT 0,
    recorded_by TEXT,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recorded_by) REFERENCES users(id),
    FOREIGN KEY (polling_station_id) REFERENCES polling_stations(id),
    UNIQUE(polling_station_id, hour)
);

-- Table des assignations de bureaux
CREATE TABLE bureau_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    polling_station_id TEXT NOT NULL,
    assigned_by TEXT NOT NULL,
    assignment_type TEXT DEFAULT 'scrutineer' CHECK (assignment_type IN ('scrutineer', 'observer', 'supervisor')),
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (polling_station_id) REFERENCES polling_stations_hierarchy(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    UNIQUE(user_id, polling_station_id)
);

-- =========================================================
-- INDEX POUR OPTIMISATION DES PERFORMANCES
-- =========================================================

-- Index sur les utilisateurs
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_region ON users(region);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_must_change_password ON users(must_change_password);

-- Index sur les soumissions
CREATE INDEX IF NOT EXISTS idx_result_submissions_status ON result_submissions(status);
CREATE INDEX IF NOT EXISTS idx_result_submissions_polling_station ON result_submissions(polling_station_id);
CREATE INDEX IF NOT EXISTS idx_result_submissions_submitted_by ON result_submissions(submitted_by);

-- Index sur les tâches de vérification
CREATE INDEX IF NOT EXISTS idx_verification_tasks_status ON verification_tasks(status);
CREATE INDEX IF NOT EXISTS idx_verification_tasks_checker ON verification_tasks(checker_id);
CREATE INDEX IF NOT EXISTS idx_verification_tasks_submission ON verification_tasks(submission_id);

-- Index sur les résultats
CREATE INDEX IF NOT EXISTS idx_election_results_candidate ON election_results(candidate_id);
CREATE INDEX IF NOT EXISTS idx_election_results_polling_station ON election_results(polling_station_id);

-- Index sur la hiérarchie administrative
CREATE INDEX IF NOT EXISTS idx_departments_region ON departments(region_id);
CREATE INDEX IF NOT EXISTS idx_arrondissements_department ON arrondissements(department_id);
CREATE INDEX IF NOT EXISTS idx_communes_arrondissement ON communes(arrondissement_id);

-- Index sur l'infrastructure électorale
CREATE INDEX IF NOT EXISTS idx_voting_centers_commune ON voting_centers(commune_id);
CREATE INDEX IF NOT EXISTS idx_polling_stations_hierarchy_center ON polling_stations_hierarchy(voting_center_id);

-- =========================================================
-- CONTRAINTES ET TRIGGERS (Optionnels pour SQLite)
-- =========================================================

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
    AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_candidates_timestamp 
    AFTER UPDATE ON candidates
BEGIN
    UPDATE candidates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_polling_stations_timestamp 
    AFTER UPDATE ON polling_stations
BEGIN
    UPDATE polling_stations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =========================================================
-- VUES UTILES POUR LES REQUÊTES FRÉQUENTES
-- =========================================================

-- Vue des résultats complets par bureau
CREATE VIEW IF NOT EXISTS polling_results_summary AS
SELECT 
    ps.id as polling_station_id,
    ps.name as polling_station_name,
    ps.region,
    ps.department,
    ps.commune,
    c.id as candidate_id,
    c.first_name || ' ' || c.last_name as candidate_name,
    c.party,
    COALESCE(er.votes, 0) as votes,
    COALESCE(er.percentage, 0) as percentage,
    er.submitted_at
FROM polling_stations ps
CROSS JOIN candidates c
LEFT JOIN election_results er ON ps.id = er.polling_station_id AND c.id = er.candidate_id
WHERE c.is_active = 1
ORDER BY ps.name, c.last_name;

-- Vue des statistiques par région
CREATE VIEW IF NOT EXISTS regional_statistics AS
SELECT 
    r.name as region_name,
    COUNT(DISTINCT ps.id) as polling_stations_count,
    COUNT(DISTINCT vc.id) as voting_centers_count,
    SUM(ps.registered_voters) as total_registered_voters,
    SUM(ps.votes_submitted) as total_votes_submitted,
    ROUND(AVG(ps.turnout_rate), 2) as average_turnout_rate
FROM regions r
LEFT JOIN departments d ON r.id = d.region_id
LEFT JOIN arrondissements a ON d.id = a.department_id
LEFT JOIN communes co ON a.id = co.arrondissement_id
LEFT JOIN voting_centers vc ON co.id = vc.commune_id
LEFT JOIN polling_stations_hierarchy psh ON vc.id = psh.voting_center_id
LEFT JOIN polling_stations ps ON psh.id = ps.id
GROUP BY r.id, r.name
ORDER BY r.name;

-- =========================================================
-- DONNÉES D'INITIALISATION (Exemples)
-- =========================================================

-- Insertion des rôles et permissions de base
INSERT OR IGNORE INTO role_permissions (role, permission) VALUES
('superadmin', 'all'),
('admin', 'users.manage'),
('admin', 'results.view'),
('admin', 'results.verify'),
('scrutineer', 'results.submit'),
('scrutineer', 'documents.upload'),
('checker', 'results.verify'),
('checker', 'verification.manage'),
('observer', 'results.view'),
('observer', 'reports.view');

-- =========================================================
-- COMMENTAIRES ET DOCUMENTATION
-- =========================================================

/*
STRUCTURE DE LA BASE DE DONNÉES VOTE CAMEROON PWA

Cette base de données est conçue pour gérer un système électoral complet avec :

1. GESTION DES UTILISATEURS
   - Système de rôles et permissions
   - Associations géographiques
   - Authentification et sécurité

2. HIÉRARCHIE ADMINISTRATIVE
   - Structure complète du Cameroun (Régions → Départements → Arrondissements → Communes)
   - Support pour les divisions administratives génériques

3. INFRASTRUCTURE ÉLECTORALE
   - Centres de vote et bureaux de vote
   - Structure hiérarchique et simple selon les besoins
   - Géolocalisation et capacités

4. GESTION DES CANDIDATS
   - Informations complètes des candidats
   - Programmes et données personnelles

5. SOUMISSION ET VÉRIFICATION
   - Soumission de résultats avec documents
   - Workflow de vérification en plusieurs étapes
   - Historique et audit trail

6. MONITORING ET STATISTIQUES
   - Taux de participation en temps réel
   - Assignations et supervision
   - Rapports et analyses

PERFORMANCE ET SCALABILITÉ :
- Index optimisés pour les requêtes fréquentes
- Vues précalculées pour les rapports
- Structure normalisée pour éviter la redondance

SÉCURITÉ :
- Contraintes d'intégrité référentielle
- Validation des statuts et types
- Audit trail complet des actions
*/
