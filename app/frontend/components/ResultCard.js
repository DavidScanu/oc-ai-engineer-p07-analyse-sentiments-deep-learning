'use client'

import { useEffect, useState } from 'react'

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
        
        <div className="card-text">
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
        
        <div className="mt-4 border-top pt-3">
          <h5 className="mb-3">Cette prédiction est-elle correcte?</h5>
          <div className="d-flex">
            <button 
              className="btn btn-outline-success me-2" 
              onClick={() => console.log('Feedback positif', { tweet: tweetText, result })}
            >
              <i className="bi bi-hand-thumbs-up me-1"></i>
              Oui, c'est correct
            </button>
            <button 
              className="btn btn-outline-danger" 
              onClick={() => console.log('Feedback négatif', { tweet: tweetText, result })}
            >
              <i className="bi bi-hand-thumbs-down me-1"></i>
              Non, c'est incorrect
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}