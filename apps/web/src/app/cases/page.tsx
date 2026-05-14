'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCases } from '@/hooks/use-cases'
import { formatPrice } from '@/lib/utils'
import type { Case } from '@skinmaze/shared'

export default function CasesPage() {
  const { data: cases, isPending, error } = useCases()

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Cases</h1>
        <p className="text-muted mt-1">Open a case for a chance at rare CS2 skins</p>
      </div>

      {isPending && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 bg-surface rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="card p-8 text-center text-muted">
          Failed to load cases. Make sure the API is running.
        </div>
      )}

      {cases && cases.length === 0 && (
        <div className="card p-8 text-center text-muted">No cases available yet.</div>
      )}

      {cases && cases.length > 0 && (
        <>
          {/* Featured cases */}
          {cases.some((c) => c.featured) && (
            <div className="mb-10">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-widest mb-4">
                Featured
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cases.filter((c) => c.featured).map((c) => (
                  <CaseCard key={c.id} caseData={c} featured />
                ))}
              </div>
            </div>
          )}

          {/* All cases */}
          {cases.some((c) => !c.featured) && (
            <div>
              <h2 className="text-sm font-semibold text-muted uppercase tracking-widest mb-4">
                All Cases
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {cases.filter((c) => !c.featured).map((c) => (
                  <CaseCard key={c.id} caseData={c} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function CaseCard({ caseData, featured }: { caseData: Case; featured?: boolean }) {
  return (
    <Link
      href={`/cases/${caseData.id}`}
      className="group relative flex flex-col items-center gap-4 p-6 rounded-xl bg-surface border border-border hover:border-primary/40 hover:bg-surface-2 transition-all duration-200"
    >
      {featured && (
        <span className="absolute top-3 right-3 text-xs bg-primary/20 text-primary border border-primary/30 rounded-full px-2 py-0.5">
          Featured
        </span>
      )}

      {/* Case image */}
      <div className="relative w-32 h-32 group-hover:scale-105 transition-transform duration-300">
        <Image
          src={caseData.image}
          alt={caseData.name}
          fill
          className="object-contain drop-shadow-lg"
          onError={(e) => {
            const el = e.target as HTMLImageElement
            el.style.display = 'none'
            el.parentElement!.innerHTML = `<div class="w-full h-full rounded-xl bg-surface-3 flex items-center justify-center text-4xl">📦</div>`
          }}
        />
      </div>

      <div className="text-center space-y-1 w-full">
        <h3 className="font-semibold text-white text-lg">{caseData.name}</h3>
        <p className="text-sm text-muted">{caseData.items.length} items inside</p>
      </div>

      <div className="w-full flex items-center justify-between border-t border-border pt-3 mt-1">
        <span className="text-xs text-muted">Price</span>
        <span className="text-lg font-bold text-primary">{formatPrice(caseData.price)}</span>
      </div>

      <div className="btn-primary w-full text-center text-sm py-2">
        Open Now
      </div>
    </Link>
  )
}
