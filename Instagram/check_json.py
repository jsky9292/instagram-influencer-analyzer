import json

with open('ig_posts_matdori.world_max100.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(len(data['items']))