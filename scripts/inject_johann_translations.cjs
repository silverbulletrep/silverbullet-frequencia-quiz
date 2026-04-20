const fs = require('fs')

const dePath = '/Users/brunogovas/Projects/Silver Bullet/Projetos/Funil_Quiz_2.0/SILVER-BULLET-AQUISICAO-FREQUENCIA/src/i18n/locales/de/translation.json'
const ptPath = '/Users/brunogovas/Projects/Silver Bullet/Projetos/Funil_Quiz_2.0/SILVER-BULLET-AQUISICAO-FREQUENCIA/src/i18n/locales/pt/translation.json'

const de = JSON.parse(fs.readFileSync(dePath, 'utf8'))
const pt = JSON.parse(fs.readFileSync(ptPath, 'utf8'))

const ptJohann = {
  "openings": {
    "age_selection": [
      "A tua faixa etária é crucial para percebermos a profundidade do bloqueio.",
      "Podes dizer-me a tua idade para continuarmos?"
    ],
    "morning": [
      "Preciso de saber o que precisas de resolver, só assim te consigo ajudar...",
      "Podemos continuar ou tens alguma dúvida?"
    ],
    "transition": [
      "Assiste a este vídeo curto!",
      "Precisas de entender como os bloqueios matam a nossa felicidade.",
      "Queres continuar ou tens alguma dúvida?"
    ],
    "quiz_step": [
      "Lutar sozinho há tantos anos desgasta qualquer um.",
      "Vamos terminar este diagnóstico e resolver isso juntos, sim ou não?"
    ],
    "processing": [
      "Espere! Aconteceu algo? Esta é a parte mais importante... onde mostramos o seu Resultado.",
      "Inclusive, já está pronto... clique no botão abaixo e veja!"
    ],
    "fim": [
      "Vi o teu exame e sei que tens carregado o mundo nas costas.",
      "Posso mostrar-te exatamente o que te falta, sim ou não?"
    ],
    "checkout": [
      "O teu exame disparou um alerta raro.",
      "Não precisas de continuar a sofrer em silêncio.",
      "Queres mudar isso hoje, sim ou não?"
    ],
    "audio_upsell": [
      "Muitos parabéns pela tua conquista! 🏆",
      "É fundamental que ouças o áudio até ao fim agora para selar a tua correção vibracional.",
      "Podemos continuar, sim ou não?"
    ],
    "audio_upsell_pos": [
      "Rápido — queres acelerar isto agora ou preferes ir mais devagar?"
    ],
    "recupera": [
      "Você chegou até aqui e parou exatamente no último passo.",
      "Não estou aqui pra te pressionar — mas preciso te perguntar uma coisa com sinceridade:",
      "O que aconteceu? Me conta o que travou."
    ],
    "suporte": [
      "Olá, estou aqui para ajudar! 🤝",
      "Qual é a dúvida que te impede de avançar neste momento?"
    ],
    "vsl_abandon": [
      "<b>Seu Exame Vibracional Está Pronto!</b>",
      "Vamos Agora descobrir: <b>O que está a travar a sua Vida</b>",
      "✓ Em que os seus Bloqueios estão a atrapalhar as suas manifestações<br/>✓ E vamos Desbloquear tudo isso para sempre"
    ]
  },
  "ui": {
    "button_vsl_abandon": "Pressiona o botão em baixo para continuar:",
    "agente_1_fallback_1": [
      "Espera… posso mostrar-te uma coisa rápida antes de saíres.",
      "O abandono é o reflexo da rejeição do bloqueio energético pela mudança; o peso no peito é o bloqueio a vencer.",
      "Leva apenas 30 segundos e pode mudar tudo — queres começar?"
    ],
    "agente_1_fallback_2": [
      "Essa fuga não é tua. É o cansaço acumulado de anos a puxar-te para trás de novo.",
      "⚠️ Posso mostrar-te onde a tua energia está a vazar, sim ou não?"
    ],
    "mentor_tracking": "**Não se preocupe, estou a acompanhar o seu exame pessoalmente!**",
    "connection_error_short": "Desculpe, tive um breve problema de conexão. Pode repetir?",
    "connection_error_critical": "🛑 O N8N respondeu, mas ocorreu um erro crítico de React no Chat ao exibir. Pressione F12 e veja no Console.",
    "button_offer": "Aproveitar Oferta Agora ➔",
    "button_continue": "Continuar de onde parei ➔",
    "placeholder": "Mensagem",
    "online": "online"
  }
}

const deJohann = {
  "openings": {
    "age_selection": [
      "Ihre Altersgruppe ist entscheidend, um die Tiefe der Blockade zu verstehen.",
      "Können Sie mir Ihr Alter verraten, damit wir fortfahren können?"
    ],
    "morning": [
      "Ich muss wissen, was Sie lösen müssen, nur so kann ich helfen...",
      "Können wir weitermachen oder haben Sie Fragen?"
    ],
    "transition": [
      "Schauen Sie sich dieses kurze Video an!",
      "Sie müssen verstehen, wie Blockaden unser Glück zerstören.",
      "Möchten Sie fortfahren oder haben Sie noch Fragen?"
    ],
    "quiz_step": [
      "Nach all den Jahren alleine zu kämpfen, ermüdet jeden.",
      "Lassen Sie uns diese Diagnose beenden und das gemeinsam lösen, ja oder nein?"
    ],
    "processing": [
      "Warten Sie! Ist etwas passiert? Dies ist der wichtigste Teil... wo wir Ihnen das Ergebnis zeigen.",
      "Es ist eigentlich schon bereit... klicken Sie auf die Schaltfläche unten und sehen Sie nach!"
    ],
    "fim": [
      "Ich habe Ihre Prüfung gesehen und weiß, dass Sie die Welt auf Ihren Schultern getragen haben.",
      "Kann ich Ihnen genau zeigen, was Ihnen fehlt, ja oder nein?"
    ],
    "checkout": [
      "Ihre Prüfung hat einen seltenen Alarm ausgelöst.",
      "Sie müssen nicht länger schweigend leiden.",
      "Möchten Sie das heute ändern, ja oder nein?"
    ],
    "audio_upsell": [
      "Herzlichen Glückwunsch zu Ihrem Erfolg! 🏆",
      "Es ist wichtig, dass Sie den Ton jetzt zu Ende hören, um Ihre energetische Korrektur zu besiegeln.",
      "Können wir fortfahren, ja oder nein?"
    ],
    "audio_upsell_pos": [
      "Schnell — möchten Sie das jetzt beschleunigen oder lieber langsamer angehen?"
    ],
    "recupera": [
      "Sie sind bis hierher gekommen und haben genau beim letzten Schritt angehalten.",
      "Ich bin nicht hier, um Sie unter Druck zu setzen — aber ich muss Sie etwas ehrlich fragen:",
      "Was ist passiert? Erzählen Sie mir, was Sie blockiert hat."
    ],
    "suporte": [
      "Hallo, ich bin hier, um zu helfen! 🤝",
      "Welche Frage hält Sie gerade davon ab, weiterzumachen?"
    ],
    "vsl_abandon": [
      "<b>Ihr Vibrationsplan ist fertig!</b>",
      "Lassen Sie uns jetzt herausfinden: <b>Was Ihr Leben blockiert</b>",
      "✓ Wo Ihre Blockaden Ihre Manifestationen behindern<br/>✓ Und wir werden all das für immer auflösen"
    ]
  },
  "ui": {
    "button_vsl_abandon": "Klicken Sie auf den Button unten, um fortzufahren:",
    "agente_1_fallback_1": [
      "Warte… kann ich dir schnell etwas zeigen, bevor du gehst.",
      "Der Abbruch spiegelt die Ablehnung der energetischen Blockade gegen Veränderung wider; die Schwere auf der Brust ist die Blockade, die es zu überwinden gilt.",
      "Es dauert nur 30 Sekunden und kann alles verändern — möchtest du beginnen?"
    ],
    "agente_1_fallback_2": [
      "Diese Flucht gehört nicht zu dir. Es ist die aufgestaute Müdigkeit jahrelanger Rückschläge.",
      "⚠️ Kann ich dir zeigen, wo deine Energie entweicht, ja oder nein?"
    ],
    "mentor_tracking": "**Machen Sie sich keine Sorgen, ich verfolge Ihre Prüfung persönlich!**",
    "connection_error_short": "Entschuldigung, ich hatte ein kurzes Verbindungsproblem. Können Sie das wiederholen?",
    "connection_error_critical": "🛑 N8N hat geantwortet, aber beim Anzeigen des Chats ist ein kritischer React-Fehler aufgetreten.",
    "button_offer": "Angebot jetzt nutzen ➔",
    "button_continue": "Dort weitermachen, wo ich aufgehört habe ➔",
    "placeholder": "Nachricht",
    "online": "online"
  }
}

pt.johannChat = ptJohann
de.johannChat = deJohann

fs.writeFileSync(dePath, JSON.stringify(de, null, 2))
fs.writeFileSync(ptPath, JSON.stringify(pt, null, 2))

console.log('JohannChat translations successfully injected.')
