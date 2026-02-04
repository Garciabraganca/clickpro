# Deploy ClickPro Portal na Vercel com SSL do Supabase

Este guia detalha como configurar o ClickPro Portal para rodar na Vercel com conexão segura SSL ao banco de dados Supabase (PostgreSQL).

## Arquitetura Serverless

O Vercel utiliza funções serverless que não persistem arquivos do build no runtime. Para garantir que o certificado SSL esteja disponível:

1. O certificado está incluído no repositório em `portal/certs/supabase-prod-ca.crt`
2. O `next.config.ts` usa `outputFileTracingIncludes` para incluir o cert no bundle
3. No runtime, o certificado fica disponível em `/var/task/certs/supabase-prod-ca.crt`

## Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Projeto Supabase existente
- Repositório Git com o código do ClickPro

## Passo a Passo

### 1. Certificado SSL (Já Incluído)

O certificado Supabase Root 2021 CA já está incluído no repositório em:
- `portal/certs/supabase-prod-ca.crt`

> **Nota:** Se precisar atualizar o certificado, baixe do [Dashboard do Supabase](https://app.supabase.com) em **Settings** → **Database** → **SSL Certificate**.

### 2. Configurar Variáveis de Ambiente na Vercel

Adicione as seguintes variáveis de ambiente na Vercel (**Settings** → **Environment Variables**):

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `PGSSLROOTCERT` | `/var/task/certs/supabase-prod-ca.crt` | Caminho do certificado no runtime serverless |
| `DATABASE_URL` | `postgresql://...?sslmode=verify-full&pgbouncer=true` | Connection string do Supabase |

### 3. Formato da DATABASE_URL

Para **conexão direta** (porta 5432):
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres?sslmode=verify-full
```

Para **Supavisor/Pooler** (porta 6543) - **recomendado para serverless**:
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=verify-full&pgbouncer=true
```

> **Importante:** Para pooler na porta 6543, sempre inclua `pgbouncer=true` na connection string.

### 4. Build Command (Padrão)

O build command padrão do Next.js funciona sem alterações:
```bash
npm run build
```

O certificado é incluído automaticamente no bundle via `outputFileTracingIncludes` no `next.config.ts`.

### 5. Testar a Conexão Localmente (Opcional)

Para testar a conexão SSL localmente com `psql`:

```bash
# Exportar variáveis
export PGSSLROOTCERT="./portal/certs/supabase-prod-ca.crt"
export DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=verify-full&pgbouncer=true"

# Testar conexão
psql "$DATABASE_URL" -c "SELECT version();"
```

### 6. Deploy e Verificação

1. Faça commit das alterações:
   ```bash
   git add .
   git commit -m "Configurar SSL para Supabase na Vercel"
   git push
   ```

2. A Vercel vai iniciar o deploy automaticamente

3. Verifique nos logs que a aplicação conecta ao banco de dados sem erros de certificado

## Diagnóstico de Problemas

### Erro: "certificate verify failed"

- Verifique se `PGSSLROOTCERT=/var/task/certs/supabase-prod-ca.crt` está configurado
- Confirme que o certificado existe em `portal/certs/supabase-prod-ca.crt`
- Verifique se o `next.config.ts` inclui `outputFileTracingIncludes`

### Erro: "connection refused" ou timeout

- Se usando porta 6543 (pooler), adicione `pgbouncer=true` na connection string
- Verifique se a connection string está correta
- Confirme que o IP da Vercel não está bloqueado no Supabase

### Erro: "prepared statement already exists"

- Este erro ocorre ao usar pooler sem `pgbouncer=true`
- Adicione `pgbouncer=true` na DATABASE_URL

### Testar certificado manualmente

```bash
# Verificar se o certificado é válido
openssl x509 -in portal/certs/supabase-prod-ca.crt -text -noout

# Testar conexão SSL
openssl s_client -connect aws-0-[region].pooler.supabase.com:5432 -CAfile portal/certs/supabase-prod-ca.crt
```

## Estrutura de Arquivos

```
clickpro/
├── portal/
│   ├── certs/
│   │   └── supabase-prod-ca.crt    # Certificado CA do Supabase (incluído no bundle)
│   ├── next.config.ts               # Configuração com outputFileTracingIncludes
│   └── .env.example                 # Exemplo de variáveis de ambiente
└── docs/
    └── vercel-supabase-ssl.md       # Este guia
```

## Referências

- [Documentação SSL do Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres#ssl-connections)
- [Next.js Output File Tracing](https://nextjs.org/docs/app/api-reference/next-config-js/output#caveats)
- [Variáveis de Ambiente na Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
- [PostgreSQL SSL Connection](https://www.postgresql.org/docs/current/libpq-ssl.html)
