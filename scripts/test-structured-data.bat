@echo off
echo.
echo Probando datos estructurados...
echo.
echo Construyendo proyecto...
call npm run build
echo.
echo Iniciando servidor (presiona Ctrl+C cuando termines)...
echo.
echo Una vez que el servidor este listo:
echo 1. Abre http://localhost:3000/productos/[nombre-producto]
echo 2. Click derecho -^> Ver codigo fuente
echo 3. Busca "application/ld+json"
echo 4. Deberia aparecer el JSON con Product y BreadcrumbList
echo.
call npm start
