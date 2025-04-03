import TweetForm from '@/components/TweetForm';
import BootstrapClient from '@/components/BootstrapClient';
import ApiStatus from '@/components/ApiStatus';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <BootstrapClient />
      <ApiStatus />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <div className="text-center mb-5">
              <h1 className="display-5 fw-bold text-primary">Analyse de Sentiment pour Tweets</h1>
              <p className="lead text-secondary">
                Entrez un tweet et découvrez s'il est perçu comme positif ou négatif grâce à notre modèle d'IA
              </p>
            </div>
            
            <TweetForm />
            
            <div className="mt-5 text-center">
              <div className="row">
                <div className="col-md-6">
                  <div className="card shadow-sm mb-3 positif-bg">
                    <div className="card-body">
                      <h5 className="card-title">
                        <span className="me-2">😊</span>
                        Tweets Positifs
                      </h5>
                      <p className="card-text">Contiennent des émotions positives, compliments, satisfaction, joie</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card shadow-sm mb-3 negatif-bg">
                    <div className="card-body">
                      <h5 className="card-title">
                        <span className="me-2">😠</span>
                        Tweets Négatifs
                      </h5>
                      <p className="card-text">Contiennent des plaintes, critiques, mécontentement, frustration</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />

    </main>
  );
}