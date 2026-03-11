#!/usr/bin/env python3
"""
PDF to Image converter for ZYGSOFT.
Renders PDF pages to PNG or JPEG and packages them in a ZIP.
Usage: python convert.py <pdf_path> <output_dir> <format> [page_range]
  format: png | jpg
  page_range: optional, e.g. 1-3, 5, 1,3,5-7 (empty = all pages)
"""
import sys
import zipfile
import os
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    print("ERROR:pymupdf not installed. Run: pip install pymupdf Pillow", file=sys.stderr)
    sys.exit(2)

try:
    from PIL import Image
    import io
except ImportError:
    print("ERROR:Pillow not installed. Run: pip install Pillow", file=sys.stderr)
    sys.exit(2)


def parse_page_range(input_str: str, page_count: int) -> list[int]:
    """Parse page range string into 0-based indices. Raises ValueError on error."""
    trimmed = input_str.strip()
    if not trimmed:
        return list(range(page_count))  # all pages

    indices = []
    tokens = [t.strip() for t in trimmed.split(",") if t.strip()]

    for token in tokens:
        if "-" in token:
            parts = token.split("-", 1)
            if len(parts) != 2:
                raise ValueError(f'Geçersiz aralık: "{token}". Örnek: 1-5')
            try:
                start = int(parts[0].strip())
                end = int(parts[1].strip())
            except ValueError:
                raise ValueError(f'Geçersiz sayfa numarası: "{token}"')
            if start < 1 or end < 1:
                raise ValueError("Sayfa numaraları 1'den küçük olamaz.")
            if start > end:
                raise ValueError(f'Aralık başlangıcı bitişten büyük olamaz: "{token}"')
            if start > page_count or end > page_count:
                raise ValueError(f"PDF'de {page_count} sayfa var. Aralık sınırı aşıyor.")
            for p in range(start, end + 1):
                indices.append(p - 1)
        else:
            try:
                num = int(token)
            except ValueError:
                raise ValueError(f'Geçersiz sayfa numarası: "{token}"')
            if num < 1:
                raise ValueError("Sayfa numaraları 1'den küçük olamaz.")
            if num > page_count:
                raise ValueError(f"PDF'de {page_count} sayfa var. Sayfa {num} mevcut değil.")
            indices.append(num - 1)

    if not indices:
        raise ValueError("En az bir sayfa seçilmelidir.")

    # Preserve order, remove duplicates
    seen = set()
    unique = []
    for i in indices:
        if i not in seen:
            seen.add(i)
            unique.append(i)
    return unique


def main() -> int:
    if len(sys.argv) < 4:
        print("Usage: convert.py <pdf_path> <output_dir> <format> [page_range]", file=sys.stderr)
        return 1

    pdf_path = Path(sys.argv[1])
    output_dir = Path(sys.argv[2])
    fmt = sys.argv[3].lower()
    page_range_str = sys.argv[4] if len(sys.argv) > 4 else ""

    if fmt not in ("png", "jpg", "jpeg"):
        print("ERROR:format must be png or jpg", file=sys.stderr)
        return 1

    if fmt == "jpeg":
        fmt = "jpg"

    if not pdf_path.exists():
        print("ERROR:PDF file not found", file=sys.stderr)
        return 1

    output_dir.mkdir(parents=True, exist_ok=True)

    try:
        doc = fitz.open(pdf_path)
        page_count = len(doc)
        doc.close()
    except Exception as e:
        print(f"ERROR:PDF okunamadı: {e}", file=sys.stderr)
        return 1

    try:
        indices = parse_page_range(page_range_str, page_count)
    except ValueError as e:
        print(f"ERROR:{e}", file=sys.stderr)
        return 1

    doc = fitz.open(pdf_path)
    ext = "png" if fmt == "png" else "jpg"
    matrix = fitz.Matrix(2.0, 2.0)  # 2x scale for quality

    for i, page_idx in enumerate(indices):
        page = doc[page_idx]
        pix = page.get_pixmap(matrix=matrix, alpha=False)
        img_path = output_dir / f"page_{i + 1:03d}.{ext}"

        if fmt == "png":
            pix.save(str(img_path))
        else:
            pix.pil_save(str(img_path), format="JPEG", quality=90)

    doc.close()

    # Create ZIP
    zip_path = output_dir / "images.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in sorted(output_dir.glob(f"page_*.{ext}")):
            zf.write(f, f.name)

    print(str(zip_path))
    return 0


if __name__ == "__main__":
    sys.exit(main())
