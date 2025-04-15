# Déploiement d'une API FastAPI sur Heroku avec GitHub Actions

Ce guide détaille la procédure complète pour déployer l'API FastAPI d'analyse de sentiments pour Air Paradis sur Heroku en utilisant GitHub Actions pour l'intégration et le déploiement continus (CI/CD).

## 1. Configuration du projet FastAPI

### 1.1. Structure des fichiers nécessaires

Assurez-vous que votre dossier `app/fastapi/` contient tous les fichiers essentiels:

```
app/fastapi/
├── main.py              # Point d'entrée de l'API
├── requirements.txt     # Dépendances du projet
├── Procfile             # Instructions pour Heroku
├── runtime.txt          # Version Python pour Heroku
├── tests/               # Tests unitaires
│   ├── __init__.py
│   ├── conftest.py
│   └── test_api.py
└── ... (autres fichiers)
```

### 1.2. Fichiers Heroku spécifiques

Créez les fichiers suivants dans le dossier `app/fastapi/`:

**Procfile**:
```
web: uvicorn main:app --host=0.0.0.0 --port=${PORT:-8000}
```

**runtime.txt**:
```
python-3.10.12
```

### 1.3. Fichier de dépendances

Assurez-vous que `requirements.txt` contient toutes les dépendances nécessaires:

```
mlflow-skinny==2.21.0
keras==3.9.0
numpy==1.26.4
tensorflow-cpu==2.19.0
fastapi==0.110.0
uvicorn==0.30.0
python-dotenv==1.0.1
dill==0.3.8
boto3==1.35.0
requests==2.31.0
pydantic>=2.11,<3.0
python-multipart==0.0.9
nltk==3.8.1
regex==2023.12.25
applicationinsights
opencensus-ext-azure
starlette==0.36.3
httpx==0.24.1
pytest
```

### 1.4. Configuration de l'API pour Heroku

Adaptez votre fichier `main.py` pour qu'il soit compatible avec Heroku:

```python
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import mlflow
import mlflow.keras

# Configuration de l'API
app = FastAPI(
    title="Air Paradis Sentiment API",
    description="API d'analyse de sentiments pour les tweets",
    version="1.0.0"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration Azure Application Insights
if "APPINSIGHTS_INSTRUMENTATION_KEY" in os.environ:
    from opencensus.ext.azure.log_exporter import AzureLogHandler
    logger = logging.getLogger("air-paradis-api")
    logger.setLevel(logging.INFO)
    logger.addHandler(AzureLogHandler(
        connection_string=f"InstrumentationKey={os.environ['APPINSIGHTS_INSTRUMENTATION_KEY']}"
    ))

# Chargement du modèle depuis MLflow (si possible)
model = None
try:
    if "MLFLOW_TRACKING_URI" in os.environ and "RUN_ID" in os.environ:
        mlflow.set_tracking_uri(os.environ.get("MLFLOW_TRACKING_URI"))
        run_id = os.environ.get("RUN_ID")
        model = mlflow.keras.load_model(f"runs:/{run_id}/model")
        print(f"Modèle chargé depuis MLflow (run_id: {run_id})")
except Exception as e:
    print(f"Erreur lors du chargement du modèle depuis MLflow: {e}")
    # Essayer un chargement local si disponible
    try:
        import tensorflow as tf
        model = tf.keras.models.load_model("./model")
        print("Modèle chargé depuis le stockage local")
    except Exception as e:
        print(f"Erreur lors du chargement du modèle local: {e}")

# Point de terminaison pour vérifier la santé de l'API
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "model_loaded": model is not None
    }

# Point de terminaison pour les prédictions
@app.post("/predict")
async def predict(request: dict):
    if model is None:
        return {"error": "Le modèle n'a pas été chargé correctement"}
    
    text = request.get("text", "")
    if not text:
        return {"error": "Aucun texte fourni"}
    
    # Prétraitement et prédiction (à adapter selon votre modèle)
    # ...
    
    # Simulation de résultat
    result = {"sentiment": "positif", "probability": 0.95}
    
    # Log dans Application Insights si configuré
    if "APPINSIGHTS_INSTRUMENTATION_KEY" in os.environ:
        logger.info(f"Prédiction effectuée: {text} -> {result}")
    
    return result
```

## 2. Configuration de Heroku

### 2.1. Création de l'application Heroku

Créez une application Heroku en région Europe:

```bash
# Connexion à Heroku
heroku login

# Création d'une nouvelle application en Europe
heroku create air-paradis-sentiment-api --region eu
```

### 2.2. Configuration des variables d'environnement

Configurez les variables d'environnement nécessaires (remplacez les valeurs par les vôtres):

```bash
# Variables MLflow et AWS pour l'accès au modèle
heroku config:set MLFLOW_TRACKING_URI="https://votre-uri-mlflow" -a air-paradis-sentiment-api
heroku config:set RUN_ID="votre-run-id" -a air-paradis-sentiment-api

# Variables AWS pour S3 (si nécessaire)
heroku config:set AWS_ACCESS_KEY_ID="votre-access-key" -a air-paradis-sentiment-api
heroku config:set AWS_SECRET_ACCESS_KEY="votre-secret-key" -a air-paradis-sentiment-api

# Clé d'instrumentation Azure Application Insights
heroku config:set APPINSIGHTS_INSTRUMENTATION_KEY="votre-clé" -a air-paradis-sentiment-api
```

### 2.3. Configuration des buildpacks (si nécessaire)

```bash
# Assurez-vous d'utiliser le buildpack Python
heroku buildpacks:set heroku/python -a air-paradis-sentiment-api

# Ajoutez d'autres buildpacks si nécessaire (par exemple, apt)
heroku buildpacks:add --index 1 heroku-community/apt -a air-paradis-sentiment-api
```

## 3. Configuration des tests unitaires

### 3.1. Fichier conftest.py

Créez ou adaptez le fichier `app/fastapi/tests/conftest.py`:

```python
import pytest
import os
from dotenv import load_dotenv

@pytest.fixture(scope="session", autouse=True)
def set_test_env():
    """Charge les variables d'environnement pour les tests."""
    # Chargez d'abord le fichier .env si disponible
    load_dotenv()
    
    # Valeurs par défaut pour les tests si non définies
    os.environ.setdefault("MLFLOW_TRACKING_URI", "mock_uri")
    os.environ.setdefault("RUN_ID", "mock_run_id")
    os.environ.setdefault("APPINSIGHTS_INSTRUMENTATION_KEY", "mock_key")
```

### 3.2. Fichier test_api.py

Créez ou adaptez le fichier `app/fastapi/tests/test_api.py`:

```python
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

# Patchez le chargement du modèle pour les tests
with patch("main.model", MagicMock()):
    from main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert "status" in response.json()
    assert response.json()["status"] == "ok"

def test_predict_endpoint():
    response = client.post("/predict", json={"text": "I love flying with this airline!"})
    assert response.status_code == 200
    result = response.json()
    assert "sentiment" in result
    assert "probability" in result
```

## 4. Configuration de GitHub Actions

### 4.1. Création du workflow GitHub Actions

Créez le dossier `.github/workflows/` à la racine de votre dépôt si ce n'est pas déjà fait.

### 4.2. Création du fichier de workflow

Créez le fichier `.github/workflows/heroku-deploy.yml`:

```yaml
name: Deploy to Heroku

on:
  push:
    branches:
      - main
    paths:
      - 'app/fastapi/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.10'
      - name: Install dependencies
        working-directory: ./app/fastapi
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
      - name: Run tests
        working-directory: ./app/fastapi
        run: |
          python -m pytest tests/test_api.py -v
        env:
          MLFLOW_TRACKING_URI: ${{ secrets.MLFLOW_TRACKING_URI }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          RUN_ID: ${{ secrets.RUN_ID }}
          APPINSIGHTS_INSTRUMENTATION_KEY: ${{ secrets.APPINSIGHTS_INSTRUMENTATION_KEY }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "air-paradis-sentiment-api"
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
          appdir: "app/fastapi"
          region: "eu"
```

### 4.3. Configuration des secrets GitHub

Dans votre dépôt GitHub:
1. Accédez à "Settings" > "Secrets and variables" > "Actions"
2. Ajoutez les secrets suivants:
   - `HEROKU_API_KEY`: Votre clé API Heroku
   - `HEROKU_EMAIL`: L'adresse email associée à votre compte Heroku
   - `MLFLOW_TRACKING_URI`: L'URI de votre serveur MLflow
   - `AWS_ACCESS_KEY_ID`: Votre clé d'accès AWS (si nécessaire)
   - `AWS_SECRET_ACCESS_KEY`: Votre clé secrète AWS (si nécessaire)
   - `RUN_ID`: L'identifiant du run MLflow de votre modèle
   - `APPINSIGHTS_INSTRUMENTATION_KEY`: Votre clé d'instrumentation Azure

## 5. Déploiement

### 5.1. Initialisation du déploiement

Poussez vos modifications sur la branche principale:

```bash
git add .
git commit -m "Configuration pour déploiement Heroku avec GitHub Actions"
git push origin main
```

### 5.2. Vérification du déploiement

1. Accédez à l'onglet "Actions" de votre dépôt GitHub pour surveiller le workflow
2. Une fois le déploiement terminé, vérifiez l'application:

```bash
# Vérifiez l'état de l'API
curl https://air-paradis-sentiment-api.herokuapp.com/health

# Testez l'endpoint de prédiction
curl -X POST -H "Content-Type: application/json" -d '{"text":"Le service d'Air Paradis est excellent!"}' https://air-paradis-sentiment-api.herokuapp.com/predict
```

### 5.3. Surveillance des logs Heroku

```bash
heroku logs --tail -a air-paradis-sentiment-api
```

## 6. Résolution des problèmes courants

### 6.1. Problèmes de mémoire

Si vous rencontrez des erreurs R14 (mémoire excessive):

```bash
# Passez à un dyno avec plus de mémoire
heroku dyno:type hobby -a air-paradis-sentiment-api

# Optimisez la configuration worker
heroku config:set WEB_CONCURRENCY=1 -a air-paradis-sentiment-api
```

### 6.2. Problèmes d'accès à MLflow

Si Heroku ne peut pas accéder à votre serveur MLflow:

1. Assurez-vous que l'URL MLflow est accessible publiquement
2. Ou exportez votre modèle et incluez-le dans votre dépôt
3. Ou stockez votre modèle sur S3 et chargez-le directement

### 6.3. Problèmes de taille de slug

Si votre application dépasse la limite de taille de Heroku (500 MB):

1. Utilisez TensorFlow Lite pour réduire la taille du modèle
2. Stockez le modèle externalement et téléchargez-le au démarrage
3. Passez à un niveau de service Heroku plus élevé

### 6.4 Erreur : "Le modèle n'est pas chargé"

Si vous recevez cette réponse en appelant l'endpoint `/health` :

```json
{
  "detail": {
    "status": "erreur",
    "message": "Le modèle n'est pas chargé. Vérifiez que les artefacts ont bien été téléchargés depuis MLflow.",
    "environment_variables": {
      "MLFLOW_TRACKING_URI": "...",
      "RUN_ID": "...",
      "APPINSIGHTS_INSTRUMENTATION_KEY": "Configured"
    }
  }
}
```

Suivez ces étapes pour résoudre le problème :

1. **Vérifiez que le serveur MLflow est en cours d'exécution**
   - Assurez-vous que votre Codespace GitHub est actif
   - Vérifiez que le serveur MLflow fonctionne sur le port 5001
   - Confirmez que le port forwarding est configuré et visible publiquement

2. **Vérifiez l'accessibilité de l'URL MLflow**
   - Testez l'URL du serveur MLflow dans un navigateur
   - Assurez-vous que l'URL est accessible depuis l'extérieur de votre Codespace

3. **Vérifiez les variables d'environnement sur Heroku**
   ```bash
   heroku config --app air-paradis-sentiment-api
   ```
   - Confirmez que MLFLOW_TRACKING_URI pointe vers la bonne URL
   - Vérifiez que RUN_ID correspond à un run existant dans MLflow

4. **Consultez les logs Heroku pour identifier les erreurs spécifiques**
   ```bash
   heroku logs --tail --app air-paradis-sentiment-api
   ```
   - Cherchez les erreurs liées à MLflow ou au chargement du modèle
   - Vérifiez les codes d'erreur HTTP (404, 500, etc.)

5. **Redémarrez l'application Heroku**
   ```bash
   heroku restart --app air-paradis-sentiment-api
   ```
   - Cette action force le redémarrage de l'application et tente à nouveau de charger le modèle

6. **Solutions pour les problèmes persistants**
   - Si le serveur MLflow est temporairement inaccessible, attendez et réessayez
   - Si le RUN_ID n'existe plus, mettez à jour la variable d'environnement avec un ID valide
   - Envisagez de migrer vers une solution de stockage plus permanente (AWS S3, Azure Blob Storage)

### Amélioration de la robustesse du déploiement

Pour éviter ces problèmes à l'avenir, considérez ces options :

1. **Stockage du modèle dans S3 plutôt que via MLflow**
   - Téléchargez les artefacts du modèle localement
   - Chargez-les dans un bucket S3
   - Mettez à jour l'application pour charger le modèle depuis S3

2. **Mise en place d'un système de cache**
   - Stockez une copie du modèle dans le système de fichiers de l'application
   - Implémentez une logique de fallback si MLflow est inaccessible

3. **Monitoring et alertes**
   - Configurez des alertes pour être notifié en cas de problème de chargement du modèle
   - Utilisez Application Insights pour surveiller les performances et la disponibilité

### Commandes CLI utiles pour le débogage

```bash
# Installer la CLI Heroku
curl https://cli-assets.heroku.com/install-ubuntu.sh | sh

# Se connecter à Heroku avec l'email et la clé API (pour les comptes avec MFA activée)
heroku login -i
# Quand l'invite apparaît, entrez votre email
# À l'invite du mot de passe, entrez votre clé API (et non votre mot de passe)
# Vous pouvez générer ou récupérer une clé API depuis https://dashboard.heroku.com/account

# Alternative: définir la clé API comme variable d'environnement
export HEROKU_API_KEY=votre-token-api
heroku auth:whoami

# Vérifier les variables d'environnement
heroku config --app air-paradis-sentiment-api

# Consulter les logs en temps réel
heroku logs --tail --app air-paradis-sentiment-api

# Redémarrer l'application
heroku restart --app air-paradis-sentiment-api
```

## 7. Ressources supplémentaires

- [Documentation Heroku pour Python](https://devcenter.heroku.com/categories/python-support)
- [Documentation GitHub Actions](https://docs.github.com/fr/actions)
- [Documentation FastAPI](https://fastapi.tiangolo.com/)
- [Documentation MLflow](https://www.mlflow.org/docs/latest/index.html)
- [Documentation Azure Application Insights](https://docs.microsoft.com/fr-fr/azure/azure-monitor/app/app-insights-overview)
