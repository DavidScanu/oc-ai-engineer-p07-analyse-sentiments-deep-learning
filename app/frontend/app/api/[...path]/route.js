import { NextResponse } from 'next/server';

// Gestionnaire pour les requêtes GET
export async function GET(request, { params }) {
  try {
    // Récupérer le chemin complet à partir des segments
    const path = params.path.join('/');
    
    // Récupérer l'URL de l'API à partir des variables d'environnement
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Extraire les paramètres de requête
    const searchParams = request.nextUrl.search || '';
    
    console.log(`Proxy API (GET): ${apiUrl}/${path}${searchParams}`);
    
    // Transmettre la requête à l'API
    const response = await fetch(`${apiUrl}/${path}${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Si la réponse n'est pas OK, renvoyer l'erreur
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }
    
    // Renvoyer la réponse au client
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur dans le proxy API (GET):', error);
    return NextResponse.json(
      { error: `Erreur de serveur: ${error.message}` },
      { status: 500 }
    );
  }
}

// Gestionnaire pour les requêtes POST
export async function POST(request, { params }) {
  try {
    // Récupérer le chemin complet à partir des segments
    const path = params.path.join('/');
    
    // Récupérer l'URL de l'API à partir des variables d'environnement
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Extraire le corps de la requête
    const body = await request.json();
    
    console.log(`Proxy API (POST): ${apiUrl}/${path}`, body);
    
    // Transmettre la requête à l'API
    const response = await fetch(`${apiUrl}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // Si la réponse n'est pas OK, renvoyer l'erreur
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }
    
    // Renvoyer la réponse au client
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur dans le proxy API (POST):', error);
    return NextResponse.json(
      { error: `Erreur de serveur: ${error.message}` },
      { status: 500 }
    );
  }
}