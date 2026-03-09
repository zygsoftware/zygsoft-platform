

---

## 🚀 Masaüstü Uygulama (EXE) Oluşturma

Aşağıdaki adımlarla **Windows için .exe** üretebilirsiniz (Python 3.10+ önerilir):

1) **Bağımlılıkları yükleyin**
```bat
python -m venv .venv
.venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

2) **PyInstaller kurun**
```bat
pip install pyinstaller
```

3) **EXE’yi üretin** (konsolsuz, tek dosya)
```bat
pyinstaller --onefile --windowed --name "UDF-Toolkit" udf_toolkit_gui.py
```

4) Çıktı **dist\UDF-Toolkit.exe** konumunda olacaktır.

> Notlar:
> - `udf_to_pdf.py` ReportLab ve uygun font dosyalarına ihtiyaç duyar. PDF’de Türkçe/özel karakterler için DejaVu ailesi gibi Unicode fontları projeye dahil etmeniz gerekebilir.
> - `scanned_pdf_to_udf.py` modülü, Tesseract OCR gerektirebilir. Windows’a Tesseract’ı kurduktan sonra PATH’e ekleyiniz veya betikte `pytesseract.pytesseract.tesseract_cmd` ile yolu tanımlayınız.
> - Anti-virüsler tek dosyalı EXE’lerde “false positive” uyarıları verebilir; kurumsal dağıtımda imzalama (code signing) önerilir.
