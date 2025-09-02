"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import { usePagination } from "@/hooks/usePagination"
import { useTableFilters } from "@/hooks/useTableFilters"
import { TableFilters } from "@/components/ui/table-filters"
import { PollingStation, PollingStationFormData } from "@/types/database"
import { Plus, Search, Edit, Trash2, MapPin, Users } from "lucide-react"

export default function PollingStationsPage() {
  const [pollingStations, setPollingStations] = useState<PollingStation[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStation, setEditingStation] = useState<PollingStation | null>(null)

  const pollingStationFilterFunction = (station: PollingStation, filters: Record<string, string>, searchTerm: string): boolean => {
    const matchesSearch = !searchTerm || 
      station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (station.region?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (station.department?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (station.commune?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    const matchesStatus = !filters.status || station.status === filters.status
    const matchesRegion = !filters.region || station.region === filters.region
    const matchesDepartment = !filters.department || station.department === filters.department
    const matchesCommune = !filters.commune || station.commune === filters.commune

    return matchesSearch && matchesStatus && matchesRegion && matchesDepartment && matchesCommune
  }

  const {
    filteredData: filteredStations,
    activeFilters,
    searchTerm,
    handleFilterChange,
    handleSearchChange
  } = useTableFilters(pollingStations, pollingStationFilterFunction)

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedStations,
    goToPage,
    resetPagination,
    totalItems,
    itemsPerPage
  } = usePagination(filteredStations, 15)

  useEffect(() => {
    fetchPollingStations()
  }, [])

  useEffect(() => {
    resetPagination()
  }, [filteredStations, resetPagination])

  const fetchPollingStations = async () => {
    try {
      const response = await fetch("/api/polling-stations")
      if (response.ok) {
        const data = await response.json()
        setPollingStations(data)
      }
    } catch (error) {
      console.error("Error fetching polling stations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce bureau de vote ?")) {
      return
    }

    try {
      const response = await fetch(`/api/polling-stations/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPollingStations(pollingStations.filter(station => station.id !== id))
      } else {
        alert("Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("Error deleting polling station:", error)
      alert("Erreur lors de la suppression")
    }
  }

  const handleEdit = (station: PollingStation) => {
    setEditingStation(station)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingStation(null)
    fetchPollingStations()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600'
      case 'closed': return 'text-red-600'
      case 'results_submitted': return 'text-blue-600'
      default: return 'text-yellow-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif'
      case 'closed': return 'Fermé'
      case 'results_submitted': return 'Résultats soumis'
      default: return 'En attente'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestion des bureaux de vote</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Chargement...</p>
        </div>
      </div>
    )
  }

  const uniqueStatuses = Array.from(new Set(pollingStations.map(s => s.status)))
  const uniqueRegions = Array.from(new Set(pollingStations.map(s => s.region).filter(Boolean))) as string[]
  const uniqueDepartments = Array.from(new Set(pollingStations.map(s => s.department).filter(Boolean))) as string[]
  const uniqueCommunes = Array.from(new Set(pollingStations.map(s => s.commune).filter(Boolean))) as string[]

  const filterOptions = [
    {
      id: 'status',
      label: 'Statut',
      type: 'select' as const,
      options: uniqueStatuses.map(status => ({ 
        value: status, 
        label: getStatusText(status) 
      }))
    },
    {
      id: 'region',
      label: 'Région',
      type: 'select' as const,
      options: uniqueRegions.map(region => ({ value: region, label: region }))
    },
    {
      id: 'department',
      label: 'Département',
      type: 'select' as const,
      options: uniqueDepartments.map(department => ({ value: department, label: department }))
    },
    {
      id: 'commune',
      label: 'Commune',
      type: 'select' as const,
      options: uniqueCommunes.map(commune => ({ value: commune, label: commune }))
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des bureaux de vote</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau bureau
        </Button>
      </div>

      <TableFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filters={activeFilters}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        placeholder="Rechercher par nom, région, département ou commune..."
      />

      {/* Polling Stations List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paginatedStations.map((station) => (
          <Card key={station.id}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <CardTitle className="text-lg">{station.name}</CardTitle>
                  <CardDescription>
                    {station.region && `${station.region}, `}
                    {station.department && `${station.department}`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Commune:</span>
                  <span className="font-medium">{station.commune || "Non définie"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Arrondissement:</span>
                  <span className="font-medium">{station.arrondissement || "Non défini"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Statut:</span>
                  <span className={`font-medium ${getStatusColor(station.status)}`}>
                    {getStatusText(station.status)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Électeurs inscrits:</span>
                  <span className="font-medium text-blue-600">{station.registered_voters}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Votes soumis:</span>
                  <span className="font-medium text-green-600">{station.votes_submitted}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taux de participation:</span>
                  <span className="font-medium">{station.turnout_rate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Personnel:</span>
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {station.scrutineers_count}S
                    </span>
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {station.observers_count}O
                    </span>
                  </div>
                </div>
                {station.address && (
                  <div className="text-sm">
                    <span className="text-gray-600">Adresse:</span>
                    <p className="font-medium text-xs mt-1">{station.address}</p>
                  </div>
                )}
                <div className="flex justify-end space-x-1 mt-4">
                  <button
                    onClick={() => handleEdit(station)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(station.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        </div>
      )}

      {filteredStations.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucun bureau de vote trouvé</p>
        </div>
      )}

      {/* Polling Station Form Modal */}
      {showForm && (
        <PollingStationForm
          station={editingStation}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}

// Polling Station Form Component
function PollingStationForm({ station, onClose }: { station: PollingStation | null; onClose: () => void }) {
  const [formData, setFormData] = useState<PollingStationFormData>({
    name: station?.name || "",
    region: station?.region || "",
    department: station?.department || "",
    commune: station?.commune || "",
    arrondissement: station?.arrondissement || "",
    address: station?.address || "",
    registered_voters: station?.registered_voters || 0,
    latitude: station?.latitude || undefined,
    longitude: station?.longitude || undefined,
    status: station?.status || "pending",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = station ? `/api/polling-stations/${station.id}` : "/api/polling-stations"
      const method = station ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onClose()
      } else {
        const error = await response.json()
        alert(error.error || "Erreur lors de la sauvegarde")
      }
    } catch (error) {
      console.error("Error saving polling station:", error)
      alert("Erreur lors de la sauvegarde")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {station ? "Modifier le bureau de vote" : "Nouveau bureau de vote"}
          </h2>
          <Button variant="outline" onClick={onClose}>×</Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom du bureau</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Région</label>
              <Input
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Département</label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Arrondissement</label>
              <Input
                value={formData.arrondissement}
                onChange={(e) => setFormData({ ...formData, arrondissement: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Commune</label>
              <Input
                value={formData.commune}
                onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Adresse</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Électeurs inscrits</label>
              <Input
                type="number"
                value={formData.registered_voters}
                onChange={(e) => setFormData({ ...formData, registered_voters: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="pending">En attente</option>
                <option value="active">Actif</option>
                <option value="closed">Fermé</option>
                <option value="results_submitted">Résultats soumis</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Latitude</label>
              <Input
                type="number"
                step="any"
                value={formData.latitude || ""}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Longitude</label>
              <Input
                type="number"
                step="any"
                value={formData.longitude || ""}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
