"""
UDF Toolkit - Profesyonel GUI
Modern, güçlü ve kullanıcı dostu arayüz
"""

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
from datetime import datetime

# Dış fonksiyonlar
try:
    from main import convert_docx_to_udf as docx_to_udf_main
    from udf_to_pdf import udf_to_pdf
    from batch_converter import BatchConverter
    from pdf_merger import PDFMerger
except Exception as e:
    raise RuntimeError(f"Gerekli modüller yüklenemedi. Hata: {e}")

# Config
APPDATA_DIR = os.path.join(os.getenv("APPDATA", os.path.expanduser("~")), "UDF-Toolkit")
os.makedirs(APPDATA_DIR, exist_ok=True)
CONFIG_FILE = os.path.join(APPDATA_DIR, "config.json")

APP_TITLE = "UDF Toolkit Pro"

# Modern renkler
COLORS = {
    'primary': '#2563eb',        # Mavi
    'primary_hover': '#1d4ed8',
    'success': '#10b981',        # Yeşil
    'success_hover': '#059669',
    'warning': '#f59e0b',        # Turuncu
    'danger': '#ef4444',         # Kırmızı
    'bg_main': '#f8fafc',        # Açık gri
    'bg_card': '#ffffff',        # Beyaz
    'text_primary': '#1e293b',   # Koyu gri
    'text_secondary': '#64748b', # Orta gri
    'border': '#e2e8f0',         # Açık gri
    'accent': '#8b5cf6',         # Mor
}

# ------------------ Yardımcılar ------------------
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
    return {"template_path": "", "template_xml_cache": "", "last_input_dir": "", "last_output_dir": ""}

def save_config(cfg):
    try:
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(cfg, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Config kaydetme hatası: {e}")

def ensure_template_xml_path(template_path: str, cfg: dict) -> str:
    if not template_path:
        return ""
    
    if not os.path.exists(template_path):
        raise RuntimeError(f"Şablon dosyası bulunamadı: {template_path}")
    
    if os.path.getsize(template_path) > 50 * 1024 * 1024:
        raise RuntimeError("Şablon dosyası çok büyük (max 50MB)")
    
    ext = os.path.splitext(template_path)[1].lower()
    if ext == ".xml":
        return template_path
    if ext == ".udf":
        try:
            with zipfile.ZipFile(template_path, "r") as z:
                total_size = sum(info.file_size for info in z.infolist())
                if total_size > 100 * 1024 * 1024:
                    raise RuntimeError("ZIP dosyası çok büyük (max 100MB)")
                if "content.xml" not in z.namelist():
                    raise RuntimeError("UDF dosyasında content.xml bulunamadı")
                data = z.read("content.xml")
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
    ext = os.path.splitext(input_path)[1].lower()
    
    if ext == '.udf':
        udf_to_pdf(input_path, pdf_path)
        return True, "UDF → PDF dönüşümü başarılı"
    elif ext == '.docx':
        if not template_xml_path:
            raise RuntimeError("DOCX → PDF dönüşümü için şablon gerekli")
        
        base = os.path.splitext(input_path)[0]
        temp_udf = base + "_temp.udf"
        
        try:
            docx_to_udf_main(input_path, temp_udf, template_xml_path=template_xml_path)
            udf_to_pdf(temp_udf, pdf_path)
            if os.path.exists(temp_udf):
                os.remove(temp_udf)
            return True, "DOCX → PDF dönüşümü başarılı"
        except Exception as e:
            if os.path.exists(temp_udf):
                os.remove(temp_udf)
            raise e
    else:
        raise RuntimeError("Sadece .docx veya .udf dosyaları destekleniyor")


class ModernButton(tk.Canvas):
    """Modern, gradient buton"""
    def __init__(self, parent, text, command, bg_color, hover_color, **kwargs):
        super().__init__(parent, height=45, highlightthickness=0, **kwargs)
        self.text = text
        self.command = command
        self.bg_color = bg_color
        self.hover_color = hover_color
        self.is_hovered = False
        
        self.bind('<Button-1>', lambda e: self.command())
        self.bind('<Enter>', self._on_enter)
        self.bind('<Leave>', self._on_leave)
        
        self.draw()
    
    def draw(self):
        self.delete('all')
        color = self.hover_color if self.is_hovered else self.bg_color
        
        # Rounded rectangle
        self.create_rectangle(0, 0, self.winfo_reqwidth() or 200, 45,
                            fill=color, outline='', tags='bg')
        
        # Text
        self.create_text(self.winfo_reqwidth()//2 or 100, 22,
                        text=self.text, fill='white',
                        font=('Segoe UI', 11, 'bold'), tags='text')
    
    def _on_enter(self, e):
        self.is_hovered = True
        self.draw()
    
    def _on_leave(self, e):
        self.is_hovered = False
        self.draw()


# ------------------ GUI ------------------
class App(TkinterDnD.Tk):
    def __init__(self):
        super().__init__()
        self.title(APP_TITLE)
        self.geometry("1200x750")
        self.minsize(1100, 700)
        self.configure(bg=COLORS['bg_main'])

        self.cfg = load_config()
        self._setup_styles()
        self._build_ui()

    def _setup_styles(self):
        """Modern stil ayarları"""
        style = ttk.Style()
        try:
            style.theme_use('clam')
        except:
            pass

        # Genel
        style.configure("TLabel", background=COLORS['bg_main'], foreground=COLORS['text_primary'], 
                       font=("Segoe UI", 10))
        style.configure("TFrame", background=COLORS['bg_main'])
        style.configure("Card.TFrame", background=COLORS['bg_card'], relief="flat")
        
        # Butonlar
        style.configure("TButton", font=("Segoe UI", 10), padding=(12, 8))
        style.configure("Primary.TButton", font=("Segoe UI", 11, "bold"), 
                       background=COLORS['primary'], foreground="white", padding=(16, 10))
        style.map("Primary.TButton",
                 background=[("active", COLORS['primary_hover'])],
                 foreground=[("disabled", "#ccc")])
        
        # Notebook (Sekmeler)
        style.configure("TNotebook", background=COLORS['bg_main'], borderwidth=0)
        style.configure("TNotebook.Tab", font=("Segoe UI", 10, "bold"), padding=(20, 10))
        style.map("TNotebook.Tab",
                 background=[("selected", COLORS['primary'])],
                 foreground=[("selected", "white"), ("!selected", COLORS['text_secondary'])])
        
        # Entry
        style.configure("TEntry", fieldbackground="white", foreground=COLORS['text_primary'],
                       font=("Segoe UI", 10))
        
        # LabelFrame
        style.configure("TLabelframe", background=COLORS['bg_main'], borderwidth=2, 
                       relief="solid", bordercolor=COLORS['border'])
        style.configure("TLabelframe.Label", background=COLORS['bg_main'], 
                       foreground=COLORS['text_primary'], font=("Segoe UI", 10, "bold"))
        
        # Checkbutton & Radiobutton
        style.configure("TCheckbutton", background=COLORS['bg_main'], 
                       foreground=COLORS['text_primary'], font=("Segoe UI", 10))
        style.configure("TRadiobutton", background=COLORS['bg_main'], 
                       foreground=COLORS['text_primary'], font=("Segoe UI", 10))

    def _build_ui(self):
        # Ana container
        main_container = tk.Frame(self, bg=COLORS['bg_main'])
        main_container.pack(fill="both", expand=True)

        # Üst bar (Header)
        self._build_header(main_container)

        # Notebook (Sekmeler)
        self.notebook = ttk.Notebook(main_container)
        self.notebook.pack(fill="both", expand=True, padx=15, pady=(0, 10))

        # Sekmeler
        self.tab_single = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_single, text="  🔄 Tekli Dönüştürme  ")
        self._build_single_tab()

        self.tab_batch = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_batch, text="  📦 Toplu Dönüştürme  ")
        self._build_batch_tab()

        self.tab_merge = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_merge, text="  🔗 PDF Birleştir  ")
        self._build_merge_tab()

        # Status bar
        self._build_status_bar(main_container)

    def _build_header(self, parent):
        """Modern header"""
        header = tk.Frame(parent, bg=COLORS['primary'], height=100)
        header.pack(fill="x", pady=(0, 15))
        header.pack_propagate(False)

        # Logo ve başlık
        content = tk.Frame(header, bg=COLORS['primary'])
        content.pack(fill="both", expand=True, padx=20, pady=15)

        # Logo
        try:
            base_dir = sys._MEIPASS if getattr(sys, "frozen", False) else os.path.dirname(__file__)
            logo_path = os.path.join(base_dir, "assets", "logo.png")
            if os.path.exists(logo_path):
                img = Image.open(logo_path).resize((120, 50))
                self.logo_img = ImageTk.PhotoImage(img)
                tk.Label(content, image=self.logo_img, bg=COLORS['primary']).pack(side="left", padx=(0, 15))
        except Exception as e:
            print("Logo yüklenemedi:", e)

        # Başlık
        title_frame = tk.Frame(content, bg=COLORS['primary'])
        title_frame.pack(side="left", fill="both", expand=True)
        
        tk.Label(title_frame, text="UDF Toolkit Pro", 
                font=("Segoe UI", 24, "bold"), bg=COLORS['primary'], fg="white").pack(anchor="w")
        tk.Label(title_frame, text="Profesyonel UDF Dönüştürme ve PDF Yönetimi", 
                font=("Segoe UI", 11), bg=COLORS['primary'], fg="#e0e7ff").pack(anchor="w")

        # Template durum
        template_frame = tk.Frame(content, bg=COLORS['primary'])
        template_frame.pack(side="right")
        
        self.lbl_template = tk.Label(template_frame, text="Şablon: Yok", 
                                    font=("Segoe UI", 9), bg=COLORS['primary'], fg="#fca5a5")
        self.lbl_template.pack(pady=(0, 5))
        
        btn_template = tk.Button(template_frame, text="📁 Şablon Seç", 
                                command=self.on_choose_template,
                                bg="white", fg=COLORS['primary'],
                                font=("Segoe UI", 10, "bold"),
                                relief="flat", padx=15, pady=8,
                                cursor="hand2")
        btn_template.pack()
        
        self._refresh_template_label()

    def _build_status_bar(self, parent):
        """Modern status bar"""
        status_frame = tk.Frame(parent, bg=COLORS['text_primary'], height=35)
        status_frame.pack(fill="x", side="bottom")
        status_frame.pack_propagate(False)
        
        self.status = tk.Label(status_frame, text="✨ Hazır", bg=COLORS['text_primary'], 
                              fg="white", anchor="w", padx=15, font=("Segoe UI", 9))
        self.status.pack(side="left", fill="both", expand=True)
        
        # Saat
        self.time_label = tk.Label(status_frame, text="", bg=COLORS['text_primary'], 
                                   fg="#94a3b8", font=("Segoe UI", 9))
        self.time_label.pack(side="right", padx=15)
        self._update_time()

    def _update_time(self):
        """Saati güncelle"""
        current_time = datetime.now().strftime("%H:%M:%S")
        self.time_label.configure(text=current_time)
        self.after(1000, self._update_time)

    def _build_single_tab(self):
        """Tekli dönüştürme sekmesi - Modern tasarım"""
        container = tk.Frame(self.tab_single, bg=COLORS['bg_main'])
        container.pack(fill="both", expand=True, padx=20, pady=20)

        # Başlık
        title = tk.Label(container, text="Tek Dosya Dönüştürme", 
                        font=("Segoe UI", 16, "bold"), 
                        bg=COLORS['bg_main'], fg=COLORS['text_primary'])
        title.pack(anchor="w", pady=(0, 10))
        
        subtitle = tk.Label(container, text="Bir dosyayı sürükle-bırak ile veya butonlarla dönüştürün", 
                           font=("Segoe UI", 10), 
                           bg=COLORS['bg_main'], fg=COLORS['text_secondary'])
        subtitle.pack(anchor="w", pady=(0, 20))

        # Hızlı işlem butonları
        btn_container = tk.Frame(container, bg=COLORS['bg_main'])
        btn_container.pack(fill="x", pady=(0, 20))

        self._create_action_button(btn_container, "📄 DOCX → UDF", 
                                   "Word dosyasını UDF'ye çevir",
                                   self.handle_docx_to_udf, 
                                   COLORS['primary']).pack(side="left", fill="x", expand=True, padx=(0, 10))
        
        self._create_action_button(btn_container, "📑 PDF Oluştur", 
                                   "DOCX veya UDF'den PDF oluştur",
                                   self.handle_to_pdf, 
                                   COLORS['success']).pack(side="left", fill="x", expand=True)

        # Drag & Drop kartları
        drag_container = tk.Frame(container, bg=COLORS['bg_main'])
        drag_container.pack(fill="both", expand=True)

        # Sol kart
        self._build_drag_card(drag_container, 
                             "WORD → UDF", 
                             "📄 Word dosyasını (.docx)\nburaya sürükleyin",
                             "#dbeafe", "#2563eb", 
                             self.on_drop_udf, "udf").pack(side="left", fill="both", expand=True, padx=(0, 10))

        # Sağ kart
        self._build_drag_card(drag_container, 
                             "PDF OLUŞTUR", 
                             "📑 Word (.docx) veya UDF (.udf)\ndosyasını buraya sürükleyin",
                             "#dcfce7", "#10b981", 
                             self.on_drop_pdf, "pdf").pack(side="right", fill="both", expand=True)

        # Log
        log_frame = self._create_card(container, "İşlem Günlüğü")
        log_frame.pack(fill="x", pady=(20, 0))

        self.log_single = scrolledtext.ScrolledText(log_frame, height=6, wrap="word",
                                                    bg=COLORS['bg_main'], fg=COLORS['text_primary'],
                                                    font=("Consolas", 9), relief="flat", borderwidth=0)
        self.log_single.pack(fill="x", padx=10, pady=10)

    def _build_drag_card(self, parent, title, message, bg_color, text_color, drop_handler, card_type):
        """Modern drag & drop kartı"""
        card = tk.Frame(parent, bg=COLORS['bg_card'], relief="solid", bd=2)
        
        # Başlık
        title_label = tk.Label(card, text=title, font=("Segoe UI", 11, "bold"),
                              bg=COLORS['bg_card'], fg=text_color)
        title_label.pack(pady=(15, 5))
        
        # Drag area
        drag_area = tk.Frame(card, bg=bg_color, relief="groove", bd=2, height=200)
        drag_area.pack(fill="both", expand=True, padx=15, pady=(0, 15))
        
        drag_label = tk.Label(drag_area, text=message,
                             font=("Segoe UI", 12), bg=bg_color, fg=text_color,
                             justify="center")
        drag_label.pack(expand=True)
        
        # Drag & Drop
        drag_area.drop_target_register(DND_FILES)
        drag_area.dnd_bind('<<Drop>>', drop_handler)
        
        # Referansları sakla
        if card_type == "udf":
            self.drag_area_udf = drag_area
            self.drag_label_udf = drag_label
        else:
            self.drag_area_pdf = drag_area
            self.drag_label_pdf = drag_label
        
        return card

    def _build_batch_tab(self):
        """Toplu dönüştürme - Ultra modern"""
        container = tk.Frame(self.tab_batch, bg=COLORS['bg_main'])
        container.pack(fill="both", expand=True, padx=20, pady=20)

        # Başlık
        title = tk.Label(container, text="Toplu Dönüştürme", 
                        font=("Segoe UI", 18, "bold"), 
                        bg=COLORS['bg_main'], fg=COLORS['text_primary'])
        title.pack(anchor="w", pady=(0, 5))
        
        subtitle = tk.Label(container, text="Bir klasördeki tüm dosyaları toplu olarak dönüştürün", 
                           font=("Segoe UI", 10), 
                           bg=COLORS['bg_main'], fg=COLORS['text_secondary'])
        subtitle.pack(anchor="w", pady=(0, 20))

        # İşlem seçimi - Kartlar halinde
        operation_card = self._create_card(container, "Dönüştürme İşlemi Seçin")
        operation_card.pack(fill="x", pady=(0, 15))

        op_inner = tk.Frame(operation_card, bg=COLORS['bg_card'])
        op_inner.pack(fill="x", padx=15, pady=15)

        self.batch_operation = tk.StringVar(value="docx-to-udf")
        
        # Grid layout
        operations = [
            ("📄 DOCX → UDF", "docx-to-udf", "Word belgelerini UDF formatına çevir"),
            ("📑 UDF → PDF", "udf-to-pdf", "UDF dosyalarını PDF'ye çevir"),
            ("📝 UDF → DOCX", "udf-to-docx", "UDF dosyalarını Word'e çevir"),
            ("🔥 Hepsini PDF'ye", "all-to-pdf", "Tüm dosyaları (DOCX+UDF+PDF) PDF formatında topla"),
            ("📚 Dönüştür & Birleştir", "convert-and-merge", "Tüm dosyaları PDF'ye çevirip tek dosyada birleştir"),
        ]
        
        for i, (text, value, desc) in enumerate(operations):
            row = i // 2
            col = i % 2
            
            rb_frame = tk.Frame(op_inner, bg=COLORS['bg_card'])
            rb_frame.grid(row=row, column=col, sticky="w", padx=10, pady=5)
            
            ttk.Radiobutton(rb_frame, text=text, 
                           variable=self.batch_operation, value=value,
                           command=self.update_batch_ui).pack(anchor="w")
            tk.Label(rb_frame, text=desc, font=("Segoe UI", 8),
                    bg=COLORS['bg_card'], fg=COLORS['text_secondary']).pack(anchor="w", padx=(25, 0))

        # Klasörler
        folder_card = self._create_card(container, "Klasör ve Dosya Ayarları")
        folder_card.pack(fill="x", pady=(0, 15))

        folder_inner = tk.Frame(folder_card, bg=COLORS['bg_card'])
        folder_inner.pack(fill="x", padx=15, pady=15)

        # Giriş
        self._create_folder_row(folder_inner, "📂 Giriş Klasörü:", self.batch_input_var := tk.StringVar(), 
                               self.select_batch_input).pack(fill="x", pady=(0, 10))

        # Çıkış (normal)
        self.output_dir_row = self._create_folder_row(folder_inner, "📁 Çıkış Klasörü:", 
                                                      self.batch_output_var := tk.StringVar(), 
                                                      self.select_batch_output)

        # Çıkış (merge)
        self.output_pdf_row = tk.Frame(folder_inner, bg=COLORS['bg_card'])
        self._create_folder_row(self.output_pdf_row, "📁 Çıkış Klasörü:", 
                               self.batch_merge_folder_var := tk.StringVar(), 
                               self.select_batch_merge_folder).pack(fill="x", pady=(0, 10))
        
        filename_row = tk.Frame(self.output_pdf_row, bg=COLORS['bg_card'])
        filename_row.pack(fill="x")
        tk.Label(filename_row, text="📄 Dosya Adı:", width=15, anchor="w",
                bg=COLORS['bg_card'], fg=COLORS['text_primary'], font=("Segoe UI", 10)).pack(side="left")
        self.batch_merge_filename_var = tk.StringVar(value="birlestirilmis")
        entry = ttk.Entry(filename_row, textvariable=self.batch_merge_filename_var, font=("Segoe UI", 10))
        entry.pack(side="left", fill="x", expand=True, padx=(0, 5))
        tk.Label(filename_row, text=".pdf", font=("Segoe UI", 10, "bold"),
                bg=COLORS['bg_card'], fg=COLORS['text_secondary']).pack(side="left")

        # Seçenekler
        options_card = self._create_card(container, "Seçenekler")
        options_card.pack(fill="x", pady=(0, 15))

        options_inner = tk.Frame(options_card, bg=COLORS['bg_card'])
        options_inner.pack(fill="x", padx=15, pady=15)

        self.batch_recursive = tk.BooleanVar(value=False)
        ttk.Checkbutton(options_inner, text="🔄 Alt klasörleri de tara (recursive)", 
                       variable=self.batch_recursive).pack(anchor="w")

        # Başlat butonu
        start_btn = tk.Button(container, text="🚀 Toplu Dönüştürmeyi Başlat", 
                             command=self.start_batch_conversion,
                             bg=COLORS['success'], fg="white",
                             font=("Segoe UI", 13, "bold"),
                             relief="flat", padx=30, pady=15,
                             cursor="hand2")
        start_btn.pack(pady=(0, 15))

        # İlerleme
        progress_card = self._create_card(container, "İlerleme ve Durum")
        progress_card.pack(fill="both", expand=True)

        progress_inner = tk.Frame(progress_card, bg=COLORS['bg_card'])
        progress_inner.pack(fill="both", expand=True, padx=15, pady=15)

        self.batch_progress_label = tk.Label(progress_inner, text="Bekliyor...",
                                            bg=COLORS['bg_card'], fg=COLORS['text_secondary'],
                                            font=("Segoe UI", 10))
        self.batch_progress_label.pack(anchor="w", pady=(0, 8))

        self.batch_progress_bar = ttk.Progressbar(progress_inner, mode='determinate', length=400)
        self.batch_progress_bar.pack(fill="x", pady=(0, 15))

        self.log_batch = scrolledtext.ScrolledText(progress_inner, height=12, wrap="word",
                                                   bg="#1e293b", fg="#e2e8f0",
                                                   font=("Consolas", 9), insertbackground="white")
        self.log_batch.pack(fill="both", expand=True)
        
        self.update_batch_ui()

    def _build_merge_tab(self):
        """PDF birleştirme - Modern tasarım"""
        container = tk.Frame(self.tab_merge, bg=COLORS['bg_main'])
        container.pack(fill="both", expand=True, padx=20, pady=20)

        # Başlık
        title = tk.Label(container, text="PDF Birleştirme", 
                        font=("Segoe UI", 18, "bold"), 
                        bg=COLORS['bg_main'], fg=COLORS['text_primary'])
        title.pack(anchor="w", pady=(0, 5))
        
        subtitle = tk.Label(container, text="Birden fazla PDF dosyasını tek bir dosyada birleştirin", 
                           font=("Segoe UI", 10), 
                           bg=COLORS['bg_main'], fg=COLORS['text_secondary'])
        subtitle.pack(anchor="w", pady=(0, 20))

        # Mod seçimi
        mode_card = self._create_card(container, "Birleştirme Modu")
        mode_card.pack(fill="x", pady=(0, 15))

        mode_inner = tk.Frame(mode_card, bg=COLORS['bg_card'])
        mode_inner.pack(fill="x", padx=15, pady=15)

        self.merge_mode = tk.StringVar(value="files")
        ttk.Radiobutton(mode_inner, text="📑 Dosya Listesi (Manuel seçim)", 
                       variable=self.merge_mode, value="files",
                       command=self.update_merge_ui).pack(anchor="w", pady=5)
        ttk.Radiobutton(mode_inner, text="📁 Klasör (Otomatik - tüm PDF'ler)", 
                       variable=self.merge_mode, value="folder",
                       command=self.update_merge_ui).pack(anchor="w")

        # Dosya listesi
        self.merge_files_frame = self._create_card(container, "PDF Dosyaları")
        
        list_inner = tk.Frame(self.merge_files_frame, bg=COLORS['bg_card'])
        list_inner.pack(fill="both", expand=True, padx=15, pady=15)

        btn_row = tk.Frame(list_inner, bg=COLORS['bg_card'])
        btn_row.pack(fill="x", pady=(0, 10))
        
        btns = [
            ("➕ Ekle", self.add_pdf_files),
            ("❌ Kaldır", self.remove_pdf_file),
            ("🔼 Yukarı", self.move_pdf_up),
            ("🔽 Aşağı", self.move_pdf_down),
            ("🗑️ Temizle", self.clear_pdf_list),
        ]
        
        for text, cmd in btns:
            tk.Button(btn_row, text=text, command=cmd,
                     bg=COLORS['bg_main'], fg=COLORS['text_primary'],
                     font=("Segoe UI", 9), relief="flat", padx=10, pady=5,
                     cursor="hand2").pack(side="left", padx=(0, 5))

        list_frame = tk.Frame(list_inner, bg=COLORS['bg_card'])
        list_frame.pack(fill="both", expand=True)
        
        scrollbar = ttk.Scrollbar(list_frame)
        scrollbar.pack(side="right", fill="y")
        
        self.pdf_listbox = tk.Listbox(list_frame, yscrollcommand=scrollbar.set, 
                                     font=("Segoe UI", 9), bg="white",
                                     selectbackground=COLORS['primary'])
        self.pdf_listbox.pack(side="left", fill="both", expand=True)
        scrollbar.config(command=self.pdf_listbox.yview)

        # Klasör modu
        self.merge_folder_frame = self._create_card(container, "Klasör Seçimi")
        
        folder_inner = tk.Frame(self.merge_folder_frame, bg=COLORS['bg_card'])
        folder_inner.pack(fill="x", padx=15, pady=15)

        self._create_folder_row(folder_inner, "📁 Klasör:", self.merge_folder_var := tk.StringVar(), 
                               self.select_merge_folder).pack(fill="x", pady=(0, 10))

        self.merge_recursive_var = tk.BooleanVar(value=False)
        ttk.Checkbutton(folder_inner, text="🔄 Alt klasörleri de dahil et", 
                       variable=self.merge_recursive_var).pack(anchor="w")

        # Seçenekler
        options_card = self._create_card(container, "Birleştirme Seçenekleri")
        options_card.pack(fill="x", pady=(0, 15))

        options_inner = tk.Frame(options_card, bg=COLORS['bg_card'])
        options_inner.pack(fill="x", padx=15, pady=15)

        self.merge_bookmarks = tk.BooleanVar(value=True)
        ttk.Checkbutton(options_inner, text="🔖 Her dosya için yer imi (bookmark) ekle", 
                       variable=self.merge_bookmarks).pack(anchor="w")

        # Çıkış
        output_card = self._create_card(container, "Çıkış Dosyası")
        output_card.pack(fill="x", pady=(0, 15))

        output_inner = tk.Frame(output_card, bg=COLORS['bg_card'])
        output_inner.pack(fill="x", padx=15, pady=15)

        self._create_folder_row(output_inner, "📄 Çıkış PDF:", self.merge_output_var := tk.StringVar(), 
                               self.select_merge_output).pack(fill="x")

        # Birleştir butonu
        merge_btn = tk.Button(container, text="🔗 PDF'leri Birleştir", 
                             command=self.start_pdf_merge,
                             bg=COLORS['accent'], fg="white",
                             font=("Segoe UI", 13, "bold"),
                             relief="flat", padx=30, pady=15,
                             cursor="hand2")
        merge_btn.pack()
        
        self.update_merge_ui()

    # Yardımcı UI fonksiyonları
    def _create_card(self, parent, title):
        """Modern kart componenti"""
        card = tk.LabelFrame(parent, text=title, bg=COLORS['bg_card'],
                            fg=COLORS['text_primary'], font=("Segoe UI", 11, "bold"),
                            relief="solid", bd=1, borderwidth=2)
        return card

    def _create_action_button(self, parent, title, subtitle, command, color):
        """Modern action buton"""
        btn_frame = tk.Frame(parent, bg=color, cursor="hand2")
        btn_frame.bind('<Button-1>', lambda e: command())
        
        tk.Label(btn_frame, text=title, font=("Segoe UI", 13, "bold"),
                bg=color, fg="white").pack(pady=(15, 5))
        tk.Label(btn_frame, text=subtitle, font=("Segoe UI", 9),
                bg=color, fg="#e0e7ff").pack(pady=(0, 15))
        
        return btn_frame

    def _create_folder_row(self, parent, label_text, text_var, command):
        """Klasör seçimi satırı"""
        row = tk.Frame(parent, bg=COLORS['bg_card'])
        
        tk.Label(row, text=label_text, width=15, anchor="w",
                bg=COLORS['bg_card'], fg=COLORS['text_primary'], 
                font=("Segoe UI", 10)).pack(side="left")
        
        entry = ttk.Entry(row, textvariable=text_var, font=("Segoe UI", 10))
        entry.pack(side="left", fill="x", expand=True, padx=(0, 10))
        
        btn = tk.Button(row, text="📁 Seç", command=command,
                       bg=COLORS['primary'], fg="white",
                       font=("Segoe UI", 9, "bold"),
                       relief="flat", padx=15, pady=6,
                       cursor="hand2")
        btn.pack(side="left")
        
        return row

    # Helper metodlar
    def _refresh_template_label(self):
        tpl = self.cfg.get("template_path") or ""
        if tpl and os.path.exists(tpl):
            self.lbl_template.configure(text=f"✅ {os.path.basename(tpl)}", fg="#86efac")
        else:
            self.lbl_template.configure(text="Şablon: Yok", fg="#fca5a5")

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

    def _set_status(self, text, icon="✨"):
        self.status.configure(text=f"{icon} {text}")
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

    # Devamı için dosya çok uzun, ikinci kısımda tamamlayacağım
    def update_batch_ui(self):
        """İşleme göre UI güncelle"""
        operation = self.batch_operation.get()
        
        if operation == "convert-and-merge":
            self.output_dir_row.pack_forget()
            self.output_pdf_row.pack(fill="x")
        else:
            self.output_pdf_row.pack_forget()
            self.output_dir_row.pack(fill="x")

    def update_merge_ui(self):
        """Merge moduna göre UI güncelle"""
        mode = self.merge_mode.get()
        if mode == "files":
            self.merge_files_frame.pack(fill="both", expand=True, pady=(0, 15))
            self.merge_folder_frame.pack_forget()
        else:
            self.merge_files_frame.pack_forget()
            self.merge_folder_frame.pack(fill="x", pady=(0, 15))

    def select_batch_input(self):
        folder = filedialog.askdirectory(title="Giriş Klasörü Seç")
        if folder:
            self.batch_input_var.set(folder)
            self.cfg["last_input_dir"] = folder
            save_config(self.cfg)

    def select_batch_output(self):
        folder = filedialog.askdirectory(title="Çıkış Klasörü Seç")
        if folder:
            self.batch_output_var.set(folder)
            self.cfg["last_output_dir"] = folder
            save_config(self.cfg)

    def select_batch_merge_folder(self):
        folder = filedialog.askdirectory(title="Birleştirilmiş PDF İçin Çıkış Klasörü")
        if folder:
            self.batch_merge_folder_var.set(folder)

    # Tekli dönüştürme fonksiyonları
    def on_drop_udf(self, event):
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
        self.drag_label_udf.configure(text=f"⏳ {os.path.basename(file_path)}\n\nİşleniyor...")
        self.update()
        self.convert_dropped_file_to_udf(file_path)
    
    def on_drop_pdf(self, event):
        files = self.tk.splitlist(event.data)
        if not files:
            return
        file_path = files[0]
        ext = file_path.lower()
        if not (ext.endswith('.docx') or ext.endswith('.udf')):
            messagebox.showerror("Hatalı Dosya", "Lütfen .docx veya .udf dosyasını sürükleyin.")
            return
        if not os.path.exists(file_path):
            messagebox.showerror("Dosya Bulunamadı", f"Dosya bulunamadı: {file_path}")
            return
        self.drag_label_pdf.configure(text=f"⏳ {os.path.basename(file_path)}\n\nİşleniyor...")
        self.update()
        self.convert_dropped_file_to_pdf(file_path)

    @run_in_thread
    def convert_dropped_file_to_udf(self, docx_path):
        try:
            tpl = self.cfg.get("template_path") or ""
            if not tpl or not os.path.exists(tpl):
                self.drag_label_udf.configure(text="❌ Şablon seçilmemiş!")
                messagebox.showerror("Şablon Yok", "Lütfen önce şablon seçin.")
                return

            try:
                tpl_xml_path = ensure_template_xml_path(tpl, self.cfg)
            except Exception as e:
                self.drag_label_udf.configure(text="❌ Şablon hatası!")
                messagebox.showerror("Şablon Hatası", str(e))
                return

            base, _ = os.path.splitext(docx_path)
            udf_out = base + ".udf"

            self._set_status("DOCX → UDF dönüştürülüyor...", "⏳")
            docx_to_udf_main(docx_path, udf_out, template_xml_path=tpl_xml_path)

            self._set_status("Tamamlandı", "✅")
            self.drag_label_udf.configure(text=f"✅ {os.path.basename(udf_out)}\n\nBaşarıyla oluşturuldu!")
            messagebox.showinfo("Başarılı", f"UDF oluşturuldu:\n{udf_out}")
            
        except Exception as e:
            self._set_status("Hata", "❌")
            self.drag_label_udf.configure(text=f"❌ Hata!")
            messagebox.showerror("Hata", str(e))
        finally:
            self.after(3000, self.reset_drag_area_udf)

    @run_in_thread
    def convert_dropped_file_to_pdf(self, input_path):
        try:
            ext = os.path.splitext(input_path)[1].lower()
            tpl_xml_path = None
            
            if ext == '.docx':
                tpl = self.cfg.get("template_path") or ""
                if not tpl or not os.path.exists(tpl):
                    self.drag_label_pdf.configure(text="❌ Şablon seçilmemiş!")
                    messagebox.showerror("Şablon Yok", "Word dosyaları için şablon gerekli.")
                    return
                try:
                    tpl_xml_path = ensure_template_xml_path(tpl, self.cfg)
                except Exception as e:
                    self.drag_label_pdf.configure(text="❌ Şablon hatası!")
                    messagebox.showerror("Şablon Hatası", str(e))
                    return

            base, _ = os.path.splitext(input_path)
            pdf_out = base + ".pdf"

            self._set_status("PDF oluşturuluyor...", "⏳")
            docx_or_udf_to_pdf(input_path, pdf_out, template_xml_path=tpl_xml_path)

            self._set_status("Tamamlandı", "✅")
            self.drag_label_pdf.configure(text=f"✅ {os.path.basename(pdf_out)}\n\nBaşarıyla oluşturuldu!")
            messagebox.showinfo("Başarılı", f"PDF oluşturuldu:\n{pdf_out}")
            
        except Exception as e:
            self._set_status("Hata", "❌")
            self.drag_label_pdf.configure(text=f"❌ Hata!")
            messagebox.showerror("Hata", str(e))
        finally:
            self.after(3000, self.reset_drag_area_pdf)

    def reset_drag_area_udf(self):
        self.drag_label_udf.configure(text="📄 Word dosyasını (.docx)\nburaya sürükleyin")
    
    def reset_drag_area_pdf(self):
        self.drag_label_pdf.configure(text="📑 Word (.docx) veya UDF (.udf)\ndosyasını buraya sürükleyin")

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

            self._set_status("DOCX → UDF dönüştürülüyor...", "⏳")
            docx_to_udf_main(docx_path, udf_out, template_xml_path=tpl_xml_path)
            self._set_status("Tamamlandı", "✅")
            messagebox.showinfo("Başarılı", f"UDF oluşturuldu:\n{udf_out}")
            
        except Exception as e:
            self._set_status("Hata", "❌")
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

            self._set_status("PDF oluşturuluyor...", "⏳")
            docx_or_udf_to_pdf(input_path, pdf_out, template_xml_path=tpl_xml_path)
            self._set_status("Tamamlandı", "✅")
            messagebox.showinfo("Başarılı", f"PDF oluşturuldu:\n{pdf_out}")
            
        except Exception as e:
            self._set_status("Hata", "❌")
            messagebox.showerror("Hata", str(e))

    # Toplu dönüştürme
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
                merge_folder = self.batch_merge_folder_var.get() or input_dir
                merge_filename = self.batch_merge_filename_var.get()
                
                if not merge_filename:
                    messagebox.showerror("Hata", "Dosya adı girin.")
                    return
                
                if not merge_filename.lower().endswith('.pdf'):
                    merge_filename += '.pdf'
                
                output_pdf = os.path.join(merge_folder, merge_filename)
                output_dir = None
            else:
                output_dir = self.batch_output_var.get() or None
                output_pdf = None

            # Şablon kontrolü
            tpl_xml_path = "calisanudfcontent.xml"
            needs_template = operation in ["docx-to-udf", "all-to-pdf", "convert-and-merge"]
            
            if needs_template:
                tpl = self.cfg.get("template_path") or ""
                if not tpl or not os.path.exists(tpl):
                    messagebox.showerror("Şablon Yok", "Bu işlem için şablon gerekli.")
                    return
                try:
                    tpl_xml_path = ensure_template_xml_path(tpl, self.cfg)
                except Exception as e:
                    messagebox.showerror("Şablon Hatası", str(e))
                    return

            # Log ekranını hazırla
            self.log_batch.delete("1.0", "end")
            self._log_batch(f"{'='*70}\n", "header")
            self._log_batch(f"İŞLEM: {operation}\n", "header")
            self._log_batch(f"{'='*70}\n", "header")
            self._log_batch(f"📂 Giriş: {input_dir}\n\n", "info")
            
            if operation == "convert-and-merge":
                self._log_batch(f"📁 Çıkış Klasörü: {os.path.dirname(output_pdf)}\n", "info")
                self._log_batch(f"📄 Dosya Adı: {os.path.basename(output_pdf)}\n\n", "info")
            else:
                self._log_batch(f"📁 Çıkış: {output_dir or '(giriş ile aynı)'}\n\n", "info")
            
            self._log_batch(f"{'-'*70}\n\n", "info")

            # Progress callback
            def progress_callback(current, total, filename, status):
                percent = int((current / total) * 100)
                self.batch_progress_bar['value'] = percent
                self.batch_progress_label.configure(text=f"[{current}/{total}] {status}")
                self._log_batch(f"[{current}/{total}] {status}: {filename}\n", "progress")

            converter = BatchConverter(progress_callback=progress_callback)

            self._set_status("Toplu dönüştürme başlıyor...", "⏳")

            # İşlemi çalıştır
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

            # Sonuçları göster
            self._log_batch(f"\n{'='*70}\n", "header")
            self._log_batch(f"ÖZET\n", "header")
            self._log_batch(f"{'='*70}\n", "header")
            self._log_batch(f"✅ Başarılı: {len(results.get('success', []))}\n", "success")
            self._log_batch(f"❌ Başarısız: {len(results.get('failed', []))}\n", "error")
            
            if operation == "convert-and-merge" and output_pdf and os.path.exists(output_pdf):
                file_size = os.path.getsize(output_pdf)
                self._log_batch(f"\n📄 Birleştirilmiş PDF: {output_pdf}\n", "success")
                self._log_batch(f"📊 Boyut: {file_size/(1024*1024):.2f} MB\n", "info")
                
                # Klasörü aç
                open_folder = messagebox.askyesno("Başarılı!", 
                    f"✅ Birleştirilmiş PDF oluşturuldu!\n\n{os.path.basename(output_pdf)}\n\nKlasörü açmak ister misiniz?")
                if open_folder:
                    import subprocess
                    subprocess.Popen(f'explorer /select,"{output_pdf}"')
            else:
                messagebox.showinfo("Tamamlandı", 
                    f"✅ Başarılı: {len(results.get('success', []))}\n❌ Başarısız: {len(results.get('failed', []))}")

            self._set_status("Tamamlandı", "✅")

        except Exception as e:
            self._log_batch(f"\n❌ HATA: {e}\n", "error")
            self._set_status("Hata", "❌")
            messagebox.showerror("Hata", str(e))

    def _log_batch(self, msg, tag=None):
        """Batch log ekranına yaz"""
        self.log_batch.insert("end", msg)
        if tag:
            # Tag renklendirme
            start_idx = self.log_batch.index("end-1c linestart")
            end_idx = self.log_batch.index("end-1c")
            
            if tag == "header":
                self.log_batch.tag_add("header", start_idx, end_idx)
                self.log_batch.tag_config("header", foreground="#60a5fa", font=("Consolas", 9, "bold"))
            elif tag == "success":
                self.log_batch.tag_add("success", start_idx, end_idx)
                self.log_batch.tag_config("success", foreground="#34d399")
            elif tag == "error":
                self.log_batch.tag_add("error", start_idx, end_idx)
                self.log_batch.tag_config("error", foreground="#f87171")
            elif tag == "info":
                self.log_batch.tag_add("info", start_idx, end_idx)
                self.log_batch.tag_config("info", foreground="#a78bfa")
            elif tag == "progress":
                self.log_batch.tag_add("progress", start_idx, end_idx)
                self.log_batch.tag_config("progress", foreground="#cbd5e1")
        
        self.log_batch.see("end")
        self.update_idletasks()

    # PDF Birleştirme
    def add_pdf_files(self):
        files = filedialog.askopenfilenames(title="PDF Dosyaları Seç", filetypes=[("PDF", "*.pdf")])
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
            self._set_status("PDF'ler birleştiriliyor...", "⏳")

            if mode == "files":
                pdf_files = list(self.pdf_listbox.get(0, "end"))
                if not pdf_files:
                    messagebox.showerror("Hata", "En az bir PDF dosyası ekleyin.")
                    return
                merger.merge_pdfs(pdf_files, output_path, add_bookmarks)
            else:
                folder = self.merge_folder_var.get()
                if not folder or not os.path.exists(folder):
                    messagebox.showerror("Hata", "Geçerli bir klasör seçin.")
                    return
                recursive = self.merge_recursive_var.get()
                merger.merge_pdfs_from_directory(folder, output_path, recursive, add_bookmarks)

            self._set_status("Tamamlandı", "✅")
            
            if os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                open_folder = messagebox.askyesno("Başarılı!", 
                    f"✅ PDF'ler birleştirildi!\n\n📄 {os.path.basename(output_path)}\n📊 {file_size/(1024*1024):.2f} MB\n\nKlasörü açmak ister misiniz?")
                if open_folder:
                    import subprocess
                    subprocess.Popen(f'explorer /select,"{output_path}"')

        except Exception as e:
            self._set_status("Hata", "❌")
            messagebox.showerror("Hata", str(e))


if __name__ == "__main__":
    app = App()
    app.mainloop()

