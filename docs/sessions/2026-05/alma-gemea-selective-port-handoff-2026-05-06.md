<!--
Handoff de auditoria e port seletivo da feature Alma Gemea.
Responsabilidades: registrar base, comparacao com origin/main, decisoes de inclusao/exclusao e validacoes executadas.
-->

# Handoff: Port Seletivo Alma Gemea

Data: 2026-05-06

Branch de trabalho: `port/alma-gemea-from-07a192a`

Base protegida: `base/alma-gemea-port-c76ee1d`

Commit base: `c76ee1d`

Remoto auditado: `origin/main` em `07a192a`

Mensagem do remoto: `fix: corrige CTA alma-gemea e enriquece payload de tracking com lead_id e lang`

## Objetivo

Atualizar a base local apenas com as atualizacoes e feats do fluxo `/alma-gemea`, sem trazer regressions/remocoes do remoto em outras areas do frontend.

## Resultado

Nenhuma alteracao de codigo fonte foi aplicada.

A auditoria mostrou que a base atual `c76ee1d` ja contem a implementacao funcional de Alma Gemea presente em `origin/main@07a192a`. As diferencas nos arquivos centrais de Alma Gemea sao essencialmente whitespace/formatacao, enquanto as diferencas funcionais restantes do remoto pertencem a outras features ou removeriam funcionalidades locais.

## Dentro Do Escopo

Arquivos auditados como parte do fluxo Alma Gemea:

- `src/pages/AlmaGemea.tsx`
- `src/components/AliceChat/AliceChat.tsx`
- `src/components/AliceChat/AliceChat.module.scss`
- `src/lib/funnelTracker.ts`
- `src/i18n/locales/pt/translation.json`
- `src/i18n/locales/de/translation.json`
- `src/App.tsx`
- assets publicos usados pelo fluxo em `public/Audio/alice`, `public/img/tarot-deck` e `public/videos`

## Atualizacoes Confirmadas Na Base

- Rota `/alma-gemea` ja existe em `src/App.tsx`.
- Header ja fica oculto em `/alma-gemea`.
- `AlmaGemea.tsx` ja possui o gate de interacao, preload de audio, wake lock, transicao cinematografica e lazy load de `AliceChat`.
- `AliceChat.tsx` ja possui o fluxo de leitura com nome, tres tiragens, telefone/video, CTA final e suporte `pt`/`de`.
- `AliceChat.tsx` ja envia `lead_identified` com payload enriquecido contendo `name`, `lead_id`, `lang` e `funnel_origin`.
- `AliceChat.tsx` ja sincroniza `lead_id` entre `funnelTracker` e `leadCache`.
- `funnelTracker.ts` ja possui `ALMA_GEMEA_FUNNEL_ID`, `ALMA_GEMEA_STEPS` e `leadIdentifiedCustom`.
- As chaves `alma_gemea` dos JSONs `pt` e `de` estao iguais entre a base e o remoto.
- Os assets de runtime do fluxo ja existem em `public`, incluindo audios da Alice, cartas de tarot e videos `AD-10.webm`/`AD-10-DE.webm`.

## Ficou De Fora

Nao foi aplicado o diff completo de `origin/main@07a192a`, porque ele traria mudancas fora do escopo Alma Gemea:

- Remocao da rota e import de `/fim-desconto` em `src/App.tsx`.
- Remocao de `"/fim-desconto"` da lista de paths sem header.
- Remocao dos eventos `discount_opened` e `surprise_opened` em `src/lib/funnelTracker.ts`.
- Remocao de `customEvent` em `src/lib/funnelTracker.ts`, usado pelos modais de retencao.
- Alteracoes grandes nos JSONs `pt` e `de` fora da chave `alma_gemea`.
- Remocoes de componentes de checkout, desconto, surpresa e retencao.
- Delecoes em `docs`, `scripts`, `supabase`, imagens globais e testes nao relacionados ao fluxo Alma Gemea.
- Pasta `tarot-json-master`, porque os assets de runtime equivalentes ja existem em `public` e nao ha referencia direta nova necessaria no codigo atual.

## Evidencias Da Auditoria

Comando usado para confirmar remoto local:

```bash
git rev-parse --short origin/main
git log --oneline -1 origin/main
```

Resultado:

```text
07a192a
07a192a fix: corrige CTA alma-gemea e enriquece payload de tracking com lead_id e lang
```

Comparacao das chaves `alma_gemea`:

```text
src/i18n/locales/pt/translation.json alma_gemea equal
src/i18n/locales/de/translation.json alma_gemea equal
```

Diff funcional ignorando whitespace:

```text
src/pages/AlmaGemea.tsx: sem alteracao funcional necessaria
src/components/AliceChat/AliceChat.tsx: sem alteracao funcional necessaria
src/components/AliceChat/AliceChat.module.scss: sem alteracao funcional necessaria
src/i18n/locales/pt/translation.json: diferencas fora de alma_gemea
src/i18n/locales/de/translation.json: diferencas fora de alma_gemea
src/lib/funnelTracker.ts: remoto remove eventos/metodo usados por retencao
src/App.tsx: remoto remove /fim-desconto
```

## Validacao Executada

Busca por conflict markers:

```bash
rg -n "^(<<<<<<<|=======|>>>>>>>)" src public tests docs
```

Resultado: nenhum conflict marker encontrado.

Typecheck:

```bash
npm run typecheck
```

Resultado: passou.

Build:

```bash
npm run build
```

Resultado: passou.

Observacoes do build:

- O build exibiu apenas warnings existentes de Sass `@import` deprecated.
- O build tambem exibiu avisos existentes de imports dinamicos/estaticos duplicados no Vite.
- Nenhum erro de TypeScript, bundling ou asset bloqueou a build.

## Estado Final

O codigo base foi preservado como estado base e validado.

O port seletivo de Alma Gemea foi considerado concluido sem alteracoes de codigo, porque a implementacao funcional de Alma ja estava presente na base atual. A decisao segura foi nao aplicar o remoto completo para evitar regressao das features locais de checkout, desconto, presente surpresa, `/fim-desconto` e tracking customizado.
