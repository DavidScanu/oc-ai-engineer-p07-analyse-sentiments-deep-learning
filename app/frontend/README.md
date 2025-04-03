# Air Paradis - Analyse de Sentiment pour Tweets

Cette application permet d'analyser le sentiment (positif/négatif) des tweets grâce à un modèle d'intelligence artificielle. Elle a été développée dans le cadre d'un projet MLOps pour la compagnie Air Paradis afin d'anticiper les bad buzz sur les réseaux sociaux.

## Architecture

L'application est composée de deux parties principales :

1. **Frontend** : Application Next.js avec Bootstrap pour l'interface utilisateur
2. **Backend** : API FastAPI qui expose un modèle de deep learning pour l'analyse de sentiment

## Fonctionnalités

- Analyse du sentiment d'un tweet unique
- Comparaison de plusieurs tweets simultanément
- Historique des analyses effectuées
- Exemples de tweets positifs et négatifs
- Système de feedback pour améliorer le modèle
- Interface responsive et intuitive
- Mode clair/sombre

## Installation

### Prérequis

- Node.js (v18+)
- npm ou yarn
- Python 3.8+
- Environnement virtuel Python (recommandé)

### Backend (FastAPI)

1. Créer et activer un environnement virtuel
```bash
python -m venv venv
source venv/bin/activate  # Sur Windows : venv\Scripts\activate
```

2. Installer les dépendances
```bash
pip install -r requirements.txt
```

3. Démarrer le serveur FastAPI
```bash
uvicorn main:app --reload
```

Le serveur sera accessible à l'adresse : http://localhost:8000

### Frontend (Next.js)

1. Installer les dépendances
```bash
npm install
# ou
yarn install
```

2. Démarrer le serveur de développement
```bash
npm run dev
# ou
yarn dev
```

L'application sera accessible à l'adresse : http://localhost:3000

## Structure du projet

```
├── app/                  # Dossier principal Next.js
│   ├── about/            # Page À propos
│   ├── compare/          # Page Comparaison
│   ├── actions.js        # Server Actions
│   ├── globals.css       # Styles globaux
│   ├── layout.js         # Layout principal
│   └── page.js           # Page d'accueil
├── components/           # Composants React
│   ├── ApiStatus.js      # Statut de connexion à l'API
│   ├── BootstrapClient.js # Chargement de Bootstrap côté client
│   ├── ExampleTweets.js  # Exemples de tweets
│   ├── FeedbackForm.js   # Formulaire de feedback
│   ├── NavBar.js         # Barre de navigation
│   ├── ResultCard.js     # Carte de résultat
│   └── TweetForm.js      # Formulaire principal
└── public/               # Fichiers statiques
```

## Déploiement

Pour déployer l'application en production :

1. Construire l'application Next.js
```bash
npm run build
# ou
yarn build
```

2. Démarrer l'application en mode production
```bash
npm start
# ou
yarn start
```

## Modèle d'IA

Le modèle utilisé est un réseau neuronal LSTM entraîné sur un large corpus de tweets. Il est capable de classifier les tweets comme positifs ou négatifs avec un niveau de confiance associé.

## MLOps

Cette application implémente plusieurs principes de MLOps :
- Suivi des expérimentations avec MLflow
- API pour le déploiement du modèle
- Tests automatisés (CI/CD)
- Surveillance des performances du modèle via le système de feedback
- Amélioration continue basée sur les retours utilisateurs

## Licence

Ce projet est développé pour Air Paradis dans le cadre d'une mission MLOps.