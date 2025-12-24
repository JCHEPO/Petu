#!/bin/bash
echo "============================================"
echo "   PETU - EVENTOS CON COMPROMISO"
echo "============================================"
echo ""
echo "1. Iniciando Backend en puerto 3000..."
echo "   Abriendo http://localhost:3000"
echo ""
echo "2. Frontend disponible en:"
echo "   file://$(pwd)/frontend/index.html"
echo ""
echo "============================================"
echo ""

cd backend
echo "[BACKEND] Iniciando servidor Node.js..."
echo "[BACKEND] Presiona Ctrl+C para detener"
echo ""
node server.js
