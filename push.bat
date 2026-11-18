@echo off
cd /d "C:\MyStuff\Coding\calomix.com\Date"

echo Actualizando desde GitHub (para no pisar cambios guardados desde la web)...
git pull --rebase origin main
if errorlevel 1 (
  echo.
  echo ATENCION: Hubo conflictos al hacer pull. Resolvelos antes de continuar.
  pause
  exit /b 1
)

echo Agregando archivos...
git add .

echo Creando commit...
git commit -m "Update site"

echo Subiendo a GitHub...
git push -u origin main

echo.
echo Listo! Revisa https://github.com/Calomix/date
pause
