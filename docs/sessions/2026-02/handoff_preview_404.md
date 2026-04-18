# Handoff: Preview Local 404 - Base Path Mismatch

## Contexto
Durante a auditoria de performance da Story 004, identificamos que o comando `npm run preview` resultava em tela branca com erros 404 para todos os arquivos JS/CSS, apesar do build ter sido concluído com sucesso.

## Causa Raiz
O problema é um conflito de configuração no `vite.config.ts`:
- **`outDir: 'dist/main'`**: O build é gerado dentro de uma subpasta.
- **`base: '/main/'`**: Todos os caminhos no HTML são prefixados com `/main/`.

O servidor de preview do Vite sobe apontando **diretamente** para a pasta `dist/main`. Para o servidor, o arquivo `index.js` está na raiz (`/`). No entanto, o browser solicita `/main/assets/index.js` (como instruído pelo HTML). O servidor procura em `dist/main/main/assets/...`, gerando o erro 404.

## Como Testar Localmente (Workarounds)
Para validar o build de produção sem erros de path, utilize um dos comandos abaixo:

### Opção 1: Servir a pasta pai (Padrão Produção)
```bash
npx vite preview --outDir dist
```
*Acesse em:* `http://localhost:4173/main/` (O path `/main/` agora existirá fisicamente).

### Opção 2: Sobrescrever a Base para teste local
```bash
npx vite preview --base /
```
*Acesse em:* `http://localhost:4173/` (O Vite ignorará o prefixo `/main/` nos assets).

## Nota sobre Produção
Em ambientes de deploy real (Hostinger), o servidor geralmente está configurado para mapear o domínio ou subpasta corretamente, portanto o `base: '/main/'` deve permanecer como está para garantir o funcionamento do roteamento e assets no servidor final.
