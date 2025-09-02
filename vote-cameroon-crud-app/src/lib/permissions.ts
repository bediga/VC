// Définition des permissions pour chaque rôle et chaque CRUD
export const PERMISSIONS = {
  // CRUD Utilisateurs
  USERS: {
    CREATE: ['superadmin', 'admin'],
    READ: ['superadmin', 'admin', 'checker'],
    UPDATE: ['superadmin', 'admin'],
    DELETE: ['superadmin'],
    ACTIVATE: ['superadmin', 'admin'],
    DEACTIVATE: ['superadmin', 'admin'],
    RESET_PASSWORD: ['superadmin', 'admin']
  },

  // CRUD Candidats
  CANDIDATES: {
    CREATE: ['superadmin', 'admin'],
    READ: ['superadmin', 'admin', 'scrutineer', 'checker', 'observer'],
    UPDATE: ['superadmin', 'admin'],
    DELETE: ['superadmin', 'admin'],
    ACTIVATE: ['superadmin', 'admin'],
    DEACTIVATE: ['superadmin', 'admin']
  },

  // CRUD Bureaux de vote et centres de vote
  VOTING_CENTERS: {
    CREATE: ['superadmin', 'admin'],
    READ: ['superadmin', 'admin', 'scrutineer', 'checker'],
    UPDATE: ['superadmin', 'admin'],
    DELETE: ['superadmin'],
    MANAGE: ['superadmin']
  },
  
  // CRUD Bureaux de vote
  POLLING_STATIONS: {
    CREATE: ['superadmin', 'admin'],
    READ: ['superadmin', 'admin', 'scrutineer', 'checker', 'observer'],
    UPDATE: ['superadmin', 'admin'],
    DELETE: ['superadmin'],
    ASSIGN_USERS: ['superadmin', 'admin'],
    VIEW_RESULTS: ['superadmin', 'admin', 'checker', 'observer']
  },

  // CRUD Rôles et Permissions
  ROLE_PERMISSIONS: {
    CREATE: ['superadmin'],
    READ: ['superadmin', 'admin'],
    UPDATE: ['superadmin'],
    DELETE: ['superadmin']
  },

  // CRUD Résultats
  RESULTS: {
    CREATE: ['scrutineer'], // Seulement les scrutateurs peuvent soumettre
    READ: ['superadmin', 'admin', 'checker', 'observer'],
    UPDATE: ['superadmin', 'admin'], // Seulement en cas de correction
    DELETE: ['superadmin'], // Très restrictif
    VERIFY: ['checker'], // Seulement les vérificateurs
    SUBMIT: ['scrutineer'],
    APPROVE: ['checker'],
    REJECT: ['checker']
  },

  // CRUD Divisions Administratives
  ADMINISTRATIVE_DIVISIONS: {
    CREATE: ['superadmin', 'admin'],
    READ: ['superadmin', 'admin', 'scrutineer', 'checker', 'observer'],
    UPDATE: ['superadmin', 'admin'],
    DELETE: ['superadmin']
  },

  // CRUD Vérifications
  VERIFICATIONS: {
    CREATE: ['checker'], // Créer des tâches de vérification
    READ: ['superadmin', 'admin', 'checker'],
    UPDATE: ['checker'], // Mettre à jour le statut de vérification
    DELETE: ['superadmin'],
    ASSIGN: ['admin'], // Assigner des tâches aux vérificateurs
    COMPLETE: ['checker']
  },

  // Fonctionnalités Dashboard
  DASHBOARD: {
    VIEW_STATS: ['superadmin', 'admin', 'checker'],
    VIEW_REPORTS: ['superadmin', 'admin', 'checker', 'observer'],
    EXPORT_DATA: ['superadmin', 'admin'],
    VIEW_TURNOUT: ['superadmin', 'admin', 'checker', 'observer']
  },

  // Paramètres système
  SETTINGS: {
    VIEW: ['superadmin', 'admin'],
    UPDATE: ['superadmin'],
    MANAGE_SYSTEM: ['superadmin'],
    CONFIGURE_SECURITY: ['superadmin']
  }
} as const

export type Permission = typeof PERMISSIONS
export type PermissionKey = keyof Permission
export type ActionKey<T extends PermissionKey> = keyof Permission[T]
export type UserRole = 'superadmin' | 'admin' | 'scrutineer' | 'checker' | 'observer'

// Fonction pour vérifier si un rôle a une permission spécifique
export function hasPermission(
  userRole: UserRole,
  resource: PermissionKey,
  action: string
): boolean {
  const resourcePermissions = PERMISSIONS[resource] as Record<string, readonly UserRole[]>
  const allowedRoles = resourcePermissions[action]
  
  if (!allowedRoles) {
    return false
  }
  
  return allowedRoles.includes(userRole)
}

// Fonction pour obtenir toutes les permissions d'un rôle
export function getRolePermissions(userRole: UserRole): Record<string, string[]> {
  const permissions: Record<string, string[]> = {}
  
  Object.entries(PERMISSIONS).forEach(([resource, actions]) => {
    permissions[resource] = []
    Object.entries(actions).forEach(([action, allowedRoles]) => {
      if (allowedRoles.includes(userRole)) {
        permissions[resource].push(action)
      }
    })
  })
  
  return permissions
}

// Descriptions des permissions pour l'interface utilisateur
export const PERMISSION_DESCRIPTIONS = {
  USERS: {
    name: 'Gestion des Utilisateurs',
    description: 'Création, modification et gestion des comptes utilisateurs',
    actions: {
      CREATE: 'Créer de nouveaux utilisateurs',
      READ: 'Consulter la liste des utilisateurs',
      UPDATE: 'Modifier les informations utilisateurs',
      DELETE: 'Supprimer des utilisateurs',
      ACTIVATE: 'Activer des comptes utilisateurs',
      DEACTIVATE: 'Désactiver des comptes utilisateurs',
      RESET_PASSWORD: 'Réinitialiser les mots de passe'
    }
  },
  CANDIDATES: {
    name: 'Gestion des Candidats',
    description: 'Gestion des candidats et de leurs informations',
    actions: {
      CREATE: 'Ajouter de nouveaux candidats',
      READ: 'Consulter la liste des candidats',
      UPDATE: 'Modifier les informations des candidats',
      DELETE: 'Supprimer des candidats',
      ACTIVATE: 'Activer des candidats',
      DEACTIVATE: 'Désactiver des candidats'
    }
  },
  
  VOTING_CENTERS: {
    name: 'Gestion des Centres de Vote',
    description: 'Administration des centres de vote et leur localisation',
    actions: {
      CREATE: 'Créer de nouveaux centres de vote',
      READ: 'Consulter les centres de vote',
      UPDATE: 'Modifier les centres de vote existants',
      DELETE: 'Supprimer des centres de vote',
      MANAGE: 'Gestion complète des centres de vote'
    }
  },
  
  POLLING_STATIONS: {
    name: 'Gestion des Bureaux de Vote',
    description: 'Administration des bureaux de vote et assignations',
    actions: {
      CREATE: 'Créer de nouveaux bureaux de vote',
      READ: 'Consulter les bureaux de vote',
      UPDATE: 'Modifier les informations des bureaux',
      DELETE: 'Supprimer des bureaux de vote',
      ASSIGN_USERS: 'Assigner des utilisateurs aux bureaux',
      VIEW_RESULTS: 'Consulter les résultats des bureaux'
    }
  },
  ROLE_PERMISSIONS: {
    name: 'Gestion des Rôles et Permissions',
    description: 'Configuration des rôles et de leurs permissions',
    actions: {
      CREATE: 'Créer de nouvelles permissions',
      READ: 'Consulter les permissions',
      UPDATE: 'Modifier les permissions',
      DELETE: 'Supprimer des permissions'
    }
  },
  RESULTS: {
    name: 'Gestion des Résultats',
    description: 'Soumission, vérification et validation des résultats',
    actions: {
      CREATE: 'Soumettre de nouveaux résultats',
      READ: 'Consulter les résultats',
      UPDATE: 'Corriger des résultats',
      DELETE: 'Supprimer des résultats',
      VERIFY: 'Vérifier des résultats soumis',
      SUBMIT: 'Soumettre des résultats officiels',
      APPROVE: 'Approuver des résultats',
      REJECT: 'Rejeter des résultats'
    }
  },
  ADMINISTRATIVE_DIVISIONS: {
    name: 'Divisions Administratives',
    description: 'Gestion de la hiérarchie administrative',
    actions: {
      CREATE: 'Créer de nouvelles divisions',
      READ: 'Consulter les divisions',
      UPDATE: 'Modifier les divisions',
      DELETE: 'Supprimer des divisions'
    }
  },
  VERIFICATIONS: {
    name: 'Processus de Vérification',
    description: 'Gestion des tâches de vérification',
    actions: {
      CREATE: 'Créer des tâches de vérification',
      READ: 'Consulter les tâches',
      UPDATE: 'Mettre à jour les vérifications',
      DELETE: 'Supprimer des tâches',
      ASSIGN: 'Assigner des vérificateurs',
      COMPLETE: 'Finaliser des vérifications'
    }
  },
  DASHBOARD: {
    name: 'Tableau de Bord',
    description: 'Accès aux statistiques et rapports',
    actions: {
      VIEW_STATS: 'Consulter les statistiques',
      VIEW_REPORTS: 'Accéder aux rapports',
      EXPORT_DATA: 'Exporter les données',
      VIEW_TURNOUT: 'Consulter le taux de participation'
    }
  },
  SETTINGS: {
    name: 'Paramètres Système',
    description: 'Configuration générale du système',
    actions: {
      VIEW: 'Consulter les paramètres',
      UPDATE: 'Modifier les paramètres',
      MANAGE_SYSTEM: 'Gérer le système',
      CONFIGURE_SECURITY: 'Configurer la sécurité'
    }
  }
}

// Fonction pour obtenir la description d'une permission
export function getPermissionDescription(resource: PermissionKey, action?: string) {
  const resourceDesc = PERMISSION_DESCRIPTIONS[resource]
  if (!resourceDesc) return null
  
  if (!action) return resourceDesc
  
  const actionDesc = resourceDesc.actions[action as keyof typeof resourceDesc.actions]
  return actionDesc || null
}
