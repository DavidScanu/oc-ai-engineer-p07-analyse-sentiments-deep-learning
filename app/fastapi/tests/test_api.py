def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_predict_endpoint(client):
    response = client.post("/predict", json={"text": "I love flying with this airline!"})
    assert response.status_code == 200
    result = response.json()
    assert "sentiment" in result
    assert "confidence" in result  # <-- au lieu de "probability"
