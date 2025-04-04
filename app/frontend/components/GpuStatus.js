'use client'

import { useState, useEffect } from 'react'
import { getApiInfo } from '@/utils/actions'

export default function GpuStatus() {
  const [status, setStatus] = useState('loading') // 'loading', 'available', 'unavailable'
  const [tfVersion, setTfVersion] = useState('')
  const [devices, setDevices] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const result = await getApiInfo()
        
        if (result.status && result.data) {
          // Récupérer les informations
          setTfVersion(result.data.tensorflow_version || 'Non spécifié')
          setDevices(result.data.devices_available || [])
          
          // Vérifier si un GPU est disponible
          const gpuAvailable = result.data.using_gpu || 
                              (result.data.devices_available && 
                               result.data.devices_available.some(device => device.toLowerCase().includes('gpu')))
          
          setStatus(gpuAvailable ? 'available' : 'unavailable')
          setMessage(gpuAvailable 
            ? 'GPU détecté et disponible pour les calculs' 
            : 'Aucun GPU détecté, modèle s\'exécutant sur CPU')
        } else {
          setStatus('unavailable')
          setMessage('Impossible de récupérer les informations sur les dispositifs')
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des informations:', error)
        setStatus('unavailable')
        setMessage('Erreur lors de la récupération des informations')
      }
    }

    // Vérifier immédiatement puis toutes les 60 secondes
    fetchInfo()
    const interval = setInterval(fetchInfo, 60000)
    
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
    case 'available':
      badgeClass += 'bg-success'
      iconClass = 'bi bi-gpu-card me-1'
      break
    case 'unavailable':
      badgeClass += 'bg-warning text-dark'
      iconClass = 'bi bi-cpu me-1'
      break
  }

  return (
    <div className="gpu-status mb-1">
      <div className={badgeClass}>
        <span className={iconClass} role="status" aria-hidden="true"></span>
        {status === 'loading' ? 'Vérification des dispositifs...' : 
          status === 'available' ? 'GPU disponible' : 'Mode CPU uniquement'}
      </div>
      
      {status !== 'loading' && (
        <div className="mt-1 small text-muted">
          TensorFlow v{tfVersion}
        </div>
      )}
    </div>
  )
}