'use client'

import { useState } from 'react'

export default function FeedbackForm({ tweetText, prediction }) {
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [feedbackValue, setFeedbackValue] = useState(null)
  
  // Dans une application réelle, cette fonction enverrait les données à Application Insights
  // ou à un autre système de télémétrie pour le suivi des performances du modèle
  const sendFeedback = (isCorrect) => {
    // Simulation d'envoi de données
    console.log('Feedback envoyé:', {
      tweet: tweetText,
      prediction: prediction.sentiment,
      confidence: prediction.confidence,
      userFeedback: isCorrect ? 'correct' : 'incorrect',
      timestamp: new Date().toISOString()
    })
    
    // Enregistrer le type de feedback
    setFeedbackValue(isCorrect)
    
    // Marquer le feedback comme envoyé
    setFeedbackSent(true)
    
    // Dans une implémentation réelle, on enverrait une requête au backend ici
    // pour enregistrer le feedback et potentiellement alerter en cas de prédictions incorrectes
  }
  
  if (!tweetText || !prediction) return null
  
  return (
    <div className="mt-4 border-top pt-3">
      <h5 className="mb-3">Cette prédiction est-elle correcte?</h5>
      
      {feedbackSent ? (
        <div className={`alert ${feedbackValue ? 'alert-success' : 'alert-secondary'}`}>
          <i className={`bi ${feedbackValue ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'} me-2`}></i>
          {feedbackValue 
            ? 'Merci pour votre confirmation! Votre feedback contribue à améliorer notre modèle.' 
            : 'Merci pour votre feedback. Nous utiliserons cette information pour améliorer notre modèle.'}
        </div>
      ) : (
        <div className="d-flex">
          <button 
            className="btn btn-outline-success me-2" 
            onClick={() => sendFeedback(true)}
          >
            <i className="bi bi-hand-thumbs-up me-1"></i>
            Oui, c'est correct
          </button>
          <button 
            className="btn btn-outline-danger" 
            onClick={() => sendFeedback(false)}
          >
            <i className="bi bi-hand-thumbs-down me-1"></i>
            Non, c'est incorrect
          </button>
        </div>
      )}
      
      {feedbackSent && !feedbackValue && (
        <div className="mt-3">
          <label htmlFor="correctionFeedback" className="form-label">
            Comment auriez-vous classé ce tweet?
          </label>
          <select 
            id="correctionFeedback" 
            className="form-select"
            defaultValue=""
          >
            <option value="" disabled>Sélectionnez une option</option>
            <option value="positive">Positif</option>
            <option value="negative">Négatif</option>
            <option value="neutral">Neutre</option>
            <option value="mixed">Mixte (contient des éléments positifs et négatifs)</option>
          </select>
          
          <div className="mt-3">
            <label htmlFor="additionalFeedback" className="form-label">
              Commentaires additionnels (optionnel)
            </label>
            <textarea 
              id="additionalFeedback" 
              className="form-control" 
              rows="2"
              placeholder="Expliquez pourquoi vous pensez que la prédiction est incorrecte..."
            ></textarea>
            
            <button className="btn btn-primary mt-2">
              Envoyer les détails
            </button>
          </div>
        </div>
      )}
    </div>
  )
}