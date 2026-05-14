'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import type { User } from '@skinmaze/shared'

export function useAuth() {
  const { user, isLoading, setUser, setLoading } = useAuthStore()

  const { data, isPending } = useQuery<User>({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then((r) => r.data),
    retry: false,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (!isPending) {
      setUser(data ?? null)
      setLoading(false)
    }
  }, [data, isPending, setUser, setLoading])

  return { user, isLoading: isPending }
}
