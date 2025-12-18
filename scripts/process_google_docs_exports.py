import os
import zipfile
import shutil
import re
import subprocess
import glob
from html.parser import HTMLParser

# Configuration
ASSETS_DIR = os.path.abspath("assets")
TEMP_DIR = os.path.abspath("temp_exports")
MIGRATION_FILE = os.path.abspath("data/migrations/import_google_docs.sql")
R2_BUCKET = "euro-keys-assets"

# Ensure temp dir exists
if os.path.exists(TEMP_DIR):
    shutil.rmtree(TEMP_DIR)
os.makedirs(TEMP_DIR)

# HTML to Markdown Parser
class DocsParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.markdown = ""
        self.in_body = False
        self.list_depth = 0
        self.list_type = [] # 'ul' or 'ol'
        self.in_bold = False
        self.in_italic = False
        self.in_heading = False
        self.heading_level = 0
        self.images = []

    def handle_starttag(self, tag, attrs):
        if tag == "body":
            self.in_body = True
        
        if not self.in_body: return

        if tag in ["h1", "h2", "h3", "h4", "h5", "h6"]:
            self.in_heading = True
            self.heading_level = int(tag[1])
            self.markdown += "\n\n" + "#" * self.heading_level + " "
        elif tag == "p":
            self.markdown += "\n\n"
        elif tag == "br":
            self.markdown += "  \n"
        elif tag == "b" or tag == "strong":
            self.markdown += "**"
            self.in_bold = True
        elif tag == "i" or tag == "em":
            self.markdown += "*"
            self.in_italic = True
        elif tag == "ul":
            self.markdown += "\n"
            self.list_depth += 1
            self.list_type.append('ul')
        elif tag == "ol":
            self.markdown += "\n"
            self.list_depth += 1
            self.list_type.append('ol')
        elif tag == "li":
            self.markdown += "\n" + "  " * (self.list_depth - 1)
            if self.list_type[-1] == 'ul':
                self.markdown += "- "
            else:
                self.markdown += "1. " # Markdown auto-numbers
        elif tag == "img":
            src = dict(attrs).get("src")
            if src:
                self.images.append(src)
                # Placeholder, will be replaced by actual logic later
                self.markdown += f"![Image]({src})"
        elif tag == "table":
            self.markdown += "\n\n"
        elif tag == "tr":
            self.markdown += "\n"

    def handle_endtag(self, tag):
        if tag == "body":
            self.in_body = False
        
        if not self.in_body: return

        if tag in ["h1", "h2", "h3", "h4", "h5", "h6"]:
            self.in_heading = False
            self.markdown += "\n"
        elif tag == "p":
            self.markdown += "\n"
        elif tag == "b" or tag == "strong":
            self.markdown += "**"
            self.in_bold = False
        elif tag == "i" or tag == "em":
            self.markdown += "*"
            self.in_italic = False
        elif tag in ["ul", "ol"]:
            self.list_depth -= 1
            self.list_type.pop()

    def handle_data(self, data):
        if self.in_body:
            cleaning = data.replace('\xa0', ' ')
            if self.in_heading:
                # Remove extra newlines in headings
                cleaning = cleaning.strip()
            self.markdown += cleaning

def infer_metadata(filename):
    lower = filename.lower()
    if 'bmw' in lower: return 'BMW', 'General', 'GUIDE'
    if 'chrysler' in lower: return 'Chrysler', 'General', 'GUIDE'
    if 'ford' in lower: return 'Ford', 'General', 'GUIDE'
    if 'honda' in lower: return 'Honda', 'General', 'GUIDE'
    if 'hyundai' in lower: return 'Hyundai', 'General', 'GUIDE'
    if 'mazda' in lower: return 'Mazda', 'General', 'GUIDE'
    if 'mercedes' in lower: return 'Mercedes', 'General', 'GUIDE'
    if 'nissan' in lower: return 'Nissan', 'General', 'GUIDE'
    if 'toyota' in lower or 'lexus' in lower: return 'Toyota', 'General', 'GUIDE'
    if 'sgw' in lower: return 'Global', 'Secure Gateway', 'SGW_RESEARCH'
    if 'volvo' in lower: return 'Volvo', 'General', 'GUIDE'
    if 'fob' in lower: return 'Global', 'Remote Keys', 'RESEARCH'
    if 'tool' in lower: return 'Global', 'Tools', 'RESEARCH'
    return 'Global', 'General', 'GUIDE'

def process_zip(zip_path, sql_file):
    zip_name = os.path.basename(zip_path)
    base_name = os.path.splitext(zip_name)[0]
    extract_path = os.path.join(TEMP_DIR, base_name)
    
    print(f"Processing {zip_name}...")
    
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_path)

    # Find the HTML file
    html_files = glob.glob(os.path.join(extract_path, "**/*.html"), recursive=True)
    if not html_files:
        print(f"  No HTML file found in {zip_name}")
        return

    html_file = html_files[0] # Assume one main doc
    
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    parser = DocsParser()
    parser.feed(content)
    markdown = parser.markdown

    # Process Images
    html_dir = os.path.dirname(html_file)
    for img_src in parser.images:
        # img_src is relative to html_file, e.g. "images/image1.png"
        old_img_path = os.path.join(html_dir, img_src)
        if os.path.exists(old_img_path):
            ext = os.path.splitext(img_src)[1]
            if not ext: ext = ".png" # Default
            # Create a unique name: zipname_imagename
            # Sanitize zipname
            safe_zip = re.sub(r'[^a-zA-Z0-9]', '_', base_name)
            safe_img = re.sub(r'[^a-zA-Z0-9]', '_', os.path.basename(img_src))
            new_img_name = f"{safe_zip}_{safe_img}{ext}"
            new_img_path = os.path.join(ASSETS_DIR, new_img_name)
            
            # Move/Copy
            shutil.copy2(old_img_path, new_img_path)
            
            # Upload to R2 (Try/Except)
            try:
                # Use subprocess to call wrangler
                # Ensure we are in api dir or pass config? 
                # Actually we can run from root if wrangler.toml is in api/, we might need --config
                # But earlier 'wrangler r2 bucket list' worked from api/ cwd.
                # So we should change cwd for the subprocess or use full path.
                print(f"  Uploading {new_img_name} to R2...")
                cmd = ["wrangler", "r2", "object", "put", f"{R2_BUCKET}/{new_img_name}", "--file", new_img_path]
                subprocess.run(cmd, cwd="api", check=True, capture_output=True)
                
                # Update Markdown link
                # parser.markdown had ![Image](images/foo.png)
                # We replace (images/foo.png) with (/api/assets/new_name)
                # Note: This simple replacement might overlap if src names are subset of others
                # But valid src is usually unique enough in the file
                markdown = markdown.replace(f"({img_src})", f"(/api/assets/{new_img_name})")
                
            except Exception as e:
                print(f"  Failed to upload {new_img_name}: {e}")
                # Fallback: still update link so it works if uploaded later?
                markdown = markdown.replace(f"({img_src})", f"(/api/assets/{new_img_name})")

    # Clean up Markdown
    # Remove excessive newlines
    markdown = re.sub(r'\n{3,}', '\n\n', markdown)
    
    # Escape quotes for SQL
    markdown_sql = markdown.replace("'", "''")
    title = base_name.replace("'", "''")
    make, model, category = infer_metadata(zip_name)
    
    sql = f"""
INSERT OR REPLACE INTO programming_guides (title, make, model, year_start, year_end, content, category)
VALUES ('{title}', '{make}', '{model}', 2010, 2024, '{markdown_sql}', '{category}');
"""
    sql_file.write(sql)

# Main Execution
with open(MIGRATION_FILE, 'w') as sql_out:
    sql_out.write("-- Migration generated from Google Docs exports\n")
    
    zips = glob.glob(os.path.join(ASSETS_DIR, "*.zip"))
    for zip_path in zips:
        process_zip(zip_path, sql_out)

print("Done! Migration file created.")
