# Importation des bibliothèques nécessaires
import os
import json
import dill
import pickle
import tempfile
import shutil
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import mlflow
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np
import logging
from pathlib import Path
import requests
from typing import Dict, List, Any

# Importation de NLTK pour le traitement du langage naturel
import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords

# Téléchargez les ressources NLTK nécessaires
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')


# Forcer TensorFlow à utiliser uniquement le CPU
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
tf.config.set_visible_devices([], 'GPU')
physical_devices = tf.config.list_physical_devices('GPU')
if physical_devices:
    try:
        # Désactiver l'allocation de mémoire GPU
        for device in physical_devices:
            tf.config.experimental.set_memory_growth(device, False)
        # Masquer complètement les GPUs
        tf.config.set_visible_devices([], 'GPU')
        logger.info("GPU désactivé avec succès pour TensorFlow.")
    except Exception as e:
        logger.warning(f"Erreur lors de la désactivation du GPU: {str(e)}")

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Chargement des variables d'environnement
load_dotenv()

# Configuration de MLflow
mlflow_tracking_uri = os.getenv("MLFLOW_TRACKING_URI")
run_id = os.getenv("RUN_ID")

# Paramètres par défaut si non spécifiés dans le modèle
MAX_SEQUENCE_LENGTH = 100

# Répertoire local pour sauvegarder les artefacts du modèle
MODEL_DIR = Path("model")
MODEL_DIR.mkdir(exist_ok=True)

# Variable globale pour stocker le modèle chargé
model_pack = None


# Configuration du logging (avant Application Insights)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration d'Azure Application Insights
from opencensus.ext.azure.log_exporter import AzureLogHandler
from applicationinsights import TelemetryClient
from datetime import datetime, timedelta

# Récupérer la clé d'instrumentation depuis les variables d'environnement
appinsights_key = os.getenv("APPINSIGHTS_INSTRUMENTATION_KEY")
telemetry_client = None

if appinsights_key:
    # Configurer le client Application Insights
    telemetry_client = TelemetryClient(appinsights_key)
    logger.info("Azure Application Insights configuré avec succès.")
    
    try:
        # Ajouter un gestionnaire Azure Log Handler
        logger.addHandler(AzureLogHandler(
            connection_string=f'InstrumentationKey={appinsights_key}'
        ))
        logger.info("Azure Application Insights configuré avec succès.")
    except Exception as e:
        logger.warning(f"Erreur lors de la configuration d'Azure Log Handler: {str(e)}")
else:
    logger.warning("Clé d'instrumentation Application Insights non trouvée. La télémétrie ne sera pas envoyée.")



# Définition du gestionnaire de contexte pour le cycle de vie de l'application
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code exécuté au démarrage
    global model_pack
    
    # Télécharger les artefacts si nécessaire
    success = download_artifacts_from_mlflow(run_id, MODEL_DIR)
    if not success:
        logger.error("Impossible de télécharger les artefacts du modèle. L'application ne pourra pas fonctionner correctement.")
    else:
        # Charger le modèle
        try:
            model_pack = load_model()
            logger.info("Modèle chargé avec succès et prêt pour les prédictions.")
        except Exception as e:
            logger.error(f"Erreur lors du chargement du modèle: {str(e)}")
    
    yield  # L'application s'exécute ici
    
    # Code exécuté à l'arrêt
    # Libérer les ressources si nécessaire
    if model_pack is not None and "model" in model_pack:
        logger.info("Libération des ressources du modèle...")
        del model_pack["model"]
        model_pack = None

# Initialisation de l'application FastAPI
app = FastAPI(
    title="API de prédiction de sentiment",
    description="API pour prédire le sentiment (positif/négatif) d'un tweet",
    version="1.0.0",
    lifespan=lifespan
)

# Support CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Origine de ton frontend Next.js
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Modèle de données pour les requêtes
class TweetRequest(BaseModel):
    text: str

# Modèle de données pour une requête de lot
class BatchTweetRequest(BaseModel):
    texts: List[str]

# Modèle de données pour une prédiction individuelle
class SentimentResponse(BaseModel):
    sentiment: str
    confidence: float
    raw_score: float

# Modèle de données pour la réponse par lot
class BatchSentimentResponse(BaseModel):
    results: List[SentimentResponse]

# Modèle de données pour le feedback utilisateur
class FeedbackRequest(BaseModel):
    tweet_text: str
    prediction: str
    confidence: float
    is_correct: bool
    corrected_sentiment: str = ""
    comments: str = ""


# Fonction pour télécharger les artefacts depuis MLflow
# et les sauvegarder localement
def download_artifacts_from_mlflow(run_id: str, model_dir: Path) -> bool:
    """
    Télécharge les artefacts nécessaires depuis MLFlow s'ils n'existent pas déjà.
    
    Args:
        run_id: ID de l'exécution MLFlow
        model_dir: Répertoire où sauvegarder les artefacts
    
    Returns:
        bool: True si le téléchargement a réussi, False sinon
    """
    try:
        logger.info(f"Configuration de MLflow avec l'URI: {mlflow_tracking_uri}")
        mlflow.set_tracking_uri(mlflow_tracking_uri)
        
        # Vérifier si tous les artefacts nécessaires existent déjà
        artifacts_to_check = [
            "local_artifacts/parameters.json",
            "local_artifacts/preprocess_function.dill",
            "local_artifacts/tokenizer.pickle",
            "local_artifacts/final_model_LSTM_Word2Vec-Fige.keras"
        ]
        
        all_exist = True
        for artifact in artifacts_to_check:
            artifact_path = model_dir / Path(artifact).name
            if not artifact_path.exists():
                all_exist = False
                break
                
        if all_exist:
            logger.info("Tous les artefacts existent déjà localement. Pas besoin de télécharger.")
            return True
            
        # Si certains artefacts n'existent pas, télécharger tous les artefacts
        logger.info(f"Téléchargement des artefacts depuis MLflow pour l'exécution {run_id}")
        
        # Créer un répertoire temporaire pour le téléchargement
        with tempfile.TemporaryDirectory() as temp_dir:
            # Télécharger les artefacts dans le répertoire temporaire
            client = mlflow.tracking.MlflowClient()
            for artifact in artifacts_to_check:
                artifact_name = Path(artifact).name
                local_path = Path(temp_dir) / artifact_name
                
                # Télécharger l'artefact depuis MLflow
                artifact_uri = client.get_run(run_id).info.artifact_uri
                artifact_path = f"{artifact_uri}/local_artifacts/{artifact_name}"
                
                # Gestion du préfixe s3:// ou autres protocoles
                if artifact_path.startswith("s3://"):
                    # Utiliser boto3 ou mlflow.artifacts.download_artifacts
                    mlflow.artifacts.download_artifacts(
                        artifact_uri=f"runs:/{run_id}/local_artifacts/{artifact_name}",
                        dst_path=str(local_path.parent)
                    )
                else:
                    # Pour les chemins HTTP ou FILE
                    response = requests.get(artifact_path.replace("file://", ""))
                    with open(local_path, 'wb') as f:
                        f.write(response.content)
                
                # Copier l'artefact dans le répertoire du modèle
                dest_path = model_dir / artifact_name
                shutil.copy(local_path, dest_path)
                logger.info(f"Artefact {artifact_name} téléchargé avec succès.")
        
        logger.info("Tous les artefacts ont été téléchargés avec succès.")
        return True
        
    except Exception as e:
        logger.error(f"Erreur lors du téléchargement des artefacts: {str(e)}")
        return False

# Fonction de prétraitement personnalisée
def custom_preprocess_tweet(tweet):
    """
    Réimplémentation de la fonction de prétraitement.
    """
    # Vérifier si le tweet est une chaîne de caractères
    if not isinstance(tweet, str):
        return ""
    
    # Convertir en minuscules
    tweet = tweet.lower()
    
    # Remplacer les URLs par un token spécial
    tweet = re.sub(r'https?://\S+|www\.\S+', '<URL>', tweet)
    
    # Remplacer les mentions par un token spécial
    tweet = re.sub(r'@\w+', '<MENTION>', tweet)
    
    # Traiter les hashtags (conserver le # comme token séparé et le mot qui suit)
    tweet = re.sub(r'#(\w+)', r'# \1', tweet)
    
    # Supprimer les caractères spéciaux et les nombres, mais garder les tokens spéciaux
    tweet = re.sub(r'[^\w\s<>@#!?]', '', tweet)
    
    # Tokenisation
    tokens = word_tokenize(tweet)
    
    # Lemmatisation
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(token) for token in tokens]
    
    # Supprimer les stopwords, mais conserver les négations importantes
    stop_words = set(stopwords.words('english'))
    important_words = {'no', 'not', 'nor', 'neither', 'never', 'nobody', 'none', 'nothing', 'nowhere'}
    stop_words = stop_words - important_words
    tokens = [token for token in tokens if token not in stop_words]
    
    # Rejoindre les tokens en une chaîne
    return ' '.join(tokens)

# Fonction pour charger le modèle et ses artefacts
def load_model() -> Dict[str, Any]:
    """
    Charge le modèle et tous ses artefacts associés.
    """
    try:
        logger.info("Chargement du modèle et de ses artefacts...")
        
        # Chemins des artefacts
        model_path = MODEL_DIR / "final_model_LSTM_Word2Vec-Fige.keras"
        tokenizer_path = MODEL_DIR / "tokenizer.pickle"
        params_path = MODEL_DIR / "parameters.json"
        
        # Vérifier si les fichiers principaux existent
        for path in [model_path, tokenizer_path, params_path]:
            if not path.exists():
                raise FileNotFoundError(f"Le fichier {path.name} n'existe pas.")
        
        # Charger le modèle
        model = tf.keras.models.load_model(str(model_path))
        
        # Charger le tokenizer
        with open(tokenizer_path, 'rb') as handle:
            tokenizer = pickle.load(handle)
        
        # Utiliser la fonction de prétraitement personnalisée au lieu de charger celle via dill
        preprocess_function = custom_preprocess_tweet
        
        # Charger les paramètres
        with open(params_path, 'r') as f:
            params = json.load(f)
        
        logger.info("Modèle et artefacts chargés avec succès.")
        
        return {
            "model": model,
            "tokenizer": tokenizer,
            "preprocess": preprocess_function,
            "params": params
        }
        
    except Exception as e:
        logger.error(f"Erreur lors du chargement du modèle: {str(e)}")
        raise

# Fonction pour prédire le sentiment d'un texte
def predict_sentiment(text: str, model_pack: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prédit le sentiment d'un texte en utilisant le modèle chargé.
    
    Args:
        text: Texte à analyser
        model_pack: Dictionnaire contenant le modèle et ses artefacts
    
    Returns:
        Dict contenant le sentiment prédit, le niveau de confiance et le score brut
    """
    try:
        model = model_pack["model"]
        tokenizer = model_pack["tokenizer"]
        preprocess = model_pack["preprocess"]
        params = model_pack["params"]
        
        # Prétraiter le texte
        preprocessed_text = preprocess(text)
        
        # Tokeniser et encoder le texte
        tokens = tokenizer.texts_to_sequences([preprocessed_text])
        max_length = params.get("max_sequence_length", MAX_SEQUENCE_LENGTH)
        padded_tokens = pad_sequences(tokens, maxlen=max_length, padding='post', truncating='post')
        
        # Prédire le sentiment
        prediction = model.predict(padded_tokens, verbose=0)[0][0]
        
        # Interpréter la prédiction
        sentiment = "Positif" if prediction >= 0.5 else "Négatif"
        confidence = float(prediction) if prediction >= 0.5 else float(1 - prediction)
        
        return {
            'sentiment': sentiment,
            'confidence': confidence,
            'raw_score': float(prediction)
        }
        
    except Exception as e:
        logger.error(f"Erreur lors de la prédiction: {str(e)}")
        raise

# Fonction pour prédire le sentiment d'un lot de textes
def predict_sentiment_batch(texts: List[str], model_pack: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Prédit le sentiment d'une liste de textes en utilisant le modèle chargé.
    Cette version est optimisée pour le traitement par lot.
    
    Args:
        texts: Liste de textes à analyser
        model_pack: Dictionnaire contenant le modèle et ses artefacts
    
    Returns:
        Liste de dictionnaires contenant les sentiments prédits et les scores
    """
    try:
        model = model_pack["model"]
        tokenizer = model_pack["tokenizer"]
        preprocess = model_pack["preprocess"]
        params = model_pack["params"]
        
        # Prétraiter tous les textes
        preprocessed_texts = [preprocess(text) for text in texts]
        
        # Tokeniser et encoder tous les textes
        tokens = tokenizer.texts_to_sequences(preprocessed_texts)
        max_length = params.get("max_sequence_length", MAX_SEQUENCE_LENGTH)
        padded_tokens = pad_sequences(tokens, maxlen=max_length, padding='post', truncating='post')
        
        # Prédire les sentiments pour tous les textes en une seule passe
        predictions = model.predict(padded_tokens, verbose=0)
        
        # Interpréter les prédictions
        results = []
        for pred in predictions:
            sentiment = "Positif" if pred[0] >= 0.5 else "Négatif"
            confidence = float(pred[0]) if pred[0] >= 0.5 else float(1 - pred[0])
            
            results.append({
                'sentiment': sentiment,
                'confidence': confidence,
                'raw_score': float(pred[0])
            })
        
        return results
        
    except Exception as e:
        logger.error(f"Erreur lors de la prédiction par lot optimisée: {str(e)}")
        raise


# Définition des routes de l'API

@app.get("/")
async def root():
    """Endpoint racine."""
    return {"message": "API de prédiction de sentiment pour tweets", "status": "opérationnel"}

@app.get("/health")
async def health_check():
    """Endpoint de vérification de santé."""
    if model_pack is None:
        return {"status": "erreur", "message": "Le modèle n'est pas chargé."}
    return {"status": "ok", "message": "Le modèle est chargé et prêt pour les prédictions."}

@app.get("/info")
async def get_info():
    """Endpoint pour obtenir des informations sur l'environnement d'exécution."""
    return {
        "tensorflow_version": tf.__version__,
        "devices_available": [device.name for device in tf.config.list_logical_devices()],
        "using_gpu": False,  # Devrait toujours être False avec notre configuration
        "environment": {
            "CUDA_VISIBLE_DEVICES": os.environ.get("CUDA_VISIBLE_DEVICES", "Non défini"),
            "TF_FORCE_GPU_ALLOW_GROWTH": os.environ.get("TF_FORCE_GPU_ALLOW_GROWTH", "Non défini")
        }
    }

@app.post("/predict", response_model=SentimentResponse)
async def predict(request: TweetRequest):
    """
    Endpoint de prédiction du sentiment d'un tweet unique.
    
    Args:
        request: Objet TweetRequest contenant le texte à analyser
    
    Returns:
        SentimentResponse contenant le sentiment prédit et les scores
    """
    global model_pack
    
    if model_pack is None:
        raise HTTPException(status_code=503, detail="Le modèle n'est pas encore chargé. Veuillez réessayer plus tard.")
    
    try:
        # Utiliser la fonction de traitement par lot avec un seul texte
        results = predict_sentiment_batch([request.text], model_pack)
        # Renvoyer seulement le premier résultat
        return SentimentResponse(**results[0])
    except Exception as e:
        logger.error(f"Erreur lors de la prédiction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la prédiction: {str(e)}")

@app.post("/predict-batch", response_model=BatchSentimentResponse)
async def predict_batch(request: BatchTweetRequest):
    """
    Endpoint de prédiction du sentiment pour un lot de tweets (optimisé).
    """
    global model_pack
    
    if model_pack is None:
        raise HTTPException(status_code=503, detail="Le modèle n'est pas encore chargé. Veuillez réessayer plus tard.")
    
    if not request.texts:
        return BatchSentimentResponse(results=[])
    
    try:
        # Utiliser la version optimisée pour le traitement par lot
        results = predict_sentiment_batch(request.texts, model_pack)
        return BatchSentimentResponse(results=[SentimentResponse(**result) for result in results])
    except Exception as e:
        logger.error(f"Erreur lors de la prédiction par lot: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la prédiction par lot: {str(e)}")
    
@app.post("/feedback")
async def record_feedback(feedback: FeedbackRequest):
    """
    Endpoint pour enregistrer le feedback utilisateur sur les prédictions.
    
    Args:
        feedback: Informations sur la prédiction et le feedback de l'utilisateur
    
    Returns:
        Dict: Statut de l'enregistrement du feedback
    """
    try:
        # Log details
        logger.info(f"Feedback reçu: {feedback.dict()}")
        
        # Enregistrer dans Application Insights si configuré
        if telemetry_client:
            # Construire les propriétés en incluant seulement les champs non vides
            properties = {
                "tweet": feedback.tweet_text,
                "prediction": feedback.prediction,
                "confidence": str(feedback.confidence),
                "is_correct": str(feedback.is_correct)
            }
            
            # Ajouter les propriétés optionnelles si elles sont présentes
            if feedback.corrected_sentiment:
                properties["corrected_sentiment"] = feedback.corrected_sentiment
            
            if feedback.comments:
                properties["comments"] = feedback.comments
            
            # Enregistrer l'événement de feedback
            telemetry_client.track_event(
                name="model_feedback",
                properties=properties
            )
            
            # Envoyer les données immédiatement
            telemetry_client.flush()
            
        return {"status": "success", "message": "Feedback enregistré avec succès"}
        
    except Exception as e:
        logger.error(f"Erreur lors de l'enregistrement du feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'enregistrement du feedback: {str(e)}")

@app.get("/test-appinsights")
async def test_appinsights_connection():
    """
    Endpoint pour tester la connexion à Azure Application Insights.
    """
    if not telemetry_client:
        return {
            "status": "error",
            "message": "Aucun client Application Insights n'est configuré. Vérifiez la variable d'environnement APPINSIGHTS_INSTRUMENTATION_KEY."
        }
    
    try:
        # Envoyer un événement de test
        telemetry_client.track_event(
            name="appinsights_connection_test",
            properties={
                "timestamp": datetime.now().isoformat(),
                "test_id": str(uuid.uuid4())
            }
        )
        telemetry_client.flush()
        
        return {
            "status": "success",
            "message": "Événement de test envoyé à Application Insights. Vérifiez le portail Azure pour confirmer la réception."
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Erreur lors du test de connexion à Application Insights: {str(e)}"
        }  


# Point d'entrée pour exécuter l'application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)