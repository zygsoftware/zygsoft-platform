#!/usr/bin/env python3
"""
OCR text extraction for ZYGSOFT.
Extracts text from PDF, PNG, JPG, JPEG, TIF, TIFF using Tesseract.
Usage: python ocr.py <input_path> <lang>
  lang: tr (Turkish) or en (English)
Output: JSON to stdout {"text": "..."} or {"error": "..."}
"""
import sys
import json
import subprocess
import tempfile
from pathlib import Path

try:
    from PIL import Image
except ImportError as e:
    print(json.dumps({"error": "Python dependencies missing. Install: pip install Pillow PyMuPDF"}))
    sys.exit(1)

try:
    import pytesseract
except ImportError:
    pytesseract = None

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

ALLOWED_EXT = {".pdf", ".png", ".jpg", ".jpeg", ".tif", ".tiff"}
LANG_MAP = {"tr": "tur", "en": "eng"}
VISION_LANG_MAP = {"tr": "tr", "en": "en"}
ROOT = Path(__file__).resolve().parent
VISION_SCRIPT = ROOT / "vision_ocr.swift"


def pdf_to_images(pdf_path: Path) -> list:
    """Convert PDF pages to PIL Images."""
    if not fitz:
        raise RuntimeError("PyMuPDF (fitz) required for PDF. Install: pip install PyMuPDF")
    images = []
    doc = fitz.open(pdf_path)
    try:
        for i in range(len(doc)):
            page = doc[i]
            pix = page.get_pixmap(dpi=200)
            img = Image.open(__import__("io").BytesIO(pix.tobytes("png")))
            images.append(img)
    finally:
        doc.close()
    return images


def image_to_text(img: Image.Image, lang: str) -> str:
    """Run Tesseract OCR on a PIL Image."""
    if pytesseract is not None:
        return pytesseract.image_to_string(img, lang=lang)
    return vision_image_to_text(img, "tr" if lang == "tur" else "en")


def vision_image_to_text(img: Image.Image, lang: str) -> str:
    """Fallback OCR for macOS using Vision via Swift."""
    if sys.platform != "darwin":
        raise RuntimeError("Tesseract kurulu değil ve macOS Vision fallback kullanılamıyor.")
    if not VISION_SCRIPT.exists():
        raise RuntimeError("Vision OCR script bulunamadı.")

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as temp_file:
        temp_path = Path(temp_file.name)

    try:
        export_img = img.convert("RGB") if img.mode not in ("RGB", "L") else img
        export_img.save(temp_path, format="PNG")
        result = subprocess.run(
            ["swift", str(VISION_SCRIPT), str(temp_path), VISION_LANG_MAP.get(lang, "tr")],
            capture_output=True,
            text=True,
            timeout=90,
            check=False,
        )
        raw = (result.stdout or "").strip() or (result.stderr or "").strip()
        payload = json.loads(raw or "{}")
        if result.returncode != 0 or payload.get("error"):
            raise RuntimeError(payload.get("error") or raw or "Vision OCR başarısız.")
        return payload.get("text", "")
    finally:
        temp_path.unlink(missing_ok=True)


def main() -> int:
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: ocr.py <input_path> <lang>"}))
        return 1

    input_path = Path(sys.argv[1])
    lang_arg = (sys.argv[2] or "tr").lower().strip()

    if lang_arg not in ("tr", "en"):
        print(json.dumps({"error": "Invalid language. Use tr or en."}))
        return 1

    lang = LANG_MAP[lang_arg]

    if not input_path.exists():
        print(json.dumps({"error": "File not found."}))
        return 1

    ext = input_path.suffix.lower()
    if ext not in ALLOWED_EXT:
        print(json.dumps({"error": f"Unsupported format: {ext}. Use pdf, png, jpg, jpeg, tif, tiff."}))
        return 1

    try:
        if ext == ".pdf":
            images = pdf_to_images(input_path)
            if not images:
                print(json.dumps({"text": "", "error": "PDF has no pages."}))
                return 0
            texts = []
            for img in images:
                texts.append(image_to_text(img, lang))
            result = "\n\n".join(texts)
        else:
            with Image.open(input_path) as img:
                if hasattr(img, "n_frames") and img.n_frames > 1:
                    texts = []
                    for i in range(img.n_frames):
                        img.seek(i)
                        frame = img.copy()
                        if frame.mode not in ("RGB", "L"):
                            frame = frame.convert("RGB")
                        texts.append(image_to_text(frame, lang))
                    result = "\n\n".join(texts)
                else:
                    if img.mode not in ("RGB", "L"):
                        img = img.convert("RGB")
                    result = image_to_text(img, lang)
    except Exception as e:
        if pytesseract is not None and isinstance(e, pytesseract.TesseractNotFoundError):
            print(json.dumps({"error": "Tesseract kurulu değil. Yerel OCR için macOS Vision fallback denendi ancak başarısız oldu."}))
            return 1
        print(json.dumps({"error": str(e)}))
        return 1

    print(json.dumps({"text": result}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
