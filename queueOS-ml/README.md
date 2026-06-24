# QueueOS ML Service

Wait time prediction service built with FastAPI and scikit-learn.

## Setup

```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

## Usage

```bash
# 1. Generate the training dataset
python generate_dataset.py

# 2. Train the model (produces wait_time_model.pkl)
python train_model.py

# 3. Start the API server
python -m uvicorn api:app --reload
```

API will be available at `http://localhost:8000`

## Endpoint

`POST /predict`

```json
{
  "businessCategory": "Hospital",
  "serviceType": "Consultation",
  "queueLength": 10,
  "hourOfDay": 11,
  "dayOfWeek": 2,
  "avgServiceDuration": 20,
  "staffCount": 3
}
```

Response:
```json
{
  "PredictionWaitTime": 68.52
}
```
