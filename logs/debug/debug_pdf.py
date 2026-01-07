from pdfminer.high_level import extract_text

PDF_FILE = "Automotive_Key_Programming_Professional_Reference.pdf"

try:
    text = extract_text(PDF_FILE)
    print("--- START OF TEXT ---")
    print(text[:2000])
    print("--- END OF SAMPLE ---")
except Exception as e:
    print(f"Error: {e}")
