'use server'

// Récupérer l'URL de l'API depuis les variables d'environnement
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Action pour prédire le sentiment d'un tweet
export async function predictSentiment(text) {
  try {
    // Configuration de la requête vers l'API FastAPI
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
      cache: 'no-store',
    })

    // Vérifier si la requête a réussi
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Erreur API: ${errorData.detail || response.statusText}`)
    }

    // Récupérer et retourner les données
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erreur lors de la prédiction:', error)
    throw new Error(`Échec de la prédiction: ${error.message}`)
  }
}

// Action pour prédire le sentiment de plusieurs tweets (batch)
export async function predictSentimentBatch(texts) {
  try {
    const response = await fetch(`${API_URL}/predict-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ texts }),
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Erreur API: ${errorData.detail || response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la prédiction par lot:', error)
    throw new Error(`Échec de la prédiction par lot: ${error.message}`)
  }
}

// Action pour vérifier la santé de l'API
export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_URL}/health`, {
      cache: 'no-store',
    })
    
    return {
      status: response.ok,
      data: await response.json()
    }
  } catch (error) {
    return {
      status: false,
      error: error.message
    }
  }
}

// Action pour récupérer les informations sur l'API (version TF, GPU, etc.)
export async function getApiInfo() {
  try {
    const response = await fetch(`${API_URL}/info`, {
      cache: 'no-store',
    })
    
    if (!response.ok) {
      return {
        status: false,
        error: response.statusText
      }
    }
    
    return {
      status: true,
      data: await response.json()
    }
  } catch (error) {
    return {
      status: false,
      error: error.message
    }
  }
}

// Action pour tester la connexion à Application Insights
export async function testAppInsightsConnection() {
  try {
    const response = await fetch(`${API_URL}/test-appinsights`, {
      cache: 'no-store',
    })
    
    const data = await response.json()
    
    return {
      status: response.ok,
      message: data.message,
      details: data
    }
  } catch (error) {
    console.error('Erreur lors du test de connexion à Application Insights:', error)
    return {
      status: false,
      message: `Erreur lors du test de connexion: ${error.message}`,
      details: null
    }
  }
}

// Action pour envoyer le feedback utilisateur
export async function sendUserFeedback(feedbackData) {
  try {
    // Vérification des données de feedback
    console.log('Feedback préparé:', feedbackData);
    
    // Envoyer au backend
    const response = await fetch(`${API_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error('Erreur lors de l\'envoi du feedback au serveur:', await response.text());
      return { success: false, error: 'Erreur serveur' };
    }
    
    return { success: true, message: 'Feedback envoyé avec succès au serveur' };
  } catch (error) {
    console.error('Erreur de connexion lors de l\'envoi du feedback:', error);
    return { success: false, error: error.message };
  }
}

// Action pour récupérer des statistiques de modèle (fictif pour la démo)
export async function getModelStats() {
  // Dans une implémentation réelle, ces données viendraient de votre API
  return {
    totalPredictions: 12483,
    accuracy: 0.876,
    positiveTweets: 7629,
    negativeTweets: 4854,
    averageConfidence: 0.83,
    lastUpdated: new Date().toISOString()
  }
}