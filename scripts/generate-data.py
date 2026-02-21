
import datetime
import numpy as np
import json

# Categories with their activity names (matches defaultCategories.ts)
categories = {
    "cat-sports": {"name": "Running", "active": True, "description": "Running and jogging activities", "activityNames": ["Running", "Trail Running"]},
    "cat-cycling": {"name": "Cycling", "active": True, "description": "Cycling activities", "activityNames": ["Cycling", "Mountain Biking"]},
    "cat-gym": {"name": "Gym & Strength", "active": True, "description": "Gym and strength training", "activityNames": ["Gym", "Weight Training"]},
    "cat-team": {"name": "Team Sports", "active": True, "description": "Team sports", "activityNames": ["Basketball", "Badminton", "Squash"]},
    "cat-rest": {"name": "Rest & Recovery", "active": False, "description": "Rest days", "activityNames": ["Nothing", "Sick"]},
}

# Flat list of (activity_name, category_id) with probabilities
activities_list = [
    ("Nothing", "cat-rest"),
    ("Sick", "cat-rest"),
    ("Basketball", "cat-team"),
    ("Gym", "cat-gym"),
    ("Running", "cat-sports"),
    ("Badminton", "cat-team"),
    ("Squash", "cat-team"),
    ("Cycling", "cat-cycling"),
    ("Mountain Biking", "cat-cycling"),
    ("Trail Running", "cat-sports"),
    ("Weight Training", "cat-gym"),
]
probabilities = [0.2, 0.03, 0.1, 0.08, 0.15, 0.08, 0.05, 0.1, 0.05, 0.06, 0.1]

date = datetime.datetime(2019, 1, 1)
end_date = datetime.datetime.now()
activities = {}
i = 0

while date < end_date:
    choice = np.random.choice(len(activities_list), 1, p=probabilities)[0]
    name, category_id = activities_list[choice]
    activities[f"act-{i}"] = {
        "date": date.strftime("%Y-%m-%d"),
        "name": name,
        "categoryId": category_id,
    }
    date = date + datetime.timedelta(days=1)
    i += 1

output = {
    "activities": activities,
    "categories": categories,
}

with open('mock-data.json', 'w') as f:
    json.dump(output, f, indent=2)

print(f"Generated {len(activities)} activities across {len(categories)} categories")
