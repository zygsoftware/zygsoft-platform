@echo off
echo Creating venv and installing requirements...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
python -m venv .venv
call .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
pip install pyinstaller
echo Building EXE with updated spec file...
python -m PyInstaller --clean --noconfirm UDF-Toolkit.spec
echo Done. See dist\UDF-Toolkit.exe
echo.
echo Copying additional files to dist folder...
copy calisanudfcontent.xml dist\
copy config.json dist\
echo.
echo EXE build completed successfully!
pause
