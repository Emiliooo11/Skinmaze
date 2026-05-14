export default function ProvablyFairPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Provably Fair</h1>
        <p className="text-muted">Every case opening on Skinmaze is verifiably fair</p>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">How it works</h2>
        <div className="space-y-3 text-sm text-muted leading-relaxed">
          <p>
            Before each case opening, the server generates a <span className="text-white">Server Seed</span> and
            publishes its SHA256 hash to you. This proves the seed existed before your roll.
          </p>
          <p>
            You provide a <span className="text-white">Client Seed</span> (or we generate one). Combined with a
            <span className="text-white"> Nonce</span> (incrementing counter), these three values are hashed
            together using HMAC-SHA256.
          </p>
          <p>
            The resulting hash is converted into a number that determines your winning item.
            After rotating your seed, the original server seed is revealed — allowing you to
            verify every historical roll.
          </p>
        </div>
      </div>

      <div className="card p-6 space-y-3">
        <h2 className="text-lg font-semibold text-white">The formula</h2>
        <code className="block bg-surface-3 rounded-lg p-4 text-sm text-primary font-mono">
          roll = HMAC-SHA256(serverSeed, clientSeed + &quot;:&quot; + nonce)
        </code>
        <p className="text-sm text-muted">
          The first 8 hex characters of the result are converted to a decimal and
          divided by 0xFFFFFFFF to produce a number between 0 and 1, which maps
          to the weighted item pool.
        </p>
      </div>

      <div className="card p-6 space-y-3">
        <h2 className="text-lg font-semibold text-white">Verify a roll</h2>
        <p className="text-sm text-muted">
          Sign in with Steam to view your seed history and verify any past opening.
        </p>
        <a href="/api/auth/steam" className="btn-primary inline-block text-sm">
          Sign in with Steam
        </a>
      </div>
    </div>
  )
}
