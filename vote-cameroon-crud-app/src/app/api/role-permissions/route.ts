import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { RolePermission } from "@/types/database"
import { hasPermission, UserRole } from "@/lib/permissions"

// Fonction helper pour vérifier l'authentification
async function checkAuth(requiredPermission: string) {
  // Pour l'instant, on simule l'authentification
  // TODO: Implémenter la vérification de session réelle
  const userRole: UserRole = 'admin' // À remplacer par la session réelle
  
  if (!hasPermission(userRole, 'ROLE_PERMISSIONS', requiredPermission)) {
    return {
      error: NextResponse.json(
        { error: "Accès refusé. Permissions insuffisantes." },
        { status: 403 }
      )
    }
  }
  
  return { userRole }
}

export async function GET() {
  try {
    // Vérifier l'authentification et les permissions
    const authCheck = await checkAuth('READ')
    if (authCheck.error) {
      return authCheck.error
    }

    const result = await db.execute(`
      SELECT 
        id,
        role,
        permission,
        created_at
      FROM role_permissions 
      ORDER BY role, permission
    `)

    const rolePermissions: RolePermission[] = result.rows.map((row: any) => ({
      id: row.id,
      role: row.role,
      permission: row.permission,
      created_at: row.created_at
    }))

    return NextResponse.json(rolePermissions)
  } catch (error) {
    console.error("Error fetching role permissions:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des permissions" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification et les permissions
    const authCheck = await checkAuth('CREATE')
    if (authCheck.error) {
      return authCheck.error
    }

    const { role, permission } = await request.json()

    if (!role || !permission) {
      return NextResponse.json(
        { error: "Le rôle et la permission sont obligatoires" },
        { status: 400 }
      )
    }

    // Vérifier si la combinaison rôle/permission existe déjà
    const existingResult = await db.execute(`
      SELECT id FROM role_permissions 
      WHERE role = ? AND permission = ?
    `, [role, permission])

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: "Cette permission existe déjà pour ce rôle" },
        { status: 409 }
      )
    }

    // Insérer la nouvelle permission
    const result = await db.execute(`
      INSERT INTO role_permissions (role, permission, created_at)
      VALUES (?, ?, datetime('now'))
    `, [role, permission])

    const newRolePermission: RolePermission = {
      id: Number(result.lastInsertRowid),
      role,
      permission,
      created_at: new Date().toISOString()
    }

    return NextResponse.json(newRolePermission, { status: 201 })
  } catch (error) {
    console.error("Error creating role permission:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création de la permission" },
      { status: 500 }
    )
  }
}
