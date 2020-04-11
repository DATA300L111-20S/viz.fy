import os
from dotenv import load_dotenv
project_folder = os.path.expanduser('/')  # adjust as appropriate
load_dotenv(os.path.join(project_folder, '.env'))


def getClientID():
    return os.getenv("CLIENT_ID")


def getClientSecret():
    return os.getenv("CLIENT_SECRET")


def getClientHost():
    return os.getenv("CLIENT_HOST")
