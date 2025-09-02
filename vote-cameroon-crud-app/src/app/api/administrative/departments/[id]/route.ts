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
    const { name, region_id } = body
    const { id } = params

    if (!name || !region_id) {
      return NextResponse.json(
        { error: "Le nom du département et la région sont requis" },
        { status: 400 }
      )
    }

    await client.execute({
      sql: "UPDATE departments SET name = ?, region_id = ? WHERE id = ?",
      args: [name, region_id, id]
    })

    return NextResponse.json({
      success: true,
      message: "Département modifié avec succès"
    })
  } catch (error) {
    console.error("Erreur lors de la modification du département:", error)
    return NextResponse.json(
      { error: "Erreur lors de la modification du département" },
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

    // Vérifier s'il y a des arrondissements liés à ce département
    const arrondissementsResult = await client.execute({
      sql: "SELECT COUNT(*) as count FROM arrondissements WHERE department_id = ?",
      args: [id]
    })

    const count = arrondissementsResult.rows[0]?.count as number
    if (count > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer ce département car il contient des arrondissements" },
        { status: 400 }
      )
    }

    await client.execute({
      sql: "DELETE FROM departments WHERE id = ?",
      args: [id]
    })

    return NextResponse.json({
      success: true,
      message: "Département supprimé avec succès"
    })
  } catch (error) {
    console.error("Erreur lors de la suppression du département:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du département" },
      { status: 500 }
    )
  }
}
