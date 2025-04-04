'use client'

import { useState, useEffect } from 'react'
import { checkApiHealth } from '@/utils/actions'

export default function ApiStatus() {
  const [status, setStatus] = useState('loading') // 'loading', 'online', 'offline'
  const [message, setMessage] = useState('')

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await checkApiHealth()
        if (result.status) {
          setStatus('online')
          setMessage(result.data.message || 'API connectée et fonctionnelle')
        } else {
          setStatus('offline')
          setMessage('Impossible de se connecter à l\'API')
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'état de l\'API:', error)
        setStatus('offline')
        setMessage('Erreur de connexion à l\'API')
      }
    }

    // Vérifier immédiatement puis toutes les 30 secondes
    checkStatus()
    const interval = setInterval(checkStatus, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Définir le style basé sur l'état
  let badgeClass = 'badge '
  let iconClass = ''
  
  switch (status) {
    case 'loading':
      badgeClass += 'bg-secondary'
      iconClass = 'spinner-grow spinner-grow-sm me-1'
      break
    case 'online':
      badgeClass += 'bg-success'
      iconClass = 'bi bi-check-circle-fill me-1'
      break
    case 'offline':
      badgeClass += 'bg-danger'
      iconClass = 'bi bi-x-circle-fill me-1'
      break
  }

  return (
    <div className="api-status mb-2">
      <span className={badgeClass}>
        <span className={iconClass} role="status" aria-hidden="true"></span>
        {status === 'loading' ? 'Vérification de l\'API...' : 
          status === 'online' ? 'API en ligne' : 'API hors ligne'}
      </span>
    </div>
  )
}