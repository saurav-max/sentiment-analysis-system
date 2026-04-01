from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI()

model = joblib.load("model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

class PredictionRequest(BaseModel):
    text: str

class PredictionResponse(BaseModel):
    prediction: str
    confidence: float


@app.get("/")
def home():
    return {"message": "AI Service Running"}


@app.post("/predict")
def predict(data: PredictionRequest):

    text_vector = vectorizer.transform([data.text])

    prediction = model.predict(text_vector)[0]

    confidence = max(model.predict_proba(text_vector)[0])

    return {
        "prediction": prediction,
        "confidence": float(confidence)
    }