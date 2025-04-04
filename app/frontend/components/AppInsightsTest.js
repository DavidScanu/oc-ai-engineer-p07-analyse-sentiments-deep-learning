'use client'

import { useState } from 'react'
import { testAppInsightsConnection } from '@/utils/actions'

export default function AppInsightsTest() {
  const [status, setStatus] = useState(null) // null, 'success', 'error', 'loading'
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleTestConnection = async () => {
    try {
      setStatus('loading')
      setMessage('Test de connexion en cours...')
      setDetails(null)
      setIsModalOpen(true)
      
      const result = await testAppInsightsConnection()
      
      setStatus(result.status ? 'success' : 'error')
      setMessage(result.message)
      setDetails(result.details)
    } catch (error) {
      console.error('Erreur lors du test:', error)
      setStatus('error')
      setMessage(`Erreur inattendue: ${error.message}`)
      setDetails(null)
    }
  }

  const toggleDetails = () => {
    setIsExpanded(!isExpanded)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    // Réinitialiser l'état après la fermeture
    setTimeout(() => {
      setStatus(null)
      setMessage('')
      setDetails(null)
      setIsExpanded(false)
    }, 300) // Attendre la fin de l'animation
  }

  // Classes pour les différents états
  const getHeaderClasses = () => {
    if (status === 'success') return 'bg-success text-white'
    if (status === 'error') return 'bg-danger text-white'
    return 'bg-primary text-white'
  }

  return (
    <>
      {/* Bouton dans le coin inférieur gauche */}
      <div className="" style={{ zIndex: 9000 }}>
        <button 
          className="btn btn-sm btn-outline-primary"
          onClick={handleTestConnection}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ) : (
            <><i className="bi bi-cloud-check me-1"></i> Test Application Insights</>
          )}
        </button>
      </div>

      {/* Modal overlay */}
      {isModalOpen && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          zIndex: 9999 
        }}>
          <div className="card shadow" style={{ maxWidth: '500px', width: '90%' }}>
            <div className={`card-header d-flex justify-content-between align-items-center ${getHeaderClasses()}`}>
              <h5 className="mb-0">
                {status === 'success' && <i className="bi bi-check-circle me-2"></i>}
                {status === 'error' && <i className="bi bi-exclamation-triangle-fill me-2"></i>}
                {status === 'loading' && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
                Test Application Insights
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                aria-label="Fermer" 
                onClick={closeModal}
              ></button>
            </div>
            <div className="card-body">
              {status === 'loading' ? (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <p>{message}</p>
                </div>
              ) : (
                <>
                  <p className="card-text">{message}</p>
                  
                  {details && (
                    <div className="mt-3">
                      <button 
                        className="btn btn-sm btn-outline-secondary" 
                        onClick={toggleDetails}
                      >
                        {isExpanded ? 'Masquer les détails' : 'Afficher les détails'}
                      </button>
                      
                      {isExpanded && (
                        <div className="mt-2">
                          <pre className="bg-light p-3 rounded small" style={{ maxHeight: '200px', overflow: 'auto' }}>
                            {JSON.stringify(details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {status === 'success' && (
                    <div className="alert alert-info mt-3 small">
                      <i className="bi bi-info-circle me-2"></i>
                      Les données de test ont été envoyées à Application Insights. Vérifiez le portail Azure pour confirmer la réception.
                    </div>
                  )}
                  
                  {status === 'error' && (
                    <div className="alert alert-warning mt-3 small">
                      <i className="bi bi-exclamation-circle me-2"></i>
                      Vérifiez que la clé d'instrumentation est correctement configurée dans les variables d'environnement.
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="card-footer d-flex justify-content-end">
              <button className="btn btn-secondary" onClick={closeModal}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}