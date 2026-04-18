🧠 📦 RESUMO DO CACHE DO FUNIL
🔑 Estrutura Central
👉 Tudo gira em torno de:
lead_cache_app_espiritualidade
👉 Gerenciado por:
leadCache.ts

🗄️ ONDE OS DADOS FICAM
1. LocalStorage (PRINCIPAL)
👉 Guarda TODO o lead
Contém:
lead_id (client_uuid)
gênero
idade
problema principal
etapa atual
respostas do quiz (técnico + humanizado)
contato (email/whatsapp)
👉 É a “memória completa” do funil

2. SessionStorage (TRACKING)
persisted_query_tracking
👉 Guarda:
UTMs
fbclid / ttclid
origem do tráfego
👉 Reaplica automaticamente nas rotas

3. Country (Geo)
👉 Salvo em:
LocalStorage
SessionStorage
👉 Ex: BR, PT

🔄 FLUXO DE ACÚMULO (COM ROTAS)
🟢 Entrada
/pt/quiz | /quiz
→ define gênero + inicia sessão

🟡 Identificação
/pt/ge-selection-men | /ge-selection-men
/pt/age-selection-women | /age-selection-women
→ salva idade

🔵 Intenção
/pt/morning-feeling | /morning-feeling
→ salva problema principal

🟣 Conteúdo
/pt/transition | /transition
/pt/vsl | /vsl
→ não altera dados (só consumo)

🔴 Diagnóstico (CORE)
/pt/quiz-step-1 | /quiz-step-1
/pt/quiz-step-2 | /quiz-step-2
/pt/quiz-step-3 | /quiz-step-3
/pt/quiz-step-4 | /quiz-step-4
/pt/quiz-step-5 | /quiz-step-5
/pt/quiz-step-6 | /quiz-step-6
👉 adiciona:
respostas técnicas (steps)
respostas humanizadas (qa_by_step)

⚙️ Processamento
/pt/processing | /processing
→ atualiza etapa do funil

🟠 Resultado
/pt/result | /result
→ salva:
email
whatsapp
preferência de contato

💰 Monetização
/pt/offer | /offer
/pt/checkout | /checkout
👉 consome TODOS os dados:
preenche checkout
envia UTMs
personaliza oferta

🚀 Maximização
/pt/upsell | /upsell

🧠 COMO USAR OS DADOS
🔥 Método padrão:
const data = leadCache.getAll();

📊 O que você pode acessar:
data.genero
data.idade
data.problema_principal
data.respostas_quiz
data.whatsapp
data.etapa_atual_do_funil

💣 DIFERENCIAL DO SISTEMA
👉 Você não tem só um funil
Você tem:
um perfil psicológico completo do lead sendo construído em tempo real

🧠 RESUMO FINAL (1 linha)
👉 Tudo que o lead faz é acumulado em um único objeto persistente no localStorage, enriquecido ao longo do funil e acessível instantaneamente via leadCache.getAll().

