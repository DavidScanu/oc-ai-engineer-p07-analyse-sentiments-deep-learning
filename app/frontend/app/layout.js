import { Inter } from 'next/font/google'
import './globals.css'

// Importation de Bootstrap CSS et des icônes
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Prédiction de Sentiment pour Tweets',
  description: 'Analysez le sentiment de vos tweets avec IA',
}

import NavBar from '@/components/NavBar'

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <NavBar />
        {children}
      </body>
    </html>
  )
}