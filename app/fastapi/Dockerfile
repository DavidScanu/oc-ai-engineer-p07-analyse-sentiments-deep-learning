FROM python:3.10-slim

WORKDIR /app

# Installer les dépendances nécessaires pour TensorFlow
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copier les fichiers de dépendances
COPY requirements.txt .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code de l'application
COPY main.py .
COPY .env .

# Définir les variables d'environnement pour forcer TensorFlow à utiliser le CPU
ENV CUDA_VISIBLE_DEVICES="-1"
ENV TF_FORCE_GPU_ALLOW_GROWTH="false"
ENV TF_CPP_MIN_LOG_LEVEL="2"

# Créer un répertoire pour les modèles
RUN mkdir -p model

# Exposer le port
EXPOSE 8000

# Commande de démarrage
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]