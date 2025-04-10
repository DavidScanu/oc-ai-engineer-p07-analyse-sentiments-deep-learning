'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function NavBar() {
  const [theme, setTheme] = useState('light')
  
  // Initialiser le thème au chargement du composant
  useEffect(() => {
    // Vérifier s'il y a un thème sauvegardé
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-bs-theme', savedTheme)
  }, [])
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-bs-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <nav className={`navbar navbar-expand-lg ${theme === 'light' ? 'navbar-light bg-light' : 'navbar-dark bg-dark'} shadow-sm`}>
      <div className="container">
        <Link href="/" className="navbar-brand d-flex align-items-center">
          <img src="logo-air-paradis-app-400.png" alt="Logo" className="me-2" width="40" height="40" />
          <span>Air Paradis - Analyse de Sentiments</span>
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link href="/compare" className="nav-link">
                <i className="bi bi-bar-chart me-1"></i> Comparaison
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/about" className="nav-link">
                <i className="bi bi-info-circle me-1"></i> À propos
              </Link>
            </li>
            <li className="nav-item ms-2">
              <button 
                className={`btn ${theme === 'light' ? 'btn-outline-dark' : 'btn-outline-light'} btn-sm`}
                onClick={toggleTheme}
              >
                {theme === 'light' ? (
                  <><i className="bi bi-moon-fill me-1"></i> Mode sombre</>
                ) : (
                  <><i className="bi bi-sun-fill me-1"></i> Mode clair</>
                )}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}