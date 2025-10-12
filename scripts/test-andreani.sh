#!/bin/bash
# Script para ejecutar tests de Andreani con diferentes configuraciones

echo "🧪 Tests de Integración Andreani"
echo "=================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para ejecutar tests
run_test() {
    echo -e "${YELLOW}Ejecutando: $1${NC}"
    npm run "$2"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1 - PASSED${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}✗ $1 - FAILED${NC}"
        echo ""
        return 1
    fi
}

# Mostrar menú
echo "Selecciona qué tests ejecutar:"
echo "1) Todos los tests de Andreani"
echo "2) Tests unitarios (librería)"
echo "3) Tests de API endpoint"
echo "4) Tests de frontend handler"
echo "5) Tests de integración E2E"
echo "6) Todos con coverage"
echo "7) Modo watch (desarrollo)"
echo "0) Salir"
echo ""

read -p "Opción: " option

case $option in
    1)
        echo ""
        echo "Ejecutando todos los tests de Andreani..."
        echo ""
        run_test "Tests de Andreani" "test:andreani"
        ;;
    2)
        echo ""
        echo "Ejecutando tests unitarios..."
        echo ""
        run_test "Tests Unitarios" "test:andreani:unit"
        ;;
    3)
        echo ""
        echo "Ejecutando tests de API..."
        echo ""
        run_test "Tests de API" "test:andreani:api"
        ;;
    4)
        echo ""
        echo "Ejecutando tests de frontend..."
        echo ""
        run_test "Tests de Frontend" "test:andreani:frontend"
        ;;
    5)
        echo ""
        echo "Ejecutando tests E2E..."
        echo ""
        run_test "Tests E2E" "test:andreani:e2e"
        ;;
    6)
        echo ""
        echo "Ejecutando todos los tests con coverage..."
        echo ""
        run_test "Tests con Coverage" "test:andreani:coverage"
        
        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}Coverage report generado en: coverage/index.html${NC}"
        fi
        ;;
    7)
        echo ""
        echo "Iniciando modo watch..."
        echo "Presiona Ctrl+C para salir"
        echo ""
        npm run test:watch -- tests/andreani
        ;;
    0)
        echo "Saliendo..."
        exit 0
        ;;
    *)
        echo -e "${RED}Opción inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo "=================================="
echo "Tests completados"
