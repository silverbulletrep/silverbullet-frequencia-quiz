# Migração da Página /audio-upsell (Passo a Passo)

Este guia descreve como migrar manualmente a página `/audio-upsell` do projeto fonte para o projeto destino:

- Projeto fonte: `D:\aquisicao-vidal\funil_prosperidade`
- Projeto destino: `D:\Funil aquisição -Ultimo - update - bruno\Funil-Aquisicao-Alemanha-main`

## 1) O que será copiado

- Frontend
  - `src/pages/AudioUpsell.jsx`
  - `src/pages/AudioUpsell.module.scss`
  - `img/expert.webp` (imagem usada na página)
  - `UPSELL.md` (texto para legendas do áudio)
- Backend
  - Pasta de áudio: `Audio - Upsell/1224.MP3`
  - Rota estática em `api/app.ts` para servir `/static/audio-upsell`
- Rota do frontend
  - Import e `<Route path="/audio-upsell" element={<AudioUpsell />} />` em `src/App.tsx`

## 2) Preparação de diretórios no destino

Crie as pastas necessárias no projeto destino (se ainda não existirem):

```powershell
New-Item -ItemType Directory -Force "D:\Funil aquisição -Ultimo - update - bruno\Funil-Aquisicao-Alemanha-main\src\pages" | Out-Null
New-Item -ItemType Directory -Force "D:\Funil aquisição -Ultimo - update - bruno\Funil-Aquisicao-Alemanha-main\img" | Out-Null
New-Item -ItemType Directory -Force "D:\Funil aquisição -Ultimo - update - bruno\Funil-Aquisicao-Alemanha-main\Audio - Upsell" | Out-Null
```

## 3) Copiar arquivos do projeto fonte

Execute os comandos abaixo para copiar os arquivos e assets:

```powershell
$src = 'D:\aquisicao-vidal\funil_prosperidade'
$dest = 'D:\Funil aquisição -Ultimo - update - bruno\Funil-Aquisicao-Alemanha-main'

robocopy "$src\src\pages" "$dest\src\pages" AudioUpsell.jsx /R:1 /W:1 /NFL /NDL /NJH /NJS /NC /NS
robocopy "$src\src\pages" "$dest\src\pages" AudioUpsell.module.scss /R:1 /W:1 /NFL /NDL /NJH /NJS /NC /NS
robocopy "$src\img" "$dest\img" expert.webp /R:1 /W:1 /NFL /NDL /NJH /NJS /NC /NS
robocopy "$src" "$dest" UPSELL.md /R:1 /W:1 /NFL /NDL /NJH /NJS /NC /NS
robocopy "$src\Audio - Upsell" "$dest\Audio - Upsell" 1224.MP3 /R:1 /W:1 /NFL /NDL /NJH /NJS /NC /NS
```

Observação: o destino já possui `src/components/CheckoutModal.jsx` e `src/lib/api.ts`, compatíveis com a página.

## 4) Adicionar rota estática no backend

Edite o arquivo `D:\Funil aquisição -Ultimo - update - bruno\Funil-Aquisicao-Alemanha-main\api\app.ts` e adicione o bloco abaixo após os `app.use('/api/...')`:

```ts
app.use(
  '/static/audio-upsell',
  express.static(path.join(process.cwd(), 'Audio - Upsell'), {
    setHeaders: (res) => {
      try { res.setHeader('Access-Control-Allow-Origin', '*') } catch {}
    },
  }),
)
```

Isso expõe os arquivos da pasta `Audio - Upsell` no endpoint: `GET /static/audio-upsell/1224.MP3`.

## 5) Registrar a rota no frontend

Edite `D:\Funil aquisição -Ultimo - update - bruno\Funil-Aquisicao-Alemanha-main\src\App.tsx`:

- Adicione o import:

```ts
import AudioUpsell from "./pages/AudioUpsell";
```

- Adicione a rota dentro de `<Routes>`:

```tsx
<Route path="/audio-upsell" element={<AudioUpsell />} />
```

## 6) Variáveis de ambiente

Defina as variáveis no `.env` do projeto destino (dev):

```env
# Frontend
VITE_API_URL=http://localhost:3007
NEXT_PUBLIC_API_URL=http://localhost:3007
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...   # opcional (habilita Payment Element)

# Backend
STRIPE_SECRET_KEY=sk_live_...
FRONTEND_URL=http://localhost:3002
# Supabase (se for usar rotas de leads)
SUPABASE_URL=https://<sua-instancia>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

- A página utiliza sempre URLs completas via `API_BASE_URL`; evite URLs relativas.

## 7) Subir o backend e validar Gate 0.5

- Iniciar backend em porta livre (ex.: 3007):

```powershell
$env:PORT='3007'
npm run server:dev
```

- Testar health e Stripe:

```powershell
Invoke-WebRequest -Uri http://localhost:3007/api/health -UseBasicParsing | Select-Object -ExpandProperty Content
Invoke-WebRequest -Uri http://localhost:3007/api/stripe/health -UseBasicParsing | Select-Object -ExpandProperty Content
```

- Testar áudio estático:

```powershell
Invoke-WebRequest -Uri http://localhost:3007/static/audio-upsell/1224.MP3 -UseBasicParsing
```

Esperado: status 200 e conteúdo do MP3.

## 8) Subir o frontend e validar a página

- Iniciar o cliente:

```powershell
npm run client:dev
```

- Abrir: `http://localhost:5173/audio-upsell`

Validar:
- Player inicia e mostra logs `[AUDIO] ...` no console.
- CTA inicia checkout (Modal se `VITE_STRIPE_PUBLISHABLE_KEY` definido; caso contrário, redireciona via sessão).
- Legendas aparecem se `UPSELL.md` estiver presente na raiz do projeto destino.

## 9) Checklist final

- API responde JSON válido em `/api/health` e `/api/stripe/health`.
- Áudio acessível em `/static/audio-upsell/1224.MP3`.
- Rota `/audio-upsell` funcionando com `API_BASE_URL` consistente.
- Logs detalhados aparecem em operações críticas.
- Opcional: `npm run check` (typecheck) e `npm run lint` (ajustes de estilo conforme necessário).

## 10) Referências úteis

- Fonte (código atual):
  - Página: [AudioUpsell.jsx](file:///d:/aquisicao-vidal/funil_prosperidade/src/pages/AudioUpsell.jsx)
  - Estilos: [AudioUpsell.module.scss](file:///d:/aquisicao-vidal/funil_prosperidade/src/pages/AudioUpsell.module.scss)
  - API Base: [api.ts](file:///d:/aquisicao-vidal/funil_prosperidade/src/lib/api.ts)
  - Texto legendas: [UPSELL.md](file:///d:/aquisicao-vidal/funil_prosperidade/UPSELL.md)

- Destino (onde aplicar):
  - App: `D:\Funil aquisição -Ultimo - update - bruno\Funil-Aquisicao-Alemanha-main\src\App.tsx`
  - Backend: `D:\Funil aquisição -Ultimo - update - bruno\Funil-Aquisicao-Alemanha-main\api\app.ts`
  - Pasta de áudio: `D:\Funil aquisição -Ultimo - update - bruno\Funil-Aquisicao-Alemanha-main\Audio - Upsell\1224.MP3`

