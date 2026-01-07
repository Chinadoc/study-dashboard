from pypdf import PdfReader

PDF_FILE = "Automotive_Key_Programming_Professional_Reference.pdf"

try:
    reader = PdfReader(PDF_FILE)
    print(f"Number of pages: {len(reader.pages)}")
    
    print("--- PAGE 1 TEXT ---")
    print(reader.pages[0].extract_text())
    print("--- END PAGE 1 ---")
    
    if len(reader.pages) > 1:
        print("--- PAGE 2 TEXT ---")
        print(reader.pages[1].extract_text())
        print("--- END PAGE 2 ---")
        
except Exception as e:
    print(f"Error: {e}")
