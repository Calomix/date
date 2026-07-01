@echo off
chcp 65001 >nul
cd /d "C:\MyStuff\Coding\Date"

echo Inicializando repositorio local (si no existe)...
git init

echo Cambiando a rama main...
git branch -M main

echo Configurando remote origin...
git remote add origin https://github.com/Calomix/date.git 2>nul || git remote set-url origin https://github.com/Calomix/date.git

echo Agregando archivos...
git add .

echo Creando commit...
git commit -m "Initial commit: cute date invitation page"

echo Subiendo a GitHub...
git push -u origin main

echo.
echo Listo! Revisá https://github.com/Calomix/date
pause
