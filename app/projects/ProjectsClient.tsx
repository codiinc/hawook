'use client'

import { useState, useMemo } from 'react'
import ProjectCard from '@/components/ProjectCard'
import type { Project } from '@/lib/types'

const AREAS = [
  'Rawai', 'Nai Harn', 'Chalong', 'Kata', 'Karon', 'Patong',
  'Kamala', 'Surin', 'Bang Tao', 'Layan', 'Cherng Talay',
  'Laguna', 'Phuket Town', 'Mai Khao',
]

const PRICE_PRESETS = [
  { label: 'Under 5M', min: 0, max: 5_000_000 },
  { label: '5M–10M', min: 5_000_000, max: 10_000_000 },
  { label: '10M–15M', min: 10_000_000, max: 15_000_000 },
  { label: '15M–30M', min: 15_000_000, max: 30_000_000 },
  { label: '30M+', min: 30_000_000, max: Infinity },
]

const UNIT_TYPES = ['1BR', '1BR Plus', '2BR', '3BR', 'Villa']

type Filters = {
  areas: string[]
  priceMin: string
  priceMax: string
  unitTypes: string[]
  foreignFreehold: boolean
  rentalProgram: boolean
}

const defaultFilters: Filters = {
  areas: [],
  priceMin: '',
  priceMax: '',
  unitTypes: [],
  foreignFreehold: false,
  rentalProgram: false,
}

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [areaOpen, setAreaOpen] = useState(false)

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (filters.areas.length > 0 && (!p.area || !filters.areas.includes(p.area))) return false

      const pMin = filters.priceMin ? parseInt(filters.priceMin) : null
      const pMax = filters.priceMax ? parseInt(filters.priceMax) : null
      if (pMin && p.price_min && p.price_min < pMin) return false
      if (pMax && p.price_min && p.price_min > pMax) return false

      if (filters.unitTypes.length > 0) {
        const types = p.unit_types?.toLowerCase() ?? ''
        const match = filters.unitTypes.some((t) => types.includes(t.toLowerCase()))
        if (!match) return false
      }

      if (filters.foreignFreehold && !p.foreign_quota_available) return false
      if (filters.rentalProgram && !p.rental_program_available) return false

      return true
    })
  }, [projects, filters])

  function toggleArea(area: string) {
    setFilters((f) => ({
      ...f,
      areas: f.areas.includes(area) ? f.areas.filter((a) => a !== area) : [...f.areas, area],
    }))
  }

  function toggleUnitType(type: string) {
    setFilters((f) => ({
      ...f,
      unitTypes: f.unitTypes.includes(type) ? f.unitTypes.filter((t) => t !== type) : [...f.unitTypes, type],
    }))
  }

  function applyPreset(min: number, max: number) {
    setFilters((f) => ({
      ...f,
      priceMin: min > 0 ? String(min) : '',
      priceMax: max === Infinity ? '' : String(max),
    }))
  }

  function clearAll() {
    setFilters(defaultFilters)
    setAreaOpen(false)
  }

  const hasFilters =
    filters.areas.length > 0 ||
    filters.priceMin ||
    filters.priceMax ||
    filters.unitTypes.length > 0 ||
    filters.foreignFreehold ||
    filters.rentalProgram

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Sticky filter bar */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-100 py-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Area dropdown */}
          <div className="relative">
            <button
              onClick={() => setAreaOpen(!areaOpen)}
              className={`text-sm font-medium px-3 py-2 rounded-md border transition-colors ${
                filters.areas.length > 0
                  ? 'border-teal text-teal bg-teal-light'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              Area{filters.areas.length > 0 ? ` (${filters.areas.length})` : ''}
              <span className="ml-1">▾</span>
            </button>
            {areaOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-56 p-3">
                <div className="grid grid-cols-1 gap-1 max-h-64 overflow-y-auto">
                  {AREAS.map((area) => (
                    <label key={area} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900 py-1">
                      <input
                        type="checkbox"
                        checked={filters.areas.includes(area)}
                        onChange={() => toggleArea(area)}
                        className="accent-teal"
                      />
                      {area}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Price presets */}
          <div className="flex gap-1 flex-wrap">
            {PRICE_PRESETS.map((preset) => {
              const active =
                String(preset.min || '') === filters.priceMin &&
                String(preset.max === Infinity ? '' : preset.max) === filters.priceMax
              return (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset.min, preset.max)}
                  className={`text-xs font-medium px-3 py-2 rounded-md border transition-colors ${
                    active
                      ? 'border-teal text-teal bg-teal-light'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>

          {/* Unit types */}
          <div className="flex gap-1 flex-wrap">
            {UNIT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => toggleUnitType(type)}
                className={`text-xs font-medium px-3 py-2 rounded-md border transition-colors ${
                  filters.unitTypes.includes(type)
                    ? 'border-teal text-teal bg-teal-light'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Tag filters */}
          <button
            onClick={() => setFilters((f) => ({ ...f, foreignFreehold: !f.foreignFreehold }))}
            className={`text-xs font-medium px-3 py-2 rounded-md border transition-colors ${
              filters.foreignFreehold ? 'border-teal text-teal bg-teal-light' : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            Foreign Freehold
          </button>
          <button
            onClick={() => setFilters((f) => ({ ...f, rentalProgram: !f.rentalProgram }))}
            className={`text-xs font-medium px-3 py-2 rounded-md border transition-colors ${
              filters.rentalProgram ? 'border-teal text-teal bg-teal-light' : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            Rental Program
          </button>

          {hasFilters && (
            <button onClick={clearAll} className="text-xs text-gray-400 hover:text-gray-600 underline ml-1">
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="py-8">
        <p className="text-sm text-gray-500 mb-6">
          Showing {filtered.length} project{filtered.length !== 1 ? 's' : ''}
        </p>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="font-serif text-xl text-gray-400 mb-3">No projects match your filters.</p>
            <button onClick={clearAll} className="text-sm text-teal hover:text-teal-dark">
              Try adjusting your search
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
