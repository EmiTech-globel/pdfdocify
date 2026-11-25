'use client'
import {useEffect} from 'react'
import {useRouter} from 'next/navigation'

// Re-checks the payment every few seconds for a minute or so, for bank transfer and USSD payments that confirm late.
export default function AutoRefresh({every = 6000, times = 10}: {every?: number; times?: number}) {
  const router = useRouter()
  useEffect(() => {
    let n = 0
    const t = setInterval(() => {
      if (++n > times) return clearInterval(t)
      router.refresh()
    }, every)
    return () => clearInterval(t)
  }, [every, times, router])
  return null
}
