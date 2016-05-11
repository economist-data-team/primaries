#!/usr/bin/env python3
import requests
import csvkit as csv

CANDIDATE_KEYS = {
    "O'Malley" : "omalley",
    "Clinton" : "clinton",
    "Sanders" : "sanders",
    "Huckabee" : "huckabee",
    "Cruz" : "cruz",
    "Kasich" : "kasich",
    "Carson" : "carson",
    "Trump" : "trump",
    "Rubio" : "rubio",
    "Christie" : "christie",
    "Bush" : "bush",
    "Fiorina" : "fiorina",
    "Paul" : "paul",
    "Uncommitted" : "uncommitted",
}

URL = 'https://interactives.ap.org/interactives/2016/delegate-tracker/live-data/data/delegates-delsuper.json'
r = requests.get(URL)
supers = r.json()['delSuper']['del']

for party in supers:
    states = party['State']
    for state in states:
        candidates = state['Cand']
        for cand in candidates:
            cand['pTot'] = int(cand['dTot']) - int(cand['sdTot'])

dem, rep = [p['State'] for p in supers]

rep_dels = [dict([('state', s['sId']), ('party', 'GOP')] + [('%s_del' % CANDIDATE_KEYS.get(c['cName']), c['pTot']) for c in s['Cand'] if c['cName'] in CANDIDATE_KEYS.keys()]) for s in rep]
dem_dels = [dict([('state', s['sId']), ('party', 'DEM')] + [('%s_del' % CANDIDATE_KEYS.get(c['cName']), c['pTot']) for c in s['Cand'] if c['cName'] in CANDIDATE_KEYS.keys()]) for s in dem]

dels = dem_dels + rep_dels

with open('delegates_ap.csv', 'w+') as f:
    writer = csv.DictWriter(f, fieldnames=set(dem_dels[0].keys()).union(set(rep_dels[0].keys())))
    writer.writeheader()
    writer.writerows(dels)
