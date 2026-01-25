#!/bin/bash

# Enermax V3 Setup Script
# Run this script to set up the project quickly

echo "🚀 Enermax V3 - Setup Script"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: No se encontró package.json${NC}"
    echo "Por favor ejecuta este script desde la raíz del proyecto enermax-v3"
    exit 1
fi

# Step 1: Install dependencies
echo -e "${YELLOW}📦 Paso 1: Instalando dependencias...${NC}"
if command -v npm &> /dev/null; then
    npm install
    echo -e "${GREEN}✓ Dependencias instaladas${NC}"
else
    echo -e "${RED}Error: npm no está instalado${NC}"
    exit 1
fi

echo ""

# Step 2: Create .env.local if it doesn't exist
echo -e "${YELLOW}🔐 Paso 2: Configurando variables de entorno...${NC}"
if [ ! -f ".env.local" ]; then
    cp .env.local.example .env.local
    echo -e "${GREEN}✓ .env.local creado desde .env.local.example${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANTE: Edita .env.local con tus credenciales reales${NC}"
else
    echo -e "${GREEN}✓ .env.local ya existe${NC}"
fi

echo ""

# Step 3: Check required env vars
echo -e "${YELLOW}🔍 Paso 3: Verificando variables de entorno...${NC}"
if grep -q "tu_url_de_supabase" .env.local 2>/dev/null; then
    echo -e "${RED}⚠️  Falta configurar NEXT_PUBLIC_SUPABASE_URL${NC}"
fi
if grep -q "tu_anon_key" .env.local 2>/dev/null; then
    echo -e "${RED}⚠️  Falta configurar NEXT_PUBLIC_SUPABASE_ANON_KEY${NC}"
fi
if grep -q "tu_service_role_key" .env.local 2>/dev/null; then
    echo -e "${RED}⚠️  Falta configurar SUPABASE_SERVICE_ROLE_KEY${NC}"
fi
if grep -q "tu_access_token" .env.local 2>/dev/null; then
    echo -e "${RED}⚠️  Falta configurar MERCADOPAGO_ACCESS_TOKEN${NC}"
fi
if grep -q "tu_public_key" .env.local 2>/dev/null; then
    echo -e "${RED}⚠️  Falta configurar NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY${NC}"
fi

echo ""

# Summary
echo "=============================="
echo -e "${GREEN}✓ Setup completado${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Edita .env.local con tus credenciales de Supabase y MercadoPago"
echo "2. Ejecuta el schema.sql en Supabase SQL Editor"
echo "3. Crea el bucket 'trabajos' en Supabase Storage"
echo "4. Habilita Realtime en solicitudes y chat_mensajes"
echo "5. Ejecuta: npm run dev"
echo ""
echo -e "${YELLOW}📖 Más info en README.md${NC}"
