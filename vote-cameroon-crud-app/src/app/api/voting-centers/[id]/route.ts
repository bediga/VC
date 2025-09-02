import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { hasPermission, UserRole } from "@/lib/permissions"

// Fonction helper pour vérifier l'authentification
async function checkAuth(requiredPermission: string) {
  // Pour l'instant, on simule l'authentification
  // TODO: Implémenter la vérification de session réelle
  const userRole: UserRole = 'admin' // À remplacer par la session réelle
  
  if (!hasPermission(userRole, 'VOTING_CENTERS', requiredPermission)) {
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

    const { 
      name, 
      address, 
      commune_id, 
      latitude, 
      longitude, 
      capacity,
      status 
    } = await request.json()
    const id = params.id

    if (!name || !address || !commune_id) {
      return NextResponse.json(
        { error: "Le nom, l'adresse et la commune sont obligatoires" },
        { status: 400 }
      )
    }

    // Vérifier si l'ID existe
    const existingResult = await db.execute(`
      SELECT id FROM voting_centers WHERE id = ?
    `, [id])

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Centre de vote non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier si la commune existe
    const communeResult = await db.execute(`
      SELECT id FROM communes WHERE id = ?
    `, [commune_id])

    if (communeResult.rows.length === 0) {
      return NextResponse.json(
        { error: "La commune spécifiée n'existe pas" },
        { status: 400 }
      )
    }

    // Mettre à jour le centre de vote
    await db.execute(`
      UPDATE voting_centers 
      SET name = ?, 
          address = ?, 
          commune_id = ?, 
          latitude = ?, 
          longitude = ?, 
          capacity = ?,
          status = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `, [
      name, 
      address, 
      commune_id, 
      latitude || null, 
      longitude || null, 
      capacity || 0,
      status || 'active',
      id
    ])

    return NextResponse.json({ message: "Centre de vote mis à jour avec succès" })
  } catch (error) {
    console.error("Error updating voting center:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du centre de vote" },
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
      SELECT id FROM voting_centers WHERE id = ?
    `, [id])

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Centre de vote non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier s'il y a des bureaux de vote associés
    const pollingStationsResult = await db.execute(`
      SELECT COUNT(*) as count FROM polling_stations_hierarchy WHERE voting_center_id = ?
    `, [id])

    const pollingStationsCount = pollingStationsResult.rows[0]?.count || 0

    if (pollingStationsCount > 0) {
      return NextResponse.json(
        { 
          error: `Impossible de supprimer ce centre de vote. Il contient ${pollingStationsCount} bureau(x) de vote. Supprimez d'abord les bureaux de vote associés.` 
        },
        { status: 409 }
      )
    }

    // Supprimer le centre de vote
    await db.execute(`
      DELETE FROM voting_centers WHERE id = ?
    `, [id])

    return NextResponse.json({ message: "Centre de vote supprimé avec succès" })
  } catch (error) {
    console.error("Error deleting voting center:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du centre de vote" },
      { status: 500 }
    )
  }
}
