import BootstrapClient from '@/components/BootstrapClient';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <main>
      <BootstrapClient />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h1 className="display-5 fw-bold mb-4 text-primary">À propos de l'Analyse de Sentiment</h1>
            
            <div className="card shadow-sm mb-5">
              <div className="card-body">
                <h2 className="h4 mb-3">Comment fonctionne cette application?</h2>
                <p>
                  Cette application utilise un modèle d'intelligence artificielle avancé pour analyser le sentiment 
                  exprimé dans des tweets. Le système est capable de déterminer si un message est globalement positif 
                  ou négatif et d'indiquer un niveau de confiance sur cette prédiction.
                </p>
                
                <h3 className="h5 mt-4">Architecture de la solution</h3>
                <p>
                  Notre solution s'appuie sur une architecture moderne:
                </p>
                <ul>
                  <li><strong>Frontend:</strong> Application Next.js interactive et réactive</li>
                  <li><strong>Backend:</strong> API FastAPI optimisée pour les prédictions rapides</li>
                  <li><strong>Modèle:</strong> Réseau neuronal LSTM entraîné sur des données réelles de Twitter</li>
                </ul>
                
                <h3 className="h5 mt-4">Technologie MLOps</h3>
                <p>
                  Notre modèle est intégré dans une démarche MLOps complète:
                </p>
                <ul>
                  <li>Suivi des expérimentations avec MLflow</li>
                  <li>Déploiement continu avec tests automatisés</li>
                  <li>Surveillance des performances du modèle en production</li>
                  <li>Amélioration constante basée sur les retours utilisateurs</li>
                </ul>
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="card h-100 shadow-sm border-primary">
                  <div className="card-body">
                    <h3 className="h4 card-title">
                      <i className="bi bi-graph-up-arrow text-primary me-2"></i>
                      Précision
                    </h3>
                    <p className="card-text">
                      Notre modèle a été entraîné sur un large corpus de données de Twitter
                      et a atteint une précision supérieure à 80% sur des jeux de test indépendants.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 mb-4">
                <div className="card h-100 shadow-sm border-primary">
                  <div className="card-body">
                    <h3 className="h4 card-title">
                      <i className="bi bi-shield-check text-primary me-2"></i>
                      Confidentialité
                    </h3>
                    <p className="card-text">
                      Vos données sont traitées localement et ne sont pas stockées sur nos serveurs.
                      Seules les prédictions sont conservées temporairement pour améliorer le service.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 mb-4">
                <div className="card h-100 shadow-sm border-primary">
                  <div className="card-body">
                    <h3 className="h4 card-title">
                      <i className="bi bi-lightning-charge text-primary me-2"></i>
                      Performance
                    </h3>
                    <p className="card-text">
                      Notre API est optimisée pour traiter rapidement vos tweets,
                      avec un temps de réponse moyen inférieur à 200ms.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 mb-4">
                <div className="card h-100 shadow-sm border-primary">
                  <div className="card-body">
                    <h3 className="h4 card-title">
                      <i className="bi bi-arrows-angle-expand text-primary me-2"></i>
                      Évolutivité
                    </h3>
                    <p className="card-text">
                      Le système peut facilement s'adapter à des volumes importants de requêtes
                      et être intégré dans d'autres applications via notre API.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <Footer />
          </div>
        </div>
      </div>
    </main>
  );
}