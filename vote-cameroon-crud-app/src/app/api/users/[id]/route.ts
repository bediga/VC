import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/database"

// GET - Get user by ID
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
          id, first_name, last_name, email, role, polling_station_id, 
          avatarPath, created_at, updated_at, is_active, region, 
          department, arrondissement, commune, phone_number, 
          must_change_password, last_login_at, password_changed_at
        FROM users 
        WHERE id = ?
      `,
      args: [params.id]
    })

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update user
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
    if (!data.first_name || !data.last_name || !data.email || !data.role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await db.execute({
      sql: "SELECT id FROM users WHERE id = ?",
      args: [params.id]
    })

    if (existingUser.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if email is already taken by another user
    const emailCheck = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? AND id != ?",
      args: [data.email, params.id]
    })

    if (emailCheck.rows.length > 0) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }

    // Update user
    await db.execute({
      sql: `
        UPDATE users SET 
          first_name = ?, last_name = ?, email = ?, role = ?,
          region = ?, department = ?, arrondissement = ?, commune = ?, 
          phone_number = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        data.first_name,
        data.last_name,
        data.email,
        data.role,
        data.region || null,
        data.department || null,
        data.arrondissement || null,
        data.commune || null,
        data.phone_number || null,
        data.is_active ? 1 : 0,
        params.id
      ]
    })

    return NextResponse.json({ message: "User updated successfully" })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user exists
    const existingUser = await db.execute({
      sql: "SELECT id FROM users WHERE id = ?",
      args: [params.id]
    })

    if (existingUser.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Don't allow deletion of the current user
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      )
    }

    // Soft delete by setting is_active to 0
    await db.execute({
      sql: "UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [params.id]
    })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
