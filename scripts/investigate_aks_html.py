import os
from bs4 import BeautifulSoup
import sys

# Target file
files = ['data/scraped_sources/american_key_supply/html_pages/17.html']

for file_path in files:
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue
        
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
            
        print(f"--- Parsing {file_path} ---")
        title = soup.select_one('h1')
        print(f"Title: {title.text.strip() if title else 'Not found'}")
        
        # Try to find "Works on" section
        works_on = soup.find(string=lambda t: t and 'Works on' in t)
        if works_on:
            parent = works_on.find_parent()
            print(f"Works On Section found: {parent.name}")
            print(parent.text[:200] + "...")
        else:
            print("Works On section not found")
            
        # Inspect tabs
        desc = soup.select_one('#tab-description')
        if desc:
            print("Found #tab-description")
        
    except Exception as e:
        print(f"Error parsing {file_path}: {e}")
