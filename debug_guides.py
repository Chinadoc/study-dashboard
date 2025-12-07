import os

INPUT_FILE = "notebooklm_source.txt"

def parse_transcripts(file_path):
    """Parses the notebooklm_source.txt file into a dictionary of vehicles."""
    vehicles = {}
    current_vehicle = None
    current_transcript = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    print(f"Read {len(lines)} lines.")
    
    for i, line in enumerate(lines):
        line = line.strip()
        # print(f"Line {i}: {line}")
        
        if line.startswith("Vehicle:"):
            current_vehicle = line.replace("Vehicle:", "").strip()
            if current_vehicle not in vehicles:
                vehicles[current_vehicle] = []
            # print(f"Found vehicle: {current_vehicle}")
            
        elif line.startswith("Transcript:"):
            # print("Found Transcript marker")
            continue
            
        elif line.startswith("----------------------------------------"):
            # print("Found delimiter")
            if current_vehicle and current_transcript:
                vehicles[current_vehicle].append("\n".join(current_transcript))
                # print(f"Saved transcript for {current_vehicle}. Length: {len(vehicles[current_vehicle][-1])}")
                current_transcript = []
            else:
                # print("Delimiter found but no current vehicle or transcript")
                pass
                
        elif line.startswith("Title:") or line.startswith("URL:") or line.startswith("Category:") or line.startswith("Source Material") or line.startswith("====="):
            continue
            
        elif line:
            current_transcript.append(line)
            
    return vehicles

vehicles = parse_transcripts(INPUT_FILE)
print(f"Found {len(vehicles)} vehicles.")
for v, t in vehicles.items():
    print(f"{v}: {len(t)} transcripts")
    for i, tr in enumerate(t):
        print(f"  Transcript {i} length: {len(tr)}")
        if "Transcript unavailable" in tr:
            print("  -> Contains 'Transcript unavailable'")
