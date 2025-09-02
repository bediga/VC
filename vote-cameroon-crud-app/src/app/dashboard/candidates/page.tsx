"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { TableFilters } from "@/components/ui/table-filters"
import { usePagination } from "@/hooks/usePagination"
import { useTableFilters } from "@/hooks/useTableFilters"
import { Edit, Trash2, Plus, User, Search } from "lucide-react"
import { Candidate, CandidateFormData } from "@/types/database"

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)
  const [administrativeDivisions, setAdministrativeDivisions] = useState<{
    regions: Array<{id: number; name: string; code?: string}>;
    departments: Array<{id: number; name: string; region_id: number; region_name: string}>;
    arrondissements: Array<{id: number; name: string; department_id: number; department_name: string; region_name: string}>;
    communes: Array<{id: number; name: string; arrondissement_id: number; arrondissement_name: string; department_name: string; region_name: string}>;
  }>({ regions: [], departments: [], arrondissements: [], communes: [] })

  useEffect(() => {
    fetchCandidates()
    fetchAdministrativeDivisions()
  }, [])

  const fetchAdministrativeDivisions = async () => {
    try {
      const response = await fetch("/api/administrative-divisions")
      if (response.ok) {
        const data = await response.json()
        setAdministrativeDivisions(data.data)
      }
    } catch (error) {
      console.error("Error fetching administrative divisions:", error)
    }
  }

  const fetchCandidates = async () => {
    try {
      const response = await fetch("/api/candidates")
      if (response.ok) {
        const data = await response.json()
        setCandidates(data.data || data)
      }
    } catch (error) {
      console.error("Error fetching candidates:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce candidat ?")) {
      try {
        const response = await fetch(`/api/candidates/${id}`, {
          method: "DELETE"
        })
        if (response.ok) {
          fetchCandidates()
        }
      } catch (error) {
        console.error("Error deleting candidate:", error)
      }
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingCandidate(null)
    fetchCandidates()
  }

  const candidateFilterFunction = (candidate: Candidate, filters: Record<string, string>, searchTerm: string) => {
    // Search in name and party
    const matchesSearch = !searchTerm || 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.party.toLowerCase().includes(searchTerm.toLowerCase())

    // Apply filters
    const matchesParty = !filters.party || candidate.party === filters.party
    const matchesStatus = !filters.status || candidate.status === filters.status
    const matchesRegion = !filters.region || candidate.region === filters.region
    const matchesDepartment = !filters.department || candidate.department === filters.department
    const matchesCommune = !filters.commune || candidate.commune === filters.commune

    return matchesSearch && matchesParty && matchesStatus && matchesRegion && matchesDepartment && matchesCommune
  }

  const {
    filteredData: filteredCandidates,
    activeFilters,
    searchTerm,
    handleFilterChange,
    handleSearchChange
  } = useTableFilters(candidates, candidateFilterFunction)

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedCandidates,
    goToPage,
    resetPagination,
    totalItems,
    itemsPerPage
  } = usePagination(filteredCandidates, 15)

  // Reset pagination when filters change
  useEffect(() => {
    resetPagination()
  }, [filteredCandidates, resetPagination])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestion des candidats</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des candidats...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des candidats</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouveau candidat
        </Button>
      </div>

      {/* Search Bar */}
      <TableFilters
        filters={[
          {
            key: 'party',
            label: 'Parti',
            type: 'select',
            options: Array.from(new Set(candidates.map(c => c.party))).map(party => ({
              value: party,
              label: party
            }))
          },
          {
            key: 'status',
            label: 'Statut',
            type: 'select',
            options: [
              { value: 'active', label: 'Actif' },
              { value: 'inactive', label: 'Inactif' }
            ]
          },
          {
            key: 'region',
            label: 'Région',
            type: 'select',
            options: Array.from(new Set(candidates.map(c => c.region).filter(Boolean))).map(region => ({
              value: region!,
              label: region!
            }))
          },
          {
            key: 'department',
            label: 'Département',
            type: 'select',
            options: Array.from(new Set(candidates.map(c => c.department).filter(Boolean))).map(dept => ({
              value: dept!,
              label: dept!
            }))
          },
          {
            key: 'commune',
            label: 'Commune',
            type: 'select',
            options: Array.from(new Set(candidates.map(c => c.commune).filter(Boolean))).map(commune => ({
              value: commune!,
              label: commune!
            }))
          }
        ]}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Rechercher par nom ou parti..."
      />

      {/* Candidates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paginatedCandidates.map((candidate) => (
          <Card key={candidate.id}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                  {candidate.photo_url ? (
                    <img src={candidate.photo_url} alt={candidate.name} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {candidate.name}
                  </CardTitle>
                  <CardDescription>{candidate.party}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Numéro:</span>
                  <span className="font-medium">{candidate.number || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Couleur:</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: candidate.color }}
                    ></div>
                    <span className="font-medium">{candidate.color}</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Votes:</span>
                  <span className="font-medium">{candidate.votes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Statut:</span>
                  <span className={`font-medium ${candidate.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {candidate.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                {(candidate.region || candidate.department || candidate.commune) && (
                  <div className="border-t pt-2 mt-2">
                    <div className="text-xs font-medium text-gray-500 mb-1">Découpage administratif:</div>
                    {candidate.region && (
                      <div className="text-xs text-gray-600">Région: {candidate.region}</div>
                    )}
                    {candidate.department && (
                      <div className="text-xs text-gray-600">Département: {candidate.department}</div>
                    )}
                    {candidate.commune && (
                      <div className="text-xs text-gray-600">Commune: {candidate.commune}</div>
                    )}
                    {candidate.arrondissement && (
                      <div className="text-xs text-gray-600">Arrondissement: {candidate.arrondissement}</div>
                    )}
                  </div>
                )}
                {candidate.description && (
                  <div className="text-sm text-gray-600 mt-2">
                    <p className="line-clamp-3">{candidate.description}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(candidate)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Modifier
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(candidate.id)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Supprimer
                </Button>
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

      {filteredCandidates.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-gray-500">
            {searchTerm ? "Aucun candidat trouvé pour cette recherche" : "Aucun candidat enregistré"}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <CandidateForm 
            candidate={editingCandidate} 
            onClose={handleCloseForm} 
            administrativeDivisions={administrativeDivisions}
          />
        </div>
      )}
    </div>
  )
}

// Candidate Form Component  
function CandidateForm({ candidate, onClose, administrativeDivisions }: { 
  candidate: Candidate | null; 
  onClose: () => void;
  administrativeDivisions: {
    regions: Array<{id: number; name: string; code?: string}>;
    departments: Array<{id: number; name: string; region_id: number; region_name: string}>;
    arrondissements: Array<{id: number; name: string; department_id: number; department_name: string; region_name: string}>;
    communes: Array<{id: number; name: string; arrondissement_id: number; arrondissement_name: string; department_name: string; region_name: string}>;
  };
}) {
  const [formData, setFormData] = useState<CandidateFormData>({
    name: candidate?.name || "",
    party: candidate?.party || "",
    number: candidate?.number || undefined,
    color: candidate?.color || "#000000",
    description: candidate?.description || "",
    photo_url: candidate?.photo_url || "",
    status: candidate?.status || "active",
    region: candidate?.region || "",
    department: candidate?.department || "",
    commune: candidate?.commune || "",
    arrondissement: candidate?.arrondissement || "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = candidate ? `/api/candidates/${candidate.id}` : "/api/candidates"
      const method = candidate ? "PUT" : "POST"

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
        alert("Erreur: " + (error.error || "Une erreur est survenue"))
      }
    } catch (error) {
      console.error("Error saving candidate:", error)
      alert("Erreur lors de la sauvegarde")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {candidate ? "Modifier le candidat" : "Nouveau candidat"}
        </h2>
        <Button variant="outline" onClick={onClose}>×</Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nom complet</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Parti politique</label>
            <Input
              value={formData.party}
              onChange={(e) => setFormData({ ...formData, party: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Numéro</label>
            <Input
              type="number"
              value={formData.number || ""}
              onChange={(e) => setFormData({ ...formData, number: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Couleur</label>
            <Input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Statut</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">URL de la photo</label>
          <Input
            type="url"
            value={formData.photo_url}
            onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
          />
        </div>

        {/* Découpage administratif */}
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-medium mb-3">Découpage administratif</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Région</label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Sélectionner une région</option>
                {administrativeDivisions.regions.map(region => (
                  <option key={region.id} value={region.name}>{region.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Département</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Sélectionner un département</option>
                {administrativeDivisions.departments.map(department => (
                  <option key={department.id} value={department.name}>{department.name} ({department.region_name})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Arrondissement</label>
              <select
                value={formData.arrondissement}
                onChange={(e) => setFormData({ ...formData, arrondissement: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Sélectionner un arrondissement</option>
                {administrativeDivisions.arrondissements.map(arrondissement => (
                  <option key={arrondissement.id} value={arrondissement.name}>{arrondissement.name} ({arrondissement.department_name})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Commune</label>
              <select
                value={formData.commune}
                onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Sélectionner une commune</option>
                {administrativeDivisions.communes.map(commune => (
                  <option key={commune.id} value={commune.name}>{commune.name} ({commune.arrondissement_name})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Sauvegarde..." : candidate ? "Modifier" : "Créer"}
          </Button>
        </div>
      </form>
    </div>
  )
}
