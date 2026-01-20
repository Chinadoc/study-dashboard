from pdfminer.high_level import extract_text
import sys

PDF_FILE = "CDJR_Security_Eras_Explained.pdf"

print(f"Testing extraction on {PDF_FILE}...")
try:
    text = extract_text(PDF_FILE, maxpages=1)
    print("Success! First 100 chars:")
    print(text[:100])
except Exception as e:
    print(f"Failed: {e}")
    sys.exit(1)
