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

    const result = await client.execute("SELECT * FROM regions ORDER BY name")
    
    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des régions:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des régions" },
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
    const { name, code } = body

    if (!name) {
      return NextResponse.json(
        { error: "Le nom de la région est requis" },
        { status: 400 }
      )
    }

    const result = await client.execute({
      sql: "INSERT INTO regions (name, code) VALUES (?, ?)",
      args: [name, code || null]
    })

    return NextResponse.json({
      success: true,
      message: "Région créée avec succès",
      data: { id: result.lastInsertRowid, name, code }
    })
  } catch (error) {
    console.error("Erreur lors de la création de la région:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création de la région" },
      { status: 500 }
    )
  }
}
