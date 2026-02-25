#!/bin/bash
# Setup Verification Script

echo "=== Verificación de Instalación ==="
echo ""

# Check files exist
echo "Verificando archivos principales..."
files=(
  "app/page.tsx"
  "app/layout.tsx"
  "app/globals.css"
  "components/config-google-sheets.tsx"
  "components/editor-horarios.tsx"
  "components/app-header.tsx"
  "lib/api.ts"
  "types/index.ts"
  "hooks/use-google-script-url.ts"
  "public/logo.png"
  "public/google-apps-script.js"
  "README.md"
  "GOOGLE_SHEETS_SETUP.md"
  "CHANGELOG.md"
)

missing=0
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file (FALTA)"
    missing=$((missing + 1))
  fi
done

echo ""
if [ $missing -eq 0 ]; then
  echo "✅ Todos los archivos están presentes"
  echo ""
  echo "=== Próximos Pasos ==="
  echo "1. Lee GOOGLE_SHEETS_SETUP.md para configurar Google Sheets"
  echo "2. Ejecuta: pnpm dev"
  echo "3. Abre http://localhost:3000"
  echo "4. Login con contraseña: Passabanfield"
  echo "5. Haz clic en botón 'Configurar' para Google Apps Script"
else
  echo "❌ Faltan $missing archivos. Ejecuta setup nuevamente."
  exit 1
fi
