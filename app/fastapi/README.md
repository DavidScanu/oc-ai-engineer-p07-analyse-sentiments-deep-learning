# API de Prédiction de Sentiment pour Tweets

Cette API, réalisé avec FastAPI, permet de prédire le sentiment (positif ou négatif) associé à un tweet en utilisant un modèle LSTM avec Word2Vec pré-entraîné.
  
## Fonctionnalités

- Prédiction du sentiment d'un tweet (positif/négatif)
- Score de confiance de la prédiction
- Score brut (probabilité)
- Vérification de santé de l'API
- Téléchargement automatique des artefacts depuis MLflow
- Exécution en mode CPU uniquement (pas besoin de GPU)

## Prérequis

- Accès à un serveur MLflow
- Identifiants AWS si les artefacts sont stockés sur S3
- Docker et Docker Compose
  
## Configuration

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```
MLFLOW_TRACKING_URI=https://votre-serveur-mlflow.com/
AWS_ACCESS_KEY_ID=votre-cle-dacces-aws
AWS_SECRET_ACCESS_KEY=votre-cle-secrete-aws
RUN_ID=identifiant-de-votre-modele-mlflow
APPINSIGHTS_INSTRUMENTATION_KEY=cle-instrumentation-azure-application-insights
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

## Structure du projet

- `requirements.txt` : Liste des dépendances
- `main.py` : Code principal de l'API
- `model/` : Dossier où sont stockés les artefacts du modèle téléchargés depuis MLflow
- `Dockerfile` : Configuration pour la conteneurisation
- `docker-compose.yml` : Configuration pour le déploiement avec Docker Compose

## Liste des Endpoints de l'API de Prédiction de Sentiment

Voici les différents endpoints disponibles dans l'API de prédiction de sentiment pour les tweets :

1. **`/`** (GET)
   - Endpoint racine de l'API
   - Retourne un message de base indiquant que l'API est opérationnelle

2. **`/health`** (GET)
   - Permet de vérifier l'état de santé de l'API
   - Confirme si le modèle est correctement chargé et prêt à être utilisé

3. **`/info`** (GET)
   - Fournit des informations sur l'environnement d'exécution
   - Détails sur la version de TensorFlow, les dispositifs disponibles et la configuration GPU/CPU

4. **`/predict`** (POST)
   - Prédit le sentiment d'un tweet unique
   - Accepte un objet JSON avec le champ "text" contenant le tweet
   - Retourne le sentiment prédit (Positif/Négatif), le niveau de confiance et le score brut

5. **`/predict-batch`** (POST)
   - Version optimisée pour prédire le sentiment de plusieurs tweets en une seule requête
   - Accepte un tableau de textes et retourne les prédictions pour chacun

6. **`/feedback`** (POST)
   - Permet d'enregistrer le feedback utilisateur sur les prédictions
   - Utile pour collecter des données sur les prédictions incorrectes pour améliorer le modèle

7. **`/test-appinsights`** (GET)
   - Teste la connexion à Azure Application Insights
   - Envoie un événement de test et vérifie si la télémétrie est correctement configurée

## Documentation de l'API

Une documentation interactive de l'API est disponible à l'adresse :`http://localhost:8000/docs`.

En y accédant, nous obtenons une interface **Swagger UI** qui permet de :
- Consulter tous les endpoints disponibles
- Voir les modèles de données requis pour les requêtes
- Tester directement les endpoints depuis le navigateur
- Explorer les réponses possibles

C'est un outil très utile pour comprendre et interagir avec l'API sans avoir à écrire de code client.

## MLOps

Cette application implémente plusieurs principes de MLOps :
- Suivi des expérimentations avec MLflow
- API pour le déploiement du modèle
- Tests automatisés (CI/CD)
- Surveillance des performances du modèle via le système de feedback
- Amélioration continue basée sur les retours utilisateurs
- Alertes à la suite de 3 prédictions incorrectes dans un délai de 5 minutes

Cette API est conçue selon les **principes MLOps**, avec des fonctionnalités pour la surveillance et l'amélioration continue du modèle en production.

## Retours utilisateurs et alertes

# Amélioration Continue et Système d'Alertes

L'API intègre un mécanisme d'amélioration continue basé sur les **retours utilisateurs**. Chaque prédiction de sentiment peut être validée ou corrigée par l'utilisateur, ces données étant collectées via l'endpoint `/feedback` et stockées dans **Azure Application Insights**.

Un système d'alertes proactif est également en place : lorsque **trois prédictions sont signalées comme incorrectes dans un intervalle de cinq minutes**, une notification est automatiquement déclenchée (SMS ou email), permettant à l'équipe d'intervenir rapidement.

Ces retours précieux alimentent le cycle d'amélioration du modèle, renforçant progressivement sa précision grâce à l'apprentissage continu des cas problématiques identifiés par les utilisateurs finaux.

- [Guide de Monitoring pour Air Paradis - Analyse de Sentiment](documentation/guide-app-insights.md)