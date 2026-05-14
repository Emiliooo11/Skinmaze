import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-gradient">Skinmaze</h1>
        <p className="text-muted text-lg">CS2 Cases & Marketplace</p>
      </div>

      <div className="flex gap-4">
        <Link href="/cases" className="btn-primary">
          Open Cases
        </Link>
        <Link href="/marketplace" className="btn-secondary">
          Marketplace
        </Link>
      </div>

      <p className="text-muted text-sm">Prototype — connecting systems</p>
    </main>
  )
}
