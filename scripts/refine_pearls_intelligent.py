import json
import os
import re

def refine_pearl(pearl):
    # Professional cleaning
    content = pearl['paragraph']
    
    # 1. Clean common artifacts
    content = content.replace('theAutel', 'the Autel')
    content = re.sub(r'(\d+)\.\s*$', '', content) # Remove trailing page numbers like .20
    content = content.replace('Warning:', '**Warning:**')
    content = content.replace('Note:', '**Note:**')
    
    # 2. Intelligence Rule: Professional Phrasing
    if content.startswith('The Solution:'):
        content = content.replace('The Solution:', '', 1).strip()
    
    # Ensure it ends with punctuation
    if not content.endswith(('.', '!', '?')):
        content += '.'
        
    pearl['paragraph'] = content
    
    # 3. Systematic Tagging
    tags = set(pearl.get('tags', []))
    category = pearl.get('category', 'unknown')
    
    # Risk Assessment
    risk = 'risk:reference'
    if 'GOTCHA' in tags or 'CRITICAL' in tags or 'Warning' in content:
        risk = 'risk:critical'
    elif 'IMPORTANT' in tags or 'Note' in content:
        risk = 'risk:important'
    
    tags.add(risk)
    
    # Functional Flags
    if 'CAN FD' in content or 'CAN-FD' in content:
        tags.add('flag:bypass-required')
    if 'SGW' in content:
        tags.add('flag:bypass-required')
    if 'AKL' in content or 'All Keys Lost' in content:
        tags.add('category:akl')
    if 'PIN' in content or 'code' in content.lower():
        tags.add('flag:online-only')
        
    pearl['tags'] = sorted(list(tags))
    return pearl

def process_batch(input_file, output_file):
    with open(input_file, 'r') as f:
        pearls = json.load(f)
    
    refined = [refine_pearl(p) for p in pearls]
    
    with open(output_file, 'w') as f:
        json.dump(refined, f, indent=2)

if __name__ == "__main__":
    process_batch('/tmp/pearls_batch_1.json', '/tmp/pearls_batch_1_refined.json')
