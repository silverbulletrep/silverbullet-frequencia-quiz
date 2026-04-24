{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "producao",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [
        -128,
        112
      ],
      "id": "bdb78dc5-7241-4c52-9937-449a98d86084",
      "name": "Webhook",
      "webhookId": "88503f52-b7b0-4e56-876a-4319362a8c2c"
    },
    {
      "parameters": {
        "sendTo": "={{ $json.body.data.buyer.email }}",
        "subject": "PLANO VIBRACIONAL: A sua jornada começa exatamente aqui.",
        "message": "=<!DOCTYPE html>\n<html>\n<head>\n <meta charset=\"UTF-8\">\n</head>\n<body style=\"margin:0; padding:0; background-color:#f4f4f7;\">\n <center>\n  <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color:#f4f4f7; padding:30px 10px;\">\n   <tr>\n    <td align=\"center\">\n     <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:600px; background-color:#ffffff; border-radius:16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow:hidden;\">\n      \n      <tr>\n       <td height=\"8\" style=\"background: linear-gradient(90deg, #1a2238, #d4af37, #1a2238);\"></td>\n      </tr>\n\n      <tr>\n       <td style=\"padding:40px 30px;\">\n        \n        <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\">\n         <tr>\n          <td width=\"64\">\n           <img src=\"https://fundaris.space/expert-pt.webp\" width=\"64\" height=\"64\" style=\"border-radius:50%; display:block; border: 2px solid #1a2238;\" alt=\"Especialista\">\n          </td>\n          <td style=\"padding-left:16px;\">\n           <p style=\"margin:0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:18px; font-weight:700; color:#1a2238; letter-spacing:-0.5px;\">Protocolo Ativado 👋</p>\n           <p style=\"margin:0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size:14px; color:#666666; text-transform: uppercase; letter-spacing:1px;\">Sintonização de Campo em Curso</p>\n          </td>\n         </tr>\n        </table>\n\n        <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-top:30px;\">\n         <tr>\n          <td style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:16px; line-height:1.6; color:#1a1a1a;\">\n           <p style=\"margin-bottom:20px;\">\n            Esqueça a \"sorte\". Como físico, garanto-lhe: o que a maioria chama de coincidência é, na verdade, uma <strong>coordenação exata de frequências.</strong>\n           </p>\n           <p style=\"margin-bottom:20px;\">\n            Se os seus desejos ainda não se manifestaram, não é porque não os merece. É porque o seu \"dial\" vibracional estava desalinhado com o alvo. <strong>A sua chegada aqui interrompe esse ciclo de falhas.</strong>\n           </p>\n          </td>\n         </tr>\n        </table>\n\n        <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color:#1a2238; border-radius:12px; margin:10px 0;\">\n         <tr>\n          <td style=\"padding:25px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;\">\n           <p style=\"margin:0; font-size:18px; line-height:1.5; color:#ffffff;\">\n            Estamos prestes a <strong style=\"color:#f5c76a;\">forçar a sua frequência</strong> ao nível exato da vida que escolheu. Quando o campo está coerente, a manifestação não é uma possibilidade — <strong>é uma inevitabilidade matemática.</strong>\n           </p>\n          </td>\n         </tr>\n        </table>\n\n        <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-top:25px;\">\n         <tr>\n          <td style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:15px; line-height:1.7; color:#444444;\">\n           <p>\n            Para garantir que a sua trajetória seja impecável, a minha <strong>equipa de acompanhamento técnico</strong> já está a postos. Eles vão monitorizar e auxiliar a sua evolução para que nenhum ruído externo interfira na sua nova assinatura vibracional.\n           </p>\n          </td>\n         </tr>\n        </table>\n\n        <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-top:35px;\">\n         <tr>\n          <td align=\"center\">\n           <a href=\"https://app.fundaris.space/pt/welcome?email={{ $json.body.data.buyer.email }}\" style=\"display:inline-block; padding:20px 45px; background-color:#d4af37; color:#1a2238; text-decoration:none; font-family: 'Helvetica Neue', Arial, sans-serif; font-weight:800; font-size:17px; border-radius:8px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(212,175,55,0.3);\">\n            EFETUAR LOGIN E ATIVAR\n           </a>\n           <p style=\"margin-top:22px; font-family: Arial, sans-serif; font-size:12px; color:#999999; text-transform: uppercase; letter-spacing:2px;\">\n            O Ponto de Não Retorno da sua Realidade\n           </p>\n          </td>\n         </tr>\n        </table>\n\n       </td>\n     </tr>\n    </table>\n    \n    <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:600px; margin-top:20px;\">\n     <tr>\n      <td align=\"center\" style=\"font-family: Arial, sans-serif; font-size:11px; color:#bbbbbb; text-transform: uppercase;\">\n       Fundaris Space • Engenharia de Frequências • 2026\n      </td>\n     </tr>\n    </table>\n\n    </td>\n   </tr>\n  </table>\n </center>\n</body>\n</html>",
        "options": {}
      },
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "position": [
        992,
        144
      ],
      "id": "71fc1457-be43-4938-af9a-e7f59ad1c00d",
      "name": "Send a message",
      "webhookId": "6bad6dc4-afe6-48bd-bb60-3076dc07d7a3",
      "credentials": {
        "gmailOAuth2": {
          "id": "b1hBLP5JG0DJNVUM",
          "name": "Gmail account 2"
        }
      }
    },
    {
      "parameters": {
        "amount": 1
      },
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1.1,
      "position": [
        752,
        144
      ],
      "id": "872cdcc1-6e02-45cd-83e9-900726a4b9a3",
      "name": "Wait",
      "webhookId": "ecaf2613-5985-41cd-9c2f-5186dafe35a0"
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 2
          },
          "conditions": [
            {
              "id": "4559e96f-9e6e-4169-a7eb-d4dcdcd731e2",
              "leftValue": "={{ !!$json.body.data.buyer.email }}",
              "rightValue": false,
              "operator": {
                "type": "boolean",
                "operation": "true",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        624,
        -272
      ],
      "id": "f3c47c34-f502-40c4-9295-a40f2d8334d9",
      "name": "Existe Email"
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 2
          },
          "conditions": [
            {
              "id": "15d43fab-ecd0-4acb-9b75-0732a188dd08",
              "leftValue": "={{ $json.lead_id }}",
              "rightValue": "",
              "operator": {
                "type": "string",
                "operation": "notEmpty",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        1120,
        -288
      ],
      "id": "4e158ccf-9bd1-401a-9130-21f5c2e4f02c",
      "name": "If"
    },
    {
      "parameters": {
        "operation": "getAll",
        "tableId": "funnel_leads",
        "limit": 1,
        "filters": {
          "conditions": [
            {
              "keyName": "=attributes->>transaction",
              "condition": "eq",
              "keyValue": "={{ $('Webhook').item.json.body.data.purchase.transaction }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        928,
        -288
      ],
      "id": "a2ffa63f-f2e0-45d1-96e7-f299c1d5b8c2",
      "name": "GETLEAD",
      "credentials": {
        "supabaseApi": {
          "id": "TGcsQc7XaL5SHyqE",
          "name": "Supabase account"
        }
      }
    },
    {
      "parameters": {
        "content": "## 02: Registro de Evento\n> **Ojetivo:** Registra o Evento de compra no banco de dados\n\n* [ ] Fazer a API/stripe e API/paypal enviarem o LEAD_ID no payload do N8N",
        "height": 320,
        "width": 1440
      },
      "type": "n8n-nodes-base.stickyNote",
      "position": [
        192,
        -336
      ],
      "typeVersion": 1,
      "id": "60ff686c-65e0-477f-b3d0-43a231352c8b",
      "name": "Sticky Note7"
    },
    {
      "parameters": {
        "content": "## 01: Recebimento de Eventi \n> **Obs:** Recebe dados do evento de compra da hotmart",
        "height": 320,
        "width": 304
      },
      "type": "n8n-nodes-base.stickyNote",
      "position": [
        -224,
        -16
      ],
      "typeVersion": 1,
      "id": "6cad5a5a-2785-49d7-a4a9-ff6fb4640e4c",
      "name": "Sticky Note"
    },
    {
      "parameters": {
        "tableId": "funnel_events",
        "fieldsUi": {
          "fieldValues": [
            {
              "fieldId": "event_type",
              "fieldValue": "=purchase"
            },
            {
              "fieldId": "lead_id",
              "fieldValue": "={{ $('If').item.json.lead_id }}"
            },
            {
              "fieldId": "event_timestamp",
              "fieldValue": "={{ $now }}"
            },
            {
              "fieldId": "funnel_id",
              "fieldValue": "quiz_frequencia_01"
            },
            {
              "fieldId": "received_at",
              "fieldValue": "={{ $now }}"
            },
            {
              "fieldId": "step_id",
              "fieldValue": "=checkout_front"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        1360,
        -304
      ],
      "id": "79556bd6-839c-48d2-a9f5-1a76fcd179f6",
      "name": "purchase event",
      "credentials": {
        "supabaseApi": {
          "id": "TGcsQc7XaL5SHyqE",
          "name": "Supabase account"
        }
      }
    },
    {
      "parameters": {
        "content": "## 03: Dispara Envio de Email\n> **Ojetivo:** Registra o Evento de compra no banco de dados",
        "height": 528,
        "width": 1280
      },
      "type": "n8n-nodes-base.stickyNote",
      "position": [
        384,
        32
      ],
      "typeVersion": 1,
      "id": "80c6830d-634f-4822-8f3f-5ae82a0f1640",
      "name": "Sticky Note8"
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 2
          },
          "conditions": [
            {
              "id": "50ca801b-dc47-4cc5-9a2a-98cf87019994",
              "leftValue": "={{ $json.headers[\"x-hotmart-hottok\"] }}",
              "rightValue": "",
              "operator": {
                "type": "string",
                "operation": "exists",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        496,
        192
      ],
      "id": "4e2ca72c-27cc-4400-afbe-8d698695fa5e",
      "name": "Se hotmart"
    },
    {
      "parameters": {
        "amount": 1
      },
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1.1,
      "position": [
        752,
        304
      ],
      "id": "bf937731-a38c-432f-ab86-a7345d841749",
      "name": "Wait1",
      "webhookId": "ecaf2613-5985-41cd-9c2f-5186dafe35a0"
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 2
          },
          "conditions": [
            {
              "id": "50ca801b-dc47-4cc5-9a2a-98cf87019994",
              "leftValue": "={{ $json.headers[\"x-hotmart-hottok\"] }}",
              "rightValue": "",
              "operator": {
                "type": "string",
                "operation": "exists",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        400,
        -176
      ],
      "id": "b8895b99-1636-421b-b720-c1d878b62b5b",
      "name": "Se hotmart1"
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 2
          },
          "conditions": [
            {
              "id": "4559e96f-9e6e-4169-a7eb-d4dcdcd731e2",
              "leftValue": "={{ $json.body.email }}",
              "rightValue": false,
              "operator": {
                "type": "string",
                "operation": "exists",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        624,
        -128
      ],
      "id": "fdae30ff-4941-4236-9cf7-a16f4f1b28dc",
      "name": "Existe Email1"
    },
    {
      "parameters": {
        "sendTo": "={{ $json.body.email }}",
        "subject": "VIBRATIONSPLAN: Ihre Reise beginnt genau hier.",
        "message": "=<!DOCTYPE html>\n<html>\n<head>\n <meta charset=\"UTF-8\">\n</head>\n<body style=\"margin:0; padding:0; background-color:#f4f4f7;\">\n <center>\n  <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color:#f4f4f7; padding:30px 10px;\">\n   <tr>\n    <td align=\"center\">\n     <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:600px; background-color:#ffffff; border-radius:16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow:hidden;\">\n      \n      <tr>\n       <td height=\"8\" style=\"background: linear-gradient(90deg, #1a2238, #d4af37, #1a2238);\"></td>\n      </tr>\n\n      <tr>\n       <td style=\"padding:40px 30px;\">\n        \n        <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\">\n         <tr>\n          <td width=\"64\">\n           <img src=\"https://fundaris.space/expert-pt.webp\" width=\"64\" height=\"64\" style=\"border-radius:50%; display:block; border: 2px solid #1a2238;\" alt=\"Experte\">\n          </td>\n          <td style=\"padding-left:16px;\">\n           <p style=\"margin:0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:18px; font-weight:700; color:#1a2238; letter-spacing:-0.5px;\">Protokoll Aktiviert 👋</p>\n           <p style=\"margin:0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size:14px; color:#666666; text-transform: uppercase; letter-spacing:1px;\">Feldabstimmung läuft</p>\n          </td>\n         </tr>\n        </table>\n\n        <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-top:30px;\">\n         <tr>\n          <td style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:16px; line-height:1.6; color:#1a1a1a;\">\n           <p style=\"margin-bottom:20px;\">\n            Vergessen Sie „Glück“. Als Physiker garantiere ich Ihnen: Was die meisten als Zufall bezeichnen, ist in Wirklichkeit eine <strong>exakte Abstimmung von Frequenzen.</strong>\n           </p>\n           <p style=\"margin-bottom:20px;\">\n            Wenn sich Ihre Wünsche bisher nicht manifestiert haben, liegt das nicht daran, dass Sie es nicht verdienen. Es liegt daran, dass Ihr Schwingungsregler nicht auf das Ziel ausgerichtet war. <strong>Ihre Ankunft hier beendet diesen Zyklus des Scheiterns.</strong>\n           </p>\n          </td>\n         </tr>\n        </table>\n\n        <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color:#1a2238; border-radius:12px; margin:10px 0;\">\n         <tr>\n          <td style=\"padding:25px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;\">\n           <p style=\"margin:0; font-size:18px; line-height:1.5; color:#ffffff;\">\n            Wir sind dabei, <strong style=\"color:#f5c76a;\">Ihre Frequenz exakt auf das Niveau</strong> des Lebens zu bringen, das Sie gewählt haben. Wenn das Feld kohärent ist, ist Manifestation keine Möglichkeit – <strong>sie ist eine mathematische Unausweichlichkeit.</strong>\n           </p>\n          </td>\n         </tr>\n        </table>\n\n        <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-top:25px;\">\n         <tr>\n          <td style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:15px; line-height:1.7; color:#444444;\">\n           <p>\n            Um sicherzustellen, dass Ihr Weg makellos verläuft, steht mein <strong>technisches Betreuungsteam</strong> bereits bereit. Sie werden Ihre Entwicklung überwachen und unterstützen, damit kein externes Rauschen Ihre neue Schwingungssignatur stört.\n           </p>\n          </td>\n         </tr>\n        </table>\n\n        <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-top:35px;\">\n         <tr>\n          <td align=\"center\">\n           <a href=\"https://app.fundaris.space/de/welcome?email={{ $json.body.email }}\" style=\"display:inline-block; padding:20px 45px; background-color:#d4af37; color:#1a2238; text-decoration:none; font-family: 'Helvetica Neue', Arial, sans-serif; font-weight:800; font-size:17px; border-radius:8px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(212,175,55,0.3);\">\n            LOGIN UND AKTIVIEREN\n           </a>\n           <p style=\"margin-top:22px; font-family: Arial, sans-serif; font-size:12px; color:#999999; text-transform: uppercase; letter-spacing:2px;\">\n            Der Point of No Return Ihrer Realität\n           </p>\n          </td>\n         </tr>\n        </table>\n\n       </td>\n      </tr>\n     </table>\n     \n     <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:600px; margin-top:20px;\">\n      <tr>\n       <td align=\"center\" style=\"font-family: Arial, sans-serif; font-size:11px; color:#bbbbbb; text-transform: uppercase;\">\n        Fundaris Space • Frequenztechnik • 2026\n       </td>\n      </tr>\n     </table>\n\n    </td>\n   </tr>\n  </table>\n </center>\n</body>\n</html>",
        "options": {}
      },
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "position": [
        976,
        304
      ],
      "id": "7810877a-b496-4a37-95fe-166aff99c584",
      "name": "Send a Message (DE)",
      "webhookId": "6bad6dc4-afe6-48bd-bb60-3076dc07d7a3",
      "credentials": {
        "gmailOAuth2": {
          "id": "b1hBLP5JG0DJNVUM",
          "name": "Gmail account 2"
        }
      }
    },
    {
      "parameters": {
        "tableId": "funnel_events",
        "fieldsUi": {
          "fieldValues": [
            {
              "fieldId": "event_type",
              "fieldValue": "=purchase"
            },
            {
              "fieldId": "lead_id",
              "fieldValue": "={{ $json.body.lead_id }}"
            },
            {
              "fieldId": "event_timestamp",
              "fieldValue": "={{ $now }}"
            },
            {
              "fieldId": "funnel_id",
              "fieldValue": "quiz_frequencia_01"
            },
            {
              "fieldId": "received_at",
              "fieldValue": "={{ $now }}"
            },
            {
              "fieldId": "step_id",
              "fieldValue": "=checkout_front)"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        912,
        -144
      ],
      "id": "0501c924-a2a5-41f8-9786-5f0be63d515a",
      "name": "purchase event1",
      "credentials": {
        "supabaseApi": {
          "id": "TGcsQc7XaL5SHyqE",
          "name": "Supabase account"
        }
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Se hotmart",
            "type": "main",
            "index": 0
          },
          {
            "node": "Se hotmart1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Send a message": {
      "main": [
        []
      ]
    },
    "Wait": {
      "main": [
        [
          {
            "node": "Send a message",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Existe Email": {
      "main": [
        [
          {
            "node": "GETLEAD",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If": {
      "main": [
        [
          {
            "node": "purchase event",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "GETLEAD": {
      "main": [
        [
          {
            "node": "If",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Se hotmart": {
      "main": [
        [
          {
            "node": "Wait",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Wait1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Wait1": {
      "main": [
        [
          {
            "node": "Send a Message (DE)",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Se hotmart1": {
      "main": [
        [
          {
            "node": "Existe Email",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Existe Email1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Existe Email1": {
      "main": [
        [
          {
            "node": "purchase event1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "2395bff04e450273b507f908294f5222a5041698e866d747fdededa8ed58ec40"
  }
}

---
