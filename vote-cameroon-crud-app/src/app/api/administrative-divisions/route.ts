import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@libsql/client'

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Récupérer les divisions administratives avec leurs relations hiérarchiques
    const [regionsResult, departmentsResult, arrondissementsResult, communesResult] = await Promise.all([
      // Régions
      db.execute(`
        SELECT id, name, code
        FROM regions
        ORDER BY name
      `),
      
      // Départements avec région
      db.execute(`
        SELECT d.id, d.name, d.code, d.region_id, r.name as region_name
        FROM departments d
        LEFT JOIN regions r ON d.region_id = r.id
        ORDER BY r.name, d.name
      `),
      
      // Arrondissements avec département et région
      db.execute(`
        SELECT a.id, a.name, a.code, a.department_id, d.name as department_name, 
               d.region_id, r.name as region_name
        FROM arrondissements a
        LEFT JOIN departments d ON a.department_id = d.id
        LEFT JOIN regions r ON d.region_id = r.id
        ORDER BY r.name, d.name, a.name
      `),
      
      // Communes avec arrondissement, département et région
      db.execute(`
        SELECT c.id, c.name, c.code, c.arrondissement_id, a.name as arrondissement_name,
               a.department_id, d.name as department_name, d.region_id, r.name as region_name
        FROM communes c
        LEFT JOIN arrondissements a ON c.arrondissement_id = a.id
        LEFT JOIN departments d ON a.department_id = d.id
        LEFT JOIN regions r ON d.region_id = r.id
        ORDER BY r.name, d.name, a.name, c.name
      `)
    ])

    return NextResponse.json({
      success: true,
      data: {
        regions: regionsResult.rows,
        departments: departmentsResult.rows,
        arrondissements: arrondissementsResult.rows,
        communes: communesResult.rows
      }
    })

  } catch (error: any) {
    console.error('Error fetching administrative divisions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch administrative divisions', details: error.message },
      { status: 500 }
    )
  }
}
