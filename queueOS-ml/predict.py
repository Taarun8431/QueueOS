import joblib
import pandas as pd

model = joblib.load("wait_time_model.pkl")

sample = pd.DataFrame([{
    "businessCategory": "Hospital",
    "serviceType": "Consultation",
    "queueLength": 12,
    "hourOfDay": 11,
    "dayOfWeek": 2,
    "avgServiceDuration": 15,
    "staffCount": 3
}])

prediction = model.predict(sample)

print(f"Predicted Wait Time: {prediction[0]:.2f} minutes")