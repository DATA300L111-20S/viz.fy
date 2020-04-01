FROM ubuntu:18.04
RUN apt-get update && apt-get install \
  -y --no-install-recommends python3 python3-virtualenv

RUN python3 -m virtualenv --python=/usr/bin/python3 /opt/venv

# Install dependencies:
COPY requirements.txt .
RUN . /opt/venv/bin/activate && pip install -r requirements.txt

# Run the application:
COPY myapp.py .
CMD . /opt/venv/bin/activate && exec python myapp.py
