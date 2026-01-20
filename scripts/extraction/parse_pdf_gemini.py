import os
import time
import re
import json
import google.generativeai as genai

# CONFIGURATION
API_KEY = "AIzaSyCb8fOkvswJMOhIOitjrQWwDYfcFu2jml0"
PDF_FILE = "Automotive_Key_Programming_Professional_Reference.pdf"
OUTPUT_DIR = "guides"

def parse_pdf_with_gemini():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    genai.configure(api_key=API_KEY)
    
    print(f"Uploading {PDF_FILE} to Gemini...")
    try:
        sample_file = genai.upload_file(path=PDF_FILE, display_name="Key Programming Guide")
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

    print("File ready. Generating content...")
    
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    # We need to extract guides one by one or in batches.
    # Since the PDF is 16MB and 17 pages (wait, 17 pages for 114 vehicles? That seems low. Maybe it's not one slide per vehicle?)
    # Let's ask Gemini to list the vehicles found first.
    
    prompt_list = """
    Analyze this PDF. It contains key programming guides.
    List all the specific vehicles (Make Model Year) covered in this document.
    Return the list as a JSON array of strings.
    Example: ["Ford F-150 2015-2020", "Honda Civic 2016-2021"]
    """
    
    try:
        response = model.generate_content([sample_file, prompt_list])
        print("Vehicle list response:")
        print(response.text)
        
        # Clean up JSON
        json_text = response.text.replace("```json", "").replace("```", "").strip()
        vehicles = json.loads(json_text)
        print(f"Found {len(vehicles)} vehicles.")
        
    except Exception as e:
        print(f"Error listing vehicles: {e}")
        return

    # Now generate guide for each vehicle (or batch them)
    # Generating one by one might be slow/expensive on tokens, but safer for formatting.
    # Let's try to get them in batches of 5 to speed it up.
    
    batch_size = 5
    for i in range(0, len(vehicles), batch_size):
        batch = vehicles[i:i+batch_size]
        print(f"Processing batch {i//batch_size + 1}: {batch}")
        
        prompt_batch = f"""
        For each of the following vehicles found in the PDF, extract the full programming guide details (Tools, Procedure, Notes).
        
        Vehicles: {json.dumps(batch)}
        
        Format the output as a JSON object where keys are the vehicle names and values are the HTML content for that guide.
        
        HTML Format:
        <div class="p-6 bg-navy-800 rounded-xl shadow-lg border border-navy-700">
            <h2 class="text-2xl font-bold text-white mb-4">[Vehicle Name]</h2>
            <div class="space-y-6">
                <div class="bg-navy-900/50 p-4 rounded-lg border border-navy-600">
                    <h3 class="text-brand-400 font-semibold mb-2">Required Tools</h3>
                    <p class="text-slate-300">[Tools List]</p>
                </div>
                <div>
                    <h3 class="text-brand-400 font-semibold mb-2">Procedure</h3>
                    <ol class="list-decimal list-inside space-y-2 text-slate-300">
                        <li>[Step 1]</li>
                        <li>[Step 2]</li>
                    </ol>
                </div>
                <!-- Optional Notes -->
                <div class="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                    <h3 class="text-red-400 font-semibold mb-2">Important Notes</h3>
                    <p class="text-red-200/80 text-sm">[Notes]</p>
                </div>
            </div>
        </div>
        
        Return ONLY valid JSON.
        """
        
        try:
            response = model.generate_content([sample_file, prompt_batch])
            batch_json_text = response.text.replace("```json", "").replace("```", "").strip()
            batch_guides = json.loads(batch_json_text)
            
            for vehicle, html in batch_guides.items():
                safe_name = re.sub(r'[^a-zA-Z0-9]', '_', vehicle).lower()
                output_path = os.path.join(OUTPUT_DIR, f"{safe_name}.html")
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(html)
                print(f"  Saved {vehicle}")
                
            time.sleep(2) # Rate limit
            
        except Exception as e:
            print(f"Error processing batch {batch}: {e}")


    print("Done!")

if __name__ == "__main__":
    parse_pdf_with_gemini()
