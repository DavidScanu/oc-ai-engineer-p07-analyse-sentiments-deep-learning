# ☑️ TODO

- Modèles : 
  - Modèle Bert : entraînement sur Colab (max_epochs) ✔️
  - Tableau de comparaison des modèles 🚧
- Frontend : Next.js ✔️
  - App Insights Widget
  - Afficher le tweet dans le résultat de la prédiction ✔️
- Readme.md ✔️
- Docker 🚧

## Suivi de la performance du modèle en production ✔️

Initier un suivi de la performance du modèle en production. Pour cela tu utiliseras un service Azure Application Insight. ✔️

- Pour remonter des traces des tweets qui seraient considérés par l’utilisateur comme mal prédits : le texte du tweet et la prédiction. ✔️
- Pour déclencher une alerte (envoi SMS ou mail) dans le cas d’un nombre trop important de tweet mal prédits (par exemple 3 tweets mal prédits en l’espace de 5 minutes). ✔️
- Prendre des captures d'écran de : 
  - Journaux Azure  ✔️
  - Email d'alerte ✔️
- Présenter une démarche qui pourrait être mise en oeuvre pour l’analyse de ces statistiques et l’amélioration du modèle dans le temps. ✔️

## Déploiement 🚧

- Pipeline de déploiement continu du modèle que tu auras choisi via une API (Git + Github + Heroku)
- Intègre également des tests unitaires automatisés (Github actions)

## Rapports

- 📺 Vidéo démo de l'appli (2 mins max) 🚧
- 🖼️ Présentation (MLOps life cycle) 🚧
- 📝 Articles (Partie 1 et Partie 2) 🚧

## Présentation 

- Contexte : projet répond au besoin, vérifier ce que les clients disent du produit 
  - Avec l'API on pourrait automatiser la lecture des tweet avec @AirParadis ou #AirParadis
- Jeu de données 
- Analyse exploratoire 
- Modele simple
- Modèle Avancée
- Modèle BERT
- Schéma Architecture / MLOps : 
  - Notebook
  - MLFlow
  - FastAPI
  - Frontend
- Démo live / vidéo 
  - Prédiction
  - Feedback
  - Alertes
- Conclusion
