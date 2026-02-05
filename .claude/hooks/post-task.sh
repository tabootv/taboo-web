#!/bin/bash
# Após cada edição do Claude, garantir que o Sonar continua feliz
echo "🔍 Validando métricas de qualidade..."
npm run sonar:scan