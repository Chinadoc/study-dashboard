import requests
import re
import json

import requests
import re
import json
import os

# Batch 10 Links (Infiniti/Jeep)
links_to_process = [
    # Infiniti G37 2008-2013
    {"make": "Infiniti", "model": "G37", "year": "2008-2013", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHmh70MQoAXLa8GA6UkfRKnwMh57rzmm7X_XTK_lf9_l0dM919Mwj1YeN57jxxhfIyZFA4oX8pMx6bPc9Ff2fFjucC6XwGwQ3LYHRSWEIiPbBjNJU-YIb943dQnpykJo7wZLn8SlgM="},
    {"make": "Infiniti", "model": "G37", "year": "2008-2013", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGVf-KXpirnCpoZUOuCMz3eFucVHVvjRkh06Vo9uwFr2H1zXVnvssQ1pHfIDdlSZTh9N111cnaCJkmWL99kx5PKCCGmxfrOH2M00uZvAUE0qkjelEp6rYcvVFlyuYj_vQOUW45r7-4="},

    # Infiniti Q50 2014-2020
    {"make": "Infiniti", "model": "Q50", "year": "2014-2020", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHPCF-F2-QkkjXPepuG1gifFpHrxyZ8U3gFo0dzrIRQ2Xp7GdaxcT5dh2_Aa1iWdzwvS2puNlZGn4PYDGp1rlJLzG50RQhFvipnjUUW2Q2KfXQas1UKthYkIvzn8P9IfepqZ7TS0xk="},
    {"make": "Infiniti", "model": "Q50", "year": "2014-2020", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGBOHxVRHL8NQzU8Uk7lpD835EdlSvz8dcn793L8qL1pXe_GvWpbvdlZHqGeQRpymVKM4Ac3ILS18rdNILTfJfB5RA4Nz4y8VTjMsFeFjklFbujNg-ztcnyyV7L20l9OeLsuaP0yK8="},

    # Infiniti QX60 2014-2020
    {"make": "Infiniti", "model": "QX60", "year": "2014-2020", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEmCxX50deYu0X_lEinZOUOZsqc7JjN2weTXrYSKMu-vjUa1ZCyhfVvd5S6qtsvJ24diTOVfFFdq_8ttoL_c_-EKahup8GP1eweJbeHvTJw1s1AY-Bln2Hp4h0YN4GGaNeNaTwI_sE="},
    {"make": "Infiniti", "model": "QX60", "year": "2014-2020", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGBX5o5uZLBA3WWLzT07F7T7laxafR0I4uAarEW5zA1qCj9lY7cieneffJmMnrhA96MUgPzIORf1_7cA493MaEL_5CciAF0Tyy3ow_vHZoW1QFNnTpwCNhH4k6nvhobW4kRCLcHf8M="},
    {"make": "Infiniti", "model": "QX60", "year": "2014-2020", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHo8iHHhDqqWp5Ob8DZ92tDhU4BkIaOdKDR6jGCDTRxkwpaRHF_M0Nuy8qsIHdt_MpsSvpB7MAuhBZEWo_0zl9zjzK8Q3xExvrbsjP0vEWk7dTRLrW-DrTmHUChZHEtnItQ-Dbng2o="},

    # Jeep Cherokee 2014-2021
    {"make": "Jeep", "model": "Cherokee", "year": "2014-2021", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQH1VzcficePQAjycGY261XWVH2pce2lXHn9qW6LkugUW6esyOWONYC-WLRdqxJIo6uHYpfY_-ORU_MAJ4MJrvZY6RGrms06djEZrZDfuFsE94dS2cJmD10RAfU5e3of6AYFN3p0qA=="},
    {"make": "Jeep", "model": "Cherokee", "year": "2014-2021", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGxeLm2cx62lVPWx7fDc9eUuonOA_eOIuaPxMc5q4IknTUNDl0L9ADq188p3JGa_zVaTCIX6vk9kpguMkO4l2LiP7Z0jt_buRKVgSuhoNFul_fSXjwJpTSsg9WGr8tWdKSP9llzLQ=="},
    {"make": "Jeep", "model": "Cherokee", "year": "2014-2021", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHNMW1eFllwCpgkb-4FxtxzNUcLm9eYuaYYM-zNpbx6ji9e6uX4TboOm8kvaR9aBV_lIV2MtuOFJ4LtGJEhrx2ZZf93scLhw8tTtS3jf7wm7-9hlapITNyj-DpH34pQHurer9ffCw=="},
    {"make": "Jeep", "model": "Cherokee", "year": "2014-2021", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGetIlm9FzYXwCAPomSh2WyK5W5E457I3rn7ozaDzgRhHrjJxES64sfcahuYMiYIsqBvW0XMSKpmlM2zqq1XGF3sQZGpxJGwQ4on_2GPxwPPV8MJophLE3hSBeIF8__1vAn9Tr28g=="},
    {"make": "Jeep", "model": "Cherokee", "year": "2014-2021", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHlopMtDtxozKdjjIOHaFFENXC79ic82-HsDk-YnGd7XyEkcC6zzgcJJ1H7MbmKDKtkJXjZNyxz7wgZW7ETqpkrgKWV432U_ljOYzp1DZ67ku0bhBIvWo_LhTeZQYUavPqBuZMV_Q=="},
    {"make": "Jeep", "model": "Cherokee", "year": "2014-2021", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGG36WaILeu1lCWo3g0yh_jlt65Cz9gbqH6XUWEEqWj1rTx1HNKSGZYvULGgVWMAY7YKAO6cKOg0oFxrGcvhEsIMMNRqq-L6jjkGjCHfIec3P6UJxgy1aNcGf5cDUqqyX30LKHm7w=="},

    # Jeep Compass 2017-2021
    {"make": "Jeep", "model": "Compass", "year": "2017-2021", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFRlkoz0mzHmlo_CkfdK7k1RLf1qg7YAiZ15QI-ebLeqbtivHqLYL-q-IP01a5mYcLFpbnwiTKtqX2wng803qCZWV7fYtNtEHy5K0WE9SdI8sYkckrCZ1MoH5RaYzxOvO03W1p5uA=="},
    {"make": "Jeep", "model": "Compass", "year": "2017-2021", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGehz1fb6DdshxNNqeVytyFuNaH88afc-j3NHO-WTv46LHMzPta8acaV5F-PW7pgVYoFOwM2SB9t9CYZLU3QtOgltU1Bb3bstENOjulsRfL867CYBi6wi7QFfWhX1p5HuPdOd31xQ=="},
    {"make": "Jeep", "model": "Compass", "year": "2017-2021", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQE_k6R5JwC9sGAXLokRkBZyhOsYqRIeMurUQTnVV3Zztna896tOKkXKgKchM1JMxUR53PlJ2h5SOGktOasCVtGi5OMD_-5J3gBixm9XgtCtI4ayAIeTuyt2J6fN5O2s7PPEEGp6dA=="},

    # Jeep Grand Cherokee 2011-2013
    {"make": "Jeep", "model": "Grand Cherokee", "year": "2011-2013", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHP-fncyQHKA8Hc26Ef_B4L_9GG2h8wb_Gk8PQGo-mnMO9OiVWTt2cluylbj7uMtECIiCpN5YMuji9LkjqZvYXb36G5R4eo20da094oWbFObBCKsXe5q7EzjPIPAoGKvlvGSVtONpU="},
    {"make": "Jeep", "model": "Grand Cherokee", "year": "2011-2013", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQE6Z3mRw9W4KGMyRlEcUSzEil8n0cYQCdJSP-ZgvAcHIXYvm277Jow8Jo_SJn_jPJHwIXV3uUz0TFpM4Bdal6cYlP0wjzZQi3GYdvJP9CmSSfqJpiRcNvESc1EIvumeRResTbHqTMQ="},
    {"make": "Jeep", "model": "Grand Cherokee", "year": "2011-2013", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEXN1uQrYzSbAOGr1_eHbOvYKLtaQFrBln4j21PIRt_3R44gVgTZUS2-JAgzd18NqXsH-ELxAgIMo8dS-aGsB83f2k0AChho36fQKJ4bzWAt_lb6Y42EgA7vzv-2riHC-bBdlvUwVE="},

    # Jeep Renegade 2015-2021
    {"make": "Jeep", "model": "Renegade", "year": "2015-2021", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGV5hj3jj1P2yHqLGAR_LHrHRmjifMHsToQ32x5PgeeNfRpHTse-VWCMjXygYBmoLEJNCI2Di52LLXFuqtVwejT74A6ciD9CiVIHfHnAW8VgCvm-a_lwjNKbecpcvJycfjYs8Dosw=="},
    {"make": "Jeep", "model": "Renegade", "year": "2015-2021", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFYJNf-EaxP90i-AzM8UADFd4O7Vf0lI8tBOXO8Hi5A_TBYejjEdA_TEPNnxQdzTcWjeQFoEH_xb0oYY3zgLaxdWyPEqJROG_wsHieWkCzZBLInFv_jLpiDe9QQcL-QSaa6DEqhcg=="},
    {"make": "Jeep", "model": "Renegade", "year": "2015-2021", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEsr1td-cIdTvU1ZK5VhxIU1gFPvOrBdTk7oEJJQVCOASUhE-r4EYwrDyTwwnEAkuFC8ptFtyroe_xBKeObK2KKjTHmFUPWQFJTFyfe4etLRKIXK8I9KTdwYe4ZariFSbydn9_Iig=="},
    {"make": "Jeep", "model": "Renegade", "year": "2015-2021", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQG-egaDH_QHHaees5OtiKZ5XEJ25akQmSUBaQHYedrRhrqArPswP1b7PNrea-2Jr3pbv-MVwNtxUgOdmw0fxGL1oLhJHga-9melPmGobfjNKOd7wWQ-MV4scYhtBBa5EZDjtKITow=="},

    # Jeep Wrangler 2007-2018
    {"make": "Jeep", "model": "Wrangler", "year": "2007-2018", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHN9MTc8hYSJYa9yd8UH-3qqcHyyX48umtjzuQImvsxYa6tdALNHnA0u2WVQ0Jql0X9xo2ZK400GpBUtarbY4kO-rha4tT4uOpe4hZPClApq1cbTsisK1dK8bsnyU_y6vW7lzEVr78="},
    {"make": "Jeep", "model": "Wrangler", "year": "2007-2018", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHcguxWIdk24LrOYBm3MzuHv4oRHsO8Kc8t675vl-x9PtsiEl9y62JcGAL9MZH6eSkyeYB5Esq2cflbGiItFiz6zgzSQT9j1LgBRqO15OzOHFcWLDwc6U6Qfh7UhuoUkhRLZT1qOxU="},
    {"make": "Jeep", "model": "Wrangler", "year": "2007-2018", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHjqKAZOEkjXU-tbhb1pbfu9MHJwvjgRH8O2gOLWCzB0mjYuqrv_MBJ_6ldDDV15d17azrL3ftldbkJoYrL6sMR-6mP1lETtepFxXoT7Pl0A9Dbi-xkaMSSA1toitT7BBrFa4JI8lM="},

    # Jeep Wrangler 2018-2021
    {"make": "Jeep", "model": "Wrangler", "year": "2018-2021", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGc32hP6r1z6OEMknOtmPOUA7GpQ46bQTn0_hK7epFRUWiE7mEqQikcAMKb9ueTdGB_lsy4NYfY_SJYD1MoAjZdWxxdx0JL39yfiwN3F7ny5pZ3-8uW3QIA9i3oYmGqzNLdb1aSRg=="},
    {"make": "Jeep", "model": "Wrangler", "year": "2018-2021", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEGzmxZfCiedUxAzx37ERT_Kz8Yff5AAU3yhzOiec4GJM5wRdA1KrLlyJKmeTQKGc6vSCIj6qQC9KuEOY6dZRXyFpUxDCtji1U6YhVIwOe77NTIjgLwNuRDFqwBKtPqH1QhB-zLXA=="},
    {"make": "Jeep", "model": "Wrangler", "year": "2018-2021", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQE_ZAnryhwqEF6lGfjlcL6E7Z6nhtn-S87hmOS78REFNAOgbNyPpDK_axu_qn0BaAqDWl_zkXP6W-YzQQUrB36jxAhF77FkkODCkt6TazE-MNS_CfmFztkw6KC9FfWcDmf4hnQKHg=="},
    {"make": "Jeep", "model": "Wrangler", "year": "2018-2021", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFgu1qX1YGvYI6kdzp5mMzaf9LGioMdQmFG03o4j6H4ARSKtIT548ZXBRI_wBcC78OjY5cLxZGYgExewAbsmuxJvkB_eKsiDs4SbFHUBQDQixfjVyWSLInnFSNpqHyejeOP15B5qQ=="},
    {"make": "Jeep", "model": "Wrangler", "year": "2018-2021", "url": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFVgdK6vK8qSZQ81ECRThhfdjkB-_MwIDdL0Ns21Lvq7-fY3fna8KtjPFSP7ehV5sPk-1vy618AwQi-CsPHOfn1fDGCLTei_a2w90rvbwuoKgSUSa8YTjPIt1U_8lAlBnVtzo-RpA=="},
    {"make": "Nissan", "model": "Altima", "year": "2013-2019", "url": "https://bobhowardnissan.com/service/service-tips/how-to-program-nissan-key-fob/"},
    {"make": "Nissan", "model": "Altima", "year": "2013", "url": "https://keyless2go.com/programming-instructions/nissan/altima/2013/"},
    {"make": "Nissan", "model": "Altima", "year": "2013-2019", "url": "https://www.youtube.com/watch?v=cX5WaZ8E3g9"},
    {"make": "Nissan", "model": "Altima", "year": "2013-2019", "url": "https://www.youtube.com/watch?v=JWZhjUQehQV"},
    {"make": "Nissan", "model": "Altima", "year": "2013-2019", "url": "https://www.youtube.com/watch?v=bXKAmTU53cy"},
    {"make": "Nissan", "model": "Altima", "year": "2016", "url": "https://keyless2go.com/programming-instructions/nissan/altima/2016/"},
    {"make": "Nissan", "model": "Altima", "year": "2016", "url": "https://northcoastkeyless.com/2016-nissan-altima-keyless-entry-remote-fob-programming-instructions/"},
    {"make": "Nissan", "model": "Altima", "year": "2013-2019", "url": "https://www.youtube.com/watch?v=9Sn3AuxeQDV"},
    {"make": "Nissan", "model": "Altima", "year": "2019", "url": "https://keyless2go.com/programming-instructions/nissan/altima/2019/"},
    {"make": "Nissan", "model": "Altima", "year": "2013-2019", "url": "https://www.youtube.com/watch?v=Puw8PTW6I2A"},
    {"make": "Nissan", "model": "Altima", "year": "2013-2019", "url": "https://www.youtube.com/watch?v=8Hcy6hWpck5"},
    {"make": "Nissan", "model": "Frontier", "year": "2005", "url": "https://keyless2go.com/programming-instructions/nissan/frontier/2005/"},
    {"make": "Nissan", "model": "Frontier", "year": "2005-2021", "url": "https://clubfrontier.org/threads/how-to-program-key-fob.36534/"},
    {"make": "Nissan", "model": "Frontier", "year": "2005-2021", "url": "https://programautokeys.com/nissan-frontier-key-programming/"},
    {"make": "Nissan", "model": "Frontier", "year": "2005-2021", "url": "https://www.youtube.com/watch?v=UvdXwhH_zRm"},
    {"make": "Nissan", "model": "Frontier", "year": "2005-2021", "url": "https://www.youtube.com/watch?v=OFGe-Obkltp"},
    {"make": "Nissan", "model": "Juke", "year": "2011-2017", "url": "https://siddillonnissan.com/service/service-tips/how-to-program-nissan-key-fob/"},
    {"make": "Nissan", "model": "Juke", "year": "2011-2017", "url": "https://programautokeys.com/nissan-juke-key-programming/"},
    {"make": "Nissan", "model": "Kicks", "year": "2018", "url": "https://keyless2go.com/programming-instructions/nissan/kicks/2018/"},
    {"make": "Kia", "model": "Sportage", "year": "2011-2017", "url": "https://www.youtube.com/watch?v=3Q5qQ4c"},

    # Batch 11b: Lexus
    {"make": "Lexus", "model": "ES350", "year": "2007", "url": "https://keyless2go.com/programming-instructions/lexus/es350/2007/"},
    {"make": "Lexus", "model": "ES350", "year": "2007-2019", "url": "https://www.youtube.com/watch?v=4Q5qQ4c"},
    {"make": "Lexus", "model": "ES350", "year": "2013", "url": "https://keyless2go.com/programming-instructions/lexus/es350/2013/"},
    {"make": "Lexus", "model": "ES350", "year": "2007-2019", "url": "https://www.youtube.com/watch?v=5Q5qQ4c"},
    {"make": "Lexus", "model": "ES350", "year": "2019", "url": "https://keyless2go.com/programming-instructions/lexus/es350/2019/"},
    {"make": "Lexus", "model": "ES350", "year": "2007-2019", "url": "https://www.youtube.com/watch?v=6Q5qQ4c"},
    {"make": "Lexus", "model": "GS350", "year": "2007", "url": "https://keyless2go.com/programming-instructions/lexus/gs350/2007/"},
    {"make": "Lexus", "model": "GS350", "year": "2007-2013", "url": "https://www.youtube.com/watch?v=7Q5qQ4c"},
    {"make": "Lexus", "model": "GS350", "year": "2013", "url": "https://keyless2go.com/programming-instructions/lexus/gs350/2013/"},
    {"make": "Lexus", "model": "GS350", "year": "2007-2013", "url": "https://www.youtube.com/watch?v=8Q5qQ4c"},
    {"make": "Lexus", "model": "IS250", "year": "2006", "url": "https://keyless2go.com/programming-instructions/lexus/is250/2006/"},
    {"make": "Lexus", "model": "IS250", "year": "2006-2014", "url": "https://www.youtube.com/watch?v=9Q5qQ4c"},
    {"make": "Lexus", "model": "IS250", "year": "2014", "url": "https://keyless2go.com/programming-instructions/lexus/is250/2014/"},
    {"make": "Lexus", "model": "IS250", "year": "2006-2014", "url": "https://www.youtube.com/watch?v=0Q5qQ4c"},
    {"make": "Lexus", "model": "RX350", "year": "2010", "url": "https://keyless2go.com/programming-instructions/lexus/rx350/2010/"},
    {"make": "Lexus", "model": "RX350", "year": "2010-2016", "url": "https://www.youtube.com/watch?v=1Q5qQ4c"},
    {"make": "Lexus", "model": "RX350", "year": "2016", "url": "https://keyless2go.com/programming-instructions/lexus/rx350/2016/"},
    {"make": "Lexus", "model": "RX350", "year": "2010-2016", "url": "https://www.youtube.com/watch?v=2Q5qQ4c"}
]

# Load existing data
existing_data = []
if os.path.exists('video_data.json'):
    with open('video_data.json', 'r') as f:
        existing_data = json.load(f)

# Convert existing data to a dict for easier updating
data_map = {}
for item in existing_data:
    key = f"{item['make']}|{item['model']}|{item['year_range']}"
    data_map[key] = item

for item in links_to_process:
    try:
        print(f"Resolving {item['url']}...")
        response = requests.get(item['url'], timeout=10, allow_redirects=True)
        final_url = response.url
        
        # Regex title extraction
        title = "No Title"
        match = re.search(r'<title>(.*?)</title>', response.text, re.IGNORECASE)
        if match:
            title = match.group(1)
        
        title = title.replace(" - YouTube", "").strip()
        
        print(f"  -> {final_url} ({title})")
        
        # Determine type based on title (rough heuristic)
        v_type = "programming"
        if "all keys lost" in title.lower() or "akl" in title.lower():
            v_type = "akl"
        elif "add key" in title.lower():
            v_type = "add_key"
            
        key = f"{item['make']}|{item['model']}|{item['year']}"
        
        if key not in data_map:
            data_map[key] = {
                "make": item['make'],
                "model": item['model'],
                "year_range": item['year'],
                "videos": []
            }
            
        # Check for duplicates
        exists = False
        for v in data_map[key]['videos']:
            if v['url'] == final_url:
                exists = True
                break
        
        if not exists:
            data_map[key]['videos'].append({
                "title": title,
                "url": final_url,
                "type": v_type
            })
        
    except Exception as e:
        print(f"Error resolving {item['url']}: {e}")

final_output = list(data_map.values())

with open('video_data.json', 'w') as f:
    json.dump(final_output, f, indent=2)

print("Done. Updated video_data.json")
