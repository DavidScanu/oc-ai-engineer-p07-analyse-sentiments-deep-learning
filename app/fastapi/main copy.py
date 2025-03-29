# Importation des bibliothèques nécessaires
import os
import json
import dill
import pickle
import tempfile
import shutil
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import mlflow
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np
import logging
from pathlib import Path
import requests
from typing import Dict, Any

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

# Modèle de données pour les requêtes
class TweetRequest(BaseModel):
    text: str

# Modèle de données pour les réponses
class SentimentResponse(BaseModel):
    sentiment: str
    confidence: float
    raw_score: float

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

def load_model() -> Dict[str, Any]:
    """
    Charge le modèle et tous ses artefacts associés.
    
    Returns:
        Dict contenant le modèle, le tokenizer, la fonction de prétraitement et les paramètres.
    """
    try:
        logger.info("Chargement du modèle et de ses artefacts...")
        
        # Chemins des artefacts
        model_path = MODEL_DIR / "final_model_LSTM_Word2Vec-Fige.keras"
        tokenizer_path = MODEL_DIR / "tokenizer.pickle"
        preprocess_path = MODEL_DIR / "preprocess_function.dill"
        params_path = MODEL_DIR / "parameters.json"
        
        # Vérifier si tous les fichiers existent
        for path in [model_path, tokenizer_path, preprocess_path, params_path]:
            if not path.exists():
                raise FileNotFoundError(f"Le fichier {path.name} n'existe pas.")
        
        # Charger le modèle
        model = tf.keras.models.load_model(str(model_path))
        
        # Charger le tokenizer
        with open(tokenizer_path, 'rb') as handle:
            tokenizer = pickle.load(handle)
        
        # Charger la fonction de prétraitement
        with open(preprocess_path, 'rb') as handle:
            preprocess_function = dill.load(handle)
        
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

# Le gestionnaire de démarrage a été remplacé par le gestionnaire de contexte lifespan

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

@app.post("/predict", response_model=SentimentResponse)
async def predict(request: TweetRequest):
    """
    Endpoint de prédiction du sentiment d'un tweet.
    
    Args:
        request: Objet TweetRequest contenant le texte à analyser
    
    Returns:
        SentimentResponse contenant le sentiment prédit et les scores
    """
    global model_pack
    
    if model_pack is None:
        raise HTTPException(status_code=503, detail="Le modèle n'est pas encore chargé. Veuillez réessayer plus tard.")
    
    try:
        result = predict_sentiment(request.text, model_pack)
        return SentimentResponse(**result)
    except Exception as e:
        logger.error(f"Erreur lors de la prédiction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la prédiction: {str(e)}")

# Point d'entrée pour exécuter l'application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)