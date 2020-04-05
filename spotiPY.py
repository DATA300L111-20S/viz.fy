import requests
import json
import csv
import collections

# api-endpoints
TOP200_URL = "https://spotifycharts.com//regional/us/daily/latest/download"
TRACK_URL_PREFIX = "https://open.spotify.com/track/"
AUDIO_FEATURE_URL = "https://api.spotify.com/v1/audio-features/"

# sending get request for top200tracks.csv from:
top200request = requests.get(url = TOP200_URL)

#Write the raw CSV to a file
with open('top200TracksRaw.csv', 'w') as top200rawCSV_write:
    popOne = top200request.content.split(b'\n')[1:]
    popOne = b'\n'.join(popOne)
    top200rawCSV_write.write(popOne.decode())
    top200rawCSV_write.close()

csvData = {"Tracks":[]}
#Read
with open('top200TracksRaw.csv') as top200rawCSV_read:
    csvReader = csv.DictReader(top200rawCSV_read)
    #i=1

    for rows in csvReader:
        #id = int(rows['Position'])
        rows['URL']= str(rows['URL']).split('/')[4]
        csvData["Tracks"].append(rows);
        #i=i+1

    top200rawCSV_read.close()

with open('top200TracksRaw.json', 'w') as top200rawJSON_write:
    orderedData = collections.OrderedDict(sorted(csvData.items()))
    top200rawJSON_write.write(json.dumps(orderedData, indent=4))
    top200rawJSON_write.close()

#Above Generates a Json File containing basic track information. (artist, position, etc.)
with open('top200TracksRaw.json') as top200rawJSON_read:
    data = json.load(top200rawJSON_read)
    for tracks in data['Tracks']:
        tracks['Cunt'] = "NIC YOU ASS"

    top200rawJSON_read.close()

def generateAudioData(authorization_header):

    with open('top200TracksRaw.json') as top200rawJSON_read:
        rawTrackData = json.load(top200rawJSON_read)
        counter = 1
        idString = ""
        for tracks in data['Tracks']:
            #tracks['Cunt'] = "NIC YOU ASS"
            print("hey")
            idString+=tracks['URL']
            idString+=","
            counter+=1
        print(idString)
    top200rawJSON_read.close()
    return 0
#generate golden json file

#generate golden csv file

#generate golden json obj

#research getting info on genre.

def main():
    return 0