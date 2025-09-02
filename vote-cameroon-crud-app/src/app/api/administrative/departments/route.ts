import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@libsql/client"

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const result = await client.execute(`
      SELECT d.*, r.name as region_name 
      FROM departments d 
      JOIN regions r ON d.region_id = r.id 
      ORDER BY r.name, d.name
    `)
    
    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des départements:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des départements" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { name, region_id } = body

    if (!name || !region_id) {
      return NextResponse.json(
        { error: "Le nom du département et la région sont requis" },
        { status: 400 }
      )
    }

    const result = await client.execute({
      sql: "INSERT INTO departments (name, region_id) VALUES (?, ?)",
      args: [name, region_id]
    })

    return NextResponse.json({
      success: true,
      message: "Département créé avec succès",
      data: { id: result.lastInsertRowid, name, region_id }
    })
  } catch (error) {
    console.error("Erreur lors de la création du département:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du département" },
      { status: 500 }
    )
  }
}
