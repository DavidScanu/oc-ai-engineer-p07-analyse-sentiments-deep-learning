import sys
import os
import pytest
from fastapi.testclient import TestClient

# Ajout du répertoire parent au chemin Python
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app

@pytest.fixture
def client():
    """Fixture fournissant un client de test pour l'application FastAPI, avec gestion du lifespan."""
    with TestClient(app) as c:
        yield c
