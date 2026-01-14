# ClikPro WhatsApp Local Integration

Esta pasta contém um aplicativo Node.js simplificado que implementa uma integração local com a API oficial do WhatsApp. O objetivo é permitir que o cliente execute o upgrade do produto **ClikPro** no seu próprio computador, com um login único no WhatsApp Business e uma página de chat onde uma IA básica atende os usuários. O cliente pode acompanhar a conversa e enviar mensagens manualmente a qualquer momento.

## Pré-requisitos

1. **Node.js 18 ou superior** instalado no computador. O script utiliza a API `fetch` embutida no Node 18+, portanto não requer dependências externas.
2. **Credenciais da API do WhatsApp Cloud**: 
   - `WHATSAPP_TOKEN` – Token de acesso gerado no painel do WhatsApp Business.
   - `WHATSAPP_PHONE_NUMBER_ID` – ID do número de telefone configurado na conta do WhatsApp Business.
3. **`VERIFY_TOKEN`** – Token arbitrário escolhido por você para validar o webhook junto à Meta.
4. (Opcional) **Exposição do servidor** – Para receber mensagens reais do WhatsApp, o servidor precisa ser acessível publicamente (por exemplo, via [ngrok](https://ngrok.com)).

## Estrutura dos Arquivos

- `index.js`: servidor HTTP que:
  - Expõe um webhook (`/webhook`) para receber mensagens da Meta.
  - Processa as mensagens, gera uma resposta automática simples e envia de volta via API do WhatsApp.
  - Disponibiliza uma interface web (`/`) para o operador enviar mensagens e visualizar o histórico.
  - Permite listar (`/messages`) e enviar (`/send-message`) mensagens via chamadas HTTP.
- `index.html`: página web simples com caixa de texto e lista de mensagens.
- `start.sh`: script de inicialização que verifica as variáveis de ambiente e executa o servidor.
- `README.md`: este guia.

## Como Usar

1. **Copiar a pasta** para o computador onde o servidor será executado.
2. **Definir variáveis de ambiente** no terminal:

```bash
export WHATSAPP_TOKEN='seu_token_de_acesso'
export WHATSAPP_PHONE_NUMBER_ID='seu_phone_number_id'
export VERIFY_TOKEN='seu_token_de_verificacao'
# Porta opcional (padrão: 3001)
export PORT=3001
```

3. **Iniciar o servidor** executando o script de inicialização na pasta do projeto:

```bash
cd clikpro-whatsapp-app
bash start.sh
```

4. **Configurar o webhook** no painel do WhatsApp Cloud:
   - Aponte a URL do webhook para `https://<seu_domínio>/webhook` (utilize ngrok ou um domínio público se estiver em desenvolvimento local).
   - Informe o `VERIFY_TOKEN` exatamente como definido.

5. **Acessar a interface** em `http://localhost:3001/` (ou a porta definida). Insira o telefone do destinatário no formato E.164 (ex.: `5511999999999`) e troque mensagens. A IA simples responderá automaticamente.

## Como Funciona

Quando uma mensagem chega ao webhook da Meta, o servidor registra a mensagem no histórico e chama a função `generateAIResponse()` para criar uma resposta. A resposta padrão identifica saudações e perguntas sobre preço, mas pode ser estendida para usar modelos de IA avançados. Em seguida, a resposta é enviada ao usuário via `sendWhatsAppMessage()`.

A interface web realiza polling a cada poucos segundos para buscar novas mensagens associadas ao telefone informado, permitindo que o operador acompanhe a conversa em tempo real e envie mensagens manuais via `POST /send-message`.

## Extensões

O repositório original do ClikPro contém módulos avançados, como `whatsapp-cloud-api.ts`, `bot-conversation-store.ts` e `bot-conversation-flow-example.ts`, que tratam de fluxos conversacionais complexos, criação de leads e integração com assistentes do OpenAI. Para uma integração completa, esses arquivos podem ser importados e utilizados em vez das funções simplificadas de `index.js`. Este exemplo foi intencionalmente reduzido para permitir a execução local sem dependências externas.

## Licença

Uso interno apenas. Ajuste conforme as necessidades do seu produto.