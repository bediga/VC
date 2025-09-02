import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/database"

// GET - List all candidates
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await db.execute(`
      SELECT 
        id, name, party, number, color, description, photo_url, 
        votes, percentage, status, region, department, commune, 
        arrondissement, created_at, updated_at
      FROM candidates 
      ORDER BY created_at DESC
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching candidates:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new candidate
export async function POST(request: NextRequest) {
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

    // Insert candidate
    const result = await db.execute({
      sql: `
        INSERT INTO candidates (
          name, party, number, color, description, photo_url, 
          votes, percentage, status, region, department, commune, 
          arrondissement, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      args: [
        data.name,
        data.party,
        data.number || null,
        data.color || '#000000',
        data.description || null,
        data.photo_url || null,
        0, // votes initial
        0, // percentage initial
        data.status || 'active',
        data.region || null,
        data.department || null,
        data.commune || null,
        data.arrondissement || null
      ]
    })

    return NextResponse.json({ 
      message: "Candidate created successfully", 
      id: result.lastInsertRowid 
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating candidate:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
