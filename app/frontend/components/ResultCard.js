'use client'

import { useEffect, useState } from 'react'
import FeedbackForm from './FeedbackForm'

export default function ResultCard({ result, tweetText = '' }) {
  const [animate, setAnimate] = useState(false)
  
  useEffect(() => {
    // Déclencher l'animation à chaque nouveau résultat
    setAnimate(true)
    
    // Supprimer la classe après l'animation
    const timer = setTimeout(() => setAnimate(false), 500)
    return () => clearTimeout(timer)
  }, [result])
  
  if (!result) return null

  const isPositive = result.sentiment === 'Positif'
  const confidencePercentage = Math.round(result.confidence * 100)
  
  // Déterminer l'emoji en fonction du sentiment et du niveau de confiance
  let emoji
  if (isPositive) {
    if (confidencePercentage > 90) emoji = '😄'
    else if (confidencePercentage > 75) emoji = '😊'
    else emoji = '🙂'
  } else {
    if (confidencePercentage > 90) emoji = '😠'
    else if (confidencePercentage > 75) emoji = '😕'
    else emoji = '🙁'
  }

  return (
    <div className={`card shadow result-card ${animate ? 'fade-in' : ''} ${isPositive ? 'positif-bg' : 'negatif-bg'}`}>
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          <div className="display-4 me-3">{emoji}</div>
          <div>
            <h5 className="card-title h4">Sentiment {result.sentiment}</h5>
            <p className="card-text mb-0">
              Niveau de confiance: <strong>{confidencePercentage}%</strong>
            </p>
          </div>
        </div>
        
        <div className="confidence-bar mb-3">
          <div 
            className={`confidence-bar-fill ${isPositive ? 'positif-bar' : 'negatif-bar'}`}
            style={{ width: `${confidencePercentage}%` }}
          ></div>
        </div>

        <div className='tweet-text mt-4 mb-2'>
          <h6 className="card-subtitle mb-2 text-muted">Analyse du Tweet</h6>
          <blockquote className="blockquote mb-0 border rounded p-3 bg-light text-body-secondary">
            <p className="blockquote-text">
              <strong className='fw-bold'>{tweetText}</strong>
            </p>
          </blockquote>
        </div>

        <div className="card-text text-muted small">
          <p>
            {isPositive 
              ? `Ce tweet est perçu comme positif avec une confiance de ${confidencePercentage}%. Le modèle a détecté des éléments linguistiques généralement associés à une expression positive.`
              : `Ce tweet est perçu comme négatif avec une confiance de ${confidencePercentage}%. Le modèle a détecté des éléments linguistiques généralement associés à une expression négative.`
            }
          </p>
          
          <div className="mt-3 text-muted small">
            <strong>Note :</strong> Cette analyse est basée sur un modèle d'apprentissage automatique
            qui peut commettre des erreurs. Le score brut de prédiction est de {result.raw_score.toFixed(4)}.
          </div>
        </div>
        
        {/* Intégration du composant FeedbackForm */}
        <FeedbackForm tweetText={tweetText} prediction={result} />
      </div>
    </div>
  )
}