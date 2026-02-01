'use client'

import dynamic from 'next/dynamic'

// Disable SSR for this page completely
const TwitterClaimContent = dynamic(
  () => import('./TwitterClaimContent'),
  { ssr: false, loading: () => <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-4xl">⏳</div></div> }
)

export default function TwitterClaimPage() {
  return <TwitterClaimContent />
}
