# VIZ.FY FLASK APP
# Author: Nicolas Mays
# 2020

FROM ubuntu:18.04

# Install Python and Virutal Env:
RUN apt-get update && apt-get install \
  -y --no-install-recommends python3 python3-virtualenv

RUN python3 -m virtualenv --python=/usr/bin/python3 /opt/venv

# Copy Over Source Code:
COPY requirements.txt .
COPY ./static ./static
COPY ./templates ./templates
COPY env.py .
COPY .env .
COPY spotiPY.py .
COPY app.py .

# Install Requirements:
RUN . /opt/venv/bin/activate && pip install -r requirements.txt

# Run the Application:
CMD . /opt/venv/bin/activate && exec python app.py
