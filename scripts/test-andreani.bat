@echo off
REM Script para ejecutar tests de Andreani en Windows

echo ========================================
echo  Tests de Integracion Andreani
echo ========================================
echo.

echo Selecciona que tests ejecutar:
echo 1) Todos los tests de Andreani
echo 2) Tests unitarios (libreria)
echo 3) Tests de API endpoint
echo 4) Tests de frontend handler
echo 5) Tests de integracion E2E
echo 6) Todos con coverage
echo 7) Modo watch (desarrollo)
echo 0) Salir
echo.

set /p option="Opcion: "

if "%option%"=="1" (
    echo.
    echo Ejecutando todos los tests de Andreani...
    echo.
    call npm run test:andreani
    goto :end
)

if "%option%"=="2" (
    echo.
    echo Ejecutando tests unitarios...
    echo.
    call npm run test:andreani:unit
    goto :end
)

if "%option%"=="3" (
    echo.
    echo Ejecutando tests de API...
    echo.
    call npm run test:andreani:api
    goto :end
)

if "%option%"=="4" (
    echo.
    echo Ejecutando tests de frontend...
    echo.
    call npm run test:andreani:frontend
    goto :end
)

if "%option%"=="5" (
    echo.
    echo Ejecutando tests E2E...
    echo.
    call npm run test:andreani:e2e
    goto :end
)

if "%option%"=="6" (
    echo.
    echo Ejecutando todos los tests con coverage...
    echo.
    call npm run test:andreani:coverage
    echo.
    echo Coverage report generado en: coverage\index.html
    goto :end
)

if "%option%"=="7" (
    echo.
    echo Iniciando modo watch...
    echo Presiona Ctrl+C para salir
    echo.
    call npm run test:watch -- tests/andreani
    goto :end
)

if "%option%"=="0" (
    echo Saliendo...
    goto :end
)

echo Opcion invalida
goto :end

:end
echo.
echo ========================================
echo Tests completados
echo ========================================
pause
