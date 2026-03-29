#!/usr/bin/env python3

import shutil
import sys
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from main import convert_docx_to_udf


def _resolve_template(default_template: Path, letterhead_path: Path | None) -> tuple[Path, Path | None]:
    if not letterhead_path:
        return default_template, None

    suffix = letterhead_path.suffix.lower()
    if suffix == ".xml":
        return letterhead_path, None

    if suffix == ".udf":
        temp_dir = Path(tempfile.mkdtemp(prefix="zyg-letterhead-"))
        content_path = temp_dir / "content.xml"
        with zipfile.ZipFile(letterhead_path, "r") as archive:
            content_name = next(
                (name for name in archive.namelist() if name.rstrip("/").lower().endswith("content.xml")),
                None,
            )
            if not content_name:
                raise RuntimeError("Antet UDF dosyasında content.xml bulunamadı.")
            content_path.write_bytes(archive.read(content_name))
        return content_path, temp_dir

    raise RuntimeError("Antet dosyası yalnızca .xml veya .udf olabilir.")


def main() -> int:
    if len(sys.argv) < 4:
        print(
            "Usage: local_docx_to_udf.py <input.docx> <output.udf> <default_template.xml> [letterhead.(xml|udf)]",
            file=sys.stderr,
        )
        return 1

    input_path = Path(sys.argv[1]).resolve()
    output_path = Path(sys.argv[2]).resolve()
    default_template = Path(sys.argv[3]).resolve()
    letterhead_path = Path(sys.argv[4]).resolve() if len(sys.argv) > 4 and sys.argv[4] else None

    if not input_path.exists():
        print("Input DOCX file not found.", file=sys.stderr)
        return 1

    if not default_template.exists():
        print("Default template XML not found.", file=sys.stderr)
        return 1

    cleanup_dir: Path | None = None
    try:
        template_path, cleanup_dir = _resolve_template(default_template, letterhead_path)
        convert_docx_to_udf(str(input_path), str(output_path), template_xml_path=str(template_path))
        return 0
    finally:
        if cleanup_dir is not None:
            shutil.rmtree(cleanup_dir, ignore_errors=True)


if __name__ == "__main__":
    raise SystemExit(main())
