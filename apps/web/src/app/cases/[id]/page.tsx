'use client'

import { use } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useCase, useOpenCase } from '@/hooks/use-cases'
import { useAuth } from '@/hooks/use-auth'
import { CaseOpener } from '@/components/cases/case-opener'
import { SkinCard } from '@/components/cases/skin-card'
import { formatPrice } from '@/lib/utils'

export default function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: caseData, isPending, error } = useCase(id)
  const { user } = useAuth()
  const { mutateAsync: openCase, isPending: isOpening } = useOpenCase()

  if (isPending) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <div className="h-8 w-48 bg-surface rounded-lg animate-pulse" />
        <div className="h-64 bg-surface rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-center">
        <p className="text-muted">Case not found.</p>
        <Link href="/cases" className="btn-secondary mt-4 inline-block">Back to Cases</Link>
      </div>
    )
  }

  const handleOpen = async () => {
    if (!user) {
      toast.error('Sign in with Steam to open cases')
      return Promise.reject()
    }
    try {
      const result = await openCase(caseData.id)
      toast.success(`You won ${result.skin.skinName}!`)
      return result
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to open case'
      toast.error(msg)
      throw err
    }
  }

  const sortedItems = [...caseData.items].sort(
    (a, b) => a.probabilityWeight - b.probabilityWeight,
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link href="/cases" className="hover:text-white transition-colors">Cases</Link>
        <span>/</span>
        <span className="text-white">{caseData.name}</span>
      </div>

      {/* Case info */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="text-8xl">📦</div>
          <h1 className="text-2xl font-bold text-white">{caseData.name}</h1>
          <p className="text-muted text-sm">{caseData.items.length} possible items</p>
        </div>

        <div className="flex-1 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Case Price', value: formatPrice(caseData.price) },
              { label: 'House Edge', value: `${(caseData.houseEdge * 100).toFixed(0)}%` },
              { label: 'Avg. Payout', value: formatPrice(caseData.price * (1 - caseData.houseEdge)) },
            ].map(({ label, value }) => (
              <div key={label} className="card p-4 text-center">
                <p className="text-lg font-bold text-white">{value}</p>
                <p className="text-xs text-muted">{label}</p>
              </div>
            ))}
          </div>

          {/* Opener */}
          <div className="card p-6">
            {!user && (
              <div className="text-center mb-4 p-3 rounded-lg bg-surface-2 border border-border">
                <p className="text-sm text-muted">
                  <a href="/api/auth/steam" className="text-primary hover:underline">Sign in with Steam</a>
                  {' '}to open cases
                </p>
              </div>
            )}
            <CaseOpener
              caseData={caseData}
              onOpen={handleOpen}
              isOpening={isOpening}
              disabled={!user}
            />
          </div>
        </div>
      </div>

      {/* Contents */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Case Contents</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {sortedItems.map((item) => (
            <SkinCard
              key={item.skinId}
              skin={item.skin}
              odds={item.displayedOdds}
            />
          ))}
        </div>
      </div>

      {/* Provably fair notice */}
      <div className="card p-4 flex items-center gap-3 text-sm">
        <span className="text-green-400 text-xl">✓</span>
        <div>
          <p className="text-white font-medium">Provably Fair</p>
          <p className="text-muted text-xs">
            Every roll is verifiable.{' '}
            <Link href="/provably-fair" className="text-primary hover:underline">
              Learn how it works →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
