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

const chipBase: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--fw-medium)',
  padding: '6px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--rule-strong)',
  color: 'var(--text-secondary)',
  background: 'var(--bg-surface)',
  cursor: 'pointer',
  transition: 'all var(--dur-base) var(--ease-out)',
}

const chipActive: React.CSSProperties = {
  ...chipBase,
  border: '1px solid var(--rule-brand)',
  color: 'var(--text-brand)',
  background: 'var(--bg-subtle-brand)',
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
    <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: '0 var(--gutter)' }}>
      {/* Sticky filter bar */}
      <div style={{
        position: 'sticky',
        top: 64,
        zIndex: 40,
        background: 'var(--bg-page)',
        borderBottom: '1px solid var(--rule)',
        padding: 'var(--space-4) 0',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' }}>

          {/* Area dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setAreaOpen(!areaOpen)}
              style={filters.areas.length > 0 ? chipActive : chipBase}
            >
              Area{filters.areas.length > 0 ? ` (${filters.areas.length})` : ''} ▾
            </button>
            {areaOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                background: 'var(--bg-surface)',
                border: '1px solid var(--rule)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lift)',
                zIndex: 50,
                width: 220,
                padding: 'var(--space-4)',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxHeight: 256, overflowY: 'auto' }}>
                  {AREAS.map((area) => (
                    <label key={area} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px 0' }}>
                      <input
                        type="checkbox"
                        checked={filters.areas.includes(area)}
                        onChange={() => toggleArea(area)}
                        style={{ accentColor: 'var(--action-primary)' }}
                      />
                      {area}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Price presets */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {PRICE_PRESETS.map((preset) => {
              const active =
                String(preset.min || '') === filters.priceMin &&
                String(preset.max === Infinity ? '' : preset.max) === filters.priceMax
              return (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset.min, preset.max)}
                  style={active ? chipActive : chipBase}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>

          {/* Unit types */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {UNIT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => toggleUnitType(type)}
                style={filters.unitTypes.includes(type) ? chipActive : chipBase}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            onClick={() => setFilters((f) => ({ ...f, foreignFreehold: !f.foreignFreehold }))}
            style={filters.foreignFreehold ? chipActive : chipBase}
          >
            Foreign Freehold
          </button>
          <button
            onClick={() => setFilters((f) => ({ ...f, rentalProgram: !f.rentalProgram }))}
            style={filters.rentalProgram ? chipActive : chipBase}
          >
            Rental Program
          </button>

          {hasFilters && (
            <button onClick={clearAll} style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div style={{ padding: 'var(--space-7) 0' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>
          Showing {filtered.length} project{filtered.length !== 1 ? 's' : ''}
        </p>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-6)' }}>
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-10) 0' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lead)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
              No projects match your filters.
            </p>
            <button onClick={clearAll} style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-brand)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Try adjusting your search
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
