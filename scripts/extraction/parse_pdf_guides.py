import os
import re
from pdfminer.high_level import extract_text

PDF_FILE = "Automotive_Key_Programming_Professional_Reference.pdf"
OUTPUT_DIR = "guides"

def clean_text(text):
    # Remove header/footer noise if common
    lines = text.split('\n')
    cleaned = []
    for line in lines:
        if len(line.strip()) > 0:
            cleaned.append(line.strip())
    return "\n".join(cleaned)

def parse_pdf_to_guides():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    print(f"Extracting text from {PDF_FILE}...")
    try:
        full_text = extract_text(PDF_FILE)
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return

    # Split by "Slide" or vehicle titles
    # NotebookLM slides usually start with a clear title or number
    # We'll look for patterns like "1. Title:" or just the vehicle names
    
    # Heuristic: Split by "Title:" if present, or look for known vehicle names
    # Let's try splitting by "Title:" first as per the prompt instructions
    
    sections = re.split(r'(?:^|\n)\s*(?:Title:|Slide \d+:)\s*', full_text)
    
    print(f"Found {len(sections)} potential sections.")
    
    count = 0
    for section in sections:
        if not section.strip():
            continue
            
        lines = section.strip().split('\n')
        vehicle_name = lines[0].strip()
        
        # Basic validation: Vehicle name should be relatively short
        if len(vehicle_name) > 100 or len(vehicle_name) < 3:
            continue
            
        # Create safe filename
        safe_name = re.sub(r'[^a-zA-Z0-9]', '_', vehicle_name).lower()
        output_path = os.path.join(OUTPUT_DIR, f"{safe_name}.html")
        
        # Convert content to HTML
        # We need to parse "Tools Required", "Procedure", "Important Notes"
        
        html_content = f"""
        <div class="p-6 bg-navy-800 rounded-xl shadow-lg border border-navy-700">
            <h2 class="text-2xl font-bold text-white mb-4">{vehicle_name}</h2>
            <div class="space-y-6">
        """
        
        # Simple parsing for body
        body = "\n".join(lines[1:])
        
        # Tools
        tools_match = re.search(r'(?:Tools Required|Tools):?\s*(.*?)(?=(?:Procedure|Steps)|$)', body, re.DOTALL | re.IGNORECASE)
        if tools_match:
            tools = tools_match.group(1).strip()
            html_content += f"""
                <div class="bg-navy-900/50 p-4 rounded-lg border border-navy-600">
                    <h3 class="text-brand-400 font-semibold mb-2">Required Tools</h3>
                    <p class="text-slate-300">{tools}</p>
                </div>
            """
            
        # Procedure
        proc_match = re.search(r'(?:Procedure|Steps):?\s*(.*?)(?=(?:Important Notes|Notes)|$)', body, re.DOTALL | re.IGNORECASE)
        if proc_match:
            proc_text = proc_match.group(1).strip()
            # Convert numbered list to HTML
            steps_html = "<ol class='list-decimal list-inside space-y-2 text-slate-300'>"
            for line in proc_text.split('\n'):
                line = line.strip()
                if line:
                    # Bold the first few words or key actions
                    line = re.sub(r'^(\d+\.?\s*)', '', line) # Remove existing numbers
                    steps_html += f"<li>{line}</li>"
            steps_html += "</ol>"
            
            html_content += f"""
                <div>
                    <h3 class="text-brand-400 font-semibold mb-2">Procedure</h3>
                    {steps_html}
                </div>
            """
            
        # Notes
        notes_match = re.search(r'(?:Important Notes|Notes):?\s*(.*)', body, re.DOTALL | re.IGNORECASE)
        if notes_match:
            notes = notes_match.group(1).strip()
            html_content += f"""
                <div class="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                    <h3 class="text-red-400 font-semibold mb-2">Important Notes</h3>
                    <p class="text-red-200/80 text-sm">{notes}</p>
                </div>
            """
            
        html_content += """
            </div>
        </div>
        """
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
            
        print(f"Generated guide for: {vehicle_name}")
        count += 1
        
    print(f"Done. Generated {count} guides.")

if __name__ == "__main__":
    parse_pdf_to_guides()
