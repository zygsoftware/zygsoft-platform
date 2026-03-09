"""
UDF Converter FastAPI Microservice
Exposes DOCX → UDF conversion for ZYGSOFT platform.
Reuses existing conversion logic from the parent directory.
"""
import os
import sys
import tempfile
import shutil
from pathlib import Path

# Ensure parent directory is in path for imports
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
os.chdir(ROOT)

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import Response

TEMPLATE_PATH = ROOT / "calisanudfcontent.xml"

app = FastAPI(
    title="UDF Converter API",
    description="DOCX to UDF conversion for ZYGSOFT platform",
    version="1.0.0",
)


@app.get("/health")
def health():
    """Health check endpoint for load balancers and monitoring."""
    return {"status": "ok", "service": "udf-converter"}


@app.post("/api/convert/doc-to-udf")
async def convert_docx_to_udf(file: UploadFile = File(...)):
    """
    Convert a DOCX file to UDF format.
    Accepts multipart/form-data with 'file' field.
    Returns the UDF file as attachment.
    """
    if not file.filename or not file.filename.lower().endswith(".docx"):
        raise HTTPException(
            status_code=400,
            detail="Sadece .docx dosyaları desteklenmektedir. Lütfen geçerli bir DOCX dosyası yükleyin."
        )

    if not TEMPLATE_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail="Şablon dosyası (calisanudfcontent.xml) bulunamadı. Servis yapılandırma hatası."
        )

    temp_dir = None
    try:
        temp_dir = tempfile.mkdtemp()
        docx_path = Path(temp_dir) / (file.filename or "input.docx")
        udf_path = Path(temp_dir) / (Path(file.filename).stem + ".udf")

        # Write uploaded file
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Dosya boş.")
        docx_path.write_bytes(content)

        # Import conversion (after chdir)
        from main import convert_docx_to_udf as _convert

        _convert(
            str(docx_path),
            str(udf_path),
            template_xml_path=str(TEMPLATE_PATH)
        )

        if not udf_path.exists():
            raise HTTPException(status_code=500, detail="Dönüşüm tamamlandı ancak çıktı dosyası oluşturulamadı.")

        udf_bytes = udf_path.read_bytes()
        output_name = Path(file.filename).stem + ".udf"

        return Response(
            content=udf_bytes,
            media_type="application/octet-stream",
            headers={
                "Content-Disposition": f'attachment; filename="{output_name}"'
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
