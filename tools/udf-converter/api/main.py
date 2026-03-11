"""
UDF Converter FastAPI Microservice
Exposes DOCX → UDF conversion for ZYGSOFT platform.
Reuses existing conversion logic from the parent directory.

Unicode-safe: uses ASCII temp filenames to avoid latin-1/Turkish character issues.
Letterhead: ONLY applied when use_letterhead=true AND letterhead_file is provided.
No default/fallback letterhead - plain conversion uses blank_udf_template.xml (no logo/antet).
When letterhead is .udf: extracts content.xml (with properties/bgImage) and copies any
bgImageSource-referenced resources into the output zip.
"""
import logging
import os
import re
import sys
import tempfile
import shutil
import unicodedata
import uuid
import zipfile
from pathlib import Path

# Ensure parent directory is in path for imports
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
os.chdir(ROOT)

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import Response

# Blank template: no letterhead, no logo, no firm-specific content. Used when useLetterhead=false.
BLANK_TEMPLATE_PATH = ROOT / "blank_udf_template.xml"


def _find_content_xml_in_zip(z: zipfile.ZipFile) -> str | None:
    """Find content.xml in zip (case-insensitive, supports subpaths)."""
    for n in z.namelist():
        if n.rstrip("/").lower().endswith("content.xml"):
            return n
    return None


def _has_bg_image_data(xml_bytes: bytes) -> bool:
    """Check if XML contains bgImageData (embedded base64 image)."""
    try:
        text = xml_bytes.decode("utf-8", errors="ignore")
        return bool(re.search(r'bgImageData\s*=\s*["\'][^"\']+["\']', text, re.I))
    except Exception:
        return False


def _has_bg_image_source(xml_bytes: bytes) -> bool:
    """Check if XML contains bgImageSource (path to external file)."""
    try:
        text = xml_bytes.decode("utf-8", errors="ignore")
        m = re.search(r'bgImageSource\s*=\s*["\']([^"\']+)["\']', text, re.I)
        return bool(m and m.group(1).strip())
    except Exception:
        return False


def _copy_letterhead_resources(letterhead_zip_path: Path, output_zip_path: Path, logger_instance) -> None:
    """Copy all files from letterhead UDF to output except content.xml (we keep our merged one)."""
    try:
        with zipfile.ZipFile(output_zip_path, "a") as out_z:
            with zipfile.ZipFile(letterhead_zip_path, "r") as in_z:
                for name in in_z.namelist():
                    if name.rstrip("/").lower().endswith("content.xml"):
                        continue
                    try:
                        data = in_z.read(name)
                        out_z.writestr(name, data)
                        logger_instance.info("[udf-convert] copied letterhead resource: %s", name)
                    except Exception as e:
                        logger_instance.warning("[udf-convert] skip copy %s: %s", name, e)
    except Exception as e:
        logger_instance.warning("[udf-convert] copy_letterhead_resources failed: %s", e)


def _extract_properties_block(xml_text: str) -> str | None:
    """Extract the full <properties>...</properties> block including nested elements (pageFormat, bgImage)."""
    m = re.search(r"(<properties[^>]*>)(.*?)(</properties>)", xml_text, re.S | re.I)
    if m:
        return m.group(0)
    return None


def _inject_letterhead_properties(
    output_zip_path: Path,
    letterhead_properties: str,
    logger_instance,
) -> bool:
    """
    Replace the properties block in output content.xml with letterhead's properties.
    Returns True if injection was performed.
    """
    try:
        with zipfile.ZipFile(output_zip_path, "r") as z:
            if "content.xml" not in z.namelist():
                logger_instance.warning("[udf-convert] output zip has no content.xml, cannot inject properties")
                return False
            out_xml = z.read("content.xml").decode("utf-8", errors="replace")
            other_files = {n: z.read(n) for n in z.namelist() if n != "content.xml"}
        out_props = _extract_properties_block(out_xml)
        if not out_props:
            logger_instance.warning("[udf-convert] output has no properties block, cannot inject")
            return False
        new_xml = out_xml.replace(out_props, letterhead_properties, 1)
        with zipfile.ZipFile(output_zip_path, "w", compression=zipfile.ZIP_STORED) as z:
            z.writestr("content.xml", new_xml.encode("utf-8"))
            for name, data in other_files.items():
                z.writestr(name, data)
        logger_instance.info("[udf-convert] injected letterhead properties into output (bgImageData preserved)")
        return True
    except Exception as e:
        logger_instance.warning("[udf-convert] inject_letterhead_properties failed: %s", e)
        return False

app = FastAPI(
    title="UDF Converter API",
    description="DOCX to UDF conversion for ZYGSOFT platform",
    version="1.0.0",
)


def _normalize_filename(name: str) -> str:
    """Normalize Unicode to NFC for consistent handling."""
    if not name:
        return "document"
    return unicodedata.normalize("NFC", name)


def _safe_display_filename(original: str, ext: str = ".udf") -> str:
    """Extract stem from original filename for display; ensure valid UTF-8."""
    if not original:
        return "document" + ext
    normalized = _normalize_filename(original)
    stem = Path(normalized).stem or "document"
    return stem + ext


def _ascii_safe_content_disposition(filename: str) -> str:
    """Build Content-Disposition with RFC 5987 for non-ASCII filenames."""
    try:
        filename.encode("ascii")
        return f'attachment; filename="{filename}"'
    except UnicodeEncodeError:
        from urllib.parse import quote
        ascii_fallback = "document.udf"
        encoded = quote(filename, safe="")
        return f"attachment; filename=\"{ascii_fallback}\"; filename*=UTF-8''{encoded}"


@app.get("/health")
def health():
    """Health check endpoint for load balancers and monitoring."""
    return {"status": "ok", "service": "udf-converter"}


logger = logging.getLogger(__name__)


@app.post("/api/convert/doc-to-udf")
async def convert_docx_to_udf(
    file: UploadFile = File(...),
    use_letterhead: str = Form("false"),
    letterhead_file: UploadFile = File(None),
):
    """
    Convert a DOCX file to UDF format.
    Accepts multipart/form-data with 'file' field.
    Optional: use_letterhead (true/false), letterhead_file (template UDF/XML when use_letterhead=true).
    Returns the UDF file as attachment.
    Rule: letterhead ONLY when use_letterhead=true AND letterhead_file provided. Otherwise blank template.
    """
    # Debug: raw values
    logger.info("[udf-convert] raw use_letterhead=%r letterhead_file=%s", use_letterhead, letterhead_file.filename if letterhead_file else None)

    use_letterhead_bool = use_letterhead and str(use_letterhead).lower() in ("true", "1", "yes")
    logger.info("[udf-convert] parsed use_letterhead=%s", use_letterhead_bool)

    if not file.filename or not file.filename.lower().endswith(".docx"):
        raise HTTPException(
            status_code=400,
            detail="Sadece .docx dosyaları desteklenmektedir. Lütfen geçerli bir DOCX dosyası yükleyin."
        )

    # Letterhead only when explicitly requested AND file provided. No fallback.
    if use_letterhead_bool:
        if not letterhead_file or not letterhead_file.filename or not letterhead_file.size or letterhead_file.size <= 0:
            logger.warning("[udf-convert] use_letterhead=true but no letterhead file - rejecting")
            raise HTTPException(
                status_code=400,
                detail="Antet kullanımı seçildi ancak antet dosyası yüklenmedi. Lütfen antet yükleyin veya antet kullanımını kapatın."
            )
        logger.info("[udf-convert] letterhead apply branch: will use user letterhead file")

    if not BLANK_TEMPLATE_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail="Şablon dosyası (blank_udf_template.xml) bulunamadı. Servis yapılandırma hatası."
        )

    temp_dir = None
    try:
        temp_dir = tempfile.mkdtemp()
        # ASCII-safe temp filenames to avoid latin-1/Turkish character encoding issues
        suffix = uuid.uuid4().hex[:12]
        docx_path = Path(temp_dir) / f"input_{suffix}.docx"
        udf_path = Path(temp_dir) / f"output_{suffix}.udf"

        # Write uploaded DOCX
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Dosya boş.")
        docx_path.write_bytes(content)

        # Resolve template: ONLY user letterhead when use_letterhead=true AND file provided. Else blank.
        template_path = BLANK_TEMPLATE_PATH
        letterhead_udf_path = None  # Set when letterhead is .udf, for copying resources
        letterhead_properties_block = None  # For explicit injection when main.py loses bgImageData
        if use_letterhead_bool and letterhead_file and letterhead_file.filename and letterhead_file.size and letterhead_file.size > 0:
            letterhead_content = await letterhead_file.read()
            letterhead_path = Path(temp_dir) / f"letterhead_{suffix}"
            ext = Path(letterhead_file.filename).suffix.lower()
            logger.info("[udf-convert] letterhead file: ext=%s size=%d treated_as=%s", ext, len(letterhead_content), "udf" if ext == ".udf" else "xml")
            if ext in (".udf", ".xml"):
                letterhead_path = letterhead_path.with_suffix(ext)
            else:
                letterhead_path = letterhead_path.with_suffix(".xml")
            letterhead_path.write_bytes(letterhead_content)
            if letterhead_path.suffix.lower() == ".udf":
                logger.info("[udf-convert] processing .udf letterhead")
                with zipfile.ZipFile(letterhead_path, "r") as z:
                    content_xml_name = _find_content_xml_in_zip(z)
                    if content_xml_name:
                        content_xml_bytes = z.read(content_xml_name)
                        logger.info("[udf-convert] content.xml found in UDF at %s size=%d", content_xml_name, len(content_xml_bytes))
                        has_bg_data = _has_bg_image_data(content_xml_bytes)
                        has_bg_src = _has_bg_image_source(content_xml_bytes)
                        logger.info("[udf-convert] letterhead UDF: bgImageData=%s bgImageSource=%s", has_bg_data, has_bg_src)
                        template_path = Path(temp_dir) / f"letterhead_xml_{suffix}.xml"
                        template_path.write_bytes(content_xml_bytes)
                        letterhead_udf_path = letterhead_path
                        if has_bg_data or has_bg_src:
                            content_xml_str = content_xml_bytes.decode("utf-8", errors="replace")
                            letterhead_properties_block = _extract_properties_block(content_xml_str)
                            if letterhead_properties_block:
                                m = re.search(r'bgImageData\s*=\s*["\']([^"\']*)["\']', letterhead_properties_block, re.I)
                                bg_len = len(m.group(1)) if m else 0
                                logger.info("[udf-convert] extracted letterhead properties block, bgImageData length=%d", bg_len)
                        logger.info("[udf-convert] using letterhead from UDF content.xml path=%s", template_path)
                    else:
                        logger.warning("[udf-convert] letterhead UDF has no content.xml - falling back to blank template")
                        template_path = BLANK_TEMPLATE_PATH
            else:
                template_path = letterhead_path
                logger.info("[udf-convert] using letterhead XML path=%s", template_path)
                try:
                    xml_str = letterhead_path.read_text(encoding="utf-8", errors="replace")
                    if _has_bg_image_data(xml_str.encode("utf-8")) or _has_bg_image_source(xml_str.encode("utf-8")):
                        letterhead_properties_block = _extract_properties_block(xml_str)
                        if letterhead_properties_block:
                            logger.info("[udf-convert] extracted letterhead properties from .xml file")
                except Exception as e:
                    logger.warning("[udf-convert] could not extract properties from .xml letterhead: %s", e)
            if not Path(template_path).exists():
                logger.warning("[udf-convert] letterhead path missing - falling back to blank template")
                template_path = BLANK_TEMPLATE_PATH
        else:
            logger.info("[udf-convert] no letterhead: using blank template path=%s", BLANK_TEMPLATE_PATH)

        # Import conversion (after chdir)
        from main import convert_docx_to_udf as _convert

        _convert(
            str(docx_path),
            str(udf_path),
            template_xml_path=str(template_path)
        )

        # When letterhead was .udf, copy any bgImageSource-referenced resources into output zip
        if letterhead_udf_path and udf_path.exists():
            _copy_letterhead_resources(letterhead_udf_path, udf_path, logger)

        # Explicitly inject letterhead properties if conversion lost bgImageData (known bug in main.py merge)
        if letterhead_properties_block and udf_path.exists():
            with zipfile.ZipFile(udf_path, "r") as z:
                out_xml = z.read("content.xml").decode("utf-8", errors="replace")
            out_has_bg = _has_bg_image_data(out_xml.encode("utf-8"))
            lh_has_bg = _has_bg_image_data(letterhead_properties_block.encode("utf-8"))
            logger.info("[udf-convert] after conversion: output bgImageData=%s letterhead bgImageData=%s", out_has_bg, lh_has_bg)
            if lh_has_bg and not out_has_bg:
                logger.warning("[udf-convert] bgImageData was lost during conversion, injecting letterhead properties")
                _inject_letterhead_properties(udf_path, letterhead_properties_block, logger)

        if not udf_path.exists():
            raise HTTPException(status_code=500, detail="Dönüşüm tamamlandı ancak çıktı dosyası oluşturulamadı.")

        udf_bytes = udf_path.read_bytes()
        output_name = _safe_display_filename(file.filename or "", ".udf")

        return Response(
            content=udf_bytes,
            media_type="application/octet-stream",
            headers={
                "Content-Disposition": _ascii_safe_content_disposition(output_name)
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Dönüşüm sırasında hata oluştu: {str(e)}"
        )
    finally:
        if temp_dir and Path(temp_dir).exists():
            try:
                shutil.rmtree(temp_dir)
            except OSError:
                pass
