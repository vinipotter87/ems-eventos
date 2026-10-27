# Eventos EMS | Checklist

Sistema web para organização de eventos médicos da regional: cada evento recebe o checklist padrão (pré-evento, dia do evento, pós-evento), com responsável, prazo, observação e registro de quem concluiu cada item. Inclui pontos críticos de controle e o texto de orientações aos staffs.

## Stack

Next.js 15 (App Router) · Postgres (Neon via Vercel Storage) · sessão em cookie assinado (jose) · senhas com bcrypt.

## Variáveis de ambiente

| Variável | Origem |
| --- | --- |
| `DATABASE_URL` | Preenchida automaticamente ao conectar um banco Neon em Storage na Vercel |
| `AUTH_SECRET` | String longa e aleatória, definida manualmente em Settings > Environment Variables |

O esquema do banco é criado automaticamente na primeira requisição (`CREATE TABLE IF NOT EXISTS`).

## Primeiro acesso

Com o site no ar e sem nenhum usuário cadastrado, a raiz redireciona para `/setup`, onde se cria a conta do Gerente Regional (administrador). A partir dela, em **Usuários**, cadastram-se GDs e staffs. Não há cadastro aberto.

## Template do checklist

Os itens estão em `src/lib/checklist.ts`. Cada evento recebe uma cópia dos itens no momento da criação, então alterar o template não altera eventos já existentes. Ao mudar a lista, incremente `TEMPLATE_VERSAO`.

## Rodar localmente

```bash
cp .env.example .env.local   # preencha DATABASE_URL e AUTH_SECRET
npm install
npm run dev
```
