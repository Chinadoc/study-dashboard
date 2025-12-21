import os
import json
import time
import google.generativeai as genai

# CONFIGURATION
API_KEY = "AIzaSyCb8fOkvswJMOhIOitjrQWwDYfcFu2jml0"
GUIDES_DIR = "guides"
OUTPUT_FILE = "structured_guides.json"

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

def restructure_guide(html_content):
    prompt = f"""
    Restructure the following vehicle programming guide (in HTML) into a structured JSON format with the following keys:
    - overview: A brief introduction and general information.
    - preparation: Tools needed, safety steps, and initial connections.
    - procedure: Step-by-step instructions for programming.
    - notes: Troubleshooting, warnings, and technical tips.

    The content should be in Markdown format.
    Return ONLY a valid JSON object.

    HTML Content:
    {html_content}
    """
    
    try:
        response = model.generate_content(prompt)
        # Extract JSON from response
        match = __import__('re').search(r'\{.*\}', response.text, __import__('re').DOTALL)
        if match:
            return json.loads(match.group(0))
        return None
    except Exception as e:
        print(f"Error restructuring guide: {e}")
        return None

def main():
    if not os.path.exists(GUIDES_DIR):
        print(f"Directory {GUIDES_DIR} not found.")
        return

    structured_data = {}
    
    # Load existing if available
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, 'r') as f:
                structured_data = json.load(f)
        except:
            pass

    files = [f for f in os.listdir(GUIDES_DIR) if f.endswith('.html')]
    print(f"Found {len(files)} guide files.")

    for i, filename in enumerate(files):
        # Extract vehicle name from filename
        vehicle_name = filename.replace('.html', '').replace('_', ' ').title()
        
        if vehicle_name in structured_data:
            print(f"Skipping {vehicle_name}, already processed.")
            continue

        print(f"[{i+1}/{len(files)}] Restructuring {vehicle_name}...")
        
        with open(os.path.join(GUIDES_DIR, filename), 'r') as f:
            html_content = f.read()
        
        data = restructure_guide(html_content)
        if data:
            structured_data[vehicle_name] = data
            # Save every time to preserve progress
            with open(OUTPUT_FILE, 'w') as f:
                json.dump(structured_data, f, indent=2)
            print(f"Successfully processed {vehicle_name}")
        else:
            print(f"Failed to process {vehicle_name}")
        
        # Avoid rate limits
        time.sleep(1)

if __name__ == "__main__":
    main()
