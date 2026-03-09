"""
UDF Toolkit Pro - Ultra Modern Professional GUI
Sabit boyut, mükemmel scroll, profesyonel tasarım
"""

import os, sys, json, tempfile, threading, zipfile, traceback, tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
from tkinterdnd2 import DND_FILES, TkinterDnD
from PIL import Image, ImageTk
from datetime import datetime

try:
    from main import convert_docx_to_udf as docx_to_udf_main
    from udf_to_pdf import udf_to_pdf
    from batch_converter import BatchConverter
    from pdf_merger import PDFMerger
except Exception as e:
    raise RuntimeError(f"Modül yükleme hatası: {e}")

APPDATA_DIR = os.path.join(os.getenv("APPDATA", os.path.expanduser("~")), "UDF-Toolkit")
os.makedirs(APPDATA_DIR, exist_ok=True)
CONFIG_FILE = os.path.join(APPDATA_DIR, "config.json")

# Premium Colors
C = {
    'primary': '#4f46e5', 'primary_dark': '#4338ca', 'success': '#059669', 'success_light': '#10b981',
    'danger': '#dc2626', 'accent': '#7c3aed', 'warning': '#f59e0b',
    'bg': '#f1f5f9', 'card': '#ffffff', 'terminal': '#0f172a',
    'text': '#0f172a', 'text2': '#475569', 'text3': '#94a3b8',
}

def load_config():
    try:
        with open(CONFIG_FILE, "r") as f:
            return json.load(f)
    except:
        return {"template_path": ""}

def save_config(cfg):
    try:
        with open(CONFIG_FILE, "w") as f:
            json.dump(cfg, f, ensure_ascii=False, indent=2)
    except:
        pass

def ensure_template_xml_path(template_path, cfg):
    if not template_path or not os.path.exists(template_path):
        raise RuntimeError("Şablon bulunamadı")
    ext = os.path.splitext(template_path)[1].lower()
    if ext == ".xml":
        return template_path
    if ext == ".udf":
        with zipfile.ZipFile(template_path, "r") as z:
            data = z.read("content.xml")
        cache = os.path.join(tempfile.gettempdir(), f"udf_tpl_{os.path.basename(template_path)}.xml")
        with open(cache, "wb") as out:
            out.write(data)
        return cache
    raise RuntimeError("Sadece .xml/.udf")

def docx_or_udf_to_pdf(inp, out, template_xml_path=None):
    ext = os.path.splitext(inp)[1].lower()
    if ext == '.udf':
        udf_to_pdf(inp, out)
    elif ext == '.docx':
        temp = os.path.splitext(inp)[0] + "_temp.udf"
        try:
            docx_to_udf_main(inp, temp, template_xml_path=template_xml_path)
            udf_to_pdf(temp, out)
            if os.path.exists(temp):
                os.remove(temp)
        except Exception as e:
            if os.path.exists(temp):
                os.remove(temp)
            raise e

def run_in_thread(fn):
    def wrapper(*args, **kwargs):
        threading.Thread(target=fn, args=args, kwargs=kwargs, daemon=True).start()
    return wrapper


class ScrollFrame(tk.Frame):
    """Scroll çalışan frame"""
    def __init__(self, parent, **kwargs):
        super().__init__(parent, bg=kwargs.get('bg', C['bg']))
        
        canvas = tk.Canvas(self, bg=kwargs.get('bg', C['bg']), highlightthickness=0, bd=0)
        scrollbar = ttk.Scrollbar(self, orient="vertical", command=canvas.yview)
        self.scrollable_frame = tk.Frame(canvas, bg=kwargs.get('bg', C['bg']))
        
        window = canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        
        def configure_scroll(e):
            canvas.configure(scrollregion=canvas.bbox("all"))
        
        def configure_width(e):
            canvas.itemconfig(window, width=e.width - scrollbar.winfo_width() - 5)
        
        self.scrollable_frame.bind("<Configure>", configure_scroll)
        canvas.bind("<Configure>", configure_width)
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Mouse wheel
        def on_wheel(e):
            canvas.yview_scroll(int(-1*(e.delta/120)), "units")
        
        self.bind("<Enter>", lambda e: canvas.bind_all("<MouseWheel>", on_wheel))
        self.bind("<Leave>", lambda e: canvas.unbind_all("<MouseWheel>"))


class App(TkinterDnD.Tk):
    def __init__(self):
        super().__init__()
        self.title("UDF Toolkit Pro")
        self.geometry("1400x850")
        self.resizable(False, False)  # Sabit boyut
        self.configure(bg=C['bg'])
        
        self.cfg = load_config()
        self._setup_styles()
        self._build_ui()

    def _setup_styles(self):
        style = ttk.Style()
        style.theme_use('clam')
        
        style.configure("TFrame", background=C['bg'])
        style.configure("TLabel", background=C['card'], foreground=C['text'], font=("Segoe UI", 10))
        style.configure("Modern.TEntry", fieldbackground="white", padding=12, font=("Segoe UI", 11))
        style.configure("TCheckbutton", background=C['card'], foreground=C['text'], font=("Segoe UI", 10))
        style.configure("TRadiobutton", background=C['card'], foreground=C['text'], font=("Segoe UI", 10))
        
        style.configure("TNotebook", background=C['bg'], borderwidth=0)
        style.configure("TNotebook.Tab", padding=(30, 15), font=("Segoe UI", 12, "bold"))
        style.map("TNotebook.Tab",
                 background=[("selected", C['primary']), ("!selected", "#e2e8f0")],
                 foreground=[("selected", "white"), ("!selected", C['text2'])])

    def _build_ui(self):
        # Header
        header = tk.Frame(self, bg=C['primary'], height=130)
        header.pack(fill="x")
        header.pack_propagate(False)
        
        h_inner = tk.Frame(header, bg=C['primary'])
        h_inner.pack(fill="both", expand=True, padx=40, pady=25)
        
        # Logo
        try:
            base_dir = sys._MEIPASS if getattr(sys, "frozen", False) else os.path.dirname(__file__)
            logo_path = os.path.join(base_dir, "assets", "logo.png")
            if os.path.exists(logo_path):
                img = Image.open(logo_path).resize((140, 58))
                self.logo_img = ImageTk.PhotoImage(img)
                tk.Label(h_inner, image=self.logo_img, bg=C['primary']).pack(side="left", padx=(0, 25))
        except:
            pass
        
        # Title
        t_box = tk.Frame(h_inner, bg=C['primary'])
        t_box.pack(side="left", fill="both", expand=True)
        
        tk.Label(t_box, text="UDF Toolkit Pro", font=("Segoe UI", 28, "bold"),
                bg=C['primary'], fg="white").pack(anchor="w")
        tk.Label(t_box, text="⚡ Profesyonel UDF Dönüştürme · PDF Yönetimi · Toplu İşlemler",
                font=("Segoe UI", 12), bg=C['primary'], fg="#e0e7ff").pack(anchor="w", pady=(5, 0))
        
        # Template
        t_badge = tk.Frame(h_inner, bg=C['primary'])
        t_badge.pack(side="right")
        
        self.template_badge = tk.Frame(t_badge, bg='#1e293b')
        self.template_badge.pack(pady=(0, 10))
        
        self.lbl_template = tk.Label(self.template_badge, text="📋 Şablon: Seçilmedi",
                                    font=("Segoe UI", 10, "bold"), bg='#1e293b', fg='#fca5a5', padx=15, pady=8)
        self.lbl_template.pack()
        
        btn_outer = tk.Frame(t_badge, bg='white', cursor="hand2")
        btn_outer.pack()
        
        def template_click():
            self.on_choose_template()
        
        def template_enter(e):
            btn_outer.configure(bg='#e0e7ff')
            btn_label.configure(bg='#e0e7ff')
        
        def template_leave(e):
            btn_outer.configure(bg='white')
            btn_label.configure(bg='white')
        
        btn_outer.bind('<Button-1>', lambda e: template_click())
        btn_outer.bind('<Enter>', template_enter)
        btn_outer.bind('<Leave>', template_leave)
        
        btn_label = tk.Label(btn_outer, text="📁 Şablon Seç", bg='white', fg=C['primary'],
                            font=("Segoe UI", 11, "bold"), cursor="hand2", padx=25, pady=12)
        btn_label.pack()
        btn_label.bind('<Button-1>', lambda e: template_click())
        
        self._refresh_template_label()
        
        # Main
        main = tk.Frame(self, bg=C['bg'])
        main.pack(fill="both", expand=True, padx=25, pady=(20, 10))
        
        # Notebook
        self.notebook = ttk.Notebook(main)
        self.notebook.pack(fill="both", expand=True)
        
        self._build_single_tab()
        self._build_batch_tab()
        self._build_merge_tab()
        
        # Status
        status = tk.Frame(self, bg=C['terminal'], height=45)
        status.pack(fill="x")
        status.pack_propagate(False)
        
        s_inner = tk.Frame(status, bg=C['terminal'])
        s_inner.pack(fill="both", expand=True, padx=25, pady=10)
        
        self.status = tk.Label(s_inner, text="✨ Hazır - Dönüştürme işlemine başlayabilirsiniz",
                              bg=C['terminal'], fg="white", anchor="w", font=("Segoe UI", 11))
        self.status.pack(side="left", fill="both", expand=True)
        
        self.time_label = tk.Label(s_inner, text="", bg=C['terminal'], fg=C['text3'], font=("Consolas", 10))
        self.time_label.pack(side="right")
        self._update_time()

    def _update_time(self):
        self.time_label.configure(text=datetime.now().strftime("%H:%M:%S"))
        self.after(1000, self._update_time)

    def _build_single_tab(self):
        tab_frame = ScrollFrame(self.notebook, bg=C['bg'])
        self.notebook.add(tab_frame, text="Tekli Dönüştürme  ")
        
        content = tab_frame.scrollable_frame
        container = tk.Frame(content, bg=C['bg'])
        container.pack(fill="both", padx=40, pady=35)
        
        # Title
        tk.Label(container, text="Hızlı Tek Dosya Dönüştürme", font=("Segoe UI", 24, "bold"),
                bg=C['bg'], fg=C['text']).pack(anchor="w")
        tk.Label(container, text="Sürükle-bırak ile saniyeler içinde dönüştürün",
                font=("Segoe UI", 12), bg=C['bg'], fg=C['text2']).pack(anchor="w", pady=(8, 30))
        
        # Buttons
        btn_row = tk.Frame(container, bg=C['bg'])
        btn_row.pack(fill="x", pady=(0, 30))
        
        self._btn(btn_row, "DOCX → UDF", "Word → UDF", self.handle_docx_to_udf, C['primary']).pack(side="left", fill="both", expand=True, padx=(0, 20))
        self._btn(btn_row, "PDF Oluştur", "DOCX/UDF → PDF", self.handle_to_pdf, C['success']).pack(side="left", fill="both", expand=True)
        
        # Drop zones
        drop_row = tk.Frame(container, bg=C['bg'])
        drop_row.pack(fill="both", expand=True, pady=(0, 30))
        
        self._drop(drop_row, "WORD → UDF", ".docx sürükleyin", "#ede9fe", C['accent'], self.on_drop_udf, "udf").pack(side="left", fill="both", expand=True, padx=(0, 20))
        self._drop(drop_row, "DOSYA → PDF", ".docx/.udf sürükleyin", "#d1fae5", C['success'], self.on_drop_pdf, "pdf").pack(side="left", fill="both", expand=True)
        
        # Log
        log_card = self._card(container, "İşlem Günlüğü")
        log_card.pack(fill="x")
        
        self.log_single = scrolledtext.ScrolledText(log_card, height=7, wrap="word",
                                                    bg=C['terminal'], fg="#e2e8f0",
                                                    font=("Consolas", 10), insertbackground="white",
                                                    relief="flat", bd=0)
        self.log_single.pack(fill="x", padx=25, pady=(0, 25))

    def _build_batch_tab(self):
        tab_frame = ScrollFrame(self.notebook, bg=C['bg'])
        self.notebook.add(tab_frame, text="Toplu Dönüştürme  ")
        
        content = tab_frame.scrollable_frame
        container = tk.Frame(content, bg=C['bg'])
        container.pack(fill="both", padx=40, pady=35)
        
        # Title
        tk.Label(container, text="Toplu Dönüştürme", font=("Segoe UI", 24, "bold"),
                bg=C['bg'], fg=C['text']).pack(anchor="w")
        tk.Label(container, text="Bir klasördeki tüm dosyaları otomatik dönüştürün",
                font=("Segoe UI", 12), bg=C['bg'], fg=C['text2']).pack(anchor="w", pady=(8, 30))
        
        # Operations
        op_card = self._card(container, "Dönüştürme İşlemi")
        op_card.pack(fill="x", pady=(0, 25))
        
        op_grid = tk.Frame(op_card, bg=C['card'])
        op_grid.pack(fill="x", padx=25, pady=(0, 25))
        
        self.batch_operation = tk.StringVar(value="docx-to-udf")
        
        ops = [
            ("DOCX → UDF", "docx-to-udf", "Word → UDF"),
            ("UDF → PDF", "udf-to-pdf", "UDF → PDF"),
            ("UDF → DOCX", "udf-to-docx", "UDF → Word"),
            ("Hepsini PDF'ye", "all-to-pdf", "Tümü → PDF"),
            ("Dönüştür & Birleştir", "convert-and-merge", "Tümü → Tek PDF"),
        ]
        
        for i, (txt, val, desc) in enumerate(ops):
            f = tk.Frame(op_grid, bg=C['card'], padx=5, pady=5)
            f.grid(row=i//2, column=i%2, sticky="ew", padx=8, pady=6)
            ttk.Radiobutton(f, text=txt, variable=self.batch_operation, value=val, command=self.update_batch_ui).pack(anchor="w")
            tk.Label(f, text=desc, font=("Segoe UI", 9), bg=C['card'], fg=C['text3']).pack(anchor="w", padx=(25, 0))
        
        op_grid.grid_columnconfigure(0, weight=1)
        op_grid.grid_columnconfigure(1, weight=1)
        
        # Folders
        folder_card = self._card(container, "Klasörler ve Dosya")
        folder_card.pack(fill="x", pady=(0, 25))
        
        f_inner = tk.Frame(folder_card, bg=C['card'])
        f_inner.pack(fill="x", padx=25, pady=(0, 25))
        
        # Input mode selection
        input_mode_frame = tk.Frame(f_inner, bg=C['card'])
        input_mode_frame.pack(fill="x", pady=(0, 15))
        
        tk.Label(input_mode_frame, text="Giriş Tipi", font=("Segoe UI", 11, "bold"),
                bg=C['card'], fg=C['text'], width=13, anchor="w").pack(side="left", padx=(0, 10))
        
        self.batch_input_mode = tk.StringVar(value="folder")
        mode_box = tk.Frame(input_mode_frame, bg=C['card'])
        mode_box.pack(side="left", fill="x", expand=True)
        
        ttk.Radiobutton(mode_box, text="Klasör", variable=self.batch_input_mode, 
                       value="folder", command=self.update_batch_input_mode).pack(side="left", padx=(0, 20))
        ttk.Radiobutton(mode_box, text="Dosyalar", variable=self.batch_input_mode,
                       value="files", command=self.update_batch_input_mode).pack(side="left")
        
        # Input selection frames
        self.batch_input_var = tk.StringVar()
        self.batch_input_files_var = []  # List of selected files
        self.batch_output_var = tk.StringVar()
        self.batch_merge_folder_var = tk.StringVar()
        self.batch_merge_filename_var = tk.StringVar(value="birlestirilmis")
        
        self.batch_input_folder_row = self._folder(f_inner, "Giriş Klasörü", self.batch_input_var, self.select_batch_input)
        self.batch_input_folder_row.pack(fill="x", pady=(0, 15))
        
        self.batch_input_files_row = tk.Frame(f_inner, bg=C['card'])
        files_list_inner = tk.Frame(self.batch_input_files_row, bg=C['card'])
        files_list_inner.pack(fill="x", pady=(0, 10))
        
        tk.Label(files_list_inner, text="Dosyalar", font=("Segoe UI", 11, "bold"),
                bg=C['card'], fg=C['text'], width=13, anchor="w").pack(side="left", padx=(0, 10))
        
        files_btn_frame = tk.Frame(files_list_inner, bg=C['card'])
        files_btn_frame.pack(side="left", fill="x", expand=True)
        
        files_btn = tk.Frame(files_btn_frame, bg=C['primary'], cursor="hand2")
        files_btn.bind('<Button-1>', lambda e: self.select_batch_input_files())
        files_btn.bind('<Enter>', lambda e: files_btn.configure(bg=C['primary_dark']))
        files_btn.bind('<Leave>', lambda e: files_btn.configure(bg=C['primary']))
        files_btn.pack(side="left", padx=(0, 15))
        
        files_btn_label = tk.Label(files_btn, text="📄 Dosya Seç", bg=C['primary'], fg="white",
                font=("Segoe UI", 11, "bold"), cursor="hand2", padx=25, pady=11)
        files_btn_label.pack()
        files_btn_label.bind('<Button-1>', lambda e: self.select_batch_input_files())
        
        # Selected files listbox
        listbox_frame = tk.Frame(files_list_inner, bg='#cbd5e1', bd=2)
        listbox_frame.pack(side="left", fill="both", expand=True)
        
        scroll = ttk.Scrollbar(listbox_frame, orient="vertical")
        scroll.pack(side="right", fill="y")
        
        self.batch_files_listbox = tk.Listbox(listbox_frame, yscrollcommand=scroll.set, height=4,
                                             font=("Segoe UI", 10), bg="white", fg=C['text'],
                                             selectbackground=C['primary'], selectforeground="white",
                                             relief="flat", bd=0)
        self.batch_files_listbox.pack(side="left", fill="both", expand=True, padx=2, pady=2)
        scroll.config(command=self.batch_files_listbox.yview)
        
        self.update_batch_input_mode()
        
        self.output_dir_row = self._folder(f_inner, "📁 Çıkış", self.batch_output_var, self.select_batch_output)
        
        self.output_pdf_row = tk.Frame(f_inner, bg=C['card'])
        self._folder(self.output_pdf_row, "📁 Klasör", self.batch_merge_folder_var, self.select_batch_merge_folder).pack(fill="x", pady=(0, 15))
        
        name_row = tk.Frame(self.output_pdf_row, bg=C['card'])
        name_row.pack(fill="x")
        
        tk.Label(name_row, text="📄 Dosya Adı", font=("Segoe UI", 11, "bold"),
                bg=C['card'], fg=C['text'], width=13, anchor="w").pack(side="left")
        
        entry_box = tk.Frame(name_row, bg='#cbd5e1', bd=2)
        entry_box.pack(side="left", fill="x", expand=True)
        
        tk.Entry(entry_box, textvariable=self.batch_merge_filename_var, font=("Segoe UI", 12),
                bg="white", fg=C['text'], relief="flat", bd=0).pack(side="left", fill="x", expand=True, padx=15, pady=10)
        tk.Label(entry_box, text=".pdf", font=("Segoe UI", 12, "bold"),
                bg="white", fg=C['text3'], padx=15).pack(side="left")
        
        # Options
        opt_card = self._card(container, "⚙️ Seçenekler")
        opt_card.pack(fill="x", pady=(0, 25))
        
        opt_inner = tk.Frame(opt_card, bg=C['card'])
        opt_inner.pack(fill="x", padx=25, pady=(0, 25))
        
        self.batch_recursive = tk.BooleanVar(value=False)
        ttk.Checkbutton(opt_inner, text="🔄 Alt klasörleri de tara", variable=self.batch_recursive).pack(anchor="w")
        
        # Start button
        start_box = tk.Frame(container, bg=C['bg'])
        start_box.pack(fill="x", pady=(0, 30))
        
        start = tk.Frame(start_box, bg=C['success'], cursor="hand2")
        
        def start_click(e):
            self.start_batch_conversion()
        
        def start_enter(e):
            start.configure(bg=C['success_light'])
            start_label.configure(bg=C['success_light'])
        
        def start_leave(e):
            start.configure(bg=C['success'])
            start_label.configure(bg=C['success'])
        
        start.bind('<Button-1>', start_click)
        start.bind('<Enter>', start_enter)
        start.bind('<Leave>', start_leave)
        start.pack(expand=True)
        
        start_label = tk.Label(start, text="🚀 Toplu Dönüştürmeyi Başlat", bg=C['success'], fg="white",
                font=("Segoe UI", 16, "bold"), cursor="hand2", padx=50, pady=20)
        start_label.pack()
        start_label.bind('<Button-1>', start_click)
        
        # Progress
        prog_card = self._card(container, "📊 İlerleme")
        prog_card.pack(fill="both", expand=True)
        
        p_inner = tk.Frame(prog_card, bg=C['card'])
        p_inner.pack(fill="both", expand=True, padx=25, pady=(0, 25))
        
        self.batch_progress_label = tk.Label(p_inner, text="⏳ Bekliyor...",
                                            font=("Segoe UI", 11, "bold"), bg=C['card'], fg=C['text2'], anchor="w")
        self.batch_progress_label.pack(fill="x", pady=(0, 12))
        
        self.batch_progress_bar = ttk.Progressbar(p_inner, mode='determinate')
        self.batch_progress_bar.pack(fill="x", pady=(0, 20))
        
        # Terminal
        term_box = tk.Frame(p_inner, bg=C['terminal'])
        term_box.pack(fill="both", expand=True)
        
        term_head = tk.Frame(term_box, bg='#1e40af', height=35)
        term_head.pack(fill="x")
        term_head.pack_propagate(False)
        
        tk.Label(term_head, text="💻 Terminal Log", font=("Segoe UI", 10, "bold"),
                bg='#1e40af', fg="white", anchor="w", padx=15).pack(side="left", fill="both", expand=True)
        
        self.log_batch = scrolledtext.ScrolledText(term_box, height=18, wrap="word",
                                                   bg=C['terminal'], fg="#e2e8f0",
                                                   font=("Consolas", 10), insertbackground="white",
                                                   relief="flat", bd=0, padx=15, pady=15)
        self.log_batch.pack(fill="both", expand=True)
        
        self.update_batch_ui()

    def _build_merge_tab(self):
        tab_frame = ScrollFrame(self.notebook, bg=C['bg'])
        self.notebook.add(tab_frame, text="  🔗 PDF Birleştir  ")
        
        content = tab_frame.scrollable_frame
        container = tk.Frame(content, bg=C['bg'])
        container.pack(fill="both", padx=40, pady=35)
        
        # Title
        tk.Label(container, text="PDF Birleştirme", font=("Segoe UI", 24, "bold"),
                bg=C['bg'], fg=C['text']).pack(anchor="w")
        tk.Label(container, text="Birden fazla PDF'i tek dosyada birleştirin",
                font=("Segoe UI", 12), bg=C['bg'], fg=C['text2']).pack(anchor="w", pady=(8, 30))
        
        # Mode
        mode_card = self._card(container, "🎯 Mod")
        mode_card.pack(fill="x", pady=(0, 25))
        
        m_inner = tk.Frame(mode_card, bg=C['card'])
        m_inner.pack(fill="x", padx=25, pady=(0, 25))
        
        self.merge_mode = tk.StringVar(value="files")
        ttk.Radiobutton(m_inner, text="📑 Dosya Listesi", variable=self.merge_mode, value="files", command=self.update_merge_ui).pack(anchor="w", pady=8)
        ttk.Radiobutton(m_inner, text="📁 Klasör", variable=self.merge_mode, value="folder", command=self.update_merge_ui).pack(anchor="w")
        
        # File list
        self.merge_files_frame = self._card(container, "📑 PDF Dosyaları")
        
        list_inner = tk.Frame(self.merge_files_frame, bg=C['card'])
        list_inner.pack(fill="both", expand=True, padx=25, pady=(0, 25))
        
        # Toolbar
        toolbar = tk.Frame(list_inner, bg=C['card'])
        toolbar.pack(fill="x", pady=(0, 15))
        
        for txt, cmd, col in [
            ("➕ Ekle", self.add_pdf_files, C['primary']),
            ("❌ Kaldır", self.remove_pdf_file, C['danger']),
            ("🔼 Yukarı", self.move_pdf_up, C['text3']),
            ("🔽 Aşağı", self.move_pdf_down, C['text3']),
            ("🗑️ Temizle", self.clear_pdf_list, C['warning'])
        ]:
            b = tk.Frame(toolbar, bg=col, cursor="hand2")
            
            def make_handler(command, button, label_widget, original_color):
                def btn_click(e):
                    command()
                
                def btn_enter(e):
                    if original_color == C['primary']:
                        hover_col = C['primary_dark']
                    elif original_color == C['danger']:
                        hover_col = '#b91c1c'
                    elif original_color == C['warning']:
                        hover_col = '#d97706'
                    else:
                        hover_col = '#475569'  # text3 darker
                    button.configure(bg=hover_col)
                    label_widget.configure(bg=hover_col)
                
                def btn_leave(e):
                    button.configure(bg=original_color)
                    label_widget.configure(bg=original_color)
                
                return btn_click, btn_enter, btn_leave
            
            lbl = tk.Label(b, text=txt, bg=col, fg="white", font=("Segoe UI", 9, "bold"),
                    cursor="hand2", padx=15, pady=8)
            
            btn_click, btn_enter, btn_leave = make_handler(cmd, b, lbl, col)
            
            b.bind('<Button-1>', btn_click)
            b.bind('<Enter>', btn_enter)
            b.bind('<Leave>', btn_leave)
            b.pack(side="left", padx=(0, 10))
            
            lbl.pack()
            lbl.bind('<Button-1>', btn_click)
        
        # Listbox
        list_box = tk.Frame(list_inner, bg='#cbd5e1', bd=2)
        list_box.pack(fill="both", expand=True)
        
        scroll = ttk.Scrollbar(list_box)
        scroll.pack(side="right", fill="y")
        
        self.pdf_listbox = tk.Listbox(list_box, yscrollcommand=scroll.set, height=10,
                                     font=("Segoe UI", 10), bg="white", fg=C['text'],
                                     selectbackground=C['primary'], selectforeground="white",
                                     relief="flat", bd=0)
        self.pdf_listbox.pack(side="left", fill="both", expand=True, padx=2, pady=2)
        scroll.config(command=self.pdf_listbox.yview)
        
        # Folder
        self.merge_folder_frame = self._card(container, "📁 Klasör")
        
        f_inner = tk.Frame(self.merge_folder_frame, bg=C['card'])
        f_inner.pack(fill="x", padx=25, pady=(0, 25))
        
        self.merge_folder_var = tk.StringVar()
        self._folder(f_inner, "📁 Klasör", self.merge_folder_var, self.select_merge_folder).pack(fill="x", pady=(0, 15))
        
        self.merge_recursive_var = tk.BooleanVar(value=False)
        ttk.Checkbutton(f_inner, text="🔄 Alt klasörler", variable=self.merge_recursive_var).pack(anchor="w")
        
        # Options
        opt_card = self._card(container, "⚙️ Seçenekler")
        opt_card.pack(fill="x", pady=(0, 25))
        
        o_inner = tk.Frame(opt_card, bg=C['card'])
        o_inner.pack(fill="x", padx=25, pady=(0, 25))
        
        self.merge_bookmarks = tk.BooleanVar(value=True)
        ttk.Checkbutton(o_inner, text="🔖 Yer imi ekle", variable=self.merge_bookmarks).pack(anchor="w")
        
        # Output
        out_card = self._card(container, "💾 Çıkış")
        out_card.pack(fill="x", pady=(0, 30))
        
        out_inner = tk.Frame(out_card, bg=C['card'])
        out_inner.pack(fill="x", padx=25, pady=(0, 25))
        
        self.merge_output_var = tk.StringVar()
        self._folder(out_inner, "📄 Çıkış PDF", self.merge_output_var, self.select_merge_output, True).pack(fill="x")
        
        # Button
        merge_box = tk.Frame(container, bg=C['bg'])
        merge_box.pack(fill="x")
        
        merge = tk.Frame(merge_box, bg=C['accent'], cursor="hand2")
        
        def merge_click(e):
            self.start_pdf_merge()
        
        def merge_enter(e):
            merge.configure(bg='#a78bfa')
            merge_label.configure(bg='#a78bfa')
        
        def merge_leave(e):
            merge.configure(bg=C['accent'])
            merge_label.configure(bg=C['accent'])
        
        merge.bind('<Button-1>', merge_click)
        merge.bind('<Enter>', merge_enter)
        merge.bind('<Leave>', merge_leave)
        merge.pack(expand=True)
        
        merge_label = tk.Label(merge, text="🔗 PDF'leri Birleştir", bg=C['accent'], fg="white",
                font=("Segoe UI", 16, "bold"), cursor="hand2", padx=50, pady=20)
        merge_label.pack()
        merge_label.bind('<Button-1>', merge_click)
        
        self.update_merge_ui()

    # UI Components
    def _card(self, parent, title):
        card = tk.Frame(parent, bg=C['card'], relief="solid", bd=1)
        
        header = tk.Frame(card, bg=C['card'], height=50)
        header.pack(fill="x")
        header.pack_propagate(False)
        
        tk.Label(header, text=title, font=("Segoe UI", 13, "bold"),
                bg=C['card'], fg=C['text'], anchor="w").pack(side="left", padx=25, pady=15)
        
        return card

    def _btn(self, parent, title, subtitle, cmd, color):
        btn = tk.Frame(parent, bg=color, cursor="hand2")
        btn.bind('<Button-1>', lambda e: cmd())
        btn.bind('<Enter>', lambda e: btn.configure(bg=self._lighter(color)))
        btn.bind('<Leave>', lambda e: btn.configure(bg=color))
        
        tk.Label(btn, text=title, font=("Segoe UI", 18, "bold"),
                bg=color, fg="white").pack(pady=(20, 5))
        tk.Label(btn, text=subtitle, font=("Segoe UI", 11),
                bg=color, fg="#e0e7ff").pack(pady=(0, 20))
        
        return btn

    def _drop(self, parent, title, msg, bg_light, color, handler, typ):
        card = tk.Frame(parent, bg=C['card'], relief="solid", bd=2)
        
        tk.Label(card, text=title, font=("Segoe UI", 14, "bold"),
                bg=C['card'], fg=color, pady=15).pack()
        
        area = tk.Frame(card, bg=bg_light, relief="solid", bd=3)
        area.pack(fill="both", expand=True, padx=25, pady=(0, 25))
        
        label = tk.Label(area, text=msg, font=("Segoe UI", 14),
                        bg=bg_light, fg=color, justify="center", pady=50)
        label.pack(expand=True)
        
        area.drop_target_register(DND_FILES)
        area.dnd_bind('<<Drop>>', handler)
        
        if typ == "udf":
            self.drag_area_udf = area
            self.drag_label_udf = label
        else:
            self.drag_area_pdf = area
            self.drag_label_pdf = label
        
        return card

    def _folder(self, parent, label, var, cmd, is_file=False):
        row = tk.Frame(parent, bg=C['card'])
        
        tk.Label(row, text=label, font=("Segoe UI", 11, "bold"),
                bg=C['card'], fg=C['text'], width=13, anchor="w").pack(side="left", padx=(0, 10))
        
        box = tk.Frame(row, bg='#cbd5e1', bd=2)
        box.pack(side="left", fill="x", expand=True, padx=(0, 15))
        
        tk.Entry(box, textvariable=var, font=("Segoe UI", 11),
                bg="white", fg=C['text'], relief="flat", bd=0).pack(fill="x", padx=12, pady=10)
        
        btn = tk.Frame(row, bg=C['primary'], cursor="hand2")
        
        def btn_click(e):
            cmd()
        
        def btn_enter(e):
            btn.configure(bg=C['primary_dark'])
            btn_label.configure(bg=C['primary_dark'])
        
        def btn_leave(e):
            btn.configure(bg=C['primary'])
            btn_label.configure(bg=C['primary'])
        
        btn.bind('<Button-1>', btn_click)
        btn.bind('<Enter>', btn_enter)
        btn.bind('<Leave>', btn_leave)
        btn.pack(side="left")
        
        txt = "📄 Seç" if is_file else "📁 Seç"
        btn_label = tk.Label(btn, text=txt, bg=C['primary'], fg="white",
                font=("Segoe UI", 11, "bold"), cursor="hand2", padx=25, pady=11)
        btn_label.pack()
        btn_label.bind('<Button-1>', btn_click)
        
        return row

    def _lighter(self, color):
        if color == C['success']:
            return C['success_light']
        elif color == C['primary']:
            return C['primary_dark']
        return color

    # Methods
    def _refresh_template_label(self):
        tpl = self.cfg.get("template_path") or ""
        if tpl and os.path.exists(tpl):
            self.lbl_template.configure(text=f"✅ Özel: {os.path.basename(tpl)}", fg='#86efac')
            self.template_badge.configure(bg='#14532d')
        else:
            self.lbl_template.configure(text="📋 Varsayılan Şablon", fg='#93c5fd')
            self.template_badge.configure(bg='#1e40af')

    def _set_status(self, text, icon="✨"):
        self.status.configure(text=f"{icon} {text}")
        self.update_idletasks()

    def _log_batch(self, msg, tag=None):
        self.log_batch.insert("end", msg)
        if tag:
            start = self.log_batch.index("end-2c linestart")
            end = self.log_batch.index("end-1c")
            self.log_batch.tag_add(tag, start, end)
            
            colors = {"header": "#60a5fa", "success": "#34d399", "error": "#f87171", "info": "#c084fc", "progress": "#cbd5e1"}
            if tag in colors:
                bold = "bold" if tag in ["header", "success", "error"] else "normal"
                self.log_batch.tag_config(tag, foreground=colors[tag], font=("Consolas", 10, bold))
        
        self.log_batch.see("end")
        self.update_idletasks()

    def on_choose_template(self):
        path = filedialog.askopenfilename(title="Şablon Seç", filetypes=[("UDF/XML", "*.udf *.xml"), ("Tümü", "*.*")])
        if path:
            self.cfg["template_path"] = path
            save_config(self.cfg)
            self._refresh_template_label()
            self._set_status(f"Şablon: {os.path.basename(path)}", "✅")

    def update_batch_ui(self):
        if self.batch_operation.get() == "convert-and-merge":
            self.output_dir_row.pack_forget()
            self.output_pdf_row.pack(fill="x")
        else:
            self.output_pdf_row.pack_forget()
            self.output_dir_row.pack(fill="x")

    def update_merge_ui(self):
        if self.merge_mode.get() == "files":
            self.merge_files_frame.pack(fill="both", expand=True, pady=(0, 25))
            self.merge_folder_frame.pack_forget()
        else:
            self.merge_files_frame.pack_forget()
            self.merge_folder_frame.pack(fill="x", pady=(0, 25))

    def update_batch_input_mode(self):
        mode = self.batch_input_mode.get()
        if mode == "folder":
            self.batch_input_folder_row.pack(fill="x", pady=(0, 15))
            self.batch_input_files_row.pack_forget()
        else:
            self.batch_input_folder_row.pack_forget()
            self.batch_input_files_row.pack(fill="x", pady=(0, 15))

    def select_batch_input(self):
        f = filedialog.askdirectory(title="Giriş Klasörü")
        if f:
            self.batch_input_var.set(f)

    def select_batch_input_files(self):
        files = filedialog.askopenfilenames(
            title="Dosyalar Seç",
            filetypes=[
                ("Desteklenen Dosyalar", "*.docx *.udf *.pdf"),
                ("Word Dosyaları", "*.docx"),
                ("UDF Dosyaları", "*.udf"),
                ("PDF Dosyaları", "*.pdf"),
                ("Tüm Dosyalar", "*.*")
            ]
        )
        if files:
            self.batch_input_files_var = list(files)
            self.batch_files_listbox.delete(0, "end")
            for f in files:
                self.batch_files_listbox.insert("end", os.path.basename(f))

    def select_batch_output(self):
        f = filedialog.askdirectory(title="Çıkış Klasörü")
        if f:
            self.batch_output_var.set(f)

    def select_batch_merge_folder(self):
        f = filedialog.askdirectory(title="PDF Klasörü")
        if f:
            self.batch_merge_folder_var.set(f)

    # Drag & Drop
    def on_drop_udf(self, event):
        files = self.tk.splitlist(event.data)
        if files and files[0].lower().endswith('.docx') and os.path.exists(files[0]):
            self.drag_label_udf.configure(text=f"⏳ İşleniyor...\n{os.path.basename(files[0])}")
            self.convert_dropped_file_to_udf(files[0])
        else:
            messagebox.showerror("Hata", ".docx dosyası sürükleyin")

    def on_drop_pdf(self, event):
        files = self.tk.splitlist(event.data)
        if files:
            f = files[0]
            if f.lower().endswith(('.docx', '.udf')) and os.path.exists(f):
                self.drag_label_pdf.configure(text=f"⏳ İşleniyor...\n{os.path.basename(f)}")
                self.convert_dropped_file_to_pdf(f)
            else:
                messagebox.showerror("Hata", ".docx veya .udf sürükleyin")

    @run_in_thread
    def convert_dropped_file_to_udf(self, docx):
        try:
            # Şablon varsa kullan, yoksa varsayılan
            tpl = self.cfg.get("template_path") or ""
            if tpl and os.path.exists(tpl):
                tpl_xml = ensure_template_xml_path(tpl, self.cfg)
            else:
                tpl_xml = "calisanudfcontent.xml"
            
            out = os.path.splitext(docx)[0] + ".udf"

            self._set_status("Dönüştürülüyor...", "⏳")
            docx_to_udf_main(docx, out, template_xml_path=tpl_xml)
            self._set_status("Başarılı!", "✅")
            
            self.drag_label_udf.configure(text=f"✅ Başarılı!\n\n{os.path.basename(out)}")
            messagebox.showinfo("Başarılı", f"✅ UDF:\n{out}")
        except Exception as e:
            self._set_status("Hata", "❌")
            self.drag_label_udf.configure(text="❌ Hata!")
            messagebox.showerror("Hata", str(e))
        finally:
            self.after(3000, lambda: self.drag_label_udf.configure(text="📄 .docx sürükleyin"))

    @run_in_thread
    def convert_dropped_file_to_pdf(self, inp):
        try:
            ext = os.path.splitext(inp)[1].lower()
            tpl = None
            
            if ext == '.docx':
                t = self.cfg.get("template_path") or ""
                if t and os.path.exists(t):
                    tpl = ensure_template_xml_path(t, self.cfg)
                else:
                    tpl = "calisanudfcontent.xml"

            out = os.path.splitext(inp)[0] + ".pdf"
            self._set_status("PDF oluşturuluyor...", "⏳")
            docx_or_udf_to_pdf(inp, out, template_xml_path=tpl)
            self._set_status("Başarılı!", "✅")
            
            self.drag_label_pdf.configure(text=f"✅ Başarılı!\n\n{os.path.basename(out)}")
            messagebox.showinfo("Başarılı", f"✅ PDF:\n{out}")
        except Exception as e:
            self._set_status("Hata", "❌")
            self.drag_label_pdf.configure(text="❌ Hata!")
            messagebox.showerror("Hata", str(e))
        finally:
            self.after(3000, lambda: self.drag_label_pdf.configure(text="📑 .docx/.udf sürükleyin"))

    @run_in_thread
    def handle_docx_to_udf(self):
        try:
            docx = filedialog.askopenfilename(title="Word Seç", filetypes=[("Word", "*.docx")])
            if not docx:
                return

            # Şablon varsa kullan, yoksa varsayılan
            tpl = self.cfg.get("template_path") or ""
            if tpl and os.path.exists(tpl):
                tpl_xml = ensure_template_xml_path(tpl, self.cfg)
            else:
                tpl_xml = "calisanudfcontent.xml"
            
            out = os.path.splitext(docx)[0] + ".udf"

            self._set_status("Dönüştürülüyor...", "⏳")
            docx_to_udf_main(docx, out, template_xml_path=tpl_xml)
            self._set_status("Başarılı!", "✅")
            messagebox.showinfo("Başarılı", f"✅ UDF:\n{out}")
        except Exception as e:
            self._set_status("Hata", "❌")
            messagebox.showerror("Hata", str(e))

    @run_in_thread
    def handle_to_pdf(self):
        try:
            inp = filedialog.askopenfilename(title="Dosya Seç", filetypes=[("DOCX/UDF", "*.docx *.udf")])
            if not inp:
                return
            
            ext = os.path.splitext(inp)[1].lower()
            tpl = None
            
            if ext == '.docx':
                t = self.cfg.get("template_path") or ""
                if t and os.path.exists(t):
                    tpl = ensure_template_xml_path(t, self.cfg)
                else:
                    tpl = "calisanudfcontent.xml"

            out = os.path.splitext(inp)[0] + ".pdf"
            self._set_status("PDF...", "⏳")
            docx_or_udf_to_pdf(inp, out, template_xml_path=tpl)
            self._set_status("Başarılı!", "✅")
            messagebox.showinfo("Başarılı", f"✅ PDF:\n{out}")
        except Exception as e:
            self._set_status("Hata", "❌")
            messagebox.showerror("Hata", str(e))

    # Batch
    @run_in_thread
    def start_batch_conversion(self):
        try:
            input_mode = self.batch_input_mode.get()
            op = self.batch_operation.get()
            rec = self.batch_recursive.get()
            
            # Determine input: folder or files
            inp_dir = None
            input_files = []
            
            if input_mode == "folder":
                inp_dir = self.batch_input_var.get()
                if not inp_dir or not os.path.exists(inp_dir):
                    messagebox.showerror("Hata", "Giriş klasörü seçin")
                    return
            else:
                input_files = self.batch_input_files_var
                if not input_files:
                    messagebox.showerror("Hata", "Dosyalar seçin")
                    return
                # Use first file's directory as inp_dir for batch_converter compatibility
                if input_files:
                    inp_dir = os.path.dirname(input_files[0])
            
            if op == "convert-and-merge":
                folder = self.batch_merge_folder_var.get() or inp_dir
                fname = self.batch_merge_filename_var.get()
                if not fname:
                    messagebox.showerror("Hata", "Dosya adı girin")
                    return
                if not fname.endswith('.pdf'):
                    fname += '.pdf'
                out_pdf = os.path.join(folder, fname)
                out_dir = None
            else:
                out_dir = self.batch_output_var.get() or None
                out_pdf = None

            # Şablon - varsa kullan, yoksa varsayılan
            tpl_xml = "calisanudfcontent.xml"
            if op in ["docx-to-udf", "all-to-pdf", "convert-and-merge"]:
                tpl = self.cfg.get("template_path") or ""
                if tpl and os.path.exists(tpl):
                    tpl_xml = ensure_template_xml_path(tpl, self.cfg)
                # Yoksa varsayılan calisanudfcontent.xml kullanılır

            self.log_batch.delete("1.0", "end")
            self._log_batch(f"{'='*75}\n", "header")
            self._log_batch(f"  {op.upper()}\n", "header")
            self._log_batch(f"{'='*75}\n", "header")
            
            if input_mode == "folder":
                self._log_batch(f"📂 Giriş: {inp_dir}\n", "info")
            else:
                self._log_batch(f"📄 Dosyalar: {len(input_files)} adet\n", "info")
            
            if op == "convert-and-merge":
                self._log_batch(f"📄 Çıkış: {out_pdf}\n", "info")
            else:
                self._log_batch(f"📁 Çıkış: {out_dir or '(giriş ile aynı)'}\n", "info")
            
            # Şablon bilgisi
            tpl_name = self.cfg.get("template_path")
            if tpl_name and os.path.exists(tpl_name):
                self._log_batch(f"📋 Şablon: {os.path.basename(tpl_name)}\n", "info")
            else:
                self._log_batch(f"📋 Şablon: Varsayılan\n", "info")
            
            self._log_batch(f"{'-'*75}\n\n", "info")

            def prog_cb(cur, tot, file, stat):
                self.batch_progress_bar['value'] = int((cur/tot)*100)
                self.batch_progress_label.configure(text=f"[{cur}/{tot}] {stat}: {file}")
                self._log_batch(f"[{cur}/{tot}] {stat}: {file}\n", "progress")

            def log_cb(msg):
                self._log_batch(msg + "\n", "info")

            conv = BatchConverter(progress_callback=prog_cb, log_callback=log_cb)
            self._set_status("İşlem yapılıyor...", "⏳")

            # Process files if file list mode, otherwise use folder mode
            if input_mode == "files":
                # Convert selected files directly
                from main import convert_docx_to_udf
                from udf_to_pdf import udf_to_pdf
                from udf_to_docx import udf_to_docx
                import shutil
                
                # Filter files by operation type
                if op == "docx-to-udf":
                    files_to_process = [f for f in input_files if f.lower().endswith('.docx')]
                elif op == "udf-to-pdf":
                    files_to_process = [f for f in input_files if f.lower().endswith('.udf')]
                elif op == "udf-to-docx":
                    files_to_process = [f for f in input_files if f.lower().endswith('.udf')]
                elif op == "all-to-pdf":
                    files_to_process = input_files  # All files
                elif op == "convert-and-merge":
                    files_to_process = input_files  # All files for merging
                else:
                    files_to_process = []
                
                if not files_to_process:
                    messagebox.showerror("Hata", "Seçilen dosyalar bu işlem için uygun değil")
                    return
                
                total = len(files_to_process)
                success_list = []
                failed_list = []
                
                # For convert-and-merge, use batch_converter with temporary folder
                if op == "convert-and-merge":
                    import tempfile
                    temp_dir = tempfile.mkdtemp(prefix="udf_batch_")
                    try:
                        for f in files_to_process:
                            shutil.copy2(f, temp_dir)
                        res = conv.convert_and_merge_to_pdf(temp_dir, out_pdf, tpl_xml, False)
                        shutil.rmtree(temp_dir)
                    except Exception as e:
                        if os.path.exists(temp_dir):
                            shutil.rmtree(temp_dir, ignore_errors=True)
                        raise e
                else:
                    for idx, file_path in enumerate(files_to_process, 1):
                        filename = os.path.basename(file_path)
                        
                        try:
                            if op == "docx-to-udf":
                                if out_dir:
                                    out_path = os.path.join(out_dir, os.path.basename(file_path))
                                    udf_path = os.path.splitext(out_path)[0] + '.udf'
                                    os.makedirs(out_dir, exist_ok=True)
                                else:
                                    udf_path = os.path.splitext(file_path)[0] + '.udf'
                                prog_cb(idx, total, filename, "Dönüştürülüyor")
                                convert_docx_to_udf(file_path, udf_path, template_xml_path=tpl_xml)
                                success_list.append(udf_path)
                            elif op == "udf-to-pdf":
                                if out_dir:
                                    out_path = os.path.join(out_dir, os.path.basename(file_path))
                                    pdf_path = os.path.splitext(out_path)[0] + '.pdf'
                                    os.makedirs(out_dir, exist_ok=True)
                                else:
                                    pdf_path = os.path.splitext(file_path)[0] + '.pdf'
                                prog_cb(idx, total, filename, "PDF'ye dönüştürülüyor")
                                udf_to_pdf(file_path, pdf_path)
                                success_list.append(pdf_path)
                            elif op == "udf-to-docx":
                                if out_dir:
                                    out_path = os.path.join(out_dir, os.path.basename(file_path))
                                    docx_path = os.path.splitext(out_path)[0] + '.docx'
                                    os.makedirs(out_dir, exist_ok=True)
                                else:
                                    docx_path = os.path.splitext(file_path)[0] + '.docx'
                                prog_cb(idx, total, filename, "DOCX'ye dönüştürülüyor")
                                udf_to_docx(file_path, docx_path)
                                success_list.append(docx_path)
                            elif op == "all-to-pdf":
                                ext = os.path.splitext(file_path)[1].lower()
                                if out_dir:
                                    out_path = os.path.join(out_dir, os.path.basename(file_path))
                                    pdf_path = os.path.splitext(out_path)[0] + '.pdf'
                                    os.makedirs(out_dir, exist_ok=True)
                                else:
                                    pdf_path = os.path.splitext(file_path)[0] + '.pdf'
                                
                                if ext == '.pdf':
                                    prog_cb(idx, total, filename, "Kopyalanıyor")
                                    shutil.copy2(file_path, pdf_path)
                                elif ext in ['.docx', '.udf']:
                                    prog_cb(idx, total, filename, "PDF'ye dönüştürülüyor")
                                    docx_or_udf_to_pdf(file_path, pdf_path, template_xml_path=tpl_xml if ext == '.docx' else None)
                                else:
                                    continue
                                success_list.append(pdf_path)
                        except Exception as e:
                            failed_list.append((file_path, str(e)))
                            prog_cb(idx, total, filename, "HATA")
                    
                    res = {
                        'success': success_list,
                        'failed': failed_list,
                        'skipped': []
                    }
            else:
                # Folder mode - use existing batch_converter methods
                if op == "docx-to-udf":
                    res = conv.convert_docx_to_udf_batch(inp_dir, out_dir, tpl_xml, rec)
                elif op == "udf-to-pdf":
                    res = conv.convert_udf_to_pdf_batch(inp_dir, out_dir, rec)
                elif op == "udf-to-docx":
                    res = conv.convert_udf_to_docx_batch(inp_dir, out_dir, rec)
                elif op == "all-to-pdf":
                    res = conv.convert_all_to_pdf_batch(inp_dir, out_dir, tpl_xml, rec)
                elif op == "convert-and-merge":
                    res = conv.convert_and_merge_to_pdf(inp_dir, out_pdf, tpl_xml, rec)

            self._log_batch(f"\n{'='*75}\n", "header")
            self._log_batch(f"  SONUÇ\n", "header")
            self._log_batch(f"{'='*75}\n", "header")
            self._log_batch(f"✅ {len(res.get('success', []))}\n", "success")
            self._log_batch(f"❌ {len(res.get('failed', []))}\n", "error")
            
            if op == "convert-and-merge" and out_pdf and os.path.exists(out_pdf):
                size = os.path.getsize(out_pdf)
                self._log_batch(f"\n📄 {out_pdf}\n", "success")
                self._log_batch(f"📊 {size/(1024*1024):.2f} MB\n", "info")
                
                if messagebox.askyesno("🎉 Başarılı!", f"✅ Birleştirildi!\n\n📄 {os.path.basename(out_pdf)}\n📊 {size/(1024*1024):.2f} MB\n\n📁 {os.path.dirname(out_pdf)}\n\nKlasörü aç?"):
                    import subprocess
                    subprocess.Popen(f'explorer /select,"{out_pdf}"')
            else:
                messagebox.showinfo("Tamamlandı", f"✅ {len(res.get('success', []))}\n❌ {len(res.get('failed', []))}")

            self._set_status("Tamamlandı!", "✅")

        except Exception as e:
            self._log_batch(f"\n❌ {str(e)}\n", "error")
            self._log_batch(f"{traceback.format_exc()}\n", "error")
            self._set_status("Hata", "❌")
            messagebox.showerror("Hata", str(e))

    # PDF Merge
    def add_pdf_files(self):
        files = filedialog.askopenfilenames(title="PDF Seç", filetypes=[("PDF", "*.pdf")])
        for f in files:
            # Store full path but display only filename
            self.pdf_listbox.insert("end", f"{os.path.basename(f)}|{f}")

    def remove_pdf_file(self):
        sel = self.pdf_listbox.curselection()
        if sel:
            self.pdf_listbox.delete(sel[0])

    def move_pdf_up(self):
        sel = self.pdf_listbox.curselection()
        if sel and sel[0] > 0:
            idx = sel[0]
            item = self.pdf_listbox.get(idx)
            self.pdf_listbox.delete(idx)
            self.pdf_listbox.insert(idx - 1, item)
            self.pdf_listbox.selection_set(idx - 1)

    def move_pdf_down(self):
        sel = self.pdf_listbox.curselection()
        if sel and sel[0] < self.pdf_listbox.size() - 1:
            idx = sel[0]
            item = self.pdf_listbox.get(idx)
            self.pdf_listbox.delete(idx)
            self.pdf_listbox.insert(idx + 1, item)
            self.pdf_listbox.selection_set(idx + 1)

    def clear_pdf_list(self):
        self.pdf_listbox.delete(0, "end")

    def select_merge_folder(self):
        f = filedialog.askdirectory(title="Klasör")
        if f:
            self.merge_folder_var.set(f)

    def select_merge_output(self):
        f = filedialog.asksaveasfilename(title="Çıkış PDF", defaultextension=".pdf", filetypes=[("PDF", "*.pdf")], initialfile="birlestirilmis.pdf")
        if f:
            self.merge_output_var.set(f)

    @run_in_thread
    def start_pdf_merge(self):
        try:
            out = self.merge_output_var.get()
            if not out:
                messagebox.showerror("Hata", "Çıkış belirtin")
                return

            mode = self.merge_mode.get()
            bm = self.merge_bookmarks.get()
            
            merger = PDFMerger(log_callback=lambda m: print(m))
            self._set_status("Birleştiriliyor...", "⏳")

            if mode == "files":
                items = list(self.pdf_listbox.get(0, "end"))
                if not items:
                    messagebox.showerror("Hata", "PDF ekleyin")
                    return
                # Extract full paths from listbox items (format: "filename|fullpath")
                files = []
                for item in items:
                    if "|" in item:
                        files.append(item.split("|", 1)[1])  # Get full path
                    else:
                        files.append(item)  # Fallback for old format
                merger.merge_pdfs(files, out, bm)
            else:
                folder = self.merge_folder_var.get()
                if not folder:
                    messagebox.showerror("Hata", "Klasör seçin")
                    return
                merger.merge_pdfs_from_directory(folder, out, self.merge_recursive_var.get(), bm)

            self._set_status("Başarılı!", "✅")
            
            if os.path.exists(out):
                size = os.path.getsize(out)
                if messagebox.askyesno("🎉 Başarılı!", f"✅ Birleştirildi!\n\n📄 {os.path.basename(out)}\n📊 {size/(1024*1024):.2f} MB\n\nKlasörü aç?"):
                    import subprocess
                    subprocess.Popen(f'explorer /select,"{out}"')
        except Exception as e:
            self._set_status("Hata", "❌")
            messagebox.showerror("Hata", str(e))


if __name__ == "__main__":
    app = App()
    app.mainloop()
