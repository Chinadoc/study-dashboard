import os
from pypdf import PdfReader

pdf_path = "/Users/jeremysamuels/Documents/study-dashboard/assets/2023-auto-truck-key-blank-reference.pdf"
output_path = "/Users/jeremysamuels/Documents/study-dashboard/assets/2023-auto-truck-key-blank-reference.txt"

def extract_text():
    if not os.path.exists(pdf_path):
        print(f"Error: {pdf_path} not found.")
        return

    try:
        reader = PdfReader(pdf_path)
        total_pages = len(reader.pages)
        print(f"Total pages: {total_pages}")
        
        with open(output_path, "w", encoding="utf-8") as f:
            for i, page in enumerate(reader.pages):
                f.write(f"--- PAGE {i+1} ---\n")
                text = page.extract_text()
                if text:
                    f.write(text)
                    f.write("\n")
                if (i + 1) % 10 == 0:
                    print(f"Extracted {i+1} / {total_pages} pages...")
        
        print(f"Successfully extracted all text to {output_path}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    extract_text()
