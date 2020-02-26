import requests
import json
import csv
import collections

import time

#t0 = time.time()


# api-endpoints
TOP200_URL = "https://spotifycharts.com//regional/global/daily/latest/download"
TRACK_URL_PREFIX = "https://open.spotify.com/track/"
AUDIO_FEATURE_URL = ""





#response = requests.get('https://api.spotify.com/v1/audio-features/06AKEBrKUckW0KREUWRnvT', headers=headers)
#print(response.content)

# sending get request for top200tracks.csv from:
#https://spotifycharts.com//regional/global/daily/latest/download
top200request = requests.get(url = TOP200_URL)
print(type(top200request.content))

#Write the raw CSV to a file
with open('top200TracksRaw.csv', 'w') as top200rawCSV_write:
    #print(top200request.content)
    popOne = top200request.content.split(b'\n')[1:]
    print(popOne)
    popOne = b'\n'.join(popOne)

    print(popOne)
    top200rawCSV_write.write(popOne.decode())

    top200rawCSV_write.close()
print('past')
csvData = {}

#Read
with open('top200TracksRaw.csv') as top200rawCSV_read:
    csvReader = csv.DictReader(top200rawCSV_read)
    i=1
    for rows in csvReader:
        id = int(rows['Position'])
        rows['URL']= str(rows['URL']).split('/')[4]
        csvData[id] = rows
        i=i+1



    top200rawCSV_read.close()

with open('top200TracksRaw.json', 'w') as top200rawJSON_write:
    orderedData = collections.OrderedDict(sorted(csvData.items()))

    top200rawJSON_write.write(json.dumps(orderedData, indent=4))

#Above Generates a Json File containing basic track information. (artist, position, etc.)'''

#time to do a whole fucking meal of calls
with open('top200TracksRaw.json') as top200rawJSON_read:
    data = json.load(top200rawJSON_read)
    top200rawJSON_read.close()

#print('ding')
t1 = time.time()

#total = t1-t0
#print(total)
