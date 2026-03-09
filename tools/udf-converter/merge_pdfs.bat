@echo off
chcp 65001 >nul
echo ========================================
echo UDF Toolkit - PDF Birleştirme
echo ========================================
echo.

if "%~1"=="" (
    echo Kullanım 1: Klasörü bu bat dosyasının üzerine sürükleyin (klasördeki tüm PDF'ler)
    echo Kullanım 2: merge_pdfs.bat "klasor_yolu"
    echo.
    pause
    exit /b 1
)

set "INPUT_DIR=%~1"

if not exist "%INPUT_DIR%" (
    echo HATA: Klasör bulunamadı: %INPUT_DIR%
    echo.
    pause
    exit /b 1
)

echo Giriş klasörü: %INPUT_DIR%
echo.
echo Çıkış PDF dosya adı (varsayılan: merged.pdf):
set /p OUTPUT_NAME="Dosya adı: "

if "%OUTPUT_NAME%"=="" (
    set "OUTPUT_NAME=merged.pdf"
)

set "OUTPUT_PATH=%INPUT_DIR%\%OUTPUT_NAME%"

echo.
echo Alt klasörleri de dahil etmek ister misiniz? (E/H)
set /p RECURSIVE="Seçim: "

if /i "%RECURSIVE%"=="E" (
    set RECURSIVE_FLAG=-r
    echo.
    echo Alt klasörler dahil taranacak...
) else (
    set RECURSIVE_FLAG=
    echo.
    echo Sadece üst klasör taranacak...
)

echo.
echo PDF'ler birleştiriliyor...
echo Çıkış: %OUTPUT_PATH%
echo.

python pdf_merger.py merge-dir "%INPUT_DIR%" -o "%OUTPUT_PATH%" %RECURSIVE_FLAG%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Başarılı! PDF birleştirildi:
    echo %OUTPUT_PATH%
    echo ========================================
) else (
    echo.
    echo ========================================
    echo HATA: PDF birleştirme başarısız oldu!
    echo ========================================
)

pause

