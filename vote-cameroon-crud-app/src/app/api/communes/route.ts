import { NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET() {
  try {
    const result = await db.execute(`
      SELECT 
        c.id,
        c.name,
        c.department_id,
        d.name as department_name,
        r.name as region_name
      FROM communes c
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN regions r ON d.region_id = r.id
      ORDER BY r.name, d.name, c.name
    `)

    const communes = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      department_id: row.department_id,
      department_name: row.department_name,
      region_name: row.region_name
    }))

    return NextResponse.json(communes)
  } catch (error) {
    console.error("Error fetching communes:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des communes" },
      { status: 500 }
    )
  }
}
