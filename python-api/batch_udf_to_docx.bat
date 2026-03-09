@echo off
chcp 65001 >nul
echo ========================================
echo UDF Toolkit - Toplu UDF → DOCX Dönüştürme
echo ========================================
echo.

if "%~1"=="" (
    echo Kullanım: Klasörü bu bat dosyasının üzerine sürükleyin
    echo Veya: batch_udf_to_docx.bat "klasor_yolu"
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
echo Alt klasörleri de taramak ister misiniz? (E/H)
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
echo Dönüştürme başlıyor...
echo.

python batch_converter.py udf-to-docx "%INPUT_DIR%" %RECURSIVE_FLAG%

echo.
echo ========================================
echo İşlem tamamlandı!
echo ========================================
pause

