# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Copy requirements.txt first to leverage Docker cache
COPY requirements.txt ./

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application code
COPY . .

# Expose the port the ML API runs on
EXPOSE 8000

# Run uvicorn server
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
