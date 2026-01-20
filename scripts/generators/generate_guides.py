import os
import re
import time
import json
import google.generativeai as genai

# CONFIGURATION
API_KEY = "AIzaSyCb8fOkvswJMOhIOitjrQWwDYfcFu2jml0"
VIDEO_DATA_FILE = "video_data.json"
TRANSCRIPT_FILE = "notebooklm_source.txt"
OUTPUT_DIR = "guides"

def load_video_data():
    with open(VIDEO_DATA_FILE, 'r') as f:
        return json.load(f)

def parse_transcripts(file_path):
    """Parses the notebooklm_source.txt file into a dictionary of vehicles."""
    vehicles = {}
    current_vehicle = None
    current_transcript = []
    
    if not os.path.exists(file_path):
        return {}

    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    for line in lines:
        line = line.strip()
        if line.startswith("Vehicle:"):
            current_vehicle = line.replace("Vehicle:", "").strip()
            if current_vehicle not in vehicles:
                vehicles[current_vehicle] = []
        elif line.startswith("Transcript:"):
            continue
        elif line.startswith("----------------------------------------"):
            if current_vehicle and current_transcript:
                vehicles[current_vehicle].append("\n".join(current_transcript))
                current_transcript = []
        elif line.startswith("Title:") or line.startswith("URL:") or line.startswith("Category:") or line.startswith("Source Material") or line.startswith("====="):
            continue
        elif line:
            current_transcript.append(line)
            
    return vehicles

def generate_guide(vehicle_name, video_entries, transcripts):
    """Generates an HTML guide using Gemini API."""
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # Prepare context
    titles = [v['title'] for v in video_entries]
    tools = set()
    for t in titles:
        if 'Autel' in t: tools.add('Autel IM508/IM608')
        if 'Smart Pro' in t: tools.add('Smart Pro')
        if 'Lishi' in t: tools.add('Lishi Tool')
        if 'OBD' in t: tools.add('OBD Programmer')
    
    tool_str = ", ".join(tools) if tools else "Standard Key Programmer"
    
    # Check if we have valid transcripts
    valid_transcripts = [t for t in transcripts if "Transcript unavailable" not in t and len(t) > 50]
    
    if valid_transcripts:
        print(f"  Using {len(valid_transcripts)} transcripts for context.")
        context_prompt = f"based on the following video transcripts:\n\n" + "\n\n--- NEXT VIDEO ---\n\n".join(valid_transcripts[:5])
    else:
        print(f"  No transcripts. Using metadata fallback.")
        context_prompt = f"based on your expert knowledge and the following video titles which indicate the methods used:\n\nVideo Titles:\n" + "\n".join(titles)
    
    prompt = f"""
    You are an expert automotive locksmith. Create a detailed, step-by-step key programming guide for the "{vehicle_name}" {context_prompt}.
    
    The guide should assume the user is using professional tools like {tool_str}.
    
    Format the output as a clean, responsive HTML snippet (do NOT include <html>, <head>, or <body> tags, just the content div).
    Use Tailwind CSS classes for styling. The theme should be dark mode (bg-navy-900 text-slate-300).
    
    Structure:
    1.  **Title**: Use a clear <h2> header with text-white.
    2.  **Required Tools**: List tools mentioned or typically required.
    3.  **Step-by-Step Procedure**: Numbered list with clear instructions. Use bold text for key actions (e.g., **Turn ignition ON**).
    4.  **Troubleshooting/Notes**: Any warnings or tips.
    
    Styling Tips:
    - Use `bg-navy-800` for cards/sections.
    - Use `text-brand-400` (or cyan-400) for accents.
    - Use `p-4 rounded-xl` for spacing.
    - Do NOT use markdown code blocks in the output, just raw HTML.
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error generating guide for {vehicle_name}: {e}")
        return None

def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    genai.configure(api_key=API_KEY)
    
    print("Loading data...")
    video_data = load_video_data()
    transcripts_map = parse_transcripts(TRANSCRIPT_FILE)
    
    print(f"Found {len(video_data)} vehicles in database.")
    
    for entry in video_data:
        make = entry.get('make', '')
        model = entry.get('model', '')
        year_range = entry.get('year_range', '')
        vehicle_name = f"{make} {model} ({year_range})"
        
        # Create a safe filename
        safe_name = re.sub(r'[^a-zA-Z0-9]', '_', vehicle_name).lower()
        output_path = os.path.join(OUTPUT_DIR, f"{safe_name}.html")
        
        if os.path.exists(output_path):
            print(f"Skipping {vehicle_name} (already exists)")
            continue
            
        print(f"Generating guide for: {vehicle_name}...")
        
        transcripts = transcripts_map.get(vehicle_name, [])
        guide_html = generate_guide(vehicle_name, entry.get('videos', []), transcripts)
        
        if guide_html:
            # Clean up markdown code blocks if present
            guide_html = guide_html.replace("```html", "").replace("```", "")
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(guide_html)
            print(f"  Saved to {output_path}")
            
        # Rate limiting pause
        time.sleep(2)

    print("Done!")

if __name__ == "__main__":
    main()
