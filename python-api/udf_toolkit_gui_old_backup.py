import os
import sys
import json
import tempfile
import threading
import zipfile
import traceback
import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
from tkinterdnd2 import DND_FILES, TkinterDnD
from PIL import Image, ImageTk

# Dış fonksiyonlar
try:
    from main import convert_docx_to_udf as docx_to_udf_main
    from udf_to_pdf import udf_to_pdf
    from batch_converter import BatchConverter
    from pdf_merger import PDFMerger
except Exception as e:
    raise RuntimeError(f"Gerekli modüller yüklenemedi. Hata: {e}")

# Config klasörü: %APPDATA%\UDF-Toolkit
APPDATA_DIR = os.path.join(os.getenv("APPDATA", os.path.expanduser("~")), "UDF-Toolkit")
os.makedirs(APPDATA_DIR, exist_ok=True)
CONFIG_FILE = os.path.join(APPDATA_DIR, "config.json")

APP_TITLE = "UDF Toolkit - Gelişmiş Dönüştürücü"

# ------------------ yardımcılar ------------------
def run_in_thread(fn):
    def wrapper(*args, **kwargs):
        t = threading.Thread(target=fn, args=args, kwargs=kwargs, daemon=True)
        t.start()
    return wrapper

def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"template_path": "", "template_xml_cache": ""}

def save_config(cfg):
    try:
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(cfg, f, ensure_ascii=False, indent=2)
    except (OSError, IOError) as e:
        print(f"Config dosyası kaydedilemedi: {e}")
    except Exception as e:
        print(f"Beklenmeyen hata (config kaydetme): {e}")

def ensure_template_xml_path(template_path: str, cfg: dict) -> str:
    """
    Kullanıcı .xml veya .udf seçebilir:
      - .xml ise doğrudan kullan,
      - .udf ise ZIP içinden content.xml çıkar ve temp'e kaydet.
    """
    if not template_path:
        return ""
    
    # Güvenlik kontrolü: dosya yolu doğrulaması
    if not os.path.exists(template_path):
        raise RuntimeError(f"Şablon dosyası bulunamadı: {template_path}")
    
    # Dosya boyutu kontrolü (max 50MB)
    if os.path.getsize(template_path) > 50 * 1024 * 1024:
        raise RuntimeError("Şablon dosyası çok büyük (max 50MB)")
    
    ext = os.path.splitext(template_path)[1].lower()
    if ext == ".xml":
        return template_path
    if ext == ".udf":
        try:
            with zipfile.ZipFile(template_path, "r") as z:
                # Güvenlik kontrolü: ZIP bomb koruması
                total_size = sum(info.file_size for info in z.infolist())
                if total_size > 100 * 1024 * 1024:  # 100MB limit
                    raise RuntimeError("ZIP dosyası çok büyük (max 100MB)")
                
                # content.xml dosyasının varlığını kontrol et
                if "content.xml" not in z.namelist():
                    raise RuntimeError("UDF dosyasında content.xml bulunamadı")
                
                data = z.read("content.xml")
                
                # XML boyutu kontrolü (max 10MB)
                if len(data) > 10 * 1024 * 1024:
                    raise RuntimeError("XML içeriği çok büyük (max 10MB)")
            
            base = os.path.basename(template_path)
            cache_name = f"udf_template_{base}.xml"
            cache_path = os.path.join(tempfile.gettempdir(), cache_name)
            
            with open(cache_path, "wb") as out:
                out.write(data)
            cfg["template_xml_cache"] = cache_path
            save_config(cfg)
            return cache_path
        except zipfile.BadZipFile:
            raise RuntimeError("Geçersiz ZIP dosyası")
        except Exception as e:
            raise RuntimeError(f"Şablon UDF içinden content.xml çıkarılamadı: {e}")
    raise RuntimeError("Şablon için .xml veya .udf seçiniz.")

def docx_or_udf_to_pdf(input_path, pdf_path, template_xml_path=None):
    """
    DOCX veya UDF dosyasını PDF'e çevirir.
    DOCX ise önce UDF'e sonra PDF'e çevrilir.
    UDF ise doğrudan PDF'e çevrilir.
    """
    ext = os.path.splitext(input_path)[1].lower()
    
    if ext == '.udf':
        # Doğrudan UDF → PDF
        udf_to_pdf(input_path, pdf_path)
        return True, "UDF → PDF dönüşümü başarılı"
    elif ext == '.docx':
        # DOCX → UDF → PDF
        if not template_xml_path:
            raise RuntimeError("DOCX → PDF dönüşümü için şablon gerekli")
        
        # Geçici UDF dosyası oluştur
        base = os.path.splitext(input_path)[0]
        temp_udf = base + "_temp.udf"
        
        try:
            # DOCX → UDF
            docx_to_udf_main(input_path, temp_udf, template_xml_path=template_xml_path)
            
            # UDF → PDF
            udf_to_pdf(temp_udf, pdf_path)
            
            # Geçici UDF dosyasını sil
            if os.path.exists(temp_udf):
                os.remove(temp_udf)
            
            return True, "DOCX → PDF dönüşümü başarılı"
        except Exception as e:
            # Hata durumunda geçici dosyayı temizle
            if os.path.exists(temp_udf):
                os.remove(temp_udf)
            raise e
    else:
        raise RuntimeError("Sadece .docx veya .udf dosyaları destekleniyor")

# ------------------ GUI ------------------
class App(TkinterDnD.Tk):
    def __init__(self):
        super().__init__()
        self.title(APP_TITLE)
        self.geometry("1000x650")
        self.minsize(950, 600)
        self.configure(bg="#f6f7fb")

        self.cfg = load_config()
        self._build_ui()

    def _build_ui(self):
        # ---- Tema / Stil ----
        style = ttk.Style()
        try:
            style.theme_use('clam')
        except Exception:
            pass

        style.configure("TLabel", font=("Segoe UI", 10))
        style.configure("TButton", font=("Segoe UI", 10), padding=(10, 6))
        style.configure("Title.TLabel", font=("Segoe UI Semibold", 16))
        
        # Ana container
        main_frame = ttk.Frame(self, padding=10)
        main_frame.pack(fill="both", expand=True)

        # Üst bar (logo + başlık + template)
        topbar = ttk.Frame(main_frame)
        topbar.pack(fill="x", pady=(0, 10))

        # Logo
        try:
            base_dir = sys._MEIPASS if getattr(sys, "frozen", False) else os.path.dirname(__file__)
            logo_path = os.path.join(base_dir, "assets", "logo.png")
            if os.path.exists(logo_path):
                img = Image.open(logo_path).resize((180, 76))
                self.logo_img = ImageTk.PhotoImage(img)
                tk.Label(topbar, image=self.logo_img, bg="#f6f7fb").pack(side="left", padx=(0, 10))
        except Exception as e:
            print("Logo yüklenemedi:", e)

        # Başlık
        titlewrap = ttk.Frame(topbar)
        titlewrap.pack(side="left", fill="x", expand=True)
        ttk.Label(titlewrap, text="UDF Toolkit", style="Title.TLabel").pack(anchor="w")
        ttk.Label(titlewrap, text="Toplu dönüştürme ve PDF birleştirme özellikleri ile güçlendirildi", 
                 foreground="#666").pack(anchor="w")

        # Template alanı
        rightwrap = ttk.Frame(topbar)
        rightwrap.pack(side="right")
        self.lbl_template = ttk.Label(rightwrap, text="Seçili şablon: (yok)", foreground="#a00")
        self.lbl_template.pack(side="top", anchor="e", pady=(2, 6))
        ttk.Button(rightwrap, text="📁 Template Seç", command=self.on_choose_template).pack(side="bottom", anchor="e")
        self._refresh_template_label()

        ttk.Separator(main_frame, orient="horizontal").pack(fill="x", pady=8)

        # ---- Notebook (Sekmeler) ----
        self.notebook = ttk.Notebook(main_frame)
        self.notebook.pack(fill="both", expand=True)

        # Sekme 1: Tekli Dönüştürme
        self.tab_single = ttk.Frame(self.notebook, padding=10)
        self.notebook.add(self.tab_single, text="🔄 Tekli Dönüştürme")
        self._build_single_tab()

        # Sekme 2: Toplu Dönüştürme
        self.tab_batch = ttk.Frame(self.notebook, padding=10)
        self.notebook.add(self.tab_batch, text="📦 Toplu Dönüştürme")
        self._build_batch_tab()

        # Sekme 3: PDF Birleştirme
        self.tab_merge = ttk.Frame(self.notebook, padding=10)
        self.notebook.add(self.tab_merge, text="🔗 PDF Birleştir")
        self._build_merge_tab()

        # Status bar
        self.status = tk.Label(self, text="Hazır", bg="#222", fg="white", anchor="w",
                               padx=10, pady=6, font=("Segoe UI", 9))
        self.status.pack(fill="x", side="bottom")

    def _build_single_tab(self):
        """Tekli dönüştürme sekmesi"""
        # Butonlar
        btn_frame = ttk.Frame(self.tab_single)
        btn_frame.pack(fill="x", pady=(0, 10))

        ttk.Button(btn_frame, text="📄 Word Dosyası Seç ve UDF'ye Çevir", command=self.handle_docx_to_udf).pack(
            side="left", padx=(0, 5), fill="x", expand=True)
        ttk.Button(btn_frame, text="📑 Dosya Seç ve PDF Oluştur", command=self.handle_to_pdf).pack(
            side="left", padx=5, fill="x", expand=True)

        # Drag & Drop alanları
        dragwrap = ttk.LabelFrame(self.tab_single, text="Sürükle & Bırak", padding=10)
        dragwrap.pack(fill="both", expand=True)

        drag_container = ttk.Frame(dragwrap)
        drag_container.pack(fill="both", expand=True)
        
        # Sol: Word → UDF
        left_frame = ttk.LabelFrame(drag_container, text="Word → UDF", padding=5)
        left_frame.pack(side="left", fill="both", expand=True, padx=(0, 5))
        
        self.drag_area_udf = tk.Frame(left_frame, bg="#e3f2fd", relief="groove", bd=2, height=150)
        self.drag_area_udf.pack(fill="both", expand=True)
        
        self.drag_label_udf = tk.Label(self.drag_area_udf, 
                                 text="📄 Word dosyasını (.docx)\nburaya sürükleyin\n\n↓\n\nUDF oluşturulacak",
                                 font=("Segoe UI", 11),
                                 bg="#e3f2fd", fg="#1565c0",
                                 justify="center")
        self.drag_label_udf.pack(expand=True)
        
        self.drag_area_udf.drop_target_register(DND_FILES)
        self.drag_area_udf.dnd_bind('<<Drop>>', self.on_drop_udf)
        
        # Sağ: Word/UDF → PDF
        right_frame = ttk.LabelFrame(drag_container, text="PDF Oluştur", padding=5)
        right_frame.pack(side="right", fill="both", expand=True, padx=(5, 0))
        
        self.drag_area_pdf = tk.Frame(right_frame, bg="#e8f5e9", relief="groove", bd=2, height=150)
        self.drag_area_pdf.pack(fill="both", expand=True)
        
        self.drag_label_pdf = tk.Label(self.drag_area_pdf, 
                                 text="📑 Word (.docx) veya UDF (.udf)\ndosyasını buraya sürükleyin\n\n↓\n\nPDF oluşturulacak",
                                 font=("Segoe UI", 10),
                                 bg="#e8f5e9", fg="#2e7d32",
                                 justify="center")
        self.drag_label_pdf.pack(expand=True)
        
        self.drag_area_pdf.drop_target_register(DND_FILES)
        self.drag_area_pdf.dnd_bind('<<Drop>>', self.on_drop_pdf)
        
        # Log alanı
        logwrap = ttk.LabelFrame(self.tab_single, text="İşlem Günlüğü", padding=5)
        logwrap.pack(fill="x", pady=(10, 0))

        self.log_single = tk.Text(logwrap, height=5, wrap="word",
                           bg="#ffffff", fg="#2b2b2b", font=("Consolas", 9),
                           relief="flat", borderwidth=0)
        self.log_single.tag_configure("ok", foreground="#0a8f5b")
        self.log_single.tag_configure("err", foreground="#cc0033")
        self.log_single.tag_configure("muted", foreground="#808080")
        self.log_single.pack(fill="x")
        self.log_single.configure(state="disabled")

    def _build_batch_tab(self):
        """Toplu dönüştürme sekmesi"""
        # Açıklama
        desc = ttk.Label(self.tab_batch, 
                        text="Bir klasördeki tüm dosyaları toplu olarak dönüştürün. Alt klasörler de dahil edilebilir.",
                        foreground="#555")
        desc.pack(anchor="w", pady=(0, 10))

        # İşlem seçimi
        operation_frame = ttk.LabelFrame(self.tab_batch, text="Dönüştürme İşlemi", padding=10)
        operation_frame.pack(fill="x", pady=(0, 10))

        self.batch_operation = tk.StringVar(value="docx-to-udf")
        ttk.Radiobutton(operation_frame, text="📄 DOCX → UDF", 
                       variable=self.batch_operation, value="docx-to-udf",
                       command=self.update_batch_ui).pack(anchor="w")
        ttk.Radiobutton(operation_frame, text="📑 UDF → PDF", 
                       variable=self.batch_operation, value="udf-to-pdf",
                       command=self.update_batch_ui).pack(anchor="w")
        ttk.Radiobutton(operation_frame, text="📝 UDF → DOCX", 
                       variable=self.batch_operation, value="udf-to-docx",
                       command=self.update_batch_ui).pack(anchor="w")
        
        ttk.Separator(operation_frame, orient="horizontal").pack(fill="x", pady=5)
        
        ttk.Radiobutton(operation_frame, text="🔥 Hepsini PDF'ye Dönüştür (DOCX + UDF → PDF)", 
                       variable=self.batch_operation, value="all-to-pdf",
                       command=self.update_batch_ui).pack(anchor="w")
        ttk.Radiobutton(operation_frame, text="📚 Dönüştür ve Birleştir (DOCX + UDF → Tek PDF)", 
                       variable=self.batch_operation, value="convert-and-merge",
                       command=self.update_batch_ui).pack(anchor="w")

        # Klasör seçimi
        folder_frame = ttk.LabelFrame(self.tab_batch, text="Klasörler", padding=10)
        folder_frame.pack(fill="x", pady=(0, 10))

        # Giriş klasörü
        input_row = ttk.Frame(folder_frame)
        input_row.pack(fill="x", pady=(0, 5))
        ttk.Label(input_row, text="Giriş Klasörü:", width=12).pack(side="left")
        self.batch_input_var = tk.StringVar()
        ttk.Entry(input_row, textvariable=self.batch_input_var).pack(side="left", fill="x", expand=True, padx=5)
        ttk.Button(input_row, text="📁 Klasör Seç", command=self.select_batch_input).pack(side="left")

        # Çıkış klasörü
        self.output_dir_row = ttk.Frame(folder_frame)
        self.output_dir_row.pack(fill="x", pady=(0, 5))
        ttk.Label(self.output_dir_row, text="Çıkış Klasörü:", width=12).pack(side="left")
        self.batch_output_var = tk.StringVar()
        ttk.Entry(self.output_dir_row, textvariable=self.batch_output_var).pack(side="left", fill="x", expand=True, padx=5)
        ttk.Button(self.output_dir_row, text="📁 Klasör Seç", command=self.select_batch_output).pack(side="left")
        
        self.output_dir_hint = ttk.Label(folder_frame, text="(Boş bırakılırsa giriş klasörüyle aynı olacak)", 
                 foreground="#888", font=("Segoe UI", 8))
        self.output_dir_hint.pack(anchor="w", pady=(0, 3))
        
        # Çıkış klasörü ve dosya adı (sadece "Dönüştür ve Birleştir" için)
        self.output_pdf_row = ttk.Frame(folder_frame)
        
        # Çıkış klasörü
        pdf_folder_row = ttk.Frame(self.output_pdf_row)
        pdf_folder_row.pack(fill="x", pady=(0, 5))
        ttk.Label(pdf_folder_row, text="Çıkış Klasörü:", width=12).pack(side="left")
        self.batch_merge_folder_var = tk.StringVar()
        ttk.Entry(pdf_folder_row, textvariable=self.batch_merge_folder_var).pack(side="left", fill="x", expand=True, padx=5)
        ttk.Button(pdf_folder_row, text="📁 Klasör Seç", command=self.select_batch_merge_folder).pack(side="left")
        
        # Dosya adı
        pdf_name_row = ttk.Frame(self.output_pdf_row)
        pdf_name_row.pack(fill="x")
        ttk.Label(pdf_name_row, text="Dosya Adı:", width=12).pack(side="left")
        self.batch_merge_filename_var = tk.StringVar(value="birlestirilmis.pdf")
        ttk.Entry(pdf_name_row, textvariable=self.batch_merge_filename_var).pack(side="left", fill="x", expand=True, padx=5)
        ttk.Label(pdf_name_row, text=".pdf", foreground="#666").pack(side="left")

        # Seçenekler
        options_frame = ttk.LabelFrame(self.tab_batch, text="Seçenekler", padding=10)
        options_frame.pack(fill="x", pady=(0, 10))

        self.batch_recursive = tk.BooleanVar(value=False)
        ttk.Checkbutton(options_frame, text="Alt klasörleri de tara (recursive)", 
                       variable=self.batch_recursive).pack(anchor="w")

        # Buton
        ttk.Button(self.tab_batch, text="🚀 Toplu Dönüştürmeyi Başlat", 
                  command=self.start_batch_conversion).pack(pady=10)

        # İlerleme
        progress_frame = ttk.LabelFrame(self.tab_batch, text="İlerleme", padding=10)
        progress_frame.pack(fill="both", expand=True)

        self.batch_progress_label = ttk.Label(progress_frame, text="Bekliyor...")
        self.batch_progress_label.pack(anchor="w")

        self.batch_progress_bar = ttk.Progressbar(progress_frame, mode='determinate')
        self.batch_progress_bar.pack(fill="x", pady=(5, 10))

        # Log
        self.log_batch = scrolledtext.ScrolledText(progress_frame, height=10, wrap="word",
                                                   font=("Consolas", 9))
        self.log_batch.pack(fill="both", expand=True)

    def _build_merge_tab(self):
        """PDF birleştirme sekmesi"""
        # Açıklama
        desc = ttk.Label(self.tab_merge, 
                        text="Birden fazla PDF dosyasını tek bir PDF dosyasında birleştirin.",
                        foreground="#555")
        desc.pack(anchor="w", pady=(0, 10))

        # Mod seçimi
        mode_frame = ttk.LabelFrame(self.tab_merge, text="Birleştirme Modu", padding=10)
        mode_frame.pack(fill="x", pady=(0, 10))

        self.merge_mode = tk.StringVar(value="files")
        ttk.Radiobutton(mode_frame, text="📑 Dosya Listesi (Manuel seçim)", 
                       variable=self.merge_mode, value="files",
                       command=self.update_merge_ui).pack(anchor="w")
        ttk.Radiobutton(mode_frame, text="📁 Klasör (Klasördeki tüm PDF'ler)", 
                       variable=self.merge_mode, value="folder",
                       command=self.update_merge_ui).pack(anchor="w")

        # Dosya listesi bölümü
        self.merge_files_frame = ttk.LabelFrame(self.tab_merge, text="PDF Dosyaları", padding=10)
        self.merge_files_frame.pack(fill="both", expand=True, pady=(0, 10))

        btn_row = ttk.Frame(self.merge_files_frame)
        btn_row.pack(fill="x", pady=(0, 5))
        ttk.Button(btn_row, text="➕ Dosya Ekle", command=self.add_pdf_files).pack(side="left", padx=(0, 5))
        ttk.Button(btn_row, text="❌ Seçileni Kaldır", command=self.remove_pdf_file).pack(side="left", padx=(0, 5))
        ttk.Button(btn_row, text="🔼 Yukarı", command=self.move_pdf_up).pack(side="left", padx=(0, 5))
        ttk.Button(btn_row, text="🔽 Aşağı", command=self.move_pdf_down).pack(side="left", padx=(0, 5))
        ttk.Button(btn_row, text="🗑️ Tümünü Temizle", command=self.clear_pdf_list).pack(side="left")

        # Listbox
        list_frame = ttk.Frame(self.merge_files_frame)
        list_frame.pack(fill="both", expand=True)
        
        scrollbar = ttk.Scrollbar(list_frame)
        scrollbar.pack(side="right", fill="y")
        
        self.pdf_listbox = tk.Listbox(list_frame, yscrollcommand=scrollbar.set, font=("Segoe UI", 9))
        self.pdf_listbox.pack(side="left", fill="both", expand=True)
        scrollbar.config(command=self.pdf_listbox.yview)

        # Klasör bölümü
        self.merge_folder_frame = ttk.LabelFrame(self.tab_merge, text="Klasör Seçimi", padding=10)
        
        folder_row = ttk.Frame(self.merge_folder_frame)
        folder_row.pack(fill="x", pady=(0, 5))
        ttk.Label(folder_row, text="Klasör:", width=10).pack(side="left")
        self.merge_folder_var = tk.StringVar()
        ttk.Entry(folder_row, textvariable=self.merge_folder_var).pack(side="left", fill="x", expand=True, padx=5)
        ttk.Button(folder_row, text="📁 Klasör Seç", command=self.select_merge_folder).pack(side="left")

        self.merge_recursive_var = tk.BooleanVar(value=False)
        ttk.Checkbutton(self.merge_folder_frame, text="Alt klasörleri de dahil et", 
                       variable=self.merge_recursive_var).pack(anchor="w")

        # Seçenekler
        options_frame = ttk.LabelFrame(self.tab_merge, text="Seçenekler", padding=10)
        options_frame.pack(fill="x", pady=(0, 10))

        self.merge_bookmarks = tk.BooleanVar(value=True)
        ttk.Checkbutton(options_frame, text="Her dosya için bookmark (yer imi) ekle", 
                       variable=self.merge_bookmarks).pack(anchor="w")

        # Çıkış dosyası
        output_frame = ttk.Frame(self.tab_merge)
        output_frame.pack(fill="x", pady=(0, 10))
        ttk.Label(output_frame, text="Çıkış PDF:", width=10).pack(side="left")
        self.merge_output_var = tk.StringVar()
        ttk.Entry(output_frame, textvariable=self.merge_output_var).pack(side="left", fill="x", expand=True, padx=5)
        ttk.Button(output_frame, text="📄 PDF Seç", command=self.select_merge_output).pack(side="left")

        # Buton
        ttk.Button(self.tab_merge, text="🔗 PDF'leri Birleştir", 
                  command=self.start_pdf_merge).pack(pady=10)

        # UI'yi güncelle
        self.update_merge_ui()

    # ---------- Yardımcı metodlar ----------
    def _refresh_template_label(self):
        tpl = self.cfg.get("template_path") or ""
        if tpl and os.path.exists(tpl):
            self.lbl_template.configure(text=f"✅ {os.path.basename(tpl)}", foreground="#138a07")
        else:
            self.lbl_template.configure(text="Seçili şablon: (yok)", foreground="#a00")

    def _log(self, msg, tag=None, log_widget=None):
        if log_widget is None:
            log_widget = self.log_single
        
        log_widget.configure(state="normal")
        if tag:
            log_widget.insert("end", msg + "\n", tag)
        else:
            log_widget.insert("end", msg + "\n")
        log_widget.see("end")
        log_widget.configure(state="disabled")

    def _set_status(self, text):
        self.status.configure(text=text)
        self.update_idletasks()

    def on_choose_template(self):
        path = filedialog.askopenfilename(
            title="Şablon seçin (content.xml veya antetli .udf)",
            filetypes=[("UDF veya XML", "*.udf *.xml"), ("Tüm Dosyalar", "*.*")]
        )
        if not path:
            return
        self.cfg["template_path"] = path
        save_config(self.cfg)
        self._refresh_template_label()
        self._log(f"Şablon seçildi: {os.path.basename(path)}", tag="muted")

    # ---------- Tekli dönüştürme ----------
    def on_drop_udf(self, event):
        """Drag & Drop - Word → UDF"""
        files = self.tk.splitlist(event.data)
        if not files:
            return
        file_path = files[0]
        if not file_path.lower().endswith('.docx'):
            messagebox.showerror("Hatalı Dosya", "Lütfen sadece .docx dosyasını sürükleyin.")
            return
        if not os.path.exists(file_path):
            messagebox.showerror("Dosya Bulunamadı", f"Dosya bulunamadı: {file_path}")
            return
        self.drag_label_udf.configure(text=f"📄 {os.path.basename(file_path)}\n\nUDF oluşturuluyor...", fg="#1565c0")
        self.update()
        self.convert_dropped_file_to_udf(file_path)
    
    def on_drop_pdf(self, event):
        """Drag & Drop - Word/UDF → PDF"""
        files = self.tk.splitlist(event.data)
        if not files:
            return
        file_path = files[0]
        ext = file_path.lower()
        if not (ext.endswith('.docx') or ext.endswith('.udf')):
            messagebox.showerror("Hatalı Dosya", "Lütfen sadece .docx veya .udf dosyalarını sürükleyin.")
            return
        if not os.path.exists(file_path):
            messagebox.showerror("Dosya Bulunamadı", f"Dosya bulunamadı: {file_path}")
            return
        self.drag_label_pdf.configure(text=f"📑 {os.path.basename(file_path)}\n\nPDF oluşturuluyor...", fg="#2e7d32")
        self.update()
        self.convert_dropped_file_to_pdf(file_path)

    @run_in_thread
    def convert_dropped_file_to_udf(self, docx_path):
        """Sürüklenen Word dosyasını UDF'e çevir"""
        try:
            tpl = self.cfg.get("template_path") or ""
            if not tpl or not os.path.exists(tpl):
                self.drag_label_udf.configure(text="❌ Şablon seçilmemiş!", fg="#cc0033")
                messagebox.showerror("Şablon Yok", "Lütfen önce Template Seç ile şablon seçin.")
                return

            try:
                tpl_xml_path = ensure_template_xml_path(tpl, self.cfg)
            except Exception as e:
                self.drag_label_udf.configure(text="❌ Şablon hatası!", fg="#cc0033")
                messagebox.showerror("Şablon Hatası", str(e))
                return

            base, _ = os.path.splitext(docx_path)
            udf_out = base + ".udf"

            self._set_status("DOCX → UDF dönüştürülüyor...")
            self._log(f"Dosya: {os.path.basename(docx_path)}", tag="muted")

            docx_to_udf_main(docx_path, udf_out, template_xml_path=tpl_xml_path)

            self._log("✔ Başarılı: UDF oluşturuldu", tag="ok")
            self._set_status("Tamamlandı")
            self.drag_label_udf.configure(text=f"✅ {os.path.basename(udf_out)}\noluşturuldu!", fg="#0a8f5b")
            messagebox.showinfo("Başarılı", f"UDF oluşturuldu:\n{udf_out}")
            
        except Exception as e:
            self._log(f"✘ Hata: {e}", tag="err")
            self._set_status("Hata")
            self.drag_label_udf.configure(text=f"❌ Hata!", fg="#cc0033")
            messagebox.showerror("Hata", str(e))
        finally:
            self.after(3000, self.reset_drag_area_udf)

    @run_in_thread
    def convert_dropped_file_to_pdf(self, input_path):
        """Sürüklenen dosyayı PDF'e çevir"""
        try:
            ext = os.path.splitext(input_path)[1].lower()
            tpl_xml_path = None
            
            if ext == '.docx':
                tpl = self.cfg.get("template_path") or ""
                if not tpl or not os.path.exists(tpl):
                    self.drag_label_pdf.configure(text="❌ Şablon seçilmemiş!", fg="#cc0033")
                    messagebox.showerror("Şablon Yok", "Word dosyaları için şablon gerekli.")
                    return
                try:
                    tpl_xml_path = ensure_template_xml_path(tpl, self.cfg)
                except Exception as e:
                    self.drag_label_pdf.configure(text="❌ Şablon hatası!", fg="#cc0033")
                    messagebox.showerror("Şablon Hatası", str(e))
                    return

            base, _ = os.path.splitext(input_path)
            pdf_out = base + ".pdf"

            self._set_status("PDF oluşturuluyor...")
            self._log(f"Dosya: {os.path.basename(input_path)}", tag="muted")

            docx_or_udf_to_pdf(input_path, pdf_out, template_xml_path=tpl_xml_path)

            self._log("✔ Başarılı: PDF oluşturuldu", tag="ok")
            self._set_status("Tamamlandı")
            self.drag_label_pdf.configure(text=f"✅ {os.path.basename(pdf_out)}\noluşturuldu!", fg="#0a8f5b")
            messagebox.showinfo("Başarılı", f"PDF oluşturuldu:\n{pdf_out}")
            
        except Exception as e:
            self._log(f"✘ Hata: {e}", tag="err")
            self._set_status("Hata")
            self.drag_label_pdf.configure(text=f"❌ Hata!", fg="#cc0033")
            messagebox.showerror("Hata", str(e))
        finally:
            self.after(3000, self.reset_drag_area_pdf)

    def reset_drag_area_udf(self):
        self.drag_label_udf.configure(text="📄 Word dosyasını (.docx)\nburaya sürükleyin\n\n↓\n\nUDF oluşturulacak", fg="#1565c0")
    
    def reset_drag_area_pdf(self):
        self.drag_label_pdf.configure(text="📑 Word (.docx) veya UDF (.udf)\ndosyasını buraya sürükleyin\n\n↓\n\nPDF oluşturulacak", fg="#2e7d32")

    @run_in_thread
    def handle_docx_to_udf(self):
        try:
            tpl = self.cfg.get("template_path") or ""
            if not tpl or not os.path.exists(tpl):
                messagebox.showerror("Şablon Yok", "Lütfen önce şablon seçin.")
                return

            try:
                tpl_xml_path = ensure_template_xml_path(tpl, self.cfg)
            except Exception as e:
                messagebox.showerror("Şablon Hatası", str(e))
                return

            docx_path = filedialog.askopenfilename(title="DOCX Seç", filetypes=[("Word DOCX", "*.docx")])
            if not docx_path:
                return
            
            base, _ = os.path.splitext(docx_path)
            udf_out = filedialog.asksaveasfilename(
                title="UDF Çıkışı", defaultextension=".udf",
                                                   filetypes=[("UDF", "*.udf")],
                initialfile=os.path.basename(base) + ".udf"
            )
            if not udf_out:
                return

            self._set_status("DOCX → UDF dönüştürülüyor...")
            self._log(f"Girdi: {docx_path}", tag="muted")
            self._log(f"Çıktı: {udf_out}", tag="muted")

            docx_to_udf_main(docx_path, udf_out, template_xml_path=tpl_xml_path)

            self._log("✔ Başarılı: UDF oluşturuldu", tag="ok")
            self._set_status("Tamamlandı")
            messagebox.showinfo("Başarılı", f"UDF oluşturuldu:\n{udf_out}")
        except Exception as e:
            self._log(f"✘ Hata: {e}", tag="err")
            self._set_status("Hata")
            messagebox.showerror("Hata", str(e))

    @run_in_thread
    def handle_to_pdf(self):
        try:
            input_path = filedialog.askopenfilename(
                title="Dosya Seç",
                filetypes=[("Word/UDF", "*.docx *.udf"), ("Tüm Dosyalar", "*.*")]
            )
            if not input_path:
                return
            
            ext = os.path.splitext(input_path)[1].lower()
            tpl_xml_path = None
            
            if ext == '.docx':
                tpl = self.cfg.get("template_path") or ""
                if not tpl or not os.path.exists(tpl):
                    messagebox.showerror("Şablon Yok", "Word dosyaları için şablon gerekli.")
                    return
                try:
                    tpl_xml_path = ensure_template_xml_path(tpl, self.cfg)
                except Exception as e:
                    messagebox.showerror("Şablon Hatası", str(e))
                    return
            
            base, _ = os.path.splitext(input_path)
            pdf_out = filedialog.asksaveasfilename(
                title="PDF Çıkışı",
                defaultextension=".pdf",
                filetypes=[("PDF", "*.pdf")],
                initialfile=os.path.basename(base) + ".pdf"
            )
            if not pdf_out:
                return

            self._set_status("PDF oluşturuluyor...")
            self._log(f"Girdi: {input_path}", tag="muted")
            self._log(f"Çıktı: {pdf_out}", tag="muted")

            docx_or_udf_to_pdf(input_path, pdf_out, template_xml_path=tpl_xml_path)
            
            self._log("✔ Başarılı: PDF oluşturuldu", tag="ok")
            self._set_status("Tamamlandı")
            messagebox.showinfo("Başarılı", f"PDF oluşturuldu:\n{pdf_out}")
            
        except Exception as e:
            self._log(f"✘ Hata: {e}", tag="err")
            self._set_status("Hata")
            messagebox.showerror("Hata", str(e))

    # ---------- Toplu dönüştürme ----------
    def update_batch_ui(self):
        """Seçilen işleme göre UI'yi güncelle"""
        operation = self.batch_operation.get()
        
        if operation == "convert-and-merge":
            # Dönüştür ve Birleştir: Çıkış klasörü yerine çıkış PDF dosyası
            self.output_dir_row.pack_forget()
            self.output_dir_hint.pack_forget()
            self.output_pdf_row.pack(fill="x", pady=(0, 5))
        else:
            # Diğer işlemler: Normal çıkış klasörü
            self.output_pdf_row.pack_forget()
            self.output_dir_row.pack(fill="x", pady=(0, 5))
            self.output_dir_hint.pack(anchor="w", pady=(0, 3))
    
    def select_batch_input(self):
        folder = filedialog.askdirectory(title="Giriş Klasörü Seç")
        if folder:
            self.batch_input_var.set(folder)

    def select_batch_output(self):
        folder = filedialog.askdirectory(title="Çıkış Klasörü Seç")
        if folder:
            self.batch_output_var.set(folder)
    
    def select_batch_merge_folder(self):
        """Birleştirilmiş PDF için çıkış klasörü seç"""
        folder = filedialog.askdirectory(title="Birleştirilmiş PDF İçin Çıkış Klasörü Seç")
        if folder:
            self.batch_merge_folder_var.set(folder)

    @run_in_thread
    def start_batch_conversion(self):
        try:
            input_dir = self.batch_input_var.get()
            if not input_dir or not os.path.exists(input_dir):
                messagebox.showerror("Hata", "Geçerli bir giriş klasörü seçin.")
                return

            operation = self.batch_operation.get()
            recursive = self.batch_recursive.get()
            
            # Çıkış kontrolü
            if operation == "convert-and-merge":
                # Klasör ve dosya adından tam yolu oluştur
                merge_folder = self.batch_merge_folder_var.get()
                merge_filename = self.batch_merge_filename_var.get()
                
                # Eğer çıkış klasörü seçilmediyse, giriş klasörünü kullan
                if not merge_folder:
                    merge_folder = input_dir
                    self.batch_merge_folder_var.set(merge_folder)
                    self.log_batch.insert("end", "ℹ️ Çıkış klasörü belirtilmediği için giriş klasörü kullanılıyor.\n\n")
                
                if not merge_filename:
                    messagebox.showerror("Hata", "Dosya adı girin.")
                    return
                
                # .pdf uzantısı yoksa ekle
                if not merge_filename.lower().endswith('.pdf'):
                    merge_filename += '.pdf'
                
                # Tam yolu oluştur
                output_pdf = os.path.join(merge_folder, merge_filename)
                output_dir = None
            else:
                output_dir = self.batch_output_var.get() or None
                output_pdf = None

            # Şablon kontrolü (DOCX dönüşümü gereken işlemler için)
            tpl_xml_path = "calisanudfcontent.xml"
            needs_template = operation in ["docx-to-udf", "all-to-pdf", "convert-and-merge"]
            
            if needs_template:
                tpl = self.cfg.get("template_path") or ""
                if not tpl or not os.path.exists(tpl):
                    messagebox.showerror("Şablon Yok", 
                                       f"{operation} işlemi için şablon gerekli.\nLütfen önce 'Template Seç' ile şablon seçin.")
                    return
                try:
                    tpl_xml_path = ensure_template_xml_path(tpl, self.cfg)
                except Exception as e:
                    messagebox.showerror("Şablon Hatası", str(e))
                    return

            self.log_batch.delete("1.0", "end")
            self.log_batch.insert("end", "=" * 60 + "\n")
            self.log_batch.insert("end", f"İŞLEM: {operation}\n")
            self.log_batch.insert("end", "=" * 60 + "\n")
            self.log_batch.insert("end", f"📂 Giriş Klasörü:\n   {input_dir}\n\n")
            if operation == "convert-and-merge":
                self.log_batch.insert("end", f"📁 Çıkış Klasörü:\n   {os.path.dirname(output_pdf)}\n")
                self.log_batch.insert("end", f"📄 Dosya Adı:\n   {os.path.basename(output_pdf)}\n")
                self.log_batch.insert("end", f"📋 Tam Yol:\n   {output_pdf}\n\n")
            else:
                if output_dir:
                    self.log_batch.insert("end", f"📁 Çıkış Klasörü:\n   {output_dir}\n\n")
                else:
                    self.log_batch.insert("end", f"📁 Çıkış Klasörü:\n   (Giriş klasörüyle aynı - {input_dir})\n\n")
            self.log_batch.insert("end", f"🔄 Alt klasörler: {'Evet' if recursive else 'Hayır'}\n")
            self.log_batch.insert("end", "-" * 60 + "\n\n")

            # Progress callback
            def progress_callback(current, total, filename, status):
                percent = int((current / total) * 100)
                self.batch_progress_bar['value'] = percent
                self.batch_progress_label.configure(text=f"[{current}/{total}] {status}: {filename}")
                self.log_batch.insert("end", f"[{current}/{total}] {status}: {filename}\n")
                self.log_batch.see("end")
                self.update_idletasks()

            converter = BatchConverter(progress_callback=progress_callback)

            self._set_status("Toplu dönüştürme başlıyor...")

            if operation == "docx-to-udf":
                results = converter.convert_docx_to_udf_batch(input_dir, output_dir, tpl_xml_path, recursive)
            elif operation == "udf-to-pdf":
                results = converter.convert_udf_to_pdf_batch(input_dir, output_dir, recursive)
            elif operation == "udf-to-docx":
                results = converter.convert_udf_to_docx_batch(input_dir, output_dir, recursive)
            elif operation == "all-to-pdf":
                results = converter.convert_all_to_pdf_batch(input_dir, output_dir, tpl_xml_path, recursive)
            elif operation == "convert-and-merge":
                results = converter.convert_and_merge_to_pdf(input_dir, output_pdf, tpl_xml_path, recursive)

            self.log_batch.insert("end", "\n" + "=" * 50 + "\n")
            self.log_batch.insert("end", "ÖZET\n")
            self.log_batch.insert("end", "=" * 50 + "\n")
            self.log_batch.insert("end", f"✔ Başarılı: {len(results['success'])}\n")
            self.log_batch.insert("end", f"✘ Başarısız: {len(results['failed'])}\n")
            
            # Oluşturulan dosyaların konumunu göster
            if operation == "convert-and-merge":
                if output_pdf and os.path.exists(output_pdf):
                    file_size = os.path.getsize(output_pdf)
                    self.log_batch.insert("end", f"\n{'='*60}\n")
                    self.log_batch.insert("end", f"📄 BİRLEŞTİRİLMİŞ PDF OLUŞTURULDU!\n")
                    self.log_batch.insert("end", f"{'='*60}\n")
                    self.log_batch.insert("end", f"📁 Dosya Konumu:\n   {output_pdf}\n")
                    self.log_batch.insert("end", f"📊 Dosya Boyutu: {file_size:,} bytes ({file_size/(1024*1024):.2f} MB)\n")
                    
                    # Klasörü Windows Explorer'da aç butonu için bilgi
                    output_folder = os.path.dirname(output_pdf)
                    self.log_batch.insert("end", f"\n💡 İpucu: Dosyayı görmek için şu klasörü açın:\n   {output_folder}\n")
                elif output_pdf:
                    self.log_batch.insert("end", f"\n❌ HATA: PDF dosyası oluşturulmadı!\n")
                    self.log_batch.insert("end", f"Beklenen konum: {output_pdf}\n")
                else:
                    self.log_batch.insert("end", f"\n❌ HATA: Çıkış PDF yolu belirtilmedi!\n")
            elif results['success'] and len(results['success']) > 0:
                # İlk dosyanın konumunu göster
                first_output = results['success'][0].get('output', '')
                if first_output:
                    output_folder = os.path.dirname(first_output)
                    self.log_batch.insert("end", f"\n📁 Çıkış Klasörü: {output_folder}\n")
                    self.log_batch.insert("end", f"Oluşturulan dosyalar:\n")
                    for item in results['success'][:5]:  # İlk 5 dosyayı göster
                        self.log_batch.insert("end", f"  • {os.path.basename(item.get('output', ''))}\n")
                    if len(results['success']) > 5:
                        self.log_batch.insert("end", f"  ... ve {len(results['success']) - 5} dosya daha\n")
            
            self.log_batch.see("end")

            self._set_status("Toplu dönüştürme tamamlandı")
            
            success_msg = f"✔ Başarılı: {len(results['success'])}\n✘ Başarısız: {len(results['failed'])}"
            
            if operation == "convert-and-merge":
                if output_pdf and os.path.exists(output_pdf):
                    file_size = os.path.getsize(output_pdf)
                    success_msg += f"\n\n📄 Birleştirilmiş PDF:\n{os.path.basename(output_pdf)}"
                    success_msg += f"\n\n📁 Konum:\n{os.path.dirname(output_pdf)}"
                    success_msg += f"\n\n📊 Boyut: {file_size/(1024*1024):.2f} MB"
                else:
                    success_msg += f"\n\n❌ UYARI: PDF dosyası oluşturulamadı!"
                    if output_pdf:
                        success_msg += f"\nBeklenen konum: {output_pdf}"
            elif results['success'] and len(results['success']) > 0:
                first_output = results['success'][0].get('output', '')
                if first_output:
                    output_folder = os.path.dirname(first_output)
                    success_msg += f"\n\n📁 Dosyalar buraya kaydedildi:\n{output_folder}"
            
            # Tamamlandı mesajı göster
            result = messagebox.showinfo("Tamamlandı", success_msg)
            
            # Eğer birleştirme işlemi başarılıysa, klasörü aç seçeneği sun
            if operation == "convert-and-merge" and output_pdf and os.path.exists(output_pdf):
                open_folder = messagebox.askyesno(
                    "Klasörü Aç?", 
                    f"Birleştirilmiş PDF oluşturuldu!\n\n{os.path.basename(output_pdf)}\n\nKlasorü Windows Explorer'da açmak ister misiniz?"
                )
                if open_folder:
                    import subprocess
                    output_folder = os.path.dirname(output_pdf)
                    # Windows Explorer'da klasörü aç ve dosyayı seç
                    subprocess.Popen(f'explorer /select,"{output_pdf}"')

        except Exception as e:
            self.log_batch.insert("end", f"\n✘ FATAL HATA: {e}\n")
            self.log_batch.insert("end", f"Hata detayı: {traceback.format_exc()}\n")
            self.log_batch.see("end")
            self._set_status("Hata")
            messagebox.showerror("Hata", str(e))

    # ---------- PDF birleştirme ----------
    def update_merge_ui(self):
        """Birleştirme moduna göre UI'yi güncelle"""
        mode = self.merge_mode.get()
        if mode == "files":
            self.merge_files_frame.pack(fill="both", expand=True, pady=(0, 10))
            self.merge_folder_frame.pack_forget()
        else:
            self.merge_files_frame.pack_forget()
            self.merge_folder_frame.pack(fill="both", expand=True, pady=(0, 10))

    def add_pdf_files(self):
        files = filedialog.askopenfilenames(
            title="PDF Dosyaları Seç",
            filetypes=[("PDF", "*.pdf")]
        )
        for file in files:
            self.pdf_listbox.insert("end", file)

    def remove_pdf_file(self):
        selection = self.pdf_listbox.curselection()
        if selection:
            self.pdf_listbox.delete(selection[0])

    def move_pdf_up(self):
        selection = self.pdf_listbox.curselection()
        if selection and selection[0] > 0:
            idx = selection[0]
            item = self.pdf_listbox.get(idx)
            self.pdf_listbox.delete(idx)
            self.pdf_listbox.insert(idx - 1, item)
            self.pdf_listbox.selection_set(idx - 1)

    def move_pdf_down(self):
        selection = self.pdf_listbox.curselection()
        if selection and selection[0] < self.pdf_listbox.size() - 1:
            idx = selection[0]
            item = self.pdf_listbox.get(idx)
            self.pdf_listbox.delete(idx)
            self.pdf_listbox.insert(idx + 1, item)
            self.pdf_listbox.selection_set(idx + 1)

    def clear_pdf_list(self):
        self.pdf_listbox.delete(0, "end")

    def select_merge_folder(self):
        folder = filedialog.askdirectory(title="PDF Klasörü Seç")
        if folder:
            self.merge_folder_var.set(folder)

    def select_merge_output(self):
        file = filedialog.asksaveasfilename(
            title="Çıkış PDF Dosyası",
            defaultextension=".pdf",
            filetypes=[("PDF", "*.pdf")]
        )
        if file:
            self.merge_output_var.set(file)

    @run_in_thread
    def start_pdf_merge(self):
        try:
            output_path = self.merge_output_var.get()
            if not output_path:
                messagebox.showerror("Hata", "Çıkış dosyası belirtin.")
                return

            mode = self.merge_mode.get()
            add_bookmarks = self.merge_bookmarks.get()

            merger = PDFMerger()

            self._set_status("PDF'ler birleştiriliyor...")

            if mode == "files":
                # Dosya listesi modu
                pdf_files = list(self.pdf_listbox.get(0, "end"))
                if not pdf_files:
                    messagebox.showerror("Hata", "En az bir PDF dosyası ekleyin.")
                    return

                # merge_pdfs artık exception fırlatır (başarısız olursa)
                merger.merge_pdfs(pdf_files, output_path, add_bookmarks)
            else:
                # Klasör modu
                folder = self.merge_folder_var.get()
                if not folder or not os.path.exists(folder):
                    messagebox.showerror("Hata", "Geçerli bir klasör seçin.")
                    return

                recursive = self.merge_recursive_var.get()
                merger.merge_pdfs_from_directory(folder, output_path, recursive, add_bookmarks)

            # Başarılıysa buraya gelir
            self._set_status("PDF birleştirme tamamlandı")
            
            # Dosya kontrolü
            if os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                success_msg = f"PDF'ler birleştirildi!\n\n📄 {os.path.basename(output_path)}\n📁 {os.path.dirname(output_path)}\n\n📊 Boyut: {file_size/(1024*1024):.2f} MB"
                messagebox.showinfo("Başarılı", success_msg)
                
                # Klasörü aç seçeneği
                open_folder = messagebox.askyesno("Klasörü Aç?", "Klasörü Windows Explorer'da açmak ister misiniz?")
                if open_folder:
                    import subprocess
                    subprocess.Popen(f'explorer /select,"{output_path}"')
            else:
                messagebox.showwarning("Uyarı", f"İşlem tamamlandı ama dosya bulunamadı:\n{output_path}")

        except Exception as e:
            self._set_status("Hata")
            error_msg = str(e)
            print(f"PDF birleştirme hatası: {error_msg}")
            traceback.print_exc()
            messagebox.showerror("Hata", f"PDF birleştirme başarısız:\n\n{error_msg}")

# ---- çalıştır ----
if __name__ == "__main__":
    app = App()
    app.mainloop()
