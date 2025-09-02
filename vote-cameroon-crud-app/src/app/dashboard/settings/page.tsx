"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { TableFilters } from "@/components/ui/table-filters"
import { usePagination } from "@/hooks/usePagination"
import { useTableFilters } from "@/hooks/useTableFilters"
import { Settings, User, Database, Shield, Bell, MapPin, Edit, Trash2, Plus, Building } from "lucide-react"
import { PollingStationsSettings } from "@/components/PollingStationsSettings"

interface Region {
  id: number;
  name: string;
  code?: string;
}

interface Department {
  id: number;
  name: string;
  region_id: number;
  region_name: string;
}

interface Arrondissement {
  id: number;
  name: string;
  department_id: number;
  department_name: string;
  region_name: string;
}

interface Commune {
  id: number;
  name: string;
  arrondissement_id: number;
  arrondissement_name: string;
  department_name: string;
  region_name: string;
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("profile")

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "security", label: "Sécurité", icon: Shield },
    { id: "administrative", label: "Divisions Administratives", icon: MapPin },
    { id: "polling-stations", label: "Bureaux de vote", icon: Building },
    { id: "database", label: "Base de données", icon: Database },
    { id: "notifications", label: "Notifications", icon: Bell },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Paramètres</h1>
      </div>

      <div className="flex space-x-6">
        {/* Sidebar */}
        <div className="w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "security" && <SecuritySettings />}
          {activeTab === "administrative" && <AdministrativeSettings />}
          {activeTab === "polling-stations" && <PollingStationsSettings />}
          {activeTab === "database" && <DatabaseSettings />}
          {activeTab === "notifications" && <NotificationSettings />}
        </div>
      </div>
    </div>
  )
}

function ProfileSettings() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations du profil</CardTitle>
        <CardDescription>
          Gérez vos informations personnelles et préférences de compte
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nom complet</label>
          <Input
            value={session?.user?.name || ""}
            disabled
            className="bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input
            value={session?.user?.email || ""}
            disabled
            className="bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Rôle</label>
          <Input
            value={session?.user?.role || ""}
            disabled
            className="bg-gray-50"
          />
        </div>
        <Button disabled={loading}>
          {loading ? "Sauvegarde..." : "Sauvegarder les modifications"}
        </Button>
      </CardContent>
    </Card>
  )
}

function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas")
      return
    }
    setLoading(true)
    // TODO: Implement password change logic
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sécurité du compte</CardTitle>
        <CardDescription>
          Modifiez votre mot de passe et gérez les paramètres de sécurité
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe actuel</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirmer le nouveau mot de passe</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Modification..." : "Changer le mot de passe"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function DatabaseSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration de la base de données</CardTitle>
        <CardDescription>
          Informations sur la connexion à la base de données
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">URL de la base de données</label>
          <Input
            value="libsql://vote-mp3-cameroon.aws-eu-west-1.turso.io"
            disabled
            className="bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Statut de connexion</label>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600">Connecté</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dernière synchronisation</label>
          <p className="text-sm text-gray-600">Il y a quelques secondes</p>
        </div>
        <Button variant="outline">
          Tester la connexion
        </Button>
      </CardContent>
    </Card>
  )
}

function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [resultAlerts, setResultAlerts] = useState(true)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Préférences de notification</CardTitle>
        <CardDescription>
          Choisissez comment vous souhaitez être notifié des événements importants
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Notifications par email</p>
            <p className="text-sm text-gray-600">Recevoir des alertes par email</p>
          </div>
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
            className="h-4 w-4"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Notifications push</p>
            <p className="text-sm text-gray-600">Notifications en temps réel dans le navigateur</p>
          </div>
          <input
            type="checkbox"
            checked={pushNotifications}
            onChange={(e) => setPushNotifications(e.target.checked)}
            className="h-4 w-4"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Alertes de résultats</p>
            <p className="text-sm text-gray-600">Notifications lors de nouveaux résultats</p>
          </div>
          <input
            type="checkbox"
            checked={resultAlerts}
            onChange={(e) => setResultAlerts(e.target.checked)}
            className="h-4 w-4"
          />
        </div>
        <Button>
          Sauvegarder les préférences
        </Button>
      </CardContent>
    </Card>
  )
}

function AdministrativeSettings() {
  const [activeAdminTab, setActiveAdminTab] = useState("regions")
  const [loading, setLoading] = useState(false)
  const [adminData, setAdminData] = useState({
    regions: [],
    departments: [],
    arrondissements: [],
    communes: []
  })

  const adminTabs = [
    { id: "regions", label: "Régions" },
    { id: "departments", label: "Départements" },
    { id: "arrondissements", label: "Arrondissements" },
    { id: "communes", label: "Communes" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Divisions Administratives</CardTitle>
        <CardDescription>
          Gérez les régions, départements, arrondissements et communes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Tabs pour les divisions administratives */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {adminTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeAdminTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu des tabs */}
        {activeAdminTab === "regions" && <RegionsManager />}
        {activeAdminTab === "departments" && <DepartmentsManager />}
        {activeAdminTab === "arrondissements" && <ArrondissementsManager />}
        {activeAdminTab === "communes" && <CommunesManager />}
      </CardContent>
    </Card>
  )
}

function RegionsManager() {
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRegion, setEditingRegion] = useState<Region | null>(null)
  const [formData, setFormData] = useState({ name: "", code: "" })

  const regionFilterFunction = (region: Region, filters: Record<string, string>, searchTerm: string): boolean => {
    const matchesSearch = !searchTerm || 
      region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Boolean(region.code?.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesSearch
  }

  const {
    filteredData: filteredRegions,
    activeFilters,
    searchTerm,
    handleFilterChange,
    handleSearchChange
  } = useTableFilters(regions, regionFilterFunction)

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedRegions,
    goToPage,
    resetPagination,
    totalItems,
    itemsPerPage
  } = usePagination(filteredRegions, 15)

  useEffect(() => {
    fetchRegions()
  }, [])

  useEffect(() => {
    resetPagination()
  }, [filteredRegions, resetPagination])

  const fetchRegions = async () => {
    try {
      const response = await fetch("/api/administrative-divisions")
      if (response.ok) {
        const data = await response.json()
        setRegions(data.data.regions)
      }
    } catch (error) {
      console.error("Error fetching regions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const method = editingRegion ? "PUT" : "POST"
      const url = editingRegion 
        ? `/api/administrative/regions/${editingRegion.id}`
        : "/api/administrative/regions"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchRegions()
        setShowForm(false)
        setEditingRegion(null)
        setFormData({ name: "", code: "" })
      }
    } catch (error) {
      console.error("Error saving region:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (region: Region) => {
    setEditingRegion(region)
    setFormData({ name: region.name, code: region.code || "" })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette région ?")) return
    
    try {
      const response = await fetch(`/api/administrative/regions/${id}`, {
        method: "DELETE"
      })
      if (response.ok) {
        fetchRegions()
      }
    } catch (error) {
      console.error("Error deleting region:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gestion des Régions</h3>
        <Button onClick={() => setShowForm(true)} size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une région
        </Button>
      </div>

      <TableFilters
        filterOptions={[]}
        filters={activeFilters}
        onFilterChange={handleFilterChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        placeholder="Rechercher par nom ou code..."
      />

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingRegion ? "Modifier" : "Ajouter"} une région</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom de la région</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Centre"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Code (optionnel)</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ex: CE"
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Sauvegarde..." : editingRegion ? "Modifier" : "Ajouter"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false)
                    setEditingRegion(null)
                    setFormData({ name: "", code: "" })
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Nom</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Code</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedRegions.map((region) => (
                  <tr key={region.id}>
                    <td className="px-4 py-3 text-sm">{region.name}</td>
                    <td className="px-4 py-3 text-sm">{region.code || "-"}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(region)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(region.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DepartmentsManager() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [formData, setFormData] = useState({ name: "", region_id: "" })

  const departmentFilterFunction = (department: Department, filters: Record<string, string>, searchTerm: string): boolean => {
    const matchesSearch = !searchTerm || 
      department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.region_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRegion = !filters.region || department.region_name === filters.region

    return matchesSearch && matchesRegion
  }

  const {
    filteredData: filteredDepartments,
    activeFilters,
    searchTerm,
    handleFilterChange,
    handleSearchChange
  } = useTableFilters(departments, departmentFilterFunction)

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedDepartments,
    goToPage,
    resetPagination,
    totalItems,
    itemsPerPage
  } = usePagination(filteredDepartments, 15)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    resetPagination()
  }, [filteredDepartments, resetPagination])

  const fetchData = async () => {
    try {
      const response = await fetch("/api/administrative-divisions")
      if (response.ok) {
        const data = await response.json()
        setDepartments(data.data.departments)
        setRegions(data.data.regions)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-4">Chargement...</div>

  const uniqueRegions = Array.from(new Set(departments.map(d => d.region_name)))

  const filterOptions = [
    {
      id: 'region',
      label: 'Région',
      type: 'select' as const,
      options: uniqueRegions.map(region => ({ value: region, label: region }))
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gestion des Départements</h3>
        <Button onClick={() => setShowForm(true)} size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un département
        </Button>
      </div>

      <TableFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filters={activeFilters}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        placeholder="Rechercher par nom ou région..."
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Nom</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Région</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedDepartments.map((department) => (
                  <tr key={department.id}>
                    <td className="px-4 py-3 text-sm">{department.name}</td>
                    <td className="px-4 py-3 text-sm">{department.region_name}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-1">
                        <button
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ArrondissementsManager() {
  const [arrondissements, setArrondissements] = useState<Arrondissement[]>([])
  const [loading, setLoading] = useState(true)

  const arrondissementFilterFunction = (arrondissement: Arrondissement, filters: Record<string, string>, searchTerm: string): boolean => {
    const matchesSearch = !searchTerm || 
      arrondissement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      arrondissement.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      arrondissement.region_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRegion = !filters.region || arrondissement.region_name === filters.region
    const matchesDepartment = !filters.department || arrondissement.department_name === filters.department

    return matchesSearch && matchesRegion && matchesDepartment
  }

  const {
    filteredData: filteredArrondissements,
    activeFilters,
    searchTerm,
    handleFilterChange,
    handleSearchChange
  } = useTableFilters(arrondissements, arrondissementFilterFunction)

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedArrondissements,
    goToPage,
    resetPagination,
    totalItems,
    itemsPerPage
  } = usePagination(filteredArrondissements, 15)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    resetPagination()
  }, [filteredArrondissements, resetPagination])

  const fetchData = async () => {
    try {
      const response = await fetch("/api/administrative-divisions")
      if (response.ok) {
        const data = await response.json()
        setArrondissements(data.data.arrondissements)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-4">Chargement...</div>

  const uniqueRegions = Array.from(new Set(arrondissements.map(a => a.region_name)))
  const uniqueDepartments = Array.from(new Set(arrondissements.map(a => a.department_name)))

  const filterOptions = [
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
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gestion des Arrondissements</h3>
        <Button size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un arrondissement
        </Button>
      </div>

      <TableFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filters={activeFilters}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        placeholder="Rechercher par nom, département ou région..."
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Nom</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Département</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Région</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedArrondissements.map((arrondissement) => (
                  <tr key={arrondissement.id}>
                    <td className="px-4 py-3 text-sm">{arrondissement.name}</td>
                    <td className="px-4 py-3 text-sm">{arrondissement.department_name}</td>
                    <td className="px-4 py-3 text-sm">{arrondissement.region_name}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-1">
                        <button
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function CommunesManager() {
  const [communes, setCommunes] = useState<Commune[]>([])
  const [loading, setLoading] = useState(true)

  const communeFilterFunction = (commune: Commune, filters: Record<string, string>, searchTerm: string): boolean => {
    const matchesSearch = !searchTerm || 
      commune.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commune.arrondissement_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commune.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commune.region_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRegion = !filters.region || commune.region_name === filters.region
    const matchesDepartment = !filters.department || commune.department_name === filters.department
    const matchesArrondissement = !filters.arrondissement || commune.arrondissement_name === filters.arrondissement

    return matchesSearch && matchesRegion && matchesDepartment && matchesArrondissement
  }

  const {
    filteredData: filteredCommunes,
    activeFilters,
    searchTerm,
    handleFilterChange,
    handleSearchChange
  } = useTableFilters(communes, communeFilterFunction)

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedCommunes,
    goToPage,
    resetPagination,
    totalItems,
    itemsPerPage
  } = usePagination(filteredCommunes, 15)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    resetPagination()
  }, [filteredCommunes, resetPagination])

  const fetchData = async () => {
    try {
      const response = await fetch("/api/administrative-divisions")
      if (response.ok) {
        const data = await response.json()
        setCommunes(data.data.communes)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-4">Chargement...</div>

  const uniqueRegions = Array.from(new Set(communes.map(c => c.region_name)))
  const uniqueDepartments = Array.from(new Set(communes.map(c => c.department_name)))
  const uniqueArrondissements = Array.from(new Set(communes.map(c => c.arrondissement_name)))

  const filterOptions = [
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
      id: 'arrondissement',
      label: 'Arrondissement',
      type: 'select' as const,
      options: uniqueArrondissements.map(arrondissement => ({ value: arrondissement, label: arrondissement }))
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gestion des Communes</h3>
        <Button size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une commune
        </Button>
      </div>

      <TableFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filters={activeFilters}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        placeholder="Rechercher par nom, arrondissement, département ou région..."
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Nom</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Arrondissement</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Département</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Région</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedCommunes.map((commune) => (
                  <tr key={commune.id}>
                    <td className="px-4 py-3 text-sm">{commune.name}</td>
                    <td className="px-4 py-3 text-sm">{commune.arrondissement_name}</td>
                    <td className="px-4 py-3 text-sm">{commune.department_name}</td>
                    <td className="px-4 py-3 text-sm">{commune.region_name}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-1">
                        <button
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}