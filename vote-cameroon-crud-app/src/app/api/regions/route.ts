import { NextRequest, NextResponse } from 'next/server'
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

    const result = await db.execute({
      sql: `
        SELECT id, name, code, created_at, updated_at
        FROM regions 
        ORDER BY name ASC
      `,
      args: []
    })

    return NextResponse.json({
      success: true,
      data: result.rows
    })

  } catch (error: any) {
    console.error('Error fetching regions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch regions', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      )
    }

    // Insert region
    const result = await db.execute({
      sql: `
        INSERT INTO regions (name, code, created_at, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      args: [
        data.name,
        data.code || null
      ]
    })

    return NextResponse.json({
      success: true,
      message: 'Region created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating region:', error)
    return NextResponse.json(
      { error: 'Failed to create region', details: error.message },
      { status: 500 }
    )
  }
}
