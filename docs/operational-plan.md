# Plano Operacional – Codex (10 Comandos)

> Documento de referência para a evolução do ClickPro com WhatsApp + OpenAI.

## 1) Configurar Banco e Estrutura Inicial ✅
- [x] Criar modelos e migrations:
  - `User`
  - `Client`
  - `ClientMember`
  - `Contact`
  - `Campaign`
  - `Message`
  - `Template`
  - `WebhookEvent`
  - `OptOut`
  - `OpenAiCredential`
  - `WhatsappCredential`

## 2) Implementar Autenticação e Painel Multiusuário ✅
- [x] Criar rotas e páginas:
  - Login seguro
  - Dashboard por cliente
  - Isolamento de dados por sessão
- [x] Middleware de autenticação com JWT ou NextAuth com RBAC:
  - `SUPER_ADMIN`
  - `CLIENT_ADMIN`
  - `CLIENT_USER`

## 3) Cadastrar e Validar Credenciais (Meta + OpenAI) ✅
- [x] Front-end: formulários para cadastrar credenciais.
- [x] Back-end: validação com chamadas de teste:
  - Meta: `GET /phone_numbers`
  - OpenAI: `GET /models`
- [x] Salvar credenciais com criptografia.

## 4) Sistema de Templates de Mensagem (Meta) ✅
- [x] Painel para criação de templates (texto, mídia).
- [x] Integração com Graph API para submissão.
- [x] Salvamento e status inicial no banco.

## 5) Webhook da Meta (Mensagens e Status) ✅
- [x] Criar endpoint público HTTPS `/webhook` com verificação de token.
- [x] Armazenar mensagens recebidas e eventos de status (entregue/lido).
- [x] Associar eventos ao cliente correto.

## 6) Verificação de Status de Templates ✅
- [x] Agendar verificação periódica dos templates enviados.
- [x] Atualizar status no banco: `APPROVED`, `REJECTED`, etc.
- [x] Notificar cliente no painel.

## 7) Upload de Contatos e Pré-processamento ⏳
- [x] Implementar parser CSV com validação de telefone.
- [ ] Implementar suporte Excel (.xlsx) no parser.
- [x] Salvar contatos no banco com vinculação a campanhas.
- [x] Eliminar duplicados automaticamente.

## 8) Campanhas e Agendador com Rate Limit ✅
- [x] Criar fluxo para campanha:
  - Selecionar template
  - Selecionar contatos
  - Configurar lote/envio
- [x] Criar worker com fila para processar envios em intervalos definidos.
- [x] Suporte a pausa/cancelamento em tempo real.

## 9) Responder com IA (OpenAI) ✅
- [x] No webhook de mensagem recebida, consultar `assistant_id` e chave do cliente.
- [x] Enviar prompt com contexto recente.
- [x] Responder via WhatsApp API se IA ativada e registrar no histórico.

## 10) Painel de Conversas ao Vivo + Histórico ✅
- [x] Construir front-end tipo inbox com mensagens agrupadas por contato.
- [x] Suporte a busca, filtragem e envio manual com fallback.
- [x] Mostrar se resposta foi da IA ou humana, com timestamps e status.

## Pendências (tarefas abertas)
- [ ] Adicionar suporte a upload Excel (.xlsx) no fluxo de contatos.
