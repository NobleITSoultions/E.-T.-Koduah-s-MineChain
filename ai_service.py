from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import datetime

app = FastAPI(title="Mining Supply Chain AI Service")

class TransactionData(BaseModel):
    batchId: str
    weightAtStage: float
    originalWeight: float
    stage: str
    location: str

# Mock model training (In a real scenario, this would load a pre-trained model)
# We use Isolation Forest for anomaly detection
model = IsolationForest(contamination=0.1, random_state=42)
# Pre-train with some dummy data
dummy_data = np.random.normal(0, 1, (100, 2))
model.fit(dummy_data)

@app.post("/predict")
async def predict_anomaly(data: TransactionData):
    try:
        # Feature Engineering
        weight_loss = data.originalWeight - data.weightAtStage
        weight_loss_pct = (weight_loss / data.originalWeight) * 100
        
        # Prepare features for the model
        # For demo, we use weight loss percentage as the primary feature
        features = np.array([[weight_loss_pct, len(data.location)]])
        
        # Predict anomaly (-1 for anomaly, 1 for normal)
        prediction = model.predict(features)[0]
        
        # Calculate a pseudo-score based on distance from decision boundary
        decision_score = model.decision_function(features)[0]
        # Normalize score to 0-1 range (lower decision_score means more anomalous)
        anomaly_score = 1.0 / (1.0 + np.exp(decision_score * 5))
        
        return {
            "anomalyScore": float(anomaly_score),
            "isSuspicious": bool(prediction == -1 or anomaly_score > 0.6),
            "classification": "suspicious" if prediction == -1 else "normal",
            "timestamp": datetime.datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
