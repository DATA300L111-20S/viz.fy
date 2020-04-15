import requests
import json
import csv
import collections

# api-endpoints
TOP200_URL = "https://spotifycharts.com//regional/us/daily/latest/download"
TRACK_URL_PREFIX = "https://open.spotify.com/track/"
AUDIO_FEATURE_URL = "https://api.spotify.com/v1/audio-features"

def generateRawDataFiles():
    # sending get request for top200tracks.csv
    top200request = requests.get(url = TOP200_URL)

    # Write the raw CSV to a file
    with open('top200TracksRaw.csv', 'w') as top200rawCSV_write:
        popOne = top200request.content.split(b'\n')[1:]
        popOne = b'\n'.join(popOne)
        top200rawCSV_write.write(popOne.decode())
        top200rawCSV_write.close()

    csvData = {"Tracks":[]}
    # Read raw CSV
    with open('top200TracksRaw.csv') as top200rawCSV_read:
        csvReader = csv.DictReader(top200rawCSV_read)

        for rows in csvReader:
            rows['URL']= str(rows['URL']).split('/')[4]
            csvData["Tracks"].append(rows)
        top200rawCSV_read.close()

    # Write CSV to JSON
    with open('top200TracksRaw.json', 'w') as top200rawJSON_write:
        orderedData = collections.OrderedDict(sorted(csvData.items()))
        top200rawJSON_write.write(json.dumps(orderedData, indent=4))
        top200rawJSON_write.close()

    # Return is for code completion
    return json.dumps(orderedData, indent=4)

def generateGoldenDataFiles(authorization_header):

    fullAudioFeature = {'audio_features': []}
    # Read JSON and generate collections of ID's for calls
    with open('top200TracksRaw.json') as top200rawJSON_read:
        rawTrackData = json.load(top200rawJSON_read)
        counter = 1
        idString = ""

        for tracks in rawTrackData['Tracks']:

            idString += tracks['URL']
            idString += ","

            # do first call with 100 ids (1-100)
            if counter == 100:
                idString = idString[0:(len(idString)-1)]

                params = (
                    ('ids', idString),
                )
                aud_request = requests.get(AUDIO_FEATURE_URL, headers=authorization_header,
                                    params=params)
                audioFeatureJson1 = json.loads(aud_request.text)

                #append to larger object
                for audioDat in audioFeatureJson1['audio_features']:
                    fullAudioFeature['audio_features'].append(audioDat)
                # reset id string
                idString = ""

            # do second call with 100 ids (101-200)
            if counter == 200:
                idString = idString[0:(len(idString)-1)]

                params = (
                    ('ids', idString),
                )
                aud_request = requests.get(AUDIO_FEATURE_URL, headers=authorization_header,
                                    params=params)
                audioFeatureJson2 = json.loads(aud_request.text)

                #append to larger object
                for audioDat in audioFeatureJson2['audio_features']:
                    fullAudioFeature['audio_features'].append(audioDat)

            counter += 1

        goldenTrackData = {"Track":[]}

        #iterate through audio feature json and track json to combine
        for tracks, audFeat in zip(rawTrackData['Tracks'], fullAudioFeature['audio_features']):

            #if an audio feature exists. Audio features may not exist for brand new songs
            #tracks without audio features are omitted.
            if audFeat is not None:
                tracks['Position'] = int(tracks['Position'])
                tracks['Streams'] = int(tracks['Streams'])
                tracks['danceability'] = audFeat['danceability']
                tracks['energy'] = audFeat['energy']
                tracks['loudness'] = audFeat['loudness']
                tracks['speechiness'] = audFeat['speechiness']
                tracks['acousticness'] = audFeat['acousticness']
                tracks['instrumentalness'] = audFeat['instrumentalness']
                tracks['liveness'] = audFeat['liveness']
                tracks['valence'] = audFeat['valence']
                tracks['tempo'] = audFeat['tempo']
                tracks['duration_ms'] = audFeat['duration_ms']

                goldenTrackData['Track'].append(tracks)

        # Write JSON to file
        with open('top200TracksGolden.json', 'w') as top200GoldenJSON_write:
            top200GoldenJSON_write.write(json.dumps(goldenTrackData, indent=4))
            top200GoldenJSON_write.close()

    top200rawJSON_read.close()

    # Return is for code completion
    return goldenTrackData
