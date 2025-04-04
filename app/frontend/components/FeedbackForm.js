'use client'

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid';

export default function FeedbackForm({ tweetText, prediction }) {
  const [feedbackStatus, setFeedbackStatus] = useState('none') // 'none', 'positive', 'negative', 'submitted'
  const [correctionType, setCorrectionType] = useState('')
  const [comments, setComments] = useState('')
  
  // Vérifier si le feedback a déjà été envoyé pour cette prédiction
  useEffect(() => {
    const feedbackHistory = JSON.parse(localStorage.getItem('feedbackHistory') || '{}')
    const predictionId = `${tweetText}_${prediction?.timestamp || Date.now()}`
    
    if (feedbackHistory[predictionId]) {
      // Si cette prédiction a déjà reçu un feedback
      setFeedbackStatus('submitted')
      
      // Récupérer les valeurs sauvegardées si elles existent
      if (feedbackHistory[predictionId].correctionType) {
        setCorrectionType(feedbackHistory[predictionId].correctionType)
      }
      if (feedbackHistory[predictionId].comments) {
        setComments(feedbackHistory[predictionId].comments)
      }
    } else {
      // Réinitialiser pour une nouvelle prédiction
      setFeedbackStatus('none')
      setCorrectionType('')
      setComments('')
    }
  }, [tweetText, prediction])
  
  // Soumettre un feedback positif (prédiction correcte)
  const submitPositiveFeedback = () => {
    if (feedbackStatus === 'submitted') return; // Éviter les soumissions multiples
    
    // Sauvegarder le feedback
    saveFeedback(true)
    
    // Mettre à jour l'état
    setFeedbackStatus('submitted')
  }
  
  // Préparer le formulaire pour un feedback négatif
  const prepareFeedbackForm = () => {
    setFeedbackStatus('negative')
  }
  
  // Soumettre le feedback négatif complet
  const submitNegativeFeedback = (e) => {
    e.preventDefault()
    
    if (!correctionType) {
      alert('Veuillez sélectionner comment vous auriez classé ce tweet.')
      return
    }
    
    // Sauvegarder le feedback avec les détails
    saveFeedback(false, correctionType, comments)
    
    // Mettre à jour l'état
    setFeedbackStatus('submitted')
  }
  
  // Fonction commune pour sauvegarder le feedback
  const saveFeedback = async (isPositive, correctionType = '', comments = '') => {
    // Récupérer l'URL de l'API depuis les variables d'environnement
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Générer un ID unique pour ce feedback
    const feedbackId = uuidv4();
    
    // Préparer les données au format attendu par le backend
    const feedbackData = {
      tweet_text: tweetText,
      prediction: prediction.sentiment,
      confidence: prediction.confidence,
      is_correct: isPositive,
      // N'inclure les champs optionnels que s'ils contiennent des données
      ...(correctionType && { corrected_sentiment: correctionType }),
      ...(comments && { comments: comments })
    };
    
    console.log('Feedback préparé:', feedbackData);
    
    // Enregistrer dans l'historique local
    const feedbackHistory = JSON.parse(localStorage.getItem('feedbackHistory') || '{}');
    
    feedbackHistory[feedbackId] = {
      isCorrect: isPositive,
      correctionType,
      comments,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('feedbackHistory', JSON.stringify(feedbackHistory));
    
    // Envoyer au backend
    try {
      const response = await fetch(`${apiUrl}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });
      
      if (!response.ok) {
        console.error('Erreur lors de l\'envoi du feedback au serveur:', await response.text());
        return false;
      } else {
        console.log('Feedback envoyé avec succès au serveur');
        return true;
      }
    } catch (error) {
      console.error('Erreur de connexion lors de l\'envoi du feedback:', error);
      return false;
    }
  };
  
  // Si pas de prédiction, ne rien afficher
  if (!tweetText || !prediction) return null
  
  // Si le feedback a déjà été soumis
  if (feedbackStatus === 'submitted') {
    return (
      <div className="mt-4 border-top pt-3">
        <div className="alert alert-success">
          <i className="bi bi-check-circle-fill me-2"></i>
          Merci pour votre feedback! Vos commentaires nous aident à améliorer notre modèle.
        </div>
      </div>
    )
  }
  
  // Si on est en train de remplir un feedback négatif
  if (feedbackStatus === 'negative') {
    return (
      <div className="mt-4 border-top pt-3">
        <h5 className="mb-3">Feedback sur la prédiction</h5>
        <form onSubmit={submitNegativeFeedback}>
          <div className="mb-3">
            <label htmlFor="correctionType" className="form-label">
              Comment classeriez-vous ce tweet?
            </label>
            <select 
              id="correctionType" 
              className="form-select"
              value={correctionType}
              onChange={(e) => setCorrectionType(e.target.value)}
              required
            >
              <option value="" disabled>Sélectionnez une option</option>
              <option value="positive">Positif</option>
              <option value="negative">Négatif</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label htmlFor="comments" className="form-label">
              Commentaires additionnels (optionnel)
            </label>
            <textarea 
              id="comments" 
              className="form-control" 
              rows="2"
              placeholder="Pourquoi pensez-vous que cette prédiction est incorrecte?"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            ></textarea>
          </div>
          
          <div className="d-flex">
            <button 
              type="submit" 
              className="btn btn-primary me-2"
            >
              Envoyer le feedback
            </button>
            <button 
              type="button" 
              className="btn btn-outline-secondary"
              onClick={() => setFeedbackStatus('none')}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    )
  }
  
  // Affichage par défaut - boutons initial de feedback
  return (
    <div className="mt-4 border-top pt-3">
      <h5 className="mb-3">Cette prédiction est-elle correcte?</h5>
      <div className="d-flex">
        <button 
          className="btn btn-outline-success me-2" 
          onClick={submitPositiveFeedback}
        >
          <i className="bi bi-hand-thumbs-up me-1"></i>
          Oui, c'est correct
        </button>
        <button 
          className="btn btn-outline-danger" 
          onClick={prepareFeedbackForm}
        >
          <i className="bi bi-hand-thumbs-down me-1"></i>
          Non, c'est incorrect
        </button>
      </div>
    </div>
  )
}