# Deploy ClickPro na Vercel com SSL do Supabase

Este guia detalha como configurar o ClickPro para rodar na Vercel com conexão segura SSL ao banco de dados Supabase (PostgreSQL).

## Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Projeto Supabase existente
- Repositório Git com o código do ClickPro

## Passo a Passo

### 1. Baixar o Certificado SSL do Supabase

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** → **Database**
4. Role até a seção **Connection string** → **SSL Certificate**
5. Clique em **Download Certificate** ou copie o conteúdo do certificado

O certificado terá o seguinte formato:
```
-----BEGIN CERTIFICATE-----
MIIDxDCCAqygAwIBAgIUbLxMod62P2ktCiAkxnKJwtE9VPYwDQYJKoZIhvcNAQEL
...
-----END CERTIFICATE-----
```

> **Nota:** O certificado Supabase Root 2021 CA já está incluído em `certs/supabase-prod-ca.crt` neste repositório.

### 2. Adicionar o Certificado como Secret na Vercel

1. Acesse seu projeto na [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em **Settings** → **Environment Variables**
3. Adicione uma nova variável:
   - **Name:** `SUPABASE_CA_CERT`
   - **Value:** Cole o conteúdo completo do certificado (incluindo `-----BEGIN CERTIFICATE-----` e `-----END CERTIFICATE-----`)
   - **Environments:** Selecione `Production`, `Preview` e `Development` conforme necessário
4. Clique em **Save**

### 3. Configurar o Build Command

O script `scripts/setup-ssl-cert.sh` grava o certificado durante o build. Configure na Vercel:

1. Vá em **Settings** → **General** → **Build & Development Settings**
2. Configure o **Build Command**:
   
   Para esta aplicação Node.js (sem etapa de build adicional):
   ```bash
   npm run vercel-build
   ```
   
   Se houver outras etapas de build (ex: TypeScript, React, etc.):
   ```bash
   bash scripts/setup-ssl-cert.sh && npm run build
   ```

### 4. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis de ambiente na Vercel:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `SUPABASE_CA_CERT` | (conteúdo do certificado) | Certificado SSL do Supabase |
| `PGSSLROOTCERT` | `/vercel/path0/certs/prod-ca.crt` | Caminho do certificado no runtime |
| `DATABASE_URL` | `postgresql://...?sslmode=verify-full` | Connection string do Supabase |

#### Exemplo de DATABASE_URL:
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres?sslmode=verify-full
```

### 5. Testar a Conexão Localmente (Opcional)

Para testar a conexão SSL localmente com `psql`:

```bash
# Exportar variáveis
export PGSSLROOTCERT="./certs/supabase-prod-ca.crt"
export DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres?sslmode=verify-full"

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

3. Verifique nos logs de build que o certificado foi gravado:
   ```
   Gravando certificado SSL do Supabase em /vercel/path0/certs/prod-ca.crt...
   Certificado SSL configurado com sucesso!
   PGSSLROOTCERT configurado: /vercel/path0/certs/prod-ca.crt
   ```

## Diagnóstico de Problemas

### Erro: "certificate verify failed"

- Verifique se `SUPABASE_CA_CERT` está corretamente configurado
- Confirme que `PGSSLROOTCERT` aponta para o caminho correto
- Verifique se o certificado não está corrompido (deve ter exatamente o formato PEM)

### Erro: "connection refused"

- Verifique se a connection string está correta
- Confirme que o IP da Vercel não está bloqueado no Supabase

### Testar certificado manualmente

```bash
# Verificar se o certificado é válido
openssl x509 -in certs/supabase-prod-ca.crt -text -noout

# Testar conexão SSL
openssl s_client -connect aws-0-[region].pooler.supabase.com:5432 -CAfile certs/supabase-prod-ca.crt
```

## Estrutura de Arquivos

```
clickpro/
├── certs/
│   └── supabase-prod-ca.crt    # Certificado CA do Supabase (incluído)
├── scripts/
│   └── setup-ssl-cert.sh       # Script de build para Vercel
├── package.json                 # Script vercel-build configurado
└── .env.example                 # Exemplo de variáveis de ambiente
```

## Referências

- [Documentação SSL do Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres#ssl-connections)
- [Variáveis de Ambiente na Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
- [PostgreSQL SSL Connection](https://www.postgresql.org/docs/current/libpq-ssl.html)
