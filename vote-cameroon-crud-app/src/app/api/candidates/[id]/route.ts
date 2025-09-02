import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/database"

// GET - Get candidate by ID
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
          id, name, party, number, color, description, photo_url,
          votes, percentage, status, region, department, commune,
          arrondissement, created_at, updated_at
        FROM candidates 
        WHERE id = ?
      `,
      args: [parseInt(params.id)]
    })

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching candidate:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update candidate
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
    if (!data.name || !data.party) {
      return NextResponse.json(
        { error: "Missing required fields: name and party" },
        { status: 400 }
      )
    }

    // Check if candidate exists
    const existingCandidate = await db.execute({
      sql: "SELECT id FROM candidates WHERE id = ?",
      args: [parseInt(params.id)]
    })

    if (existingCandidate.rows.length === 0) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 })
    }

    // Update candidate
    await db.execute({
      sql: `
        UPDATE candidates SET 
          name = ?, party = ?, number = ?, color = ?, description = ?, 
          photo_url = ?, status = ?, region = ?, department = ?, 
          commune = ?, arrondissement = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        data.name,
        data.party,
        data.number || null,
        data.color || '#000000',
        data.description || null,
        data.photo_url || null,
        data.status || 'active',
        data.region || null,
        data.department || null,
        data.commune || null,
        data.arrondissement || null,
        parseInt(params.id)
      ]
    })

    return NextResponse.json({ message: "Candidate updated successfully" })
  } catch (error) {
    console.error("Error updating candidate:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete candidate
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if candidate exists
    const existingCandidate = await db.execute({
      sql: "SELECT id FROM candidates WHERE id = ?",
      args: [parseInt(params.id)]
    })

    if (existingCandidate.rows.length === 0) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 })
    }

    // Soft delete by setting is_active to 0
    await db.execute({
      sql: "UPDATE candidates SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [parseInt(params.id)]
    })

    return NextResponse.json({ message: "Candidate deleted successfully" })
  } catch (error) {
    console.error("Error deleting candidate:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
