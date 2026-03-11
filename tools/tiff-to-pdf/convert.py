#!/usr/bin/env python3
"""
TIFF to PDF converter for ZYGSOFT.
Converts one or more TIFF/TIF files to a single merged PDF.
Supports multi-page TIFFs.
Usage: python convert.py <output_pdf_path> <tiff_path_1> [tiff_path_2 ...]
"""
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("ERROR:Pillow not installed. Run: pip install Pillow", file=sys.stderr)
    sys.exit(2)


def get_tiff_pages(img_path: Path) -> list[Image.Image]:
    """Extract all pages from a TIFF file (single or multi-page). Returns list of RGB PIL Images."""
    images = []
    with Image.open(img_path) as img:
        if hasattr(img, "n_frames"):
            n = img.n_frames
            for i in range(n):
                img.seek(i)
                frame = img.copy()
                if frame.mode != "RGB":
                    frame = frame.convert("RGB")
                images.append(frame)
        else:
            if img.mode != "RGB":
                img = img.convert("RGB")
            images.append(img.copy())
    return images


def main() -> int:
    if len(sys.argv) < 3:
        print("Usage: convert.py <output_pdf_path> <tiff_1> [tiff_2 ...]", file=sys.stderr)
        return 1

    output_pdf = Path(sys.argv[1])
    tiff_paths = [Path(p) for p in sys.argv[2:]]

    all_pages = []
    for p in tiff_paths:
        if not p.exists():
            print(f"ERROR:Dosya bulunamadı: {p}", file=sys.stderr)
            return 1
        ext = p.suffix.lower()
        if ext not in (".tif", ".tiff"):
            print(f"ERROR:Geçersiz format: {p}. Sadece .tif ve .tiff desteklenir.", file=sys.stderr)
            return 1
        try:
            pages = get_tiff_pages(p)
            if not pages:
                print(f"ERROR:Boş veya okunamayan dosya: {p}", file=sys.stderr)
                return 1
            all_pages.extend(pages)
        except Exception as e:
            print(f"ERROR:{p} okunamadı: {e}", file=sys.stderr)
            return 1

    if not all_pages:
        print("ERROR:Hiçbir sayfa işlenemedi.", file=sys.stderr)
        return 1

    try:
        all_pages[0].save(
            str(output_pdf),
            "PDF",
            save_all=True,
            append_images=all_pages[1:],
            resolution=100.0,
        )
    except Exception as e:
        print(f"ERROR:PDF oluşturulamadı: {e}", file=sys.stderr)
        return 1

    print(str(output_pdf))
    return 0


if __name__ == "__main__":
    sys.exit(main())
