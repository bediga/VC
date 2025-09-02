"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardStats } from "@/types/database"
import { Users, UserCheck, MapPin, BarChart3, Clock, CheckCircle, Database } from "lucide-react"

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Utilisateurs",
      value: stats?.totalUsers || 0,
      description: "Utilisateurs actifs",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Candidats",
      value: stats?.totalCandidates || 0,
      description: "Candidats enregistrés",
      icon: UserCheck,
      color: "text-green-600"
    },
    {
      title: "Bureaux de vote",
      value: stats?.totalPollingStations || 0,
      description: "Bureaux configurés",
      icon: MapPin,
      color: "text-purple-600"
    },
    {
      title: "Soumissions",
      value: stats?.totalSubmissions || 0,
      description: "Résultats soumis",
      icon: BarChart3,
      color: "text-orange-600"
    },
    {
      title: "En attente",
      value: stats?.pendingVerifications || 0,
      description: "Vérifications pendantes",
      icon: Clock,
      color: "text-yellow-600"
    },
    {
      title: "Taux de participation",
      value: `${stats?.turnoutRate || 0}%`,
      description: "Participation globale",
      icon: CheckCircle,
      color: "text-red-600"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Vue d'ensemble du système électoral</p>
        </div>
        <Link href="/test-data">
          <Button variant="outline" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Tester les données
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-600">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users by Role */}
      {stats?.usersByRole && (
        <Card>
          <CardHeader>
            <CardTitle>Répartition des utilisateurs par rôle</CardTitle>
            <CardDescription>Nombre d'utilisateurs par type de rôle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.usersByRole).map(([role, count]) => (
                <div key={role} className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">{role}</span>
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submissions by Status */}
      {stats?.submissionsByStatus && (
        <Card>
          <CardHeader>
            <CardTitle>État des soumissions</CardTitle>
            <CardDescription>Répartition des soumissions par statut</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.submissionsByStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">{status}</span>
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
