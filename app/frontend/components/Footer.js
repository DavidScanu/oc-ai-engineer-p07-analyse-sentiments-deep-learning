
export default function Footer() {
  return (

    <footer className="footer border-top text-center">
      <div className="container">
        <p className=''>
          Développé pour <strong>Air Paradis</strong> permettant d'anticiper les bad buzz sur les réseaux sociaux - © {new Date().getFullYear()}
        </p>
        <p className="mb-0">
          Développé par <a href="https://www.linkedin.com/in/davidscanu14/" target="_blank" rel="noopener noreferrer">David Scanu</a> dans le cadre du parcours <a href="https://openclassrooms.com/fr/paths/795-ai-engineer" target="_blank" rel="noopener noreferrer">AI Engineer</a> d'OpenClassrooms : <br/><span className='fst-italic'>Projet 7 - Réalisez une analyse de sentiments grâce au Deep Learning</span>.
        </p>
      </div>
    </footer>

  )
}