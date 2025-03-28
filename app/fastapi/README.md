# API de Prédiction de Sentiment pour Tweets

Cette API permet de prédire le sentiment (positif ou négatif) associé à un tweet en utilisant un modèle LSTM avec Word2Vec pré-entraîné.

## Fonctionnalités

- Prédiction du sentiment d'un tweet (positif/négatif)
- Score de confiance de la prédiction
- Score brut (probabilité)
- Vérification de santé de l'API
- Téléchargement automatique des artefacts depuis MLflow
- Exécution en mode CPU uniquement (pas besoin de GPU)

## Prérequis

- Docker et Docker Compose
- Accès à un serveur MLflow
- Identifiants AWS si les artefacts sont stockés sur S3

## Configuration

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```
MLFLOW_TRACKING_URI=https://votre-serveur-mlflow.com/
RUN_ID=identifiant-de-votre-modele-mlflow
AWS_ACCESS_KEY_ID=votre-cle-dacces-aws
AWS_SECRET_ACCESS_KEY=votre-cle-secrete-aws
```

## Déploiement

### Avec Docker Compose

```bash
docker-compose up -d
```

### Sans Docker

1. Installer les dépendances :

```bash
pip install -r requirements.txt
```

2. Lancer l'API :

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Utilisation de l'API

### Vérification de santé

```
GET /health
```

Exemple de réponse :
```json
{
  "status": "ok",
  "message": "Le modèle est chargé et prêt pour les prédictions."
}
```

### Prédiction de sentiment

```
POST /predict
```

Corps de la requête :
```json
{
  "text": "I love this new airline, the service was amazing!"
}
```

Exemple de réponse :
```json
{
  "sentiment": "Positif",
  "confidence": 0.92,
  "raw_score": 0.92
}
```

## Documentation de l'API

Une documentation interactive de l'API est disponible à l'adresse :

```
http://localhost:8000/docs
```

## Structure du projet

- `main.py` : Code principal de l'API
- `Dockerfile` : Configuration pour la conteneurisation
- `docker-compose.yml` : Configuration pour le déploiement avec Docker Compose
- `requirements.txt` : Liste des dépendances
- `model/` : Dossier où sont stockés les artefacts du modèle téléchargés depuis MLflow