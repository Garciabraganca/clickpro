#!/bin/bash
# Script de inicialização para o ClikPro WhatsApp App
#
# Antes de executar, defina as seguintes variáveis de ambiente:
#   WHATSAPP_TOKEN             Token de acesso da API do WhatsApp
#   WHATSAPP_PHONE_NUMBER_ID   ID do número de telefone associado
#   VERIFY_TOKEN               Token de verificação para o webhook
# Opcionalmente:
#   PORT                       Porta do servidor (padrão: 3001)

# Verificar variáveis obrigatórias
if [[ -z "$WHATSAPP_TOKEN" || -z "$WHATSAPP_PHONE_NUMBER_ID" || -z "$VERIFY_TOKEN" ]]; then
  echo "Por favor, defina WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID e VERIFY_TOKEN antes de iniciar." >&2
  exit 1
fi

# Definir porta padrão
PORT=${PORT:-3001}
echo "Iniciando ClikPro WhatsApp App na porta $PORT..."

# Executar o servidor Node.js
node index.js