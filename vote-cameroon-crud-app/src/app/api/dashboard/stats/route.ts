import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/database"
import { DashboardStats } from "@/types/database"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get total users
    const usersResult = await db.execute("SELECT COUNT(*) as count FROM users WHERE is_active = 1")
    const totalUsers = Number(usersResult.rows[0]?.count || 0)

    // Get total candidates
    const candidatesResult = await db.execute("SELECT COUNT(*) as count FROM candidates WHERE status = 'active'")
    const totalCandidates = Number(candidatesResult.rows[0]?.count || 0)

    // Get total polling stations
    const pollingStationsResult = await db.execute("SELECT COUNT(*) as count FROM polling_stations")
    const totalPollingStations = Number(pollingStationsResult.rows[0]?.count || 0)

    // Get total submissions
    const submissionsResult = await db.execute("SELECT COUNT(*) as count FROM result_submissions")
    const totalSubmissions = Number(submissionsResult.rows[0]?.count || 0)

    // Get pending verifications
    const pendingResult = await db.execute("SELECT COUNT(*) as count FROM verification_tasks WHERE status = 'pending'")
    const pendingVerifications = Number(pendingResult.rows[0]?.count || 0)

    // Calculate turnout rate
    const turnoutResult = await db.execute(`
      SELECT 
        COALESCE(AVG(turnout_rate), 0) as avg_turnout 
      FROM polling_stations 
      WHERE votes_submitted > 0
    `)
    const turnoutRate = Math.round(Number(turnoutResult.rows[0]?.avg_turnout || 0))

    // Get users by role
    const usersByRoleResult = await db.execute(`
      SELECT role, COUNT(*) as count 
      FROM users 
      WHERE is_active = 1 
      GROUP BY role
    `)
    const usersByRole: Record<string, number> = {}
    usersByRoleResult.rows.forEach(row => {
      usersByRole[row.role as string] = Number(row.count)
    })

    // Get submissions by status
    const submissionsByStatusResult = await db.execute(`
      SELECT status, COUNT(*) as count 
      FROM result_submissions 
      GROUP BY status
    `)
    const submissionsByStatus: Record<string, number> = {}
    submissionsByStatusResult.rows.forEach(row => {
      submissionsByStatus[row.status as string] = Number(row.count)
    })

    const stats: DashboardStats = {
      totalUsers,
      totalCandidates,
      totalPollingStations,
      totalSubmissions,
      pendingVerifications,
      turnoutRate,
      usersByRole,
      submissionsByStatus
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
