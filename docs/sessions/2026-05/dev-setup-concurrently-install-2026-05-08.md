<!--
Session handoff for local dev startup troubleshooting.
Captures the root cause, validation performed, and remaining environment configuration warnings.
-->

# Handoff: local dev startup fix for missing concurrently

Data: 2026-05-08 02:04:09 -03

Projeto: `silverbullet-frequencia-quiz`

## Objetivo

Restaurar a execucao de `npm run dev` apos a falha `sh: concurrently: command not found`.

## Causa raiz

O projeto ja declarava `concurrently` em `devDependencies`, mas o binario local `node_modules/.bin/concurrently` nao existia. O problema era instalacao ausente ou incompleta de dependencias, nao erro em `package.json`.

## Acao executada

- Rodado `npm ci` na raiz do projeto.
- Validado que `node_modules/.bin/concurrently` passou a existir.
- Validado `npm run dev`.

## Resultado

- O erro original de `concurrently` foi resolvido.
- O app iniciou normalmente fora do sandbox:
- Frontend Vite em `http://localhost:3006/`
- Backend com log `Server ready on port 3005`

## Avisos remanescentes

- Stripe sem chave secreta valida ou ausente.
- Supabase sem `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` validos.

Esses avisos nao impedem o boot do processo, mas bloqueiam integracoes dependentes de ambiente.
