import sys
from pdfminer.high_level import extract_text

pdf_file = "Honda_Immobilizer_Master_Guide.pdf"
output_file = "honda_extracted.txt"

print(f"Extracting from {pdf_file}...")
try:
    text = extract_text(pdf_file)
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"Success! Wrote {len(text)} characters to {output_file}")
except ImportError:
    print("Error: pdfminer not installed. Please pip install pdfminer.six")
except Exception as e:
    print(f"Error: {e}")
