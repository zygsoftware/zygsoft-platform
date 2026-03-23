#!/usr/bin/env python3
"""
Compress PDF using PyMuPDF: garbage collection, stream deflate.
Usage: python3 compress.py <input.pdf> <output.pdf>

Uses a fallback chain: aggressive options first, then simpler saves if the PDF
rejects clean/linear (common with scans, hybrid, or older PDFs).
"""
import os
import sys
from typing import Optional

try:
    import fitz  # PyMuPDF
except ImportError:
    print("ERROR:pymupdf not installed. Run: pip install pymupdf", file=sys.stderr)
    sys.exit(2)


def _save_attempt(doc, outp: str, **kwargs) -> None:
    doc.save(outp, **kwargs)


def main() -> int:
    if len(sys.argv) != 3:
        print("ERROR:usage: compress.py <input.pdf> <output.pdf>", file=sys.stderr)
        return 1
    inp, outp = sys.argv[1], sys.argv[2]

    try:
        doc = fitz.open(inp)
    except Exception as e:
        print(f"ERROR:{e}", file=sys.stderr)
        return 1

    if doc.is_encrypted:
        # Try opening without password (some files only have empty user pass)
        if not doc.authenticate(""):
            print("ERROR:PDF is password protected. Remove the password and try again.", file=sys.stderr)
            doc.close()
            return 1

    # Try from strictest to most compatible (many real-world PDFs fail on clean/linear)
    attempts = [
        {
            "garbage": 4,
            "deflate": True,
            "clean": True,
            "linear": True,
        },
        {
            "garbage": 4,
            "deflate": True,
            "clean": True,
            "linear": False,
        },
        {
            "garbage": 4,
            "deflate": True,
            "clean": False,
            "linear": False,
        },
        {
            "garbage": 3,
            "deflate": True,
            "clean": False,
            "linear": False,
        },
        {
            "garbage": 2,
            "deflate": False,
            "clean": False,
            "linear": False,
        },
    ]

    last_err: Optional[Exception] = None
    for opts in attempts:
        try:
            try:
                if os.path.isfile(outp):
                    os.remove(outp)
            except OSError:
                pass
            _save_attempt(doc, outp, **opts)
            doc.close()
            return 0
        except Exception as e:
            last_err = e
            continue

    print(f"ERROR:{last_err}", file=sys.stderr)
    doc.close()
    return 1


if __name__ == "__main__":
    sys.exit(main())
