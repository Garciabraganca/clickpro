#!/bin/bash
# Script de build para Vercel - Configura certificado SSL do Supabase
#
# Este script é executado durante o build step na Vercel e grava o
# certificado SSL do Supabase a partir da variável de ambiente SUPABASE_CA_CERT.
#
# Uso na Vercel:
#   1. Adicione o certificado como Secret na Vercel (nome: SUPABASE_CA_CERT)
#   2. Configure o build command: bash scripts/setup-ssl-cert.sh && npm run build
#   3. Configure PGSSLROOTCERT=/vercel/path0/certs/prod-ca.crt

set -e

CERT_DIR="/vercel/path0/certs"
CERT_PATH="$CERT_DIR/prod-ca.crt"

# Criar diretório se não existir
mkdir -p "$CERT_DIR"

# Verificar se a variável SUPABASE_CA_CERT está definida
if [ -n "$SUPABASE_CA_CERT" ]; then
    echo "Gravando certificado SSL do Supabase em $CERT_PATH..."
    echo "$SUPABASE_CA_CERT" > "$CERT_PATH"
    chmod 644 "$CERT_PATH"
    echo "Certificado SSL configurado com sucesso!"
else
    echo "AVISO: SUPABASE_CA_CERT não definido. Usando certificado local se disponível."
    # Copiar certificado local se existir
    LOCAL_CERT="$(dirname "$0")/../certs/supabase-prod-ca.crt"
    if [ -f "$LOCAL_CERT" ]; then
        cp "$LOCAL_CERT" "$CERT_PATH"
        echo "Certificado local copiado para $CERT_PATH"
    fi
fi

# Exportar variável para uso posterior
export PGSSLROOTCERT="$CERT_PATH"
echo "PGSSLROOTCERT configurado: $PGSSLROOTCERT"
