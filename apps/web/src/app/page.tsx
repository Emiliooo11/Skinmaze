import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-24 flex flex-col items-center text-center gap-8">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
            Open <span className="text-gradient">CS2 Cases</span>
          </h1>
          <p className="text-xl text-muted max-w-xl mx-auto">
            Provably fair case openings. Real CS2 skins. Instant marketplace.
          </p>
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/cases" className="btn-primary text-base px-6 py-3">
            Browse Cases
          </Link>
          <Link href="/marketplace" className="btn-secondary text-base px-6 py-3">
            Marketplace
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-8 border border-border rounded-2xl bg-surface/50 px-12 py-6">
          {[
            { label: 'Cases Opened', value: '0' },
            { label: 'Skins Available', value: '11' },
            { label: 'House Edge', value: '7%' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-sm text-muted">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
