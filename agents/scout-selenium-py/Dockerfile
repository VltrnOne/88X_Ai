# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Install system dependencies required for headless Chromium & Selenium
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    gnupg \
    chromium \
    chromium-driver \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the dependencies file and install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Set Chromium as the default browser for Selenium
ENV CHROME_BIN=chromium
ENV CHROMEDRIVER_BIN=chromium-driver

# Command to run the application
CMD [ "python", "main.py" ] 