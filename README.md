# Eventos EMS | Checklist

Sistema web para organização de eventos médicos da regional: cada evento recebe o checklist padrão (pré-evento, dia do evento, pós-evento), com responsável, prazo, observação e registro de quem concluiu cada item. Inclui pontos críticos de controle e o texto de orientações aos staffs.

## Stack

Next.js 15 (App Router) · Postgres (Neon via Vercel Storage) · sessão em cookie assinado (jose) · login por código de 6 dígitos enviado por email (nodemailer, Gmail SMTP).

## Acesso

Só recebe código quem tem email `@ems.com.br` (regra no servidor, em `src/lib/auth.ts`). Exceções: emails listados em `ADMIN_EMAILS` e Gerentes Regionais já cadastrados no banco. O código vale 10 minutos, é de uso único, tem no máximo 5 tentativas e 5 envios por hora por email. A conta é criada sozinha no primeiro acesso, como Staff; o Gerente Regional promove a GD em **Usuários**.

## Variáveis de ambiente

| Variável | Origem |
| --- | --- |
| `DATABASE_URL` | Preenchida automaticamente ao conectar um banco Neon em Storage na Vercel |
| `AUTH_SECRET` | String longa e aleatória (40+ caracteres), definida em Settings > Environment Variables |
| `GMAIL_USER` | Gmail que envia os códigos |
| `GMAIL_APP_PASSWORD` | Senha de aplicativo do Google (Conta Google > Segurança > Senhas de app) |
| `ADMIN_EMAILS` | Emails (separados por vírgula) que entram como Gerente Regional |

O esquema do banco é criado automaticamente na primeira requisição. Para trocar o provedor de email, altere somente `src/lib/email.ts`.

## Template do checklist

Os itens estão em `src/lib/checklist.ts`. Cada evento recebe uma cópia dos itens no momento da criação, então alterar o template não altera eventos já existentes. Ao mudar a lista, incremente `TEMPLATE_VERSAO`.

## Rodar localmente

```bash
cp .env.example .env.local   # preencha DATABASE_URL e AUTH_SECRET; use OTP_DEV_LOG=1 para ver o código no log
npm install
npm run dev
```
