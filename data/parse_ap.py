#!/usr/bin/env python3
import requests
import os
import csvkit as csv
from collections import OrderedDict

CANDIDATE_KEYS = OrderedDict([
    ("O'Malley", "omalley"),
    ("Clinton", "clinton"),
    ("Sanders", "sanders"),
    ("Huckabee", "huckabee"),
    ("Cruz", "cruz"),
    ("Kasich", "kasich"),
    ("Carson", "carson"),
    ("Trump", "trump"),
    ("Rubio", "rubio"),
    ("Christie", "christie"),
    ("Bush", "bush"),
    ("Fiorina", "fiorina"),
    ("Paul", "paul"),
    ("Uncommitted", "uncommitted"),
])

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

dem_spdel = [dict([('state', 'SPD'), ('party', 'DEM')] + [('%s_del' % CANDIDATE_KEYS.get(c['cName']), c['sdTot']) for c in s['Cand']]) for s in [d for d in dem if d['sId'] == 'US']]
rep_spdel = [dict([('state', 'SPD'), ('party', 'GOP')] + [('%s_del' % CANDIDATE_KEYS.get(c['cName']), c['sdTot']) for c in s['Cand']]) for s in [d for d in rep if d['sId'] == 'US']]

script_dir_path = os.path.dirname(os.path.realpath(__file__))
outpath = os.path.join(script_dir_path, 'delegates_ap.csv')

cand_values = list(CANDIDATE_KEYS.values())

# this bit is just to ensure that the fields come out in a repeatable,
# regular order
def field_sorter(name):
    if name == 'party':
        return -1
    elif name == 'state':
        return -2
    else:
        return cand_values.index(name.split('_')[0])
fieldnames = sorted(
    set(dem_dels[0].keys()).union(set(rep_dels[0].keys())),
    key=field_sorter
)

dem_spdel[0] = {k:v for k,v in dem_spdel[0].items() if k in fieldnames}
rep_spdel[0] = {k:v for k,v in rep_spdel[0].items() if k in fieldnames}

dels = dem_dels + rep_dels + dem_spdel + rep_spdel

with open(outpath, 'w+') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(dels)
