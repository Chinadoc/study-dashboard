import os
import time
import re
import json
import google.generativeai as genai

# CONFIGURATION
API_KEY = "AIzaSyCb8fOkvswJMOhIOitjrQWwDYfcFu2jml0"
PDF_FILE = "Honda_Immobilizer_Master_Guide.pdf"
OUTPUT_FILE = "data/guides/honda_guide_blocks.json"

def extract_honda_modular():
    genai.configure(api_key=API_KEY)
    
    print(f"Uploading {PDF_FILE} to Gemini...")
    try:
        sample_file = genai.upload_file(path=PDF_FILE, display_name="Honda Master Guide")
        print(f"Uploaded file: {sample_file.name}")
    except Exception as e:
        print(f"Error uploading file: {e}")
        return

    # Wait for processing
    while sample_file.state.name == "PROCESSING":
        print("Processing file...")
        time.sleep(2)
        sample_file = genai.get_file(sample_file.name)
        
    if sample_file.state.name == "FAILED":
        print("File processing failed.")
        return

    print("File ready. Generating modular blocks...")
    
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    prompt = """
    Analyze this Honda Immobilizer Master Guide PDF.
    Convert the entire document into a single JSON object for our Modular Vehicle Guide System.
    
    The JSON structure must match this example:
    {
        "id": "honda-complete-guide",
        "title": "Honda/Acura Professional Locksmith Programming Guide",
        "make": "Honda",
        "year_start": 1998,
        "year_end": 2025,
        "difficulty": "Intermediate",
        "estimated_time": "15-45 mins",
        "last_updated": "2024-12-23",
        "modules": [
            {
                "type": "warning_banner",
                "id": "honda-locked-bcm-warning",
                "level": "critical",
                "content": "2023+ Accord/CR-V/Civic use 'Locked BCM' architecture. Requires rolling code/online calculation."
            },
            {
                "type": "reference_table",
                "id": "honda-immo-types",
                "title": "Honda Immobilizer Types",
                "headers": ["Type", "Years", "Chip", "Transponder Identification"],
                "rows": [ ... ]
            },
            {
                "type": "step_group",
                "id": "honda-akl-type6",
                "title": "Procedure: Type 6 All Keys Lost",
                "estimated_time": "20 mins",
                "steps": [ ... ]
            }
        ]
    }
    
    Block Types to use:
    - warning_banner (level: critical, warning, info)
    - info_callout (level: important, tip, info)
    - step_group (steps: {number, text, tip, warning})
    - reference_table (headers, rows: {cells, highlight})
    - tool_checklist (items: {name, required, notes})
    
    Ensure you cover:
    1. Evolution of Honda Immo (Type 1 to Type 6).
    2. Specific procedures for 2023+ locked systems.
    3. AKL vs Add Key logic.
    4. Lishi Tool compatibility (HON66).
    5. Transponder/FCC ID cross reference.
    
    Return ONLY valid JSON.
    """
    
    try:
        response = model.generate_content([sample_file, prompt])
        json_text = response.text.replace("```json", "").replace("```", "").strip()
        
        # Validate JSON
        guide_data = json.loads(json_text)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
        
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(guide_data, f, indent=4)
            
        print(f"Successfully generated {OUTPUT_FILE}")
        
    except Exception as e:
        print(f"Error generating Honda guide: {e}")
        # print(response.text) # For debugging if needed

if __name__ == "__main__":
    extract_honda_modular()
