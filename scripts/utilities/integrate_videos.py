import json
import re

def integrate_videos():
    # Read video data
    with open('video_data.json', 'r') as f:
        video_data = json.load(f)

    # Read index.html
    with open('index.html', 'r') as f:
        html_content = f.read()

    # 1. Generate new VIDEO_TUTORIALS objects
    new_tutorials = []
    
    # Helper to determine category
    def get_category(make):
        make = make.lower()
        if make in ['ford', 'lincoln', 'mercury']: return 'ford'
        if make in ['dodge', 'chrysler', 'jeep', 'ram', 'fiat']: return 'dodge'
        if make in ['chevrolet', 'gmc', 'buick', 'cadillac', 'pontiac', 'saturn', 'hummer']: return 'gm'
        if make in ['toyota', 'lexus', 'scion']: return 'toyota'
        if make in ['honda', 'acura']: return 'honda'
        if make in ['nissan', 'infiniti']: return 'nissan'
        if make in ['hyundai', 'kia', 'genesis']: return 'hyundai'
        if make in ['subaru']: return 'subaru'
        if make in ['mazda']: return 'mazda'
        if make in ['mitsubishi']: return 'mitsubishi'
        if make in ['bmw', 'volkswagen', 'vw', 'audi', 'mercedes', 'mercedes-benz', 'volvo', 'jaguar', 'land rover', 'mini', 'smart']: return 'european'
        return 'tools'

    # Helper to determine difficulty (simple heuristic)
    def get_difficulty(title, type_):
        title_lower = title.lower()
        if 'diy' in title_lower or 'easy' in title_lower or 'no tools' in title_lower:
            return 'Easy'
        if type_ == 'akl' or 'all keys lost' in title_lower:
            return 'Advanced'
        if 'autel' in title_lower or 'smart pro' in title_lower or 'key tool max' in title_lower:
            return 'Professional'
        return 'Intermediate'

    # Helper to extract tool from title
    def get_tool(title):
        title_lower = title.lower()
        if 'autel' in title_lower: return 'Autel'
        if 'smart pro' in title_lower: return 'Smart Pro'
        if 'vvdi' in title_lower or 'xhorse' in title_lower: return 'Xhorse'
        if 'lishi' in title_lower: return 'Lishi'
        if 'obd' in title_lower: return 'OBD Scanner'
        if 'diy' in title_lower: return 'DIY'
        return 'Various'

    for entry in video_data:
        make = entry['make']
        model = entry['model']
        year_range = entry['year_range']
        
        for video in entry['videos']:
            title = video['title'] or f"{make} {model} ({year_range}) Key Programming"
            url = video['url']
            type_ = video['type']
            
            # Extract video ID
            video_id = ''
            if 'youtube.com/watch?v=' in url:
                video_id = url.split('v=')[1].split('&')[0]
            elif 'youtu.be/' in url:
                video_id = url.split('youtu.be/')[1].split('?')[0]
            
            if not video_id:
                continue # Skip non-YouTube links for now as the grid expects videoId
                
            category = get_category(make)
            
            # Create ID
            safe_make = make.lower().replace(' ', '-')
            safe_model = model.lower().replace(' ', '-')
            safe_title = re.sub(r'[^a-zA-Z0-9]', '', title[:10]).lower()
            id_ = f"{safe_make}-{safe_model}-{safe_title}"
            
            tutorial = {
                'id': id_,
                'category': category,
                'title': title,
                'videoId': video_id,
                'desc': f"Programming tutorial for {make} {model} ({year_range}).",
                'tool': get_tool(title),
                'difficulty': get_difficulty(title, type_),
                'makes': [make.upper()],
                'models': [model.upper()],
                'years': year_range
            }
            new_tutorials.append(tutorial)

    # 2. Append to VIDEO_TUTORIALS in index.html
    # Find the end of the existing VIDEO_TUTORIALS array
    # We look for the closing bracket of the array
    
    # First, find the start of VIDEO_TUTORIALS
    start_marker = "const VIDEO_TUTORIALS = ["
    start_idx = html_content.find(start_marker)
    if start_idx == -1:
        print("Could not find VIDEO_TUTORIALS array")
        return

    # Find the end of the array (this is a bit naive, assuming proper formatting)
    # We'll search for the next "];" after the start
    # But to be safer, let's just insert before the last element's closing brace if possible, 
    # or better, just replace the whole array definition if we can parse it.
    # Given the file size, regex replacement might be safer if we can match the whole block.
    # But the block is huge.
    
    # Strategy: Find the last object in the array and append after it.
    # We'll look for the line containing "        ];" which closes the array.
    
    lines = html_content.split('\n')
    insert_line_idx = -1
    for i, line in enumerate(lines):
        if line.strip() == '];' and i > 5000: # Ensure we are in the JS section
            # Check if this is the VIDEO_TUTORIALS closing
            # We can check if previous lines look like video entries
            if "category: 'tools'" in lines[i-1] or "category: 'tools'" in lines[i-2]:
                 insert_line_idx = i
                 break
    
    if insert_line_idx == -1:
        # Fallback: look for the specific closing of VIDEO_TUTORIALS
        # We know it ends around line 6066 in the current file
        pass

    # Let's generate the JS string for new tutorials
    js_objects = []
    for t in new_tutorials:
        # Format as JS object string
        obj_str = f"            {{ id: '{t['id']}', category: '{t['category']}', title: {json.dumps(t['title'])}, videoId: '{t['videoId']}', desc: {json.dumps(t['desc'])}, tool: '{t['tool']}', difficulty: '{t['difficulty']}', makes: {json.dumps(t['makes'])}, models: {json.dumps(t['models'])}, years: '{t['years']}' }}"
        js_objects.append(obj_str)
    
    new_content_str = ",\n".join(js_objects)
    
    # We will use regex to insert before the closing bracket of VIDEO_TUTORIALS
    # Pattern: match the end of the last item and the closing bracket
    # We look for the last item which likely ends with "}" and then whitespace and "];"
    
    # Actually, let's just find "const VIDEO_TUTORIALS = [" and then find the matching "];"
    # This is safer.
    
    pattern = re.compile(r'(const VIDEO_TUTORIALS = \[\s*[\s\S]*?)(\s*\];)', re.MULTILINE)
    match = pattern.search(html_content)
    
    if match:
        # We found the array. Now insert the new content before the closing bracket.
        # We need to add a comma to the last existing item if it doesn't have one?
        # The regex captures the content up to the closing bracket.
        # We can just append ",\n" + new_content_str + "\n" before the closing group.
        
        existing_content = match.group(1)
        closing_bracket = match.group(2)
        
        # Check if existing content ends with a comma (ignoring whitespace)
        if existing_content.strip().endswith(','):
            separator = "\n"
        else:
            separator = ",\n"
            
        new_block = existing_content + separator + new_content_str + closing_bracket
        
        html_content = html_content.replace(match.group(0), new_block)
        print(f"Added {len(new_tutorials)} new videos to VIDEO_TUTORIALS.")
    else:
        print("Could not match VIDEO_TUTORIALS block.")
        return

    # 3. Add Hyundai/Kia filter button
    # Look for the Nissan button and add Hyundai after it
    nissan_btn = '<button onclick="filterTutorials(\'nissan\')" class="tutorial-filter-btn px-4 py-2 rounded-lg text-sm font-semibold bg-navy-800 text-slate-300 hover:bg-navy-700">Nissan/Infiniti</button>'
    hyundai_btn = '\n                    <button onclick="filterTutorials(\'hyundai\')" class="tutorial-filter-btn px-4 py-2 rounded-lg text-sm font-semibold bg-navy-800 text-slate-300 hover:bg-navy-700">Hyundai/Kia/Asian</button>'
    
    if nissan_btn in html_content:
        html_content = html_content.replace(nissan_btn, nissan_btn + hyundai_btn)
        print("Added Hyundai/Kia filter button.")
    else:
        print("Could not find Nissan button to insert Hyundai button.")

    # 4. Update renderTutorials logic to include Mitsubishi in 'hyundai' category
    # Look for: if (currentTutorialFilter === 'hyundai') return v.category === 'hyundai' || v.category === 'subaru' || v.category === 'mazda';
    old_logic = "if (currentTutorialFilter === 'hyundai') return v.category === 'hyundai' || v.category === 'subaru' || v.category === 'mazda';"
    new_logic = "if (currentTutorialFilter === 'hyundai') return v.category === 'hyundai' || v.category === 'subaru' || v.category === 'mazda' || v.category === 'mitsubishi';"
    
    if old_logic in html_content:
        html_content = html_content.replace(old_logic, new_logic)
        print("Updated renderTutorials logic.")
    else:
        print("Could not find renderTutorials logic to update.")

    # Write back to index.html
    with open('index.html', 'w') as f:
        f.write(html_content)
    
    print("Successfully updated index.html")

if __name__ == "__main__":
    integrate_videos()
