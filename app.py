import json
from flask import Flask, request, redirect, render_template
from flask_cors import CORS
import requests
from urllib.parse import quote
import env as config
from cachetools import TTLCache
import generateSpecificData as DataBuilder
from spotiPY import generateRawDataFiles, generateGoldenDataFiles

# Authentication Steps, paramaters, and responses are defined at:
# https://developer.spotify.com/web-api/authorization-guide/
# Visit this url to see all the steps, parameters, and expected response.

app = Flask(__name__)
CORS(app)
cache = TTLCache(maxsize=10, ttl=86400)

#  Client Keys
CLIENT_ID = config.getClientID()
CLIENT_SECRET = config.getClientSecret()

# Spotify URLS
SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_API_BASE_URL = "https://api.spotify.com"
API_VERSION = "v1"
SPOTIFY_API_URL = "{}/{}".format(SPOTIFY_API_BASE_URL, API_VERSION)

# Server-side Parameters
CLIENT_SIDE_URL = config.getClientHost()

PORT = 8080
REDIRECT_URI = "{}:{}/callback/q".format(CLIENT_SIDE_URL, PORT)
SCOPE = "playlist-modify-public playlist-modify-private"
STATE = ""
SHOW_DIALOG_bool = True
SHOW_DIALOG_str = str(SHOW_DIALOG_bool).lower()

auth_query_parameters = {
    "response_type": "code",
    "redirect_uri": REDIRECT_URI,
    "scope": SCOPE,
    "client_id": CLIENT_ID
}


# Handle not founds
@app.errorhandler(404)
def page_not_found(e):
    return render_template('error.html'), 404


@app.route("/about")
def about():
    return render_template('aboot.html')


# Home Route
@app.route("/")
def index():
    # Auth Step 1: Authorization
    url_args = "&".join(["{}={}".format(key, quote(val)) for key, val in auth_query_parameters.items()])
    auth_url = "{}/?{}".format(SPOTIFY_AUTH_URL, url_args)
    return redirect(auth_url)


# call back - auth route
@app.route("/callback/q")
def callback():
    # Auth Step 4: Requests refresh and access tokens
    auth_token = request.args['code']
    code_payload = {
        "grant_type": "authorization_code",
        "code": str(auth_token),
        "redirect_uri": REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
    }
    post_request = requests.post(SPOTIFY_TOKEN_URL, data=code_payload)

    # Auth Step 5: Tokens are Returned to Application
    response_data = json.loads(post_request.text)

    # Page-Reload or Non-Login
    if response_data == {'error': 'invalid_grant', 'error_description': 'Invalid authorization code'}:
        url_args = "&".join(["{}={}".format(key, quote(val)) for key, val in auth_query_parameters.items()])
        auth_url = "{}/?{}".format(SPOTIFY_AUTH_URL, url_args)
        return redirect("/")

    try:
        access_token = response_data["access_token"]
    except Exception as e:
        return redirect("/")


    # Auth Step 6: Use the access token to access Spotify API
    authorization_header = {"Authorization": "Bearer {}".format(access_token)}

    # Get profile data
    #Wuser_profile_api_endpoint = "{}/me".format(SPOTIFY_API_URL)
    #profile_response = requests.get(user_profile_api_endpoint, headers=authorization_header)
    #profile_data = json.loads(profile_response.text)

    # ============= VIZ WORK START ====================

    generateRawFilesFromCache()
    generateGoldenFilesFromCache(authorization_header)
    generateSpecificChartDataFromCache()
    return render_template("index.html")


# Implements a cache to only generate files once
def generateRawFilesFromCache():
    try:
        glove = cache['RAW_FILES']
        print('Cache Hit . . . @generateRawFilesFromCache()')
    except Exception as e:
        print('Cache Miss . . . @generateRawFilesFromCache()')
        print('Generating Cache Table for RAW_FILES: [TTL = '+str(cache.ttl)
              + ' seconds = '+str((cache.ttl/60)/60)
              + ' hours]')

        cache['RAW_FILES'] = generateRawDataFiles()


# Implements a cache to only generate files once
def generateGoldenFilesFromCache(authorization_header):
    try:
        glove = cache['GOLDEN_FILES']
        print('Cache Hit . . . @generateGoldenFilesFromCache()')
    except Exception as e:
        print('Cache Miss . . . @generateGoldenFilesFromCache()')
        print('Generating Cache Table for GOLDEN_FILES: [TTL = ' + str(cache.ttl)
              + ' seconds = ' + str((cache.ttl / 60) / 60)
              + ' hours]')

        cache['GOLDEN_FILES'] = generateGoldenDataFiles(authorization_header)


# Implements a cache to only generate files once
def generateSpecificChartDataFromCache():
    try:
        glove = cache['CHART_FILES']
        print('Cache Hit . . . @generateSpecificChartDataFromCache()')
    except Exception as e:
        print('Cache Miss . . . @generateSpecificChartDataFromCache()')
        print('Generating Cache Table for CHART_FILES: [TTL = ' + str(cache.ttl)
              + ' seconds = ' + str((cache.ttl / 60) / 60)
              + ' hours]')
        cache['GOLDEN_FILES'] = DataBuilder.buildBarChart()
        DataBuilder.copyFilesToClient()

# App Running Config
if __name__ == "__main__":
    app.config['TEMPLATES_AUTO_RELOAD']=True
    app.config['DEBUG'] = True
    app.config['ENV'] = 'development'
    app.run(debug=True, port=PORT, use_reloader=True)