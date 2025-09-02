import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasPermission, UserRole, PermissionKey } from '@/lib/permissions'

export interface PermissionConfig {
  resource: PermissionKey
  action: string
  requireAuth?: boolean
}

/**
 * Middleware pour vérifier les permissions d'accès aux routes API
 */
export function withPermissions(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: PermissionConfig
) {
  return async (req: NextRequest) => {
    try {
      // Vérifier l'authentification si requise
      if (config.requireAuth !== false) {
        const session = await getServerSession(authOptions)
        
        if (!session || !session.user) {
          return NextResponse.json(
            { error: 'Non autorisé. Connexion requise.' },
            { status: 401 }
          )
        }

        // Vérifier les permissions
        const userRole = session.user.role as UserRole
        const hasAccess = hasPermission(userRole, config.resource, config.action)
        
        if (!hasAccess) {
          return NextResponse.json(
            { 
              error: 'Accès refusé. Permissions insuffisantes.',
              required: {
                resource: config.resource,
                action: config.action,
                userRole: userRole
              }
            },
            { status: 403 }
          )
        }
      }

      // Exécuter le handler si toutes les vérifications passent
      return await handler(req)
    } catch (error) {
      console.error('Erreur dans le middleware de permissions:', error)
      return NextResponse.json(
        { error: 'Erreur interne du serveur' },
        { status: 500 }
      )
    }
  }
}

/**
 * Décorateur pour appliquer facilement les permissions aux routes API
 */
export function requirePermission(config: PermissionConfig) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function (req: NextRequest, ...args: any[]) {
      const protectedHandler = withPermissions(
        async (request) => originalMethod.call(this, request, ...args),
        config
      )
      return await protectedHandler(req)
    }
    
    return descriptor
  }
}

/**
 * Helper pour créer des routes protégées par permissions
 */
export function createProtectedRoute(
  config: PermissionConfig,
  handlers: {
    GET?: (req: NextRequest) => Promise<NextResponse>
    POST?: (req: NextRequest) => Promise<NextResponse>
    PUT?: (req: NextRequest) => Promise<NextResponse>
    DELETE?: (req: NextRequest) => Promise<NextResponse>
    PATCH?: (req: NextRequest) => Promise<NextResponse>
  }
) {
  const protectedHandlers: Record<string, any> = {}
  
  Object.entries(handlers).forEach(([method, handler]) => {
    if (handler) {
      protectedHandlers[method] = withPermissions(handler, {
        ...config,
        action: getActionForMethod(method, config.action)
      })
    }
  })
  
  return protectedHandlers
}

/**
 * Mapper les méthodes HTTP aux actions de permission
 */
function getActionForMethod(method: string, defaultAction: string): string {
  const methodToAction: Record<string, string> = {
    GET: 'READ',
    POST: 'CREATE',
    PUT: 'UPDATE',
    PATCH: 'UPDATE',
    DELETE: 'DELETE'
  }
  
  return methodToAction[method] || defaultAction
}

/**
 * Vérifier les permissions côté client (composants)
 */
export function usePermissionCheck() {
  return {
    hasPermission: (resource: PermissionKey, action: string, userRole?: UserRole) => {
      if (!userRole) return false
      return hasPermission(userRole, resource, action)
    },
    canAccess: (resource: PermissionKey, action: string, userRole?: UserRole) => {
      if (!userRole) return false
      return hasPermission(userRole, resource, action)
    }
  }
}
