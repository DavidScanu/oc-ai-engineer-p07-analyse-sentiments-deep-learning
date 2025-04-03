'use client'

import { useState } from 'react'
import { predictSentimentBatch } from '@/utils/actions'
import BootstrapClient from '@/components/BootstrapClient'

export default function ComparePage() {
  const [tweets, setTweets] = useState(['', ''])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleTweetChange = (index, value) => {
    const newTweets = [...tweets]
    newTweets[index] = value
    setTweets(newTweets)
  }

  const addTweetField = () => {
    setTweets([...tweets, ''])
  }

  const removeTweetField = (index) => {
    if (tweets.length <= 2) return
    const newTweets = [...tweets]
    newTweets.splice(index, 1)
    setTweets(newTweets)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Vérifier si tous les champs sont remplis
    const emptyFields = tweets.some(tweet => !tweet.trim())
    if (emptyFields) {
      setError('Veuillez remplir tous les champs de tweets.')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await predictSentimentBatch(tweets)
      setResults(response.results)
    } catch (err) {
      console.error('Erreur lors de la prédiction par lot:', err)
      setError('Une erreur est survenue lors de l\'analyse. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <BootstrapClient />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <h1 className="display-5 fw-bold text-primary mb-4">Comparaison de Tweets</h1>
            <p className="lead">
              Comparez les sentiments de plusieurs tweets simultanément pour mieux comprendre les nuances
              de perception de vos communications.
            </p>
            
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {tweets.map((tweet, index) => (
                    <div key={index} className="mb-3">
                      <label className="form-label fw-semibold">
                        Tweet {index + 1}
                      </label>
                      <div className="input-group">
                        <textarea
                          className="form-control"
                          rows="3"
                          placeholder={`Entrez le texte du tweet ${index + 1}...`}
                          value={tweet}
                          onChange={(e) => handleTweetChange(index, e.target.value)}
                        ></textarea>
                        {tweets.length > 2 && (
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => removeTweetField(index)}
                            title="Supprimer ce tweet"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div className="d-flex mb-4">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary" 
                      onClick={addTweetField}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Ajouter un tweet
                    </button>
                  </div>
                  
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}
                  
                  <div className="d-grid gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Analyse en cours...
                        </>
                      ) : (
                        'Comparer les sentiments'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            
            {results && (
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-primary text-white">
                  <h2 className="h5 mb-0">Résultats de la comparaison</h2>
                </div>
                <div className="card-body">
                  {results.map((result, index) => {
                    const isPositive = result.sentiment === 'Positif'
                    const confidencePercentage = Math.round(result.confidence * 100)
                    
                    return (
                      <div key={index} className="mb-4">
                        <div className="d-flex align-items-center mb-2">
                          <span className="badge bg-secondary me-2">Tweet {index + 1}</span>
                          <h3 className="h6 mb-0">
                            <span className="text-truncate">{tweets[index].substring(0, 50)}{tweets[index].length > 50 ? '...' : ''}</span>
                          </h3>
                        </div>
                        
                        <div className={`alert ${isPositive ? 'alert-success' : 'alert-danger'} d-flex align-items-center`}>
                          <div className="me-3 fs-4">
                            {isPositive ? '😊' : '😠'}
                          </div>
                          <div>
                            <strong>Sentiment: {result.sentiment}</strong>
                            <div className="progress mt-2" style={{ height: '8px' }}>
                              <div 
                                className={`progress-bar ${isPositive ? 'bg-success' : 'bg-danger'}`}
                                role="progressbar" 
                                style={{ width: `${confidencePercentage}%` }}
                                aria-valuenow={confidencePercentage} 
                                aria-valuemin="0" 
                                aria-valuemax="100"
                              ></div>
                            </div>
                            <small>Confiance: {confidencePercentage}%</small>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  
                  <div className="mt-4">
                    <h4 className="h5 mb-3">Analyse comparative</h4>
                    
                    {/* Compteurs de sentiments */}
                    <div className="row text-center mb-4">
                      <div className="col-6">
                        <div className="card bg-success bg-opacity-10">
                          <div className="card-body py-3">
                            <h5 className="display-4 fw-bold text-success">
                              {results.filter(r => r.sentiment === 'Positif').length}
                            </h5>
                            <p className="mb-0">Tweets positifs</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="card bg-danger bg-opacity-10">
                          <div className="card-body py-3">
                            <h5 className="display-4 fw-bold text-danger">
                              {results.filter(r => r.sentiment === 'Négatif').length}
                            </h5>
                            <p className="mb-0">Tweets négatifs</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Graphique simple */}
                    <div className="progress mt-3" style={{ height: '30px' }}>
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ 
                          width: `${(results.filter(r => r.sentiment === 'Positif').length / results.length) * 100}%` 
                        }}
                      >
                        Positifs
                      </div>
                      <div
                        className="progress-bar bg-danger"
                        role="progressbar"
                        style={{ 
                          width: `${(results.filter(r => r.sentiment === 'Négatif').length / results.length) * 100}%` 
                        }}
                      >
                        Négatifs
                      </div>
                    </div>
                    
                    <div className="alert alert-info mt-4">
                      <i className="bi bi-info-circle-fill me-2"></i>
                      <strong>Conseil:</strong> Pour une communication optimale, privilégiez les formulations qui obtiennent un sentiment positif avec une confiance élevée.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}