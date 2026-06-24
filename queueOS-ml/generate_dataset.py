import pandas as pd
import random

data=[]

business_categories=[
    "Hospital",
    "Salon",
    "Bank",
    "Government Office",
    "Service Center",
    "Passport Office",
    "Repair Center"
]

services = {
    "Hospital": ["Consultation", "Dental", "Eye Checkup", "Blood Test"],
    "Salon": ["Haircut", "Facial", "Hair Spa", "Shaving"],
    "Bank": ["Account Opening", "Cash Deposit", "Loan Inquiry"],
    "Government Office": ["Certificate Issue", "Verification", "Registration"],
    "Service Center": ["Mobile Repair", "Laptop Repair", "Inspection"],
    "Passport Office": ["Document Verification", "Biometrics"],
    "Repair Center": ["TV Repair", "AC Repair", "Washing Machine Repair"]
}

for i in range(20000):
    category=random.choice(business_categories)
    service=random.choice(services[category])
    queue_length=random.randint(1,50)
    hour_of_day=random.randint(9,18)
    day_of_week=random.randint(1,7)
    avg_service_duration=random.randint(10,40)
    staff_count=random.randint(1,10)

    wait_time=(
        (queue_length*avg_service_duration)/staff_count
    )+random.randint(-10,10)
    data.append([
        category,
        service,
        queue_length,
        hour_of_day,
        day_of_week,
        avg_service_duration,
        staff_count,
        max(wait_time, 1)
    ])

df = pd.DataFrame(
    data,
    columns=[
        "businessCategory",
        "serviceType",
        "queueLength",
        "hourOfDay",
        "dayOfWeek",
        "avgServiceDuration",
        "staffCount",
        "waitTime"
    ]
)

df.to_csv("queue_data.csv", index=False)

print("Dataset Generated Successfully")
