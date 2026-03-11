# PDF → Image Converter

Python script used by the ZYGSOFT PDF-to-Image tool. Renders PDF pages to PNG or JPEG and packages them in a ZIP.

## Requirements

```bash
pip install pymupdf Pillow
```

Or:

```bash
pip install -r requirements.txt
```

## Usage

```bash
python convert.py <pdf_path> <output_dir> <format> [page_range]
```

- `format`: `png` or `jpg`
- `page_range`: optional. Examples: `1-3`, `5`, `1,3,5-7`. Empty = all pages.

## Output

Creates `images.zip` in the output directory containing `page_001.png`, `page_002.png`, etc.
