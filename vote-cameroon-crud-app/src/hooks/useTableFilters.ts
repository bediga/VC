import { useState, useMemo } from "react"

export function useTableFilters<T>(
  data: T[],
  filterFunction: (item: T, filters: Record<string, string>, searchTerm: string) => boolean
) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [searchTerm, setSearchTerm] = useState("")

  const filteredData = useMemo(() => {
    return data.filter(item => filterFunction(item, activeFilters, searchTerm))
  }, [data, activeFilters, searchTerm, filterFunction])

  const handleFilterChange = (filters: Record<string, string>) => {
    setActiveFilters(filters)
  }

  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
  }

  const clearFilters = () => {
    setActiveFilters({})
    setSearchTerm("")
  }

  return {
    filteredData,
    activeFilters,
    searchTerm,
    handleFilterChange,
    handleSearchChange,
    clearFilters
  }
}
