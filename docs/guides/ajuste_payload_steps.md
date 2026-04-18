Preciso que você corrija o payload nas paginas nas rotas:

/quiz-step-1
/quiz-step-2
/quiz-step-3
/quiz-step-4
/quiz-step-5
/quiz-step-6

todos os ajustes envolvem a forma com que enviamos o payload de evento para o nosso endpoint nessas paginas

o corpo do payload deve ser exatamente como no exemplo mostrado abaixo, vou citar os que estão sendo enviados corretamente e oque precisamos ajustar no payload:

{
  "event": "desire_selected", --> ok
  "funnel_id": "quiz_frequencia_01",--> ok
  "lead_id": "lead_x",--> ok
  "session_id": "sess_x",--> devemos puxar ele do localstorage hoje ele está sendo enviado como null isso é pesimo, veja como os eventos puxam do local estorage e faça as paginas listadas fazerem o mesmo.
  "step": {
    "id": "checkout_exemplo", --> hoje está sendo enviado com null, isso é pessimo, esse id deve ser a rota da pagina, 
    "index": 3, --> o index não está sendo enviado isso é extremente critico... precisamos seguir a seguinte rota: 

/quiz-step-1 deve enviar "index":7
/quiz-step-2 deve enviar "index":8
/quiz-step-3 deve enviar "index":9
/quiz-step-4 deve enviar "index":10
/quiz-step-5 deve enviar "index":11
/quiz-step-6 deve enviar "index":12

   "name": "Checkout exemplo" --> coleque questionario 1 para o /quiz-step-1, questionario 2 para o /quiz-step-2, etc.
  },
  "attributes": { --> o formato atual está perfeito!! não mexa.
    "question": "Qual é o teu maior objetivo neste momento?",
    "response": [
      "Perder peso sem dietas restritivas",
      "Reduzir a barriga sem ginásio"
    ]
  },
  "metadata": {
    "referrer": "https://facebook.com",--> deixe como está no payload do codigo atual
    "utm": {
      "source": "facebook",--> deixe como está no payload do codigo atual
      "campaign": "vsl_test_01" --> deixe como está no payload do codigo atual
    },
    "user_agent": "Mozilla/5.0",--> deixe como está no payload do codigo atual
    "country": "BR" --> o country deve ser puxado do localstorage
  },
  "timestamp": "2026-01-31T12:00:00.000Z"
}

Lembrando que estamos enviado o payload corretamente nessas paginas, apenas precisamos fazer esses pequenos ajustes... 