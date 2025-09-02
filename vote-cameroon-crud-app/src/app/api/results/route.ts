import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/database"

// GET - List all election results with candidate and polling station details
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await db.execute(`
      SELECT 
        er.id, er.candidate_id, er.polling_station_id, er.votes, 
        er.percentage, er.total_votes, er.submitted_at, er.verified, 
        er.verification_notes, er.created_at, er.updated_at,
        c.first_name || ' ' || c.last_name as candidate_name,
        c.party as candidate_party,
        ps.name as polling_station_name,
        ps.region as polling_station_region,
        ps.department as polling_station_department
      FROM election_results er
      JOIN candidates c ON er.candidate_id = c.id
      LEFT JOIN polling_stations ps ON er.polling_station_id = ps.id
      ORDER BY er.submitted_at DESC, er.votes DESC
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching election results:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
