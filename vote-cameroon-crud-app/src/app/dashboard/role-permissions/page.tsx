"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { TableFilters } from "@/components/ui/table-filters"
import { usePagination } from "@/hooks/usePagination"
import { useTableFilters } from "@/hooks/useTableFilters"
import { RolePermission, RolePermissionFormData } from "@/types/database"
import { Plus, Edit, Trash2, Shield, Users } from "lucide-react"

export default function RolePermissionsPage() {
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPermission, setEditingPermission] = useState<RolePermission | null>(null)

  const rolePermissionFilterFunction = (permission: RolePermission, filters: Record<string, string>, searchTerm: string): boolean => {
    const matchesSearch = !searchTerm || 
      permission.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.permission.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = !filters.role || permission.role === filters.role

    return matchesSearch && matchesRole
  }

  const {
    filteredData: filteredPermissions,
    activeFilters,
    searchTerm,
    handleFilterChange,
    handleSearchChange
  } = useTableFilters(rolePermissions, rolePermissionFilterFunction)

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedPermissions,
    goToPage,
    resetPagination,
    totalItems,
    itemsPerPage
  } = usePagination(filteredPermissions, 15)

  useEffect(() => {
    fetchRolePermissions()
  }, [])

  useEffect(() => {
    resetPagination()
  }, [filteredPermissions, resetPagination])

  const fetchRolePermissions = async () => {
    try {
      const response = await fetch("/api/role-permissions")
      if (response.ok) {
        const data = await response.json()
        setRolePermissions(data)
      }
    } catch (error) {
      console.error("Error fetching role permissions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette permission ?")) {
      return
    }

    try {
      const response = await fetch(`/api/role-permissions/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setRolePermissions(rolePermissions.filter(permission => permission.id !== id))
      } else {
        alert("Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("Error deleting role permission:", error)
      alert("Erreur lors de la suppression")
    }
  }

  const handleEdit = (permission: RolePermission) => {
    setEditingPermission(permission)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingPermission(null)
    fetchRolePermissions()
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-red-100 text-red-800'
      case 'admin': return 'bg-blue-100 text-blue-800'
      case 'scrutineer': return 'bg-green-100 text-green-800'
      case 'checker': return 'bg-yellow-100 text-yellow-800'
      case 'observer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'superadmin': return 'Super Admin'
      case 'admin': return 'Administrateur'
      case 'scrutineer': return 'Scrutateur'
      case 'checker': return 'Vérificateur'
      case 'observer': return 'Observateur'
      default: return role
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestion des rôles et permissions</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Chargement...</p>
        </div>
      </div>
    )
  }

  const uniqueRoles = Array.from(new Set(rolePermissions.map(p => p.role)))

  const filterOptions = [
    {
      id: 'role',
      label: 'Rôle',
      type: 'select' as const,
      options: uniqueRoles.map(role => ({ 
        value: role, 
        label: getRoleLabel(role) 
      }))
    }
  ]

  // Grouper les permissions par rôle pour affichage
  const permissionsByRole = rolePermissions.reduce((acc, permission) => {
    if (!acc[permission.role]) {
      acc[permission.role] = []
    }
    acc[permission.role].push(permission)
    return acc
  }, {} as Record<string, RolePermission[]>)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Gestion des rôles et permissions</h1>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle permission
        </Button>
      </div>

      <TableFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filters={activeFilters}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        placeholder="Rechercher par rôle ou permission..."
      />

      {/* Permissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions par rôle ({rolePermissions.length} permissions)</CardTitle>
          <CardDescription>
            Gérez les permissions pour chaque rôle utilisateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de création
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedPermissions.map((permission) => (
                  <tr key={permission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-gray-400 mr-3" />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(permission.role)}`}>
                          {getRoleLabel(permission.role)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {permission.permission}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(permission.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(permission)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(permission.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
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

          {filteredPermissions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune permission trouvée</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permissions by Role Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(permissionsByRole).map(([role, permissions]) => (
          <Card key={role}>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">{getRoleLabel(role)}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-gray-600 mb-2">
                  {permissions.length} permission(s)
                </div>
                {permissions.slice(0, 5).map((permission) => (
                  <div key={permission.id} className="text-sm bg-gray-50 px-2 py-1 rounded">
                    {permission.permission}
                  </div>
                ))}
                {permissions.length > 5 && (
                  <div className="text-sm text-gray-500">
                    ... et {permissions.length - 5} autres
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role Permission Form Modal */}
      {showForm && (
        <RolePermissionForm
          permission={editingPermission}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}

// Role Permission Form Component
function RolePermissionForm({ permission, onClose }: { permission: RolePermission | null; onClose: () => void }) {
  const [formData, setFormData] = useState<RolePermissionFormData>({
    role: permission?.role || "observer",
    permission: permission?.permission || "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = permission ? `/api/role-permissions/${permission.id}` : "/api/role-permissions"
      const method = permission ? "PUT" : "POST"

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
      console.error("Error saving role permission:", error)
      alert("Erreur lors de la sauvegarde")
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { value: 'superadmin', label: 'Super Admin' },
    { value: 'admin', label: 'Administrateur' },
    { value: 'scrutineer', label: 'Scrutateur' },
    { value: 'checker', label: 'Vérificateur' },
    { value: 'observer', label: 'Observateur' }
  ]

  const commonPermissions = [
    'all',
    'users.manage',
    'users.view',
    'results.view',
    'results.submit',
    'results.verify',
    'documents.upload',
    'verification.manage',
    'reports.view',
    'settings.manage',
    'polling-stations.manage',
    'candidates.manage'
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {permission ? "Modifier la permission" : "Nouvelle permission"}
          </h2>
          <Button variant="outline" onClick={onClose}>×</Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Rôle</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Permission</label>
            <Input
              list="permissions"
              value={formData.permission}
              onChange={(e) => setFormData({ ...formData, permission: e.target.value })}
              placeholder="Ex: users.manage, results.view..."
              required
            />
            <datalist id="permissions">
              {commonPermissions.map((perm) => (
                <option key={perm} value={perm} />
              ))}
            </datalist>
            <div className="text-xs text-gray-500 mt-1">
              Utilisez des permissions comme: users.manage, results.view, etc.
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
