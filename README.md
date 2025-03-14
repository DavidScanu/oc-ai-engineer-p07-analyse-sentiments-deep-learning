# Projet 7 - Réalisez une analyse de sentiments grâce au Deep Learning

> 🎓 OpenClassrooms • Parcours [AI Engineer](https://openclassrooms.com/fr/paths/795-ai-engineer) | 👋 *Étudiant* : [David Scanu](https://www.linkedin.com/in/davidscanu14/)

## 📝 Contexte

Dans le cadre de ma formation d'AI Engineer chez OpenClassrooms, ce projet s'inscrit dans un scénario professionnel où j'interviens en tant qu'ingénieur IA chez MIC (Marketing Intelligence Consulting), entreprise de conseil spécialisée en marketing digital.

Notre client, Air Paradis (compagnie aérienne), souhaite anticiper les bad buzz sur les réseaux sociaux. La mission consiste à développer un produit IA permettant de prédire le sentiment associé à un tweet, afin d'améliorer la gestion de sa réputation en ligne.

## ⚡ Mission

> Développer un modèle d'IA permettant de prédire le sentiment associé à un tweet.

Créer un prototype fonctionnel d'un modèle d'analyse de sentiments pour tweets selon trois approches différentes :

1. **Modèle sur mesure simple** : Approche classique (régression logistique) pour une prédiction rapide
2. **Modèle sur mesure avancé** : Utilisation de réseaux de neurones profonds avec différents word embeddings
3. **Modèle avancé BERT** : Exploration de l'apport en performance d'un modèle BERT

Cette mission implique également la mise en œuvre d'une démarche MLOps complète :

- Utilisation de **MLFlow pour le tracking des expérimentations et le stockage des modèles**.
- Création d'un pipeline de déploiement continu (Git + Github + plateforme Cloud).
- Intégration de tests unitaires automatisés.
- Mise en place d'un suivi de performance en production via Azure Application Insight.

## 🎯 Objectifs pédagogiques

Durant ce projet, je vais :

- **Développer des modèles IA** pour la prédiction de sentiment à partir de données textuelles
- **Mettre en pratique des méthodologies MLOps** pour le déploiement et la gestion continue des modèles
- **Mettre en œuvre un pipeline CI/CD** intégrant des tests unitaires automatisés
- **Configurer un système de suivi** de la performance du modèle en production
- **Préparer des supports de présentation** pour une audience non technique
- **Rédiger un article de blog** mettant en valeur le travail de modélisation et la démarche MLOps

Ces compétences sont essentielles pour ma future carrière d'ingénieur IA, me permettant de gérer des projets complexes et de délivrer des solutions robustes en environnement réel.

## 🗓️ Plan de travail

1. **Exploration et préparation des données**
   - Acquisition des données de tweets Open Source
   - Analyse exploratoire et prétraitement des textes

2. **Développement des modèles**
   - Implémentation du modèle classique (régression logistique)
   - Conception du modèle avancé avec différents word embeddings
   - Test du modèle BERT pour l'analyse de sentiments
   - Comparaison des performances via MLFlow

3. **Mise en place de la démarche MLOps**
   - Configuration de MLFlow pour le tracking des expérimentations
   - Création du dépôt Git avec structure de projet appropriée
   - Implémentation des tests unitaires automatisés
   - Configuration du pipeline de déploiement continu

4. **Déploiement et monitoring**
   - Développement de l'API de prédiction avec FastAPI
   - Déploiement sur Heroku
   - Création de l'interface de test (Streamlit ou Next.js)
   - Configuration du suivi via Azure Application Insight

5. **Communication**
   - Rédaction de l'article de blog
   - Préparation du support de présentation

## 📦 Livrables

1. **API de prédiction** déployée sur Heroku
   - Exposant le "Modèle sur mesure avancé" via FastAPI
   - Lien: [API Prediction Air Paradis](https://lien-vers-api.herokuapp.com)

2. **Scripts de modélisation** pour les trois approches
   - Intégration avec MLFlow pour le tracking et l'enregistrement des modèles

3. **Dépôt GitHub** contenant :
   - Notebooks des modélisations avec tracking MLFlow
   - Code de déploiement de l'API
   - Fichier README explicatif et requirements.txt
   - Lien: [GitHub Repository](https://github.com/DavidScanu/oc-ai-engineer-p06-analyse-sentiments-deep-learning/)

4. **Interface de test** (Streamlit ou Next.js)
   - Permettant la saisie d'un tweet
   - Affichant la prédiction et demandant validation à l'utilisateur
   - Envoyant une trace à Application Insight en cas de non-validation

5. **Article de blog** (1500-2000 mots)
   - Comparaison des trois approches de modélisation
   - Présentation de la démarche MLOps mise en œuvre
   - Analyse du suivi de performance en production

6. **Support de présentation**
   - Méthodologie et résultats des différents modèles
   - Visualisations MLFlow
   - Preuves du pipeline CI/CD (commits, tests unitaires)
   - Captures d'écran du monitoring Application Insight

## 🔧 Technologies utilisées

- **Langages** : Python
- **Bibliothèques ML/DL** : Scikit-learn, TensorFlow/Keras, Transformers (BERT)
- **MLOps** : MLFlow, Git, GitHub Actions
- **Backend** : FastAPI, Heroku
- **Frontend** : Streamlit ou Next.js
- **Monitoring** : Azure Application Insight
- **Traitement texte** : NLTK/SpaCy, Word Embeddings

## 📃 Documentation

- [Guide d'utilisation de l'API](docs/api_guide.md)
- [Description détaillée des modèles](docs/models.md)
- [Implémentation MLOps](docs/mlops.md)
- [Suivi de performance](docs/monitoring.md)
- [Article de blog complet](docs/blog_post.md)

## 🔄 Installation et utilisation

Pour copier et installer le projet en local :

```bash
# Cloner le dépôt
git clone git@github.com:DavidScanu/oc-ai-engineer-p07-analyse-sentiments-deep-learning.git
cd oc-ai-engineer-p07-analyse-sentiments-deep-learning

# Créer un environnement virtuel 
source .venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

Pour configurer MLFlow dans le code Python : 

Créer un fichier `.env` à la racine du projet contenant les variables de configuration du serveur MLFlow : 
- `MLFLOW_TRACKING_URI`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

```python
import mlflow
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

# Configuration de MLflow avec les variables d'environnement
mlflow_tracking_uri = os.getenv("MLFLOW_TRACKING_URI")
aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")

# Configuration de MLflow
mlflow.set_tracking_uri(mlflow_tracking_uri)
```

Pour lancer les serveurs de l'API et du frontend en local : 

```bash
# Lancer l'API FastAPI en local
uvicorn api.main:app --reload

# Lancer l'interface Streamlit
streamlit run frontend/app.py
```

### Structure du projet
```
oc-ai-engineer-p06-analyse-sentiments-deep-learning/
├── api/                # Code de l'API FastAPI
├── frontend/           # Interface utilisateur (Streamlit ou Next.js)
├── data/               # Données de tweets
├── models/             # Modèles entraînés
├── notebooks/          # Notebooks d'expérimentation
├── mlflow/             # Configuration MLFlow
├── tests/              # Tests unitaires
├── .github/workflows/  # Configuration GitHub Actions
├── requirements.txt    # Dépendances
└── README.md           # Documentation
```
