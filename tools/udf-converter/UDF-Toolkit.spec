# -*- mode: python ; coding: utf-8 -*-

from PyInstaller.utils.hooks import collect_all, collect_submodules

# Reportlab ve PyPDF2 modüllerini tam olarak topla
try:
    reportlab_datas, reportlab_binaries, reportlab_hiddenimports = collect_all('reportlab')
except:
    reportlab_datas, reportlab_binaries, reportlab_hiddenimports = [], [], []

try:
    pypdf2_hiddenimports = collect_submodules('PyPDF2')
except:
    pypdf2_hiddenimports = []

a = Analysis(
    ['udf_toolkit_gui.py', 'main.py', 'udf_to_pdf.py', 'udf_to_docx.py', 'paragraph_processor.py', 'table_processor.py', 'image_processor.py', 'utils.py', 'batch_converter.py', 'pdf_merger.py'],
    pathex=[],
    binaries=reportlab_binaries,
    datas=[('assets', 'assets'), ('fonts', 'fonts')] + reportlab_datas,
    hiddenimports=[
        'reportlab',
        'reportlab.pdfgen',
        'reportlab.pdfgen.canvas',
        'reportlab.lib',
        'reportlab.lib.pagesizes',
        'reportlab.lib.styles',
        'reportlab.lib.units',
        'reportlab.lib.colors',
        'reportlab.platypus',
        'reportlab.platypus.paragraph',
        'reportlab.platypus.tables',
        'reportlab.platypus.frames',
        'reportlab.platypus.doctemplate',
        'reportlab.pdfbase',
        'reportlab.pdfbase.pdfmetrics',
        'reportlab.pdfbase.ttfonts',
        'reportlab.pdfbase._fontdata',
        'PyPDF2',
        'PyPDF2.generic',
        'PyPDF2._reader',
        'PyPDF2._writer',
        'PyPDF2._merger',
        'PyPDF2._page',
    ] + reportlab_hiddenimports + pypdf2_hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='UDF-Toolkit',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['assets\\logo.png'],
)
