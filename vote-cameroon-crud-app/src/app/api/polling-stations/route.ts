import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/database"
import { generateId } from "@/lib/utils"

// GET - List all polling stations from polling_stations_hierarchy with geographic info
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use polling_stations_hierarchy with deep JOIN to get full geographic hierarchy
    const result = await db.execute(`
      SELECT 
        psh.id,
        psh.name,
        psh.station_number,
        psh.registered_voters,
        psh.votes_submitted,
        psh.turnout_rate,
        psh.status,
        psh.last_update,
        psh.created_at,
        psh.updated_at,
        vc.name as center_name,
        vc.address,
        vc.latitude,
        vc.longitude,
        c.name as commune,
        a.name as arrondissement,
        d.name as department,
        r.name as region
      FROM polling_stations_hierarchy psh
      LEFT JOIN voting_centers vc ON psh.voting_center_id = vc.id
      LEFT JOIN communes c ON vc.commune_id = c.id
      LEFT JOIN arrondissements a ON c.arrondissement_id = a.id
      LEFT JOIN departments d ON a.department_id = d.id
      LEFT JOIN regions r ON d.region_id = r.id
      ORDER BY psh.created_at DESC
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching polling stations:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new polling station
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Generate station ID
    const stationId = generateId()

    // Insert polling station
    await db.execute({
      sql: `
        INSERT INTO polling_stations (
          id, name, region, department, commune, arrondissement, address,
          registered_voters, latitude, longitude, status, votes_submitted,
          turnout_rate, scrutineers_count, observers_count, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      args: [
        stationId,
        data.name,
        data.region || null,
        data.department || null,
        data.commune || null,
        data.arrondissement || null,
        data.address || null,
        data.registered_voters || 0,
        data.latitude || null,
        data.longitude || null,
        data.status || 'pending',
        0, // votes_submitted
        0, // turnout_rate
        0, // scrutineers_count
        0  // observers_count
      ]
    })

    return NextResponse.json({ 
      message: "Polling station created successfully", 
      id: stationId 
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating polling station:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
