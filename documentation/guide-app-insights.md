# Guide de Monitoring pour Air Paradis - Analyse de Sentiment

## 🧠 Mise en place du feedback utilisateur et des alertes

Dans le cadre du suivi de notre modèle d’analyse de sentiment, nous avons mis en place un système de **feedback utilisateur** intégré directement dans l’application. Lorsqu’un utilisateur estime qu’une prédiction est incorrecte, il peut le signaler. Ce feedback est **automatiquement enregistré** dans [Azure Application Insights](https://learn.microsoft.com/fr-fr/azure/azure-monitor/app/app-insights-overview) via un événement personnalisé `model_feedback`, contenant les détails du tweet, la prédiction initiale, la correction apportée par l’utilisateur, et des éventuels commentaires.

Afin de garantir une surveillance proactive, nous avons également configuré une `**alerte automatique**. Cette alerte se déclenche si **au moins trois prédictions incorrectes sont signalées dans une fenêtre glissante de 5 minutes**. Lorsqu’elle est activée, une notification est envoyée à l’équipe (par email), permettant une réaction rapide. Ce mécanisme permet de détecter rapidement une éventuelle dérive du modèle ou un changement de distribution des données en production.

## ✔️ Événements enregistrés dans Azure Application Insights

| Nom de l'événement | Type | Méthode | Description |
|-------------------|------|---------|-------------|
| `model_feedback` | customEvents | `track_event()` | Enregistre tous les feedbacks utilisateurs avec leurs détails (tweet, prédiction, correction) |
| `appinsights_connection_test` | customEvents | `track_event()` | Événement de test pour vérifier la connexion à Application Insights |

## 📋 Accéder aux journaux (Logs)

1. Dans le [Portail Azure](https://portal.azure.com)
2. Accéder à notre ressource Application Insights
3. Dans le menu de gauche, cliquer sur **Journaux (Logs)**

## 🔎 Requêtes pour consulter les données

### Tous les feedbacks utilisateurs

```kusto
customEvents
| where name == "model_feedback"
| sort by timestamp desc
| project timestamp, 
        tweet = tostring(customDimensions.tweet), 
        prediction = tostring(customDimensions.prediction), 
        is_correct = tostring(customDimensions.is_correct), 
        corrected_sentiment = tostring(customDimensions.corrected_sentiment), 
        comments = tostring(customDimensions.comments)
```

### Feedbacks de tweets incorrectement prédits

```kusto
customEvents
| where name == "model_feedback" and customDimensions.is_correct == "False"
| sort by timestamp desc
| project timestamp, 
        tweet = tostring(customDimensions.tweet), 
        prediction = tostring(customDimensions.prediction), 
        corrected_sentiment = tostring(customDimensions.corrected_sentiment)
```

### Évolution des feedbacks dans le temps

```kusto
customEvents
| where name == "model_feedback"
| summarize correct=countif(customDimensions.is_correct == "True"), 
          incorrect=countif(customDimensions.is_correct == "False") by bin(timestamp, 1d)
| extend total = correct + incorrect
| extend error_rate = (incorrect * 100.0) / total
| project timestamp, correct, incorrect, total, error_rate
| render timechart
```

### Tweets les plus fréquemment mal prédits

```kusto
customEvents
| where name == "model_feedback" and customDimensions.is_correct == "False"
| summarize count() by tweet = tostring(customDimensions.tweet)
| sort by count_ desc
| take 10
```

### Tester la connexion à Application Insights

```kusto
customEvents
| where name == "appinsights_connection_test"
| sort by timestamp desc
```

## 🚨 Configuration des alertes (tweets mal prédits)

1. Dans le portail Azure, accéder à notre ressource Application Insights
2. Cliquer sur **Alertes** dans le menu de gauche
3. Cliquer sur **+ Nouvelle règle d'alerte**
4. Configurer la condition avec cette requête :

```kusto
customEvents
| where timestamp > ago(5m) 
| where name == "model_feedback" and customDimensions.is_correct == "False"
| summarize count() 
| where count_ >= 3
```

5. Définir la valeur seuil à 1 (car la requête elle-même vérifie déjà si count_ ≥ 3)
6. Configurer les actions d'alerte (email)
7. Les alertes délenchées sont consultables dans **Alertes**  avec le nom "3PredictionsIncorrectesEn5Minutes"


## 🧪 Démarche d'analyse et amélioration du modèle

La performance d'un modèle d'analyse de sentiment en production nécessite un suivi rigoureux et une amélioration continue. Notre approche MLOps intègre un cycle complet de surveillance, d'analyse des erreurs et d'amélioration itérative pour garantir que le modèle maintient son niveau de précision dans le temps et s'adapte aux nouveaux cas d'usage. Cette démarche méthodique permet d'identifier rapidement les points faibles du modèle et d'y apporter des corrections ciblées.

### Suivi quotidien
- Consulter le taux d'erreur quotidien pour identifier les tendances
- Vérifier régulièrement la liste des tweets mal prédits pour comprendre les erreurs courantes

### Analyse approfondie
- Étudier les types de contenu mal prédits pour identifier des motifs
- Comparer les prédictions incorrectes avec les corrections suggérées par les utilisateurs

### Améliorations du modèle

1. Collecter les tweets incorrectement prédits

```kusto
customEvents
| where name == "model_feedback" and customDimensions.is_correct == "False"
| sort by timestamp desc
| project timestamp, 
        tweet = tostring(customDimensions.tweet), 
        prediction = tostring(customDimensions.prediction), 
        corrected_sentiment = tostring(customDimensions.corrected_sentiment)
```

2. Les Utiliser pour enrichir notre jeu de données d'entraînement
3. Réentraînez périodiquement notre modèle en incluant ces nouveaux exemples
4. Mesurer l'impact sur la précision après chaque mise à jour

## Bonnes pratiques

1. **Vérification quotidienne** : Consulter les métriques d'erreur au moins une fois par jour
2. **Réagir aux alertes** : Définir un protocole clair pour répondre aux alertes de performance
3. **Cycle d'amélioration** : Établir un calendrier régulier (mensuel ou trimestriel) pour améliorer le modèle
4. **Analyse des causes profondes** : Pour chaque alerte, identifier les facteurs communs des prédictions incorrectes