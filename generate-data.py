
import datetime
import numpy as np
import json

activities_list = ["nothing", "sick", "basketball",
                   "gym", "running", "badminton", "squash"]
probabilities = [0.3, 0.05, 0.15, 0.1, 0.2, 0.13, 0.07]

date = datetime.datetime(2019, 1, 1)
end_date = datetime.datetime.now()
data = []

while date < end_date:
    activity = np.random.choice(activities_list, 1, p=probabilities)[0]
    entry = {}
    entry[date.strftime("%Y-%m-%d")] = activity
    data.append(entry)
    date = date + datetime.timedelta(days=1)

with open('mock-data.json', 'w') as f:
    json.dump(data, f)
