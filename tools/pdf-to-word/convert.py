#!/usr/bin/env python3
"""
High-quality PDF → DOCX using pdf2docx (layout-aware).
Usage: python3 convert.py <input.pdf> <output.docx>
Requires: pip install pdf2docx pymupdf
"""
import sys

try:
    from pdf2docx import Converter
except ImportError:
    print(
        "ERROR:pdf2docx not installed. Run: pip install pdf2docx",
        file=sys.stderr,
    )
    sys.exit(2)


def main() -> int:
    if len(sys.argv) != 3:
        print("ERROR:usage: convert.py <input.pdf> <output.docx>", file=sys.stderr)
        return 1
    pdf_path, docx_path = sys.argv[1], sys.argv[2]
    cv = None
    try:
        cv = Converter(pdf_path)
        cv.convert(docx_path, start=0, end=None)
    except Exception as e:
        print(f"ERROR:{e}", file=sys.stderr)
        if cv is not None:
            cv.close()
        return 1
    if cv is not None:
        cv.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
