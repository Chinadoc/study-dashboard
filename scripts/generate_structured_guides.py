import os
import re
import json
import time
import sys
import google.generativeai as genai
from pypdf import PdfReader

print("Script started", flush=True)

# CONFIGURATION
API_KEY = "AIzaSyCb8fOkvswJMOhIOitjrQWwDYfcFu2jml0"  # Extracted from previous script
PDF_SOURCES = {
    "CDJR": "CDJR_Security_Eras_Explained.pdf"
}
OUTPUT_FILE = "structured_guides.json"

def extract_pdf_content(file_path):
    print(f"Extracting text from {file_path} using pypdf...", flush=True)
    try:
        reader = PdfReader(file_path)
        text = []
        for i in range(min(50, len(reader.pages))): # Limit to 50 pages for now
            text.append(reader.pages[i].extract_text())
        return "\n".join(text)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return None

def generate_structured_guide(make, content):
    """Uses Gemini 1.5 Pro to parse PDF content into structured guides."""
    model = genai.GenerativeModel('gemini-1.5-pro')
    
    prompt = f"""
    You are an expert automotive locksmith. Analyze the following technical documentation for {make} vehicles and extract detailed programming guides for individual models.
    
    For each distinct vehicle model/year group found in the text, create a structured guide in the following "Book" format:
    
    Format:
    - **Chapter 1: Overview & Specifications**: Include Key ID, Chip Type, Frequency, Blade Profile, and Immobilizer System Type.
    - **Chapter 2: Equipment & Preparation**: List required programmers, bypass cables (12+8, 30-pin), emulator keys, and ECU/SGW locations.
    - **Chapter 3: Programming Procedures**: Detailed, step-by-step instructions for "Add Key" and "All Keys Lost" (AKL). Use bold text for key actions.
    - **Chapter 4: Technical Notes & Troubleshooting**: Expert tips, known issues, and safety protocols.
    
    The documentation text is:
    ---
    {content[:30000]} # Limit content to avoid token overflow
    ---
    
    Return the result as a JSON object where the keys are vehicle names (e.g. "Dodge Durango 2011-2020") and the value is an object with the chapters.
    
    JSON Schema:
    {{
      "Vehicle Name": {{
        "overview": "Markdown content for Chapter 1",
        "preparation": "Markdown content for Chapter 2",
        "procedure": "Markdown content for Chapter 3",
        "notes": "Markdown content for Chapter 4"
      }}
    }}
    
    Ensure the Markdown is clean and uses standard heading/list syntax.
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text
        # Clean up JSON if Gemini wraps it in code blocks
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].strip()
        return json.loads(text)
    except Exception as e:
        print(f"Error generating structured guide for {make}: {e}")
        return {}

def main():
    genai.configure(api_key=API_KEY)
    all_guides = {}
    
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, 'r') as f:
            all_guides = json.load(f)
            
    for make, pdf in PDF_SOURCES.items():
        if pdf in all_guides.get('_processed_pdfs', []):
            print(f"Skipping {pdf}, already processed.")
            continue
            
        content = extract_pdf_content(pdf)
        if not content:
            continue
            
        print(f"Structuring guides for {make}...")
        guides = generate_structured_guide(make, content)
        
        if guides:
            all_guides.update(guides)
            if '_processed_pdfs' not in all_guides:
                all_guides['_processed_pdfs'] = []
            all_guides['_processed_pdfs'].append(pdf)
            
            # Save progress after each PDF
            with open(OUTPUT_FILE, 'w') as f:
                json.dump(all_guides, f, indent=2)
            print(f"Successfully processed {make}.")
        
        # Rate limit
        time.sleep(5)

    print(f"Done! Structured guides saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
