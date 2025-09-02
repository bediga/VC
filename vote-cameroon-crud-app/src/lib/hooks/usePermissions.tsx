"use client"

import { useSession } from 'next-auth/react'
import { hasPermission, UserRole, PermissionKey } from '@/lib/permissions'

/**
 * Hook pour vérifier les permissions côté client
 */
export function usePermissions() {
  const { data: session } = useSession()
  
  const checkPermission = (resource: PermissionKey, action: string): boolean => {
    if (!session?.user?.role) {
      return false
    }
    
    return hasPermission(session.user.role as UserRole, resource, action)
  }
  
  const canCreate = (resource: PermissionKey): boolean => {
    return checkPermission(resource, 'CREATE')
  }
  
  const canRead = (resource: PermissionKey): boolean => {
    return checkPermission(resource, 'READ')
  }
  
  const canUpdate = (resource: PermissionKey): boolean => {
    return checkPermission(resource, 'UPDATE')
  }
  
  const canDelete = (resource: PermissionKey): boolean => {
    return checkPermission(resource, 'DELETE')
  }
  
  const canManage = (resource: PermissionKey): boolean => {
    return checkPermission(resource, 'MANAGE')
  }
  
  return {
    checkPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canManage,
    userRole: session?.user?.role as UserRole,
    isAuthenticated: !!session?.user
  }
}

/**
 * Composant wrapper pour conditionner l'affichage selon les permissions
 */
interface PermissionGateProps {
  resource: PermissionKey
  action: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGate({ 
  resource, 
  action, 
  children, 
  fallback = null 
}: PermissionGateProps) {
  const { checkPermission } = usePermissions()
  
  if (!checkPermission(resource, action)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}
