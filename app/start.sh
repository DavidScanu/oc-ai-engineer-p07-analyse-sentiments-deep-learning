#!/bin/bash

MODE=$1

case "$MODE" in
  local)
    echo "🚀 Démarrage du projet Air Paradis en mode LOCAL"
    
    # Démarrer le backend (remplacez cette commande si nécessaire)
    echo "📡 Démarrage du backend FastAPI..."
    cd fastapi
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    cd ..
    
    # Démarrer le frontend
    echo "🖥️ Démarrage du frontend Next.js..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    echo "✅ Application démarrée en mode LOCAL!"
    echo "   - API: http://localhost:8000"
    echo "   - Frontend: http://localhost:3000"
    echo ""
    echo "Appuyez sur CTRL+C pour arrêter tous les services"
    
    # Gérer l'arrêt propre des services
    trap "kill $BACKEND_PID $FRONTEND_PID; echo 'Arrêt des services...'; exit 0" INT
    wait
    ;;
    
  docker)
    echo "🐳 Démarrage du projet Air Paradis avec Docker Compose"
    
    # Démarrer les conteneurs
    docker compose up -d
    
    echo "✅ Application démarrée en mode DOCKER!"
    echo "   - API: http://localhost:8000"
    echo "   - Frontend: http://localhost:3000"
    echo ""
    echo "Pour voir les logs: docker compose logs -f"
    echo "Pour arrêter: docker compose down"
    ;;
    
  *)
    echo "❌ Usage: ./start.sh [local|docker]"
    echo ""
    echo "Options:"
    echo "  local  - Démarre l'application en mode développement local"
    echo "  docker - Démarre l'application avec Docker Compose"
    exit 1
    ;;
esac