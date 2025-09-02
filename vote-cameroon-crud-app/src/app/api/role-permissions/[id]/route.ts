import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification et les permissions
    const authCheck = await checkAuth('UPDATE')
    if (authCheck.error) {
      return authCheck.error
    }

    const { role, permission } = await request.json()
    const id = params.id

    if (!role || !permission) {
      return NextResponse.json(
        { error: "Le rôle et la permission sont obligatoires" },
        { status: 400 }
      )
    }

    // Vérifier si l'ID existe
    const existingResult = await db.execute(`
      SELECT id FROM role_permissions WHERE id = ?
    `, [id])

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Permission non trouvée" },
        { status: 404 }
      )
    }

    // Vérifier si la nouvelle combinaison rôle/permission existe déjà (sauf pour l'ID actuel)
    const duplicateResult = await db.execute(`
      SELECT id FROM role_permissions 
      WHERE role = ? AND permission = ? AND id != ?
    `, [role, permission, id])

    if (duplicateResult.rows.length > 0) {
      return NextResponse.json(
        { error: "Cette permission existe déjà pour ce rôle" },
        { status: 409 }
      )
    }

    // Mettre à jour la permission
    await db.execute(`
      UPDATE role_permissions 
      SET role = ?, permission = ?
      WHERE id = ?
    `, [role, permission, id])

    return NextResponse.json({ message: "Permission mise à jour avec succès" })
  } catch (error) {
    console.error("Error updating role permission:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la permission" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification et les permissions
    const authCheck = await checkAuth('DELETE')
    if (authCheck.error) {
      return authCheck.error
    }

    const id = params.id

    // Vérifier si l'ID existe
    const existingResult = await db.execute(`
      SELECT id FROM role_permissions WHERE id = ?
    `, [id])

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Permission non trouvée" },
        { status: 404 }
      )
    }

    // Supprimer la permission
    await db.execute(`
      DELETE FROM role_permissions WHERE id = ?
    `, [id])

    return NextResponse.json({ message: "Permission supprimée avec succès" })
  } catch (error) {
    console.error("Error deleting role permission:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la permission" },
      { status: 500 }
    )
  }
}
