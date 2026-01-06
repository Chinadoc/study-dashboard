
import json

def summarize():
    try:
        with open("extracted_automotive_data.json", "r") as f:
            data = json.load(f)
        
        print(f"Total Files Processed: {len(data)}")
        for item in data:
            filename = item['filename']
            points = item['data_points']
            print(f"\nFile: {filename}")
            print(f"  Count: {len(points)}")
            if points:
                print(f"  Sample: {points[0]}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    summarize()
