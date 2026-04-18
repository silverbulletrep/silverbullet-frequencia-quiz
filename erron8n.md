📄 Erro: node execution output incorrect data
Descrição do erro

Mensagem apresentada no n8n:

Error: node execution output incorrect data


Esse erro indica que um nó do workflow foi executado com sucesso, porém o payload retornado por ele está fora do formato esperado pelo n8n.

Não é erro de infraestrutura, Node.js ou do n8n em si.
É um problema exclusivamente de formatação da resposta gerada por um nó ou integração.

O que isso significa na prática

O n8n exige que todo nó retorne dados no seguinte padrão:

[
  {
    "json": { ...dados }
  }
]


Se o nó retorna qualquer coisa diferente disso, o n8n interrompe o fluxo e lança esse erro.

Causas mais comuns
1. API retornando payload inesperado

A API chamada pode estar retornando:

string pura

HTML de erro

null

objeto JSON sem o wrapper correto

array fora do padrão do n8n

Exemplo inválido:

{ "success": true }


Formato esperado:

[
  {
    "json": { "success": true }
  }
]

2. Nó “Code” com retorno incorreto

Se existir um nó JavaScript no fluxo, retornos como estes causam erro:

return "ok"

return { status: "done" }


Forma correta:

return [{ json: { status: "done" } }]

3. Falha na integração OpenAI / HTTP

Pelo log apresentado, há referência ao módulo:

n8n-core/openai


Isso indica que:

um nó de integração (OpenAI ou HTTP Request) recebeu resposta inesperada

o próximo nó tentou processar um payload inválido

o workflow falhou por inconsistência de dados

Como identificar a origem

Verificações recomendadas:

Identificar qual nó está imediatamente antes do erro

Inspecionar o output bruto dele no modo debug do n8n

Validar:

tipo do retorno

estrutura JSON

se há mensagens de erro vindas da API

Ações para correção

Garantir que toda API retorne JSON válido

Converter respostas externas para o formato esperado

Adicionar tratamento de erro antes de repassar dados

Se usar nó “Code”, garantir retorno exatamente assim:

return [{ json: resposta }];

Resumo técnico

Problema:
Payload retornado por um nó não está no padrão do n8n.

Natureza do erro:
Erro de integração / formatação de dados.

Solução:
Normalizar a resposta da API ou do nó Code para o formato obrigatório do n8n.

Se quiser, posso analisar o workflow específico e indicar exatamente qual nó está causando o problema e como corrigir.