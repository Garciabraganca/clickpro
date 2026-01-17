# ClickPro - Relatório de Finalização

**Data de Início:** 2026-01-17
**Objetivo:** Deixar o produto pronto para operação comercial com RBAC, onboarding de cliente, licenças e dashboard admin.

---

## FASE 1 — DIAGNÓSTICO DO SISTEMA

### Resumo Executivo

| Componente | Status | Detalhes |
|------------|--------|----------|
| A) Auth & Sessão | **PRONTO** | NextAuth funcional com JWT |
| B) RBAC e Isolamento | **PARCIAL** | Roles existem, mas não são aplicadas |
| C) Admin UI | **AUSENTE** | Sem gestão de clientes/usuários via UI |
| D) Onboarding | **PARCIAL** | Telas existem, dependem de API externa |
| E) Licenças | **PARCIAL** | Model existe, falta rate limit e enforcement |
| F) Dashboard/Métricas | **MOCK** | Dados estáticos hardcoded |
| G) Logs e Rate Limit | **PARCIAL** | Logs de licença OK, rate limit ausente |

---

### A) Auth & Sessão — PRONTO

**O que existe:**
- NextAuth v4 com Credentials Provider
- Hashing PBKDF2 (120.000 iterações, SHA256) - seguro
- Sessão JWT com 24h de validade
- Middleware protege `/dashboard/*`
- Login/Signup funcionais
- Callbacks JWT/Session populam `role`, `clientId`, `clientName`

**Arquivos:**
- `src/lib/auth.ts` - Configuração NextAuth
- `src/app/api/auth/[...nextauth]/route.ts` - Handler
- `src/app/api/auth/signup/route.ts` - Criação de conta
- `middleware.ts` - Proteção de rotas

**Helpers disponíveis:**
```typescript
isSuperAdmin(session)
isClientAdmin(session)
getSessionClientId(session)
```

---

### B) RBAC e Isolamento — PARCIAL

**O que existe:**
- Enum `Role`: `SUPER_ADMIN`, `CLIENT_ADMIN`, `CLIENT_USER`
- Model `ClientMember` para associar User → Client
- Session carrega `role`, `clientId`, `clientName`

**O que falta:**
1. Middleware NÃO verifica roles - apenas autenticação
2. Não há rotas `/admin/*` protegidas por role
3. Signup cria usuário sem associação a Client (fica órfão)
4. Não há guard server-side nas APIs

**Riscos:**
- Qualquer usuário autenticado pode acessar tudo
- CLIENT_USER pode ver dados de outros clientes

---

### C) Admin UI (Gestão de Clientes) — AUSENTE

**O que falta:**
- Página `/admin/clients` - listar/criar/editar clientes
- Página `/admin/users` - listar/criar/editar usuários
- Funcionalidade de ativar/desativar cliente
- Funcionalidade de reset de senha
- Atribuição de role e tenant
- Convite por email (opcional)

**Impacto:**
- Admin precisa usar SQL manual para operações diárias
- Inviável para operação comercial

---

### D) Onboarding do Cliente — PARCIAL

**O que existe:**
- `/credentials` - formulário para OpenAI/WhatsApp
- `/contacts` - upload CSV com preview
- `/campaigns` - criar campanha com seleção de contatos/template
- `/templates` - gestão de templates
- `/conversations` - inbox de mensagens

**Problemas:**
1. Todas as telas dependem de API externa (`localhost:3001`)
2. Não há models Prisma para Campaign/Contact/Template no portal
3. Credenciais salvam em `localStorage`, não no banco
4. Sem integração real - são apenas interfaces para a API externa

**Arquitetura atual:**
```
Portal (Next.js) → API Externa (localhost:3001)
                   ↓
                   PostgreSQL (campaigns, contacts, etc)
```

---

### E) Licenças — PARCIAL

**O que existe:**
- Model `License` no Prisma
- Model `LicenseValidationLog` para auditoria
- API `POST /api/license/validate` - valida token
- API `POST /api/license/generate` - gera licença (requer auth)
- Componente `LicenseGenerator` no dashboard
- Componente `LicenseValidator` no dashboard

**O que falta:**
1. **Rate limit** na API de validação (crítico)
2. **UI para listar licenças** existentes
3. **UI para revogar licenças**
4. **Enforcement:** cliente não é bloqueado se licença expirar
5. Campo `revoked` ou `status` no model License

**APIs existentes:**
```
POST /api/license/validate
  Body: { licenseKey: string }
  Response: { ok, valid, reason?, expiresAt?, plan?, features?, limits? }

POST /api/license/generate (auth required)
  Body: { clientId?, plan?, expiresInDays, features?, limits? }
  Response: { ok, licenseKey, expiresAt, issuedAt }
```

---

### F) Dashboard e Métricas — MOCK

**O que existe:**
- `KpiCards.tsx` - 6 cards de métricas (HARDCODED)
- `UsersMetrics.tsx` - tabela de usuários (HARDCODED)

**Dados mockados:**
```javascript
// KpiCards - valores fixos
{ title: "Licenças Ativas", value: 247 }
{ title: "Usuários Totais", value: 1842 }
// etc...

// UsersMetrics - lista fixa de 5 usuários
```

**O que falta:**
- Buscar dados reais do banco
- Métricas: usuários ativos 7/30d, campanhas ativas, volume de envios
- Taxa de erro por provedor
- Validações de licença (sucesso/falha)

---

### G) Logs e Rate Limit — PARCIAL

**O que existe:**
- `LicenseValidationLog` com IP, userAgent, timestamp
- Logs são criados em cada validação

**O que falta:**
1. **Rate limit em `/api/license/validate`** - pode ser abusado
2. **Rate limit em `/api/auth/signup`** - pode ser abusado
3. **Rate limit em login** - brute force possível
4. Garantir que logs não vazem PII/secrets

---

### Estrutura de Arquivos Atual

```
portal/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── auth/signup/route.ts
│   │   │   └── license/
│   │   │       ├── generate/route.ts
│   │   │       ├── validate/route.ts
│   │   │       └── verify/route.ts
│   │   ├── dashboard/page.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── credentials/page.tsx
│   │   ├── contacts/page.tsx
│   │   ├── campaigns/page.tsx
│   │   ├── templates/page.tsx
│   │   └── conversations/page.tsx
│   ├── components/
│   │   ├── DashboardHeader.tsx
│   │   ├── KpiCards.tsx
│   │   ├── LicenseGenerator.tsx
│   │   ├── LicenseValidator.tsx
│   │   └── UsersMetrics.tsx
│   └── lib/
│       ├── auth.ts
│       └── prisma.ts
├── prisma/
│   └── schema.prisma
├── scripts/
│   └── seed-admin.ts
└── middleware.ts
```

---

### Prisma Models Existentes

```prisma
enum Role { SUPER_ADMIN, CLIENT_ADMIN, CLIENT_USER }

model User {
  id, email, name?, passwordHash, role, createdAt, updatedAt
  memberships → ClientMember[]
}

model Client {
  id, name, slug, createdAt, updatedAt
  members → ClientMember[]
  licenses → License[]
}

model ClientMember {
  id, userId, clientId, role, createdAt
  @@unique([userId, clientId])
}

model License {
  id, clientId, plan, expiresAt, features(JSON), limits(JSON), token, createdAt, updatedAt
  logs → LicenseValidationLog[]
}

model LicenseValidationLog {
  id, licenseId?, token, valid, reason?, ip?, userAgent?, createdAt
}
```

---

## Plano de Implementação

### FASE 2 — Corrigir Auth/RBAC
- [ ] Adicionar verificação de role no middleware
- [ ] Criar rota `/admin/*` protegida para SUPER_ADMIN
- [ ] Adicionar guards nas APIs
- [ ] Signup: associar usuário a client (ou exigir convite)

### FASE 3 — Admin Operacional
- [ ] Criar `/admin/clients` - CRUD de clientes
- [ ] Criar `/admin/users` - CRUD de usuários
- [ ] Implementar reset de senha
- [ ] Implementar ativar/desativar

### FASE 4 — Licenciamento Completo
- [ ] Adicionar campo `status` ao model License
- [ ] Implementar rate limit na validação
- [ ] Criar UI para listar/revogar licenças
- [ ] Implementar enforcement (verificar licença antes de acessar)

### FASE 5 — Onboarding
- [ ] Persistir credenciais no banco (por client)
- [ ] Validar integração com API externa ou internalizar

### FASE 6 — Dashboard Métricas
- [ ] Criar API para buscar métricas reais
- [ ] Atualizar KpiCards para dados dinâmicos
- [ ] Atualizar UsersMetrics para dados reais

### FASE 7 — Finalização
- [ ] Documentação de env vars
- [ ] Go-live checklist
- [ ] Seed idempotente

---

*Próximo passo: FASE 2 - Implementar RBAC e proteção de rotas*
