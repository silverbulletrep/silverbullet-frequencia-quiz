# QA Checklist: Persistência de Dados (Email & WhatsApp)

Este checklist guia a verificação da funcionalidade de "gravação" de contatos (Email/WhatsApp) tanto no **Cache Local (Navegador)** quanto no **Banco de Dados (Supabase)**.

## Pré-requisitos
- [ ] Acessar a aplicação em ambiente de desenvolvimento (`http://localhost:3006`) ou produção.
- [ ] Abrir o **DevTools** do navegador (F12 ou `Cmd+Option+I`).
- [ ] Navegar até a aba **Application** > **Local Storage**.
- [ ] Opcional: Limpar a chave `lead_cache_app_espiritualidade` para um teste limpo.

---

## 🧪 Teste 1: Captura de Email

**Ação:**
1. Navegue até `/processing`.
2. Escolha **"E-mail"** no modal de preferência.
3. Insira um email válido (ex: `teste.qa@exemplo.com`) no modal do Resultado e clique em "Continue".

**Verificação Local (Cache):**
- [ ] No DevTools > Application > Local Storage, selecione a URL do site.
- [ ] Procure pela chave: `lead_cache_app_espiritualidade`.
- [ ] Verifique se o valor JSON contém:
  ```json
  "email": "teste.qa@exemplo.com",
  "contact_preference": "email"
  ```

**Verificação Remota (Banco de Dados / Network):**
- [ ] No DevTools > Aba **Network**, filtre por `leads` ou `rpc`.
- [ ] Verifique se houve uma requisição `POST` ou `PATCH` para o Supabase.
- [ ] **Payload esperado:**
  ```json
  {
    "email": "teste.qa@exemplo.com",
    "etapa_funil": "Coleta de Contato" (ou similar),
    "client_uuid": "..."
  }
  ```
- [ ] Se tiver acesso ao Banco de Dados (Supabase), execute a query:
  ```sql
  SELECT * FROM leads WHERE email = 'teste.qa@exemplo.com' ORDER BY created_at DESC LIMIT 1;
  ```

---

## 🧪 Teste 2: Captura de WhatsApp

**Ação:**
1. Recarregue a página ou navegue novamente para `/processing`.
2. Escolha **"WhatsApp"** no modal de preferência.
3. Insira um número válido (ex: `(11) 99999-9999`) no modal do Resultado e clique em "Continue".

**Verificação Local (Cache):**
- [ ] No DevTools > Application > Local Storage > `lead_cache_app_espiritualidade`.
- [ ] Verifique se o valor JSON foi atualizado para conter:
  ```json
  "whatsapp": "5511999999999", (normalizado)
  "contact_preference": "whatsapp"
  ```
  *(Nota: O email anterior pode persistir se não limpou o cache, mas o `contact_preference` deve ser "whatsapp")*

**Verificação Remota (Banco de Dados / Network):**
- [ ] No DevTools > Aba **Network**, verifique se houve nova requisição para o Supabase.
- [ ] **Payload esperado:**
  ```json
  {
    "whatsapp": "5511999999999",
    "contact_preference": "whatsapp"
  }
  ```
- [ ] Verifica no Banco de Dados:
  ```sql
  SELECT * FROM leads WHERE whatsapp = '5511999999999' ORDER BY created_at DESC LIMIT 1;
  ```

---

## 🔍 Pontos de Atenção (Bugs Conhecidos / Comportamentos Esperados)
1. **Sync Assíncrono:** A gravação no banco é feita via `leadSyncService.sync()`, que deve ocorrer logo após a gravação no cache.
2. **Idempotência:** O sistema usa `client_uuid` para identificar o usuário. Se você usar o mesmo navegador, ele deve ATUALIZAR o registro existente no banco, não criar um novo (Upsert). Verifique se o `id` ou `created_at` se mantém e o `updated_at` muda.
