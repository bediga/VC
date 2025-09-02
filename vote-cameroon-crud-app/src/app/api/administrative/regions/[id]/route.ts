import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@libsql/client"

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { name, code } = body
    const { id } = params

    if (!name) {
      return NextResponse.json(
        { error: "Le nom de la région est requis" },
        { status: 400 }
      )
    }

    await client.execute({
      sql: "UPDATE regions SET name = ?, code = ? WHERE id = ?",
      args: [name, code || null, id]
    })

    return NextResponse.json({
      success: true,
      message: "Région modifiée avec succès"
    })
  } catch (error) {
    console.error("Erreur lors de la modification de la région:", error)
    return NextResponse.json(
      { error: "Erreur lors de la modification de la région" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = params

    // Vérifier s'il y a des départements liés à cette région
    const departmentsResult = await client.execute({
      sql: "SELECT COUNT(*) as count FROM departments WHERE region_id = ?",
      args: [id]
    })

    const count = departmentsResult.rows[0]?.count as number
    if (count > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer cette région car elle contient des départements" },
        { status: 400 }
      )
    }

    await client.execute({
      sql: "DELETE FROM regions WHERE id = ?",
      args: [id]
    })

    return NextResponse.json({
      success: true,
      message: "Région supprimée avec succès"
    })
  } catch (error) {
    console.error("Erreur lors de la suppression de la région:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la région" },
      { status: 500 }
    )
  }
}
