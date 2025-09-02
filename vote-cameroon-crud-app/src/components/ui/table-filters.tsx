import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Filter, X, Search } from "lucide-react"

interface FilterOption {
  id: string
  label: string
  type: 'text' | 'select' | 'date'
  options?: { value: string; label: string }[]
  placeholder?: string
}

interface TableFiltersProps {
  filterOptions: FilterOption[]
  filters: Record<string, string>
  onFilterChange: (filters: Record<string, string>) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  placeholder?: string
}

export function TableFilters({
  filterOptions,
  filters,
  onFilterChange,
  searchTerm,
  onSearchChange,
  placeholder = "Rechercher..."
}: TableFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (id: string, value: string) => {
    const newFilters = { ...filters, [id]: value }
    if (!value) {
      delete newFilters[id]
    }
    onFilterChange(newFilters)
  }

  const clearAllFilters = () => {
    onFilterChange({})
  }

  const activeFilterCount = Object.keys(filters).length

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtres
          {activeFilterCount > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {(activeFilterCount > 0 || searchTerm) && (
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="flex items-center gap-2 text-gray-500"
          >
            <X className="h-4 w-4" />
            Effacer tout
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterOptions.map((filter) => (
                <div key={filter.id} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {filter.label}
                  </label>
                  
                  {filter.type === 'select' && filter.options ? (
                    <select
                      value={filters[filter.id] || ""}
                      onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Tous</option>
                      {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : filter.type === 'text' ? (
                    <Input
                      type="text"
                      value={filters[filter.id] || ""}
                      onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                      placeholder={filter.placeholder || `Filtrer par ${filter.label.toLowerCase()}...`}
                    />
                  ) : filter.type === 'date' ? (
                    <Input
                      type="date"
                      value={filters[filter.id] || ""}
                      onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
