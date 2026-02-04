#!/bin/bash
# DEPRECATED: Este script não é mais necessário para Vercel serverless.
#
# O certificado SSL do Supabase agora é incluído diretamente no bundle
# via outputFileTracingIncludes no next.config.ts.
#
# Para Vercel serverless, configure:
#   PGSSLROOTCERT=/var/task/certs/supabase-prod-ca.crt
#
# Veja docs/vercel-supabase-ssl.md para mais informações.

echo "AVISO: Este script está deprecated."
echo "O certificado SSL agora é incluído via next.config.ts outputFileTracingIncludes."
echo "Configure PGSSLROOTCERT=/var/task/certs/supabase-prod-ca.crt no Vercel."
echo ""
echo "Veja docs/vercel-supabase-ssl.md para instruções atualizadas."
