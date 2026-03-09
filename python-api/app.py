from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
import uuid
import tempfile
import shutil
from pathlib import Path

# Import UDF Toolkit functions
# Make sure we're running from python-api directory
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import convert_docx_to_udf
from pdf_merger import PDFMerger

app = FastAPI(title="Zygsoft UDF Toolkit API")

# Allow CORS since Next.js will call this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this in production to localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = Path(tempfile.gettempdir()) / "zygsoft_udf_toolkit"
TEMP_DIR.mkdir(parents=True, exist_ok=True)


@app.get("/")
def read_root():
    return {"status": "UDF Toolkit API is running."}


@app.post("/api/convert/doc-to-udf")
async def doc_to_udf(file: UploadFile = File(...)):
    if not file.filename.endswith(('.doc', '.docx')):
        raise HTTPException(status_code=400, detail="Sadece Word belgesi desteklenmektedir.")
        
    session_id = str(uuid.uuid4())
    input_path = str(TEMP_DIR / f"{session_id}_{file.filename}")
    output_path = str(TEMP_DIR / f"{session_id}_converted.udf")
    
    # Needs to match the template xml location in the python-api folder
    template_path = os.path.join(os.path.dirname(__file__), "calisanudfcontent.xml")
    
    try:
        # Save input file
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Convert to UDF
        convert_docx_to_udf(input_path, output_path, template_xml_path=template_path)
        
        # We should use BackgroundTasks to delete files, but keeping it simple: FastApi returns FileResponse, 
        # cleanup can be done via cron or background job. Or just let OS handle tmp folder.
        if os.path.exists(output_path):
            filename = os.path.splitext(file.filename)[0]
            return FileResponse(
                path=output_path, 
                filename=f"{filename}_udf.udf",
                media_type="application/octet-stream"
            )
        else:
            raise HTTPException(status_code=500, detail="Belge dönüştürülemedi.")
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Dönüşüm Hatası: {str(e)}")


@app.post("/api/convert/pdf-merge")
async def merge_pdfs(files: List[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="En az 2 adet PDF yüklemelisiniz.")
        
    session_id = str(uuid.uuid4())
    input_paths = []
    
    try:
        # Save all files
        for i, upload_file in enumerate(files):
            if not upload_file.filename.endswith('.pdf'):
                raise HTTPException(status_code=400, detail="Tüm dosyalar PDF formatında olmalıdır.")
                
            path = str(TEMP_DIR / f"{session_id}_{i}_{upload_file.filename}")
            input_paths.append(path)
            with open(path, "wb") as buffer:
                shutil.copyfileobj(upload_file.file, buffer)
                
        output_path = str(TEMP_DIR / f"{session_id}_merged.pdf")
        
        # Use PDFMerger
        merger = PDFMerger()
        merger.merge_pdfs(input_paths, output_path, add_bookmarks=True)
        
        if os.path.exists(output_path):
            return FileResponse(
                path=output_path, 
                filename="Birlestirilmis_Dosya.pdf",
                media_type="application/pdf"
            )
        else:
            raise HTTPException(status_code=500, detail="Birleştirilemedi.")
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Hata: {str(e)}")


@app.post("/api/convert/img-to-pdf")
async def img_to_pdf(files: List[UploadFile] = File(...)):
    if len(files) < 1:
        raise HTTPException(status_code=400, detail="En az 1 adet resim/TIFF yüklemelisiniz.")
        
    session_id = str(uuid.uuid4())
    input_paths = []
    
    try:
        # Install PIL locally if not imported
        from PIL import Image
        
        images_to_pdf = []
        for i, upload_file in enumerate(files):
            path = str(TEMP_DIR / f"{session_id}_{i}_{upload_file.filename}")
            input_paths.append(path)
            with open(path, "wb") as buffer:
                shutil.copyfileobj(upload_file.file, buffer)
                
            # Open with Pillow and convert to RGB
            img = Image.open(path)
            if img.mode == "RGBA":
                img = img.convert("RGB")
            elif img.mode == "P":
                img = img.convert("RGB")
                
            images_to_pdf.append(img)
            
        output_path = str(TEMP_DIR / f"{session_id}_images.pdf")
        
        if len(images_to_pdf) > 0:
            images_to_pdf[0].save(
                output_path, 
                "PDF", 
                resolution=100.0, 
                save_all=True, 
                append_images=images_to_pdf[1:]
            )
            
        if os.path.exists(output_path):
            return FileResponse(
                path=output_path, 
                filename="Resim_Kitapcigi.pdf",
                media_type="application/pdf"
            )
        else:
            raise HTTPException(status_code=500, detail="PDF oluşturulamadı.")
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Hata: {str(e)}")
