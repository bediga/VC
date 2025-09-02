'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Candidate {
  id: number
  name: string
  party: string
  number: number
  color: string
  description: string
  photo_url: string
  votes: number
  percentage: number
  status: string
  created_at: string
  updated_at: string
}

interface PollingStation {
  id: string
  name: string
  region: string
  department: string
  commune: string
  registered_voters: number
  status: string
  turnout_rate: number
  scrutineers_count: number
  observers_count: number
}

interface Region {
  id: number
  name: string
  code: string
  created_at: string
  updated_at: string
}

export default function TestDataPage() {
  const { data: session, status } = useSession()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [pollingStations, setPollingStations] = useState<PollingStation[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAllData()
    }
  }, [status])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch candidates
      const candidatesRes = await fetch('/api/candidates')
      if (candidatesRes.ok) {
        const candidatesData = await candidatesRes.json()
        setCandidates(candidatesData.data || candidatesData)
      } else {
        throw new Error('Failed to fetch candidates')
      }

      // Fetch polling stations
      const stationsRes = await fetch('/api/polling-stations')
      if (stationsRes.ok) {
        const stationsData = await stationsRes.json()
        setPollingStations(stationsData)
      } else {
        console.warn('Failed to fetch polling stations')
      }

      // Fetch regions
      const regionsRes = await fetch('/api/regions')
      if (regionsRes.ok) {
        const regionsData = await regionsRes.json()
        setRegions(regionsData.data || regionsData)
      } else {
        console.warn('Failed to fetch regions')
      }

    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Accès restreint</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Vous devez être connecté pour accéder à cette page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={fetchAllData} className="mt-4">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard - Test des Données</h1>
        <Button onClick={fetchAllData}>Actualiser</Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Candidats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidates.length}</div>
            <p className="text-gray-600">Total des candidats</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bureaux de vote</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pollingStations.length}</div>
            <p className="text-gray-600">Total des bureaux</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Régions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regions.length}</div>
            <p className="text-gray-600">Total des régions</p>
          </CardContent>
        </Card>
      </div>

      {/* Candidates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Candidats</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Parti</TableHead>
                <TableHead>Couleur</TableHead>
                <TableHead>Votes</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>{candidate.number}</TableCell>
                  <TableCell>{candidate.name}</TableCell>
                  <TableCell>{candidate.party}</TableCell>
                  <TableCell>
                    <div 
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: candidate.color }}
                    ></div>
                  </TableCell>
                  <TableCell>{candidate.votes}</TableCell>
                  <TableCell>
                    <Badge variant={candidate.status === 'active' ? 'default' : 'secondary'}>
                      {candidate.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Polling Stations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bureaux de vote</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Région</TableHead>
                <TableHead>Département</TableHead>
                <TableHead>Électeurs inscrits</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pollingStations.slice(0, 10).map((station) => (
                <TableRow key={station.id}>
                  <TableCell>{station.id}</TableCell>
                  <TableCell>{station.name}</TableCell>
                  <TableCell>{station.region}</TableCell>
                  <TableCell>{station.department}</TableCell>
                  <TableCell>{station.registered_voters}</TableCell>
                  <TableCell>
                    <Badge variant={station.status === 'active' ? 'default' : 'secondary'}>
                      {station.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {pollingStations.length > 10 && (
            <p className="text-sm text-gray-500 mt-2">
              Affichage de 10 sur {pollingStations.length} bureaux de vote
            </p>
          )}
        </CardContent>
      </Card>

      {/* Regions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Régions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Date de création</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regions.map((region) => (
                <TableRow key={region.id}>
                  <TableCell>{region.id}</TableCell>
                  <TableCell>{region.name}</TableCell>
                  <TableCell>{region.code || 'N/A'}</TableCell>
                  <TableCell>{new Date(region.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
