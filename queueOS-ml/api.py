from fastapi import FastAPI
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import os

app = FastAPI(
    title="QueueOS ML Service",
    description="Wait time prediction API for QueueOS",
    version="1.0.0"
)

# Load model once at startup — fail early if the file is missing
MODEL_PATH = "wait_time_model.pkl"
if not os.path.exists(MODEL_PATH):
    raise RuntimeError(
        f"Model file '{MODEL_PATH}' not found. "
        "Run train_model.py first to generate it."
    )

model = joblib.load(MODEL_PATH)


class PredictRequest(BaseModel):
    businessCategory: str = Field(
        ...,
        description="Category of the business",
        examples=["Hospital"]
    )
    serviceType: str = Field(
        ...,
        description="Type of service being requested",
        examples=["Consultation"]
    )
    queueLength: int = Field(
        ...,
        ge=0,
        description="Number of people currently in the queue"
    )
    hourOfDay: int = Field(
        ...,
        ge=0,
        le=23,
        description="Current hour of the day (0-23)"
    )
    dayOfWeek: int = Field(
        ...,
        ge=1,
        le=7,
        description="Day of the week (1=Monday, 7=Sunday)"
    )
    avgServiceDuration: int = Field(
        ...,
        ge=1,
        description="Average time in minutes to serve one customer"
    )
    staffCount: int = Field(
        ...,
        ge=1,
        description="Number of staff currently serving"
    )


class PredictResponse(BaseModel):
    PredictionWaitTime: float


@app.post("/predict", response_model=PredictResponse)
def predict(data: PredictRequest):
    df = pd.DataFrame([data.model_dump()])
    prediction = model.predict(df)

    return PredictResponse(
        PredictionWaitTime=round(float(prediction[0]), 2)
    )


@app.get("/health")
def health():
    return {"status": "ok"}
