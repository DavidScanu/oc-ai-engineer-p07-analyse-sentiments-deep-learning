'use client'

import { useEffect } from 'react'

export default function BootstrapClient() {
  useEffect(() => {
    // Import Bootstrap JS uniquement côté client
    require('bootstrap/dist/js/bootstrap.bundle.min.js')
  }, [])

  return null
}