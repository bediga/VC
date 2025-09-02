import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/database"

// GET - Get polling station by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await db.execute({
      sql: `
        SELECT 
          id, name, region, department, commune, arrondissement, address,
          registered_voters, latitude, longitude, status, votes_submitted, 
          turnout_rate, last_update, scrutineers_count, observers_count,
          created_at, updated_at
        FROM polling_stations 
        WHERE id = ?
      `,
      args: [params.id]
    })

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Polling station not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching polling station:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update polling station
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if polling station exists
    const existingStation = await db.execute({
      sql: "SELECT id FROM polling_stations WHERE id = ?",
      args: [params.id]
    })

    if (existingStation.rows.length === 0) {
      return NextResponse.json({ error: "Polling station not found" }, { status: 404 })
    }

    // Update polling station
    await db.execute({
      sql: `
        UPDATE polling_stations SET 
          name = ?, region = ?, department = ?, commune = ?, arrondissement = ?, 
          address = ?, registered_voters = ?, latitude = ?, longitude = ?, 
          status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
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
        params.id
      ]
    })

    return NextResponse.json({ message: "Polling station updated successfully" })
  } catch (error) {
    console.error("Error updating polling station:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete polling station
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if polling station exists
    const existingStation = await db.execute({
      sql: "SELECT id FROM polling_stations WHERE id = ?",
      args: [params.id]
    })

    if (existingStation.rows.length === 0) {
      return NextResponse.json({ error: "Polling station not found" }, { status: 404 })
    }

    // Check if there are any submissions linked to this station
    const submissionsCheck = await db.execute({
      sql: "SELECT id FROM result_submissions WHERE polling_station_id = ? LIMIT 1",
      args: [params.id]
    })

    if (submissionsCheck.rows.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete polling station with existing submissions" },
        { status: 400 }
      )
    }

    // Delete polling station
    await db.execute({
      sql: "DELETE FROM polling_stations WHERE id = ?",
      args: [params.id]
    })

    return NextResponse.json({ message: "Polling station deleted successfully" })
  } catch (error) {
    console.error("Error deleting polling station:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
