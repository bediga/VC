# Système de Gestion des Permissions - Vote Cameroon

## Vue d'ensemble

Ce document décrit le système complet de gestion des permissions basé sur les rôles (RBAC) implémenté pour l'application Vote Cameroon.

## Architecture du Système

### 1. Rôles Utilisateurs

Le système définit 5 rôles principaux avec des niveaux d'accès hiérarchiques :

1. **superadmin** - Accès complet à toutes les fonctionnalités
2. **admin** - Gestion des utilisateurs, candidats, et données de base
3. **scrutineer** - Soumission et gestion des résultats
4. **checker** - Vérification et validation des données
5. **observer** - Accès en lecture seule

### 2. Ressources Protégées

Le système protège 9 domaines fonctionnels principaux :

- **USERS** - Gestion des utilisateurs
- **CANDIDATES** - Gestion des candidats
- **POLLING_STATIONS** - Gestion des bureaux de vote
- **ROLE_PERMISSIONS** - Gestion des permissions
- **RESULTS** - Gestion des résultats électoraux
- **ADMINISTRATIVE_DIVISIONS** - Divisions administratives
- **VERIFICATIONS** - Processus de vérification
- **DASHBOARD** - Tableaux de bord
- **SETTINGS** - Paramètres système

### 3. Actions Disponibles

Chaque ressource peut avoir les actions suivantes :
- **CREATE** - Créer de nouveaux éléments
- **READ** - Consulter les données
- **UPDATE** - Modifier les données existantes
- **DELETE** - Supprimer des éléments
- **MANAGE** - Gestion complète (CREATE + READ + UPDATE + DELETE)
- **VALIDATE** - Valider des données (spécifique aux résultats)
- **SUBMIT** - Soumettre des données
- **VERIFY** - Vérifier des données

## Structure des Fichiers

### Backend (API Routes)

```
src/
├── lib/
│   ├── permissions.ts                    # Définition des permissions
│   ├── middleware/
│   │   └── permissions.ts               # Middleware de vérification
│   └── hooks/
│       └── usePermissions.tsx           # Hook React pour permissions
├── app/
│   └── api/
│       └── role-permissions/
│           ├── route.ts                 # CRUD principal
│           └── [id]/
│               └── route.ts             # Édition/suppression
```

### Frontend (Composants)

```
src/
├── app/
│   └── dashboard/
│       ├── role-permissions/
│       │   └── page.tsx                 # Interface de gestion
│       └── permissions-test/
│           └── page.tsx                 # Page de test
└── components/
    └── layout/
        └── Sidebar.tsx                  # Navigation avec permissions
```

## Configuration des Permissions

### Matrice des Permissions

```typescript
// Exemple pour les utilisateurs
USERS: {
  CREATE: ['superadmin', 'admin'],
  READ: ['superadmin', 'admin', 'checker'],
  UPDATE: ['superadmin', 'admin'],
  DELETE: ['superadmin'],
  MANAGE: ['superadmin']
}
```

### Base de Données

Table `role_permissions` :
```sql
CREATE TABLE role_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL,
  permission TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Utilisation

### 1. Vérification des Permissions dans les Composants

```tsx
import { usePermissions, PermissionGate } from '@/lib/hooks/usePermissions'

function MyComponent() {
  const { canCreate, canUpdate } = usePermissions()
  
  return (
    <div>
      {/* Affichage conditionnel simple */}
      {canCreate('USERS') && (
        <button>Créer un utilisateur</button>
      )}
      
      {/* Composant wrapper */}
      <PermissionGate resource="USERS" action="UPDATE">
        <button>Modifier l'utilisateur</button>
      </PermissionGate>
    </div>
  )
}
```

### 2. Protection des Routes API

```typescript
// Dans vos routes API
import { hasPermission, UserRole } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  // Vérification d'authentification
  const userRole: UserRole = getUserRole() // Votre logique d'auth
  
  if (!hasPermission(userRole, 'USERS', 'CREATE')) {
    return NextResponse.json(
      { error: "Accès refusé" },
      { status: 403 }
    )
  }
  
  // Logique de création...
}
```

### 3. Navigation Conditionnelle

```tsx
// Dans Sidebar.tsx
const navigationItems = [
  { 
    name: "Rôles & Permissions", 
    href: "/dashboard/role-permissions", 
    icon: Shield,
    requiredPermission: { resource: 'ROLE_PERMISSIONS', action: 'READ' }
  }
]
```

## Fonctionnalités Implémentées

### ✅ Complétées

1. **Système de Permissions** - Matrice complète définie
2. **CRUD Role-Permissions** - Interface de gestion complète
3. **Hook usePermissions** - Vérification côté client
4. **Composant PermissionGate** - Affichage conditionnel
5. **Page de Test** - Interface de test et simulation
6. **Protection API** - Vérification des permissions

### 🔄 En Cours / À Finaliser

1. **Intégration NextAuth** - Connexion avec le système d'auth existant
2. **Middleware Global** - Application automatique sur toutes les routes
3. **Interface Admin** - Gestion visuelle des permissions par rôle
4. **Audit Logs** - Traçabilité des actions

## Pages Disponibles

1. **Dashboard Principal** - `http://localhost:3004/dashboard`
2. **Gestion Permissions** - `http://localhost:3004/dashboard/role-permissions`
3. **Centres de Vote** - `http://localhost:3004/dashboard/voting-centers`
4. **Paramètres** - `http://localhost:3004/dashboard/settings`

## Configuration de Développement

### Variables d'Environnement

```env
# Base de données
DATABASE_URL=your_turso_database_url
DATABASE_AUTH_TOKEN=your_turso_auth_token

# Authentification
NEXTAUTH_URL=http://localhost:3004
NEXTAUTH_SECRET=your_secret_key
```

### Commandes Utiles

```bash
# Démarrer le serveur de développement
npm run dev

# Construire l'application
npm run build

# Lancer les tests
npm test
```

## Sécurité

### Bonnes Pratiques Implémentées

1. **Principe du moindre privilège** - Chaque rôle a accès uniquement aux ressources nécessaires
2. **Validation côté serveur** - Toutes les API vérifient les permissions
3. **Interface utilisateur adaptative** - Les éléments non autorisés sont masqués
4. **Audit trail** - Actions traçables (à compléter)

### Recommandations

1. **Révision régulière** - Examiner les permissions trimestriellement
2. **Formation utilisateurs** - Sensibiliser aux rôles et responsabilités
3. **Monitoring** - Surveiller les tentatives d'accès non autorisé
4. **Sauvegarde** - Sauvegarder régulièrement la configuration des permissions

## Support et Maintenance

### Logs et Debug

```typescript
// Activer les logs de permissions
console.log('Permission check:', hasPermission(userRole, resource, action))
```

### Tests

Le système de permissions peut être testé via :
- La page de gestion des permissions `/dashboard/role-permissions`
- Les composants conditionnels dans l'interface
- Les hooks `usePermissions` et `PermissionGate`

---

*Dernière mise à jour : Janvier 2025*
*Version : 1.0.0*
