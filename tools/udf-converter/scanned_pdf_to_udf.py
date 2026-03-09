import sys
import os
import zipfile
import base64
import fitz  # PyMuPDF
import io
from PIL import Image
import pytesseract

# --- Tesseract entegrasyonu ---
def _resource_path(*parts):
    """Hem geliştirme hem PyInstaller (.exe) içinde güvenli yol üretir"""
    if getattr(sys, "frozen", False):
        base = sys._MEIPASS
    else:
        base = os.path.dirname(__file__)
    return os.path.join(base, *parts)

# Tesseract exe ve tessdata yolu
TESSERACT_EXE = _resource_path("tesseract", "tesseract.exe")
TESSDATA_DIR  = _resource_path("tesseract", "tessdata")

pytesseract.pytesseract.tesseract_cmd = TESSERACT_EXE
os.environ["TESSDATA_PREFIX"] = TESSDATA_DIR
DEFAULT_OCR_LANG = "tur+eng"
# -------------------------------

def pdf_to_udf(pdf_file, udf_file):
    udf_template = '''<?xml version="1.0" encoding="UTF-8" ?>
<template format_id="1.8">
<content><![CDATA[{content}]]></content>
<properties><pageFormat mediaSizeName="1" leftMargin="42.51968479156494" rightMargin="28.34645652770996" topMargin="14.17322826385498" bottomMargin="14.17322826385498" paperOrientation="1" headerFOffset="20.0" footerFOffset="20.0" /></properties>
<elements resolver="hvl-default">
{elements}
</elements>
<styles><style name="default" description="Geçerli" family="Dialog" size="12" bold="false" italic="false" foreground="-13421773" FONT_ATTRIBUTE_KEY="javax.swing.plaf.FontUIResource[family=Dialog,name=Dialog,style=plain,size=12]" /><style name="hvl-default" family="Times New Roman" size="12" description="Gövde" /></styles>
</template>'''

    try:
        pdf_document = fitz.open(pdf_file)
        content = []
        elements = []
        current_offset = 0

        for page_num in range(len(pdf_document)):
            page = pdf_document[page_num]

            # --- Metin çıkar ---
            text = page.get_text()

            # Eğer metin yoksa OCR uygula
            if not text.strip():
                # Memory optimizasyonu: DPI'ı düşür
                pix = page.get_pixmap(dpi=200)  # daha düşük çözünürlük
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                text = pytesseract.image_to_string(img, lang=DEFAULT_OCR_LANG)
                # Memory temizliği
                pix = None
                img = None

            if text:
                content.append(text)
                elements.append(f'<paragraph Alignment="0" LeftIndent="0.0" RightIndent="0.0"><content startOffset="{current_offset}" length="{len(text)}" /></paragraph>')
                current_offset += len(text)

            # --- Gömülü resimler çıkar ---
            image_list = page.get_images(full=True)
            for img_index, img in enumerate(image_list):
                xref = img[0]
                base_image = pdf_document.extract_image(xref)
                image_bytes = base_image["image"]

                image = Image.open(io.BytesIO(image_bytes))
                buffered = io.BytesIO()
                image.save(buffered, format="PNG")
                img_str = base64.b64encode(buffered.getvalue()).decode()

                placeholder = ' '  # Normal boşluk karakteri
                content.append(placeholder)

                elements.append(f'<image family="Times New Roman" size="10" imageData="{img_str}" startOffset="{current_offset}" length="1" />')
                current_offset += 1

            # Sayfa sonuna newline
            content.append('\n')
            elements.append(f'<paragraph Alignment="0" LeftIndent="0.0" RightIndent="0.0"><content startOffset="{current_offset}" length="1" /></paragraph>')
            current_offset += 1

        udf_content = udf_template.format(
            content=''.join(content),
            elements='\n'.join(elements)
        )

        with zipfile.ZipFile(udf_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
            zipf.writestr('content.xml', udf_content)
        print(f"UDF file created successfully: {udf_file}")
    except Exception as e:
        print(f"Error creating UDF file: {e}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python pdf_to_udf.py input.pdf")
        sys.exit(1)

    input_file = sys.argv[1]

    if not os.path.isfile(input_file):
        print(f"Input file not found: {input_file}")
        sys.exit(1)

    filename, ext = os.path.splitext(input_file)

    if ext.lower() == '.pdf':
        udf_file = filename + '.udf'
        pdf_to_udf(input_file, udf_file)
    else:
        print("Please provide a .pdf file.")
        sys.exit(1)

if __name__ == '__main__':
    main()
