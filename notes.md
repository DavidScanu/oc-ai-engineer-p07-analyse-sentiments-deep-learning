## Recommandations de modélisation

Approches recommandées pour l'analyse de sentiment:

1. Approches classiques de Machine Learning:
   - Modèles basés sur les sacs de mots (BoW) ou TF-IDF avec classifieurs comme Régression Logistique, SVM, Random Forest ou Naive Bayes

2. Word Embeddings + Deep Learning (2 modèles):
   - Utiliser des embeddings pré-entraînés (Word2Vec, GloVe, FastText) avec des classifieurs Deep Learning
   - Utiliser des réseaux de neurones récurrents (RNN, **LSTM**, GRU)

3. Modèles transformers (BERT, Sentence Transformers, RoBERTa, DistilBERT):
   - Fine-tuning de modèles pré-entraînés spécifiques à Twitter comme BERTweet

Considérations importantes:

1. Déséquilibre des classes: utiliser des techniques comme SMOTE, sous-échantillonnage, ou pondération des classes
2. Validation croisée: essentielle pour évaluer correctement les performances
3. Métriques d'évaluation: ne pas se limiter à l'accuracy, utiliser F1-score, précision, rappel, et AUC-ROC
4. Interprétabilité: pour certaines applications, privilégier des modèles interprétables ou utiliser SHAP/LIME
5. Dépendance temporelle: considérer l'évolution du langage sur Twitter au fil du temps


**Notes du mentor :**

Voici le texte extrait de cette capture d'écran :

- Création de deux modèles de Deep Learning, dont au moins un avec un layer LSTM.
- Simulation selon deux techniques de pré-traitement (lemmatization, stemming) sur l'un des 2 modèles, afin de choisir la technique pour la suite des simulations.
- Simulation selon 2 approches de word embedding (parmi Word2VEc, Glove, FastText), entraînés avec le jeu de données ou pré-entraînés sur au moins un des 2 modèles de Deep Learning, afin de choisir l'embedding pour la suite des simulations.
- Création ensuite d'un modèle BERT, il y a 2 approches possibles :
  - Générer des features (sentence embedding) à partir d'un TFBertModel (Hugging Face) ou d'un d'un model via le Hub TensorFlow, puis ajouter une ou des couches de classification
  - Utiliser directement un modèle Hugging Face de type TFBertForSequenceClassification
- En option tester USE (Universal Sentence Encoding) pour le feature engineering

Problèmes et erreurs courants :
- Temps de traitement et limitation de ressources en TensorFlow-Keras.
- Inspirer des exemples de modèles cités en ressources
