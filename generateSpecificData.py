import shutil
import json
import collections

def copyFilesToClient():
    shutil.copy2('./top200TracksD3.json', './static/data/top200TracksD3.json')
    shutil.copy2('./top200Histogram.json', './static/data/top200Histogram.json')
    return True


def buildBarChart():
    barChartData = {"Artist_Data": []}
    with open('top200TracksGolden.json') as top200rawJSON_read:
        goldenTrackData = json.load(top200rawJSON_read)
        goldenTrackData = goldenTrackData['Track']
        artist = ""
        track_id = ""
        artistCount = 0
        misses=0
        accountedForArtist = []
        for tracks in goldenTrackData:
            artist = tracks['Artist']
            track_id = tracks['URL']
            count = 1

            if artist in accountedForArtist:
                misses = misses+1
            else:
                for iterator in goldenTrackData:
                    if iterator['Artist'] == artist and iterator['URL'] != track_id:
                        count = count + 1
                accountedForArtist.append(artist)
                tracks['Count'] = count
                barChartData["Artist_Data"].append(tracks)

        with open('top200Histogram.json', 'w') as top200rawJSON_write:
            top200rawJSON_write.write(json.dumps(barChartData, indent=4))
            top200rawJSON_write.close()
    top200rawJSON_read.close()

    return True
