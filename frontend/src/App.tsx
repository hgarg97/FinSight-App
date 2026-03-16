import { useEffect, useState } from 'react'

interface HealthResponse {
  status: string
  app: string
}

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then(setHealth)
      .catch(() => setError('Backend unreachable'))
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-5xl font-bold text-gray-900">FinSight</h1>
      <p className="mt-4 text-lg text-gray-500">
        {error
          ? error
          : health
          ? `${health.app} — ${health.status}`
          : 'Checking backend...'}
      </p>
    </div>
  )
}
