from pypdf import PdfReader
import sys

PDF_FILE = "CDJR_Security_Eras_Explained.pdf"

print(f"Testing pypdf extraction on {PDF_FILE}...")
try:
    reader = PdfReader(PDF_FILE)
    page = reader.pages[0]
    text = page.extract_text()
    print("Success! First 1000 chars:")
    print(text[:1000], flush=True)
except Exception as e:
    print(f"Failed: {e}")
    sys.exit(1)
