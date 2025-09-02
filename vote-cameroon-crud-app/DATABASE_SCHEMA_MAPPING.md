# Database Schema Mapping

## Tables existantes dans la base de données réelle

### 1. USERS ✅
```sql
- id (TEXT) PRIMARY KEY
- first_name (TEXT) NOT NULL
- last_name (TEXT) NOT NULL
- email (TEXT) NOT NULL
- password (TEXT) NOT NULL
- role (TEXT) NOT NULL
- polling_station_id (TEXT)
- avatarPath (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)
- is_active (INTEGER)
- region (TEXT)
- department (TEXT)
- arrondissement (TEXT)
- commune (TEXT)
- phone_number (TEXT)
- must_change_password (INTEGER)
- last_login_at (DATETIME)
- password_changed_at (DATETIME)
```

### 2. CANDIDATES ✅
```sql
- id (INTEGER) PRIMARY KEY
- name (TEXT) NOT NULL
- party (TEXT) NOT NULL
- number (INTEGER) NOT NULL
- color (TEXT)
- description (TEXT)
- photo_url (TEXT)
- votes (INTEGER)
- percentage (REAL)
- status (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)
```

### 3. POLLING_STATIONS ✅
```sql
- id (TEXT) PRIMARY KEY
- name (TEXT) NOT NULL
- region (TEXT)
- department (TEXT)
- commune (TEXT)
- arrondissement (TEXT)
- address (TEXT)
- registered_voters (INTEGER)
- latitude (REAL)
- longitude (REAL)
- status (TEXT)
- votes_submitted (INTEGER)
- turnout_rate (REAL)
- last_update (DATETIME)
- scrutineers_count (INTEGER)
- observers_count (INTEGER)
- created_at (DATETIME)
- updated_at (DATETIME)
```

### 4. REGIONS ✅
```sql
- id (INTEGER) PRIMARY KEY
- name (TEXT) NOT NULL
- code (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)
```

### 5. ELECTIONS ❌ (N'existe pas)
Cette table doit être créée si nécessaire.

## Actions à effectuer

1. ✅ Corriger l'API candidates (fait)
2. 🔄 Mettre à jour l'API polling_stations
3. 🔄 Mettre à jour l'API regions
4. 🔄 Créer les tables manquantes si nécessaire
5. 🔄 Adapter les entités du domaine à la structure réelle
6. 🔄 Mettre à jour les repositories

## Notes importantes
- Les ID sont parfois TEXT, parfois INTEGER selon les tables
- La table candidates utilise un seul champ `name` au lieu de `first_name`/`last_name`
- La structure réelle est plus simple que le schéma complet fourni initialement
