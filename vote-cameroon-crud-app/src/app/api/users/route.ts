import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/database"
import bcrypt from "bcryptjs"
import { generateId } from "@/lib/utils"

// GET - List all users
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await db.execute(`
      SELECT 
        id, first_name, last_name, email, role, polling_station_id, 
        avatarPath, created_at, updated_at, is_active, region, 
        department, arrondissement, commune, phone_number, 
        must_change_password, last_login_at, password_changed_at
      FROM users 
      ORDER BY created_at DESC
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    // Validate required fields
    if (!data.first_name || !data.last_name || !data.email || !data.password || !data.role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [data.email]
    })

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)
    
    // Generate user ID
    const userId = generateId()

    // Insert user
    await db.execute({
      sql: `
        INSERT INTO users (
          id, first_name, last_name, email, password, role,
          region, department, arrondissement, commune, phone_number,
          is_active, must_change_password, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      args: [
        userId,
        data.first_name,
        data.last_name,
        data.email,
        hashedPassword,
        data.role,
        data.region || null,
        data.department || null,
        data.arrondissement || null,
        data.commune || null,
        data.phone_number || null,
        data.is_active ? 1 : 0,
        1 // must_change_password = true for new users
      ]
    })

    return NextResponse.json({ message: "User created successfully", id: userId }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
