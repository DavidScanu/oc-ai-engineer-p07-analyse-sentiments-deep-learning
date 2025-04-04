import { Open_Sans } from 'next/font/google'
import './globals.css'

// Importation de Bootstrap CSS et des icônes
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

// Configurer Open Sans comme police principale
const openSans = Open_Sans({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-open-sans'
})

export const metadata = {
  title: 'Prédiction de Sentiment pour Tweets',
  description: 'Analysez le sentiment de vos tweets avec IA',
}

import NavBar from '@/components/NavBar'

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={openSans.className}>
        <NavBar />
        {children}
      </body>
    </html>
  )
}