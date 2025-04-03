'use client'

import { useState, useEffect, useRef } from 'react'
import { useActionState } from 'react'
import { predictSentiment } from '@/utils/actions'
import ResultCard from '@/components/ResultCard'
import ExampleTweets from '@/components/ExampleTweets'

// Server Action modifiée pour useActionState
async function analyzeTweet(previousState, formData) {
  try {
    const text = formData.get('tweet')?.trim()
    
    if (!text) {
      return { 
        error: 'Veuillez entrer un texte à analyser',
        result: null
      }
    }
    
    const prediction = await predictSentiment(text)
    
    return { 
      result: prediction, 
      error: null, 
      submittedText: text 
    }
  } catch (err) {
    console.error('Erreur lors de la prédiction:', err)
    return { 
      error: 'Erreur lors de l\'analyse. Veuillez réessayer.',
      result: null
    }
  }
}

export default function TweetForm() {
  // État local
  const [tweetText, setTweetText] = useState('')
  const [history, setHistory] = useState([])
  const [historyExpanded, setHistoryExpanded] = useState(false)
  
  // Référence pour stocker la dernière prédiction traitée
  const lastProcessedPrediction = useRef(null)
  
  // useActionState pour gérer l'état de la prédiction
  const [predictionState, formAction, isPending] = useActionState(analyzeTweet, {
    result: null,
    error: null,
    submittedText: ''
  })
  
  // Charger l'historique depuis localStorage après le montage du composant
  useEffect(() => {
    const savedHistory = localStorage.getItem('tweetHistory')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Erreur lors du chargement de l\'historique:', e)
        localStorage.removeItem('tweetHistory')
      }
    }
  }, [])
  
  // Mettre à jour l'historique quand une nouvelle prédiction est reçue
  useEffect(() => {
    // Vérifier si c'est une nouvelle prédiction
    if (predictionState.result && 
        predictionState.submittedText &&
        (!lastProcessedPrediction.current || 
         lastProcessedPrediction.current !== predictionState.result)) {
      
      // Mettre à jour la référence pour éviter de traiter plusieurs fois la même prédiction
      lastProcessedPrediction.current = predictionState.result
      
      // Ajouter à l'historique
      const newHistoryItem = {
        id: Date.now(),
        tweet: predictionState.submittedText,
        result: predictionState.result,
        timestamp: new Date().toISOString()
      }
      
      // Mise à jour de l'historique en utilisant la fonction de mise à jour de state
      // pour éviter la dépendance cyclique
      setHistory(prevHistory => {
        const updatedHistory = [newHistoryItem, ...prevHistory].slice(0, 10)
        
        // Sauvegarder dans localStorage
        localStorage.setItem('tweetHistory', JSON.stringify(updatedHistory))
        
        return updatedHistory
      })
      
      // Réinitialiser le champ de texte
      setTweetText('')
    }
  }, [predictionState.result, predictionState.submittedText]) // Retirer history des dépendances
  
  // Fonction pour utiliser un tweet de l'historique
  function useHistoryItem(item) {
    setTweetText(item.tweet)
  }
  
  // Fonction pour effacer l'historique
  function clearHistory() {
    setHistory([])
    localStorage.removeItem('tweetHistory')
  }
  
  // Fonction pour utiliser un exemple de tweet
  const handleSelectExample = (exampleText) => {
    setTweetText(exampleText)
    document.getElementById('tweet')?.focus()
  }
  
  return (
    <div className="tweet-form">
      <form action={formAction} className="mb-4">
        <div className="mb-3">
          <label htmlFor="tweet" className="form-label fw-bold">Votre tweet à analyser</label>
          <div className="input-group mb-3">
            <textarea
              id="tweet"
              name="tweet"
              className="form-control"
              rows="4"
              placeholder="Entrez ici le texte de votre tweet..."
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              required
            ></textarea>
            <button 
              className="btn btn-outline-secondary" 
              type="button"
              onClick={() => setTweetText('')}
              title="Effacer le texte"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          
          <div className="d-flex justify-content-between align-items-center mt-2">
            <div>
              <button 
                type="button" 
                className="btn btn-sm btn-outline-secondary me-2"
                data-bs-toggle="collapse" 
                data-bs-target="#examplesCollapse"
                aria-expanded="false"
              >
                <i className="bi bi-lightbulb me-1"></i>
                Voir des exemples
              </button>
            </div>
            <small className="text-muted">
              {tweetText.length} caractères
            </small>
          </div>
        </div>
        
        <div className="collapse mb-3" id="examplesCollapse">
          <ExampleTweets onSelectExample={handleSelectExample} />
        </div>
        
        {predictionState.error && (
          <div className="alert alert-danger" role="alert">
            {predictionState.error}
          </div>
        )}
        
        <div className="d-grid gap-2">
          <button 
            type="submit" 
            className="btn btn-primary w-100"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Analyse en cours...
              </>
            ) : (
              'Analyser le Sentiment'
            )}
          </button>
        </div>
      </form>

      {/* Affichage du résultat */}
      {isPending ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2">Analyse du sentiment en cours...</p>
        </div>
      ) : predictionState.result && (
        <ResultCard 
          result={predictionState.result} 
          tweetText={predictionState.submittedText} 
        />
      )}
      
      {/* Historique des prédictions */}
      {history.length > 0 && (
        <div className="mt-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="h5">Historique des analyses</h3>
            <div>
              <button 
                className="btn btn-sm btn-outline-secondary me-2" 
                onClick={() => setHistoryExpanded(!historyExpanded)}
              >
                {historyExpanded ? 'Masquer' : 'Afficher'}
              </button>
              <button 
                className="btn btn-sm btn-outline-danger" 
                onClick={clearHistory}
              >
                Effacer
              </button>
            </div>
          </div>
          
          {historyExpanded && (
            <div className="list-group">
              {history.map((item) => (
                <div 
                  key={item.id}
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                    item.result.sentiment === 'Positif' ? 'list-group-item-success' : 'list-group-item-danger'
                  }`}
                >
                  <div className="ms-2 me-auto">
                    <div className="fw-bold text-truncate" style={{ maxWidth: '300px' }}>
                      {item.tweet}
                    </div>
                    <small>
                      {new Date(item.timestamp).toLocaleString('fr-FR')} - 
                      {item.result.sentiment} ({Math.round(item.result.confidence * 100)}%)
                    </small>
                  </div>
                  <button 
                    className="btn btn-sm btn-outline-primary" 
                    onClick={() => useHistoryItem(item)}
                  >
                    Réutiliser
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}