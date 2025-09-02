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

export async function GET() {
  try {
    // Vérifier l'authentification et les permissions
    const authCheck = await checkAuth('READ')
    if (authCheck.error) {
      return authCheck.error
    }

    const result = await db.execute(`
      SELECT 
        vc.id,
        vc.name,
        vc.address,
        vc.commune_id,
        vc.latitude,
        vc.longitude,
        vc.capacity,
        vc.polling_stations_count,
        vc.status,
        vc.created_at,
        vc.updated_at,
        c.name as commune_name,
        d.name as department_name,
        r.name as region_name
      FROM voting_centers vc
      LEFT JOIN communes c ON vc.commune_id = c.id
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN regions r ON d.region_id = r.id
      ORDER BY vc.name
    `)

    const votingCenters = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      address: row.address,
      commune_id: row.commune_id,
      latitude: row.latitude,
      longitude: row.longitude,
      capacity: row.capacity,
      polling_stations_count: row.polling_stations_count,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      commune_name: row.commune_name,
      department_name: row.department_name,
      region_name: row.region_name
    }))

    return NextResponse.json(votingCenters)
  } catch (error) {
    console.error("Error fetching voting centers:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des centres de vote" },
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

    const { 
      id, 
      name, 
      address, 
      commune_id, 
      latitude, 
      longitude, 
      capacity,
      status 
    } = await request.json()

    if (!id || !name || !address || !commune_id) {
      return NextResponse.json(
        { error: "L'ID, le nom, l'adresse et la commune sont obligatoires" },
        { status: 400 }
      )
    }

    // Vérifier si l'ID existe déjà
    const existingResult = await db.execute(`
      SELECT id FROM voting_centers WHERE id = ?
    `, [id])

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: "Cet ID de centre de vote existe déjà" },
        { status: 409 }
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

    // Insérer le nouveau centre de vote
    await db.execute(`
      INSERT INTO voting_centers (
        id, name, address, commune_id, latitude, longitude, capacity, status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [
      id, 
      name, 
      address, 
      commune_id, 
      latitude || null, 
      longitude || null, 
      capacity || 0,
      status || 'active'
    ])

    const newVotingCenter = {
      id,
      name,
      address,
      commune_id,
      latitude,
      longitude,
      capacity: capacity || 0,
      polling_stations_count: 0,
      status: status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return NextResponse.json(newVotingCenter, { status: 201 })
  } catch (error) {
    console.error("Error creating voting center:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du centre de vote" },
      { status: 500 }
    )
  }
}
