"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ElectionResult, Candidate, PollingStation } from "@/types/database"
import { Search, BarChart3, TrendingUp, MapPin, Users } from "lucide-react"

interface ResultWithDetails extends ElectionResult {
  candidate_name: string
  candidate_party: string
  polling_station_name: string
  polling_station_region: string
}

export default function ResultsPage() {
  const [results, setResults] = useState<ResultWithDetails[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [pollingStations, setPollingStations] = useState<PollingStation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCandidate, setSelectedCandidate] = useState("")
  const [selectedStation, setSelectedStation] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [resultsRes, candidatesRes, stationsRes] = await Promise.all([
        fetch("/api/results"),
        fetch("/api/candidates"),
        fetch("/api/polling-stations")
      ])

      if (resultsRes.ok) {
        const resultsData = await resultsRes.json()
        setResults(resultsData)
      }

      if (candidatesRes.ok) {
        const candidatesData = await candidatesRes.json()
        setCandidates(candidatesData)
      }

      if (stationsRes.ok) {
        const stationsData = await stationsRes.json()
        setPollingStations(stationsData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate overall statistics
  const totalVotes = results.reduce((sum, result) => sum + result.votes, 0)
  const resultsByCandidate = results.reduce((acc, result) => {
    if (!acc[result.candidate_id]) {
      acc[result.candidate_id] = {
        candidate_name: result.candidate_name,
        candidate_party: result.candidate_party,
        total_votes: 0,
        stations_count: 0
      }
    }
    acc[result.candidate_id].total_votes += result.votes
    acc[result.candidate_id].stations_count += 1
    return acc
  }, {} as Record<number, { candidate_name: string; candidate_party: string; total_votes: number; stations_count: number }>)

  const candidateResults = Object.entries(resultsByCandidate)
    .map(([id, data]) => ({
      candidate_id: parseInt(id),
      ...data,
      percentage: totalVotes > 0 ? (data.total_votes / totalVotes) * 100 : 0
    }))
    .sort((a, b) => b.total_votes - a.total_votes)

  const filteredResults = results.filter(result => {
    const matchesSearch = searchTerm === "" || 
      result.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.polling_station_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.candidate_party.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCandidate = selectedCandidate === "" || result.candidate_id.toString() === selectedCandidate
    const matchesStation = selectedStation === "" || result.polling_station_id === selectedStation

    return matchesSearch && matchesCandidate && matchesStation
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Résultats électoraux</h1>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Résultats électoraux</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <BarChart3 className="h-4 w-4" />
          <span>{results.length} résultats</span>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des votes</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVotes.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidats</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidateResults.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bureaux rapportés</CardTitle>
            <MapPin className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(results.map(r => r.polling_station_id)).size}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En tête</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {candidateResults[0]?.candidate_name.split(' ')[0] || "N/A"}
            </div>
            <div className="text-sm text-gray-600">
              {candidateResults[0]?.percentage.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Candidate Results Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Résultats par candidat</CardTitle>
          <CardDescription>Classement général des candidats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {candidateResults.map((candidate, index) => (
              <div key={candidate.candidate_id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{candidate.candidate_name}</p>
                    <p className="text-sm text-gray-600">{candidate.candidate_party}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{candidate.total_votes.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{candidate.percentage.toFixed(1)}%</p>
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(candidate.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={selectedCandidate}
          onChange={(e) => setSelectedCandidate(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="">Tous les candidats</option>
          {candidates.map(candidate => (
            <option key={candidate.id} value={candidate.id}>
              {candidate.first_name} {candidate.last_name}
            </option>
          ))}
        </select>
        <select
          value={selectedStation}
          onChange={(e) => setSelectedStation(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="">Tous les bureaux</option>
          {pollingStations.map(station => (
            <option key={station.id} value={station.id}>
              {station.name}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          onClick={() => {
            setSearchTerm("")
            setSelectedCandidate("")
            setSelectedStation("")
          }}
        >
          Réinitialiser
        </Button>
      </div>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Résultats détaillés</CardTitle>
          <CardDescription>Résultats par bureau de vote</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredResults.map((result) => (
              <div key={`${result.candidate_id}-${result.polling_station_id}`} 
                   className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                <div className="flex-1">
                  <p className="font-medium">{result.candidate_name}</p>
                  <p className="text-sm text-gray-600">{result.candidate_party}</p>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{result.polling_station_name}</p>
                  <p className="text-sm text-gray-600">{result.polling_station_region}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{result.votes.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{result.percentage.toFixed(1)}%</p>
                </div>
                <div className="ml-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    result.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {result.verified ? 'Vérifié' : 'En attente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {filteredResults.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun résultat trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
