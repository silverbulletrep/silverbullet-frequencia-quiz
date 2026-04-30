import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './JohannChat.module.scss';
import { asset } from '@/lib/asset';

const isPtRoute = window.location.pathname.startsWith('/pt');
const EXPERT_IMG = isPtRoute ? asset('/img/expert-pt.webp') : asset('/img/expert.webp');

// --- CONFIGURAÇÃO DOS GANCHOS (17 VARIAÇÕES) ---
const getOpeningMessages = (t) => ({
    // Agente 1 (Foco na estagnação palpável) - /quiz a /vsl
    // Agora usando uma função ou lógica para alternar entre Primário e Fallback
    '/quiz': 'AGENTE_1',
    '/age-selection-men': t('johannChat.openings.age_selection', { returnObjects: true }),
    '/ge-selection-men': t('johannChat.openings.age_selection', { returnObjects: true }),
    '/age-selection-women': t('johannChat.openings.age_selection', { returnObjects: true }),
    '/women-success': 'AGENTE_1',
    '/men-success': 'AGENTE_1',
    '/morning-feeling': t('johannChat.openings.morning', { returnObjects: true }),
    '/transition': t('johannChat.openings.transition', { returnObjects: true }),
    '/vsl': 'AGENTE_1',
    '/vsl2': 'AGENTE_1',

    // Agente 4 (Hesitação no Exame / Sinceridade) - /quiz-step-1 a /resultado
    '/quiz-step-1': t('johannChat.openings.quiz_step', { returnObjects: true }),
    '/quiz-step-2': t('johannChat.openings.quiz_step', { returnObjects: true }),
    '/quiz-step-3': t('johannChat.openings.quiz_step', { returnObjects: true }),
    '/quiz-step-4': t('johannChat.openings.quiz_step', { returnObjects: true }),
    '/quiz-step-5': t('johannChat.openings.quiz_step', { returnObjects: true }),
    '/quiz-step-6': t('johannChat.openings.quiz_step', { returnObjects: true }),
    '/quiz-step-9': t('johannChat.openings.quiz_step', { returnObjects: true }),
    '/quiz-step-10': t('johannChat.openings.quiz_step', { returnObjects: true }),
    '/compont-test-1': t('johannChat.openings.quiz_step', { returnObjects: true }),
    '/compont-test-2': t('johannChat.openings.quiz_step', { returnObjects: true }),
    '/compont-test-3': t('johannChat.openings.quiz_step', { returnObjects: true }),
    '/compont-test-4': t('johannChat.openings.quiz_step', { returnObjects: true }),
    '/compont-test-5': t('johannChat.openings.quiz_step', { returnObjects: true }),
    '/compont-test-6': t('johannChat.openings.quiz_step', { returnObjects: true }),
    '/processing': t('johannChat.openings.processing', { returnObjects: true }),
    '/resultado': t('johannChat.openings.quiz_step', { returnObjects: true }),
    '/resultado-pressel': t('johannChat.openings.quiz_step', { returnObjects: true }),

    // Agente (Mentor Atento) - /fim (antes do pitch)
    '/fim': t('johannChat.openings.fim', { returnObjects: true }),

    // Agente 3 (Sinal Dourado) - /fim (pós pitch), /checkout, /fim-funil
    '/fim-pos-pitch': t('johannChat.openings.checkout', { returnObjects: true }),
    '/checkout': t('johannChat.openings.checkout', { returnObjects: true }),
    '/fim-funil': t('johannChat.openings.checkout', { returnObjects: true }),

    // Agente 2 (Via Intravenosa) - /audio-upsell
    // Agente 2 (Via Intravenosa) - /audio-upsell ANTES do play
    '/audio-upsell': t('johannChat.openings.audio_upsell', { returnObjects: true }),

    // Agente 2 - /audio-upsell PÓS play (se o cliente pausar/sair no meio)
    '/audio-upsell-pos-play': t('johannChat.openings.audio_upsell_pos', { returnObjects: true }),

    '/recupera': t('johannChat.openings.recupera', { returnObjects: true }),

    // Rota direta de Atendimento / Suporte (PT-PT)
    '/suporte': t('johannChat.openings.suporte', { returnObjects: true }),

    // Fallback Específico do VSL de abandono final
    '/vsl-abandon': [
        ...t('johannChat.openings.vsl_abandon', { returnObjects: true }),
        {
            type: 'text',
            content: t('johannChat.ui.button_vsl_abandon'),
            actionUnlock: true
        }
    ]
});

const WEBHOOK_URL = "https://n8n-n8n.6jcwzd.easypanel.host/webhook/chat-funel";

// --- MAPA DE CONTEXTO PSICOLÓGICO DA ROTA (PARA O N8N) ---
const CHECKPOINT_DESCRIPTIONS = {
    '/quiz': '/quiz - Entrada do funil. Cliente escolhendo o Gênero (Homem/Mulher). Estado curioso/frio.',
    '/age-selection-men': '/age-selection-men - Selecionando a idade (Homem). Leve atrito, impaciente.',
    '/age-selection-women': '/age-selection-women - Selecionando a idade (Mulher). Leve atrito, impaciente.',
    '/women-success': '/women-success - Prova social (Mulheres). Vendo depoimentos. Estado cético.',
    '/men-success': '/men-success - Prova social (Homens). Vendo depoimentos. Estado cético.',
    '/morning-feeling': '/morning-feeling - Respondendo como acorda. Identificação emocional, pode estar protelando.',
    '/transition': '/transition - Tela pré-video. Frustrado com mais vídeo para assistir.',
    '/vsl': '/vsl - Assistindo vídeo principal VSL. Não chegou na oferta ainda.',
    '/vsl2': '/vsl2 - Assistindo vídeo principal VSL (Alternativo). Não chegou na oferta ainda.',
    '/quiz-step-1': '/quiz-step-1 - Pergunta 1 do Teste Vibracional. Surpreso com mais perguntas.',
    '/quiz-step-2': '/quiz-step-2 - Pergunta 2 do Teste Vibracional. Abertura emocional.',
    '/quiz-step-3': '/quiz-step-3 - Pergunta 3 do Teste Vibracional. Imersão crescente.',
    '/quiz-step-4': '/quiz-step-4 - Pergunta 4 do Teste Vibracional. Comprometimento crescente, mas ansioso.',
    '/quiz-step-5': '/quiz-step-5 - Pergunta 5 do Teste Vibracional. Antecipação do resultado.',
    '/quiz-step-6': '/quiz-step-6 - Última pergunta do Teste. Quase lá, cansaço.',
    '/quiz-step-9': '/quiz-step-9 - Última pergunta do Teste. Quase lá, cansaço.',
    '/quiz-step-10': '/quiz-step-10 - Última pergunta do Teste. Quase lá, cansaço.',
    '/compont-test-1': '/compont-test-1 - Pergunta 1 do Exame Vibracional. Surpreso com mais perguntas.',
    '/compont-test-2': '/compont-test-2 - Pergunta 2 do Exame Vibracional. Abertura emocional.',
    '/compont-test-3': '/compont-test-3 - Pergunta 3 do Exame Vibracional. Imersão crescente.',
    '/compont-test-4': '/compont-test-4 - Pergunta 4 do Exame Vibracional. Comprometimento crescente.',
    '/compont-test-5': '/compont-test-5 - Pergunta 5 do Exame Vibracional. Antecipação do resultado.',
    '/compont-test-6': '/compont-test-6 - Última pergunta do Exame Vibracional. Quase lá, cansaço.',
    '/processing': '/processing - Processando resultado. Ansioso pelo resultado e encontrou barreira de email/whatsapp.',
    '/resultado': '/resultado - Página do Gráfico Vibracional. Alta curiosidade e vulnerabilidade.',
    '/resultado-pressel': '/resultado-pressel - Página de Resultado Pressel.',
    '/fim': '/fim - Onde o cliente está na página final antecipando o plano (PRÉ-PITCH).',
    '/fim-pos-pitch': '/fim-pos-pitch - Onde o cliente JÁ VIU a oferta (PÓS-PITCH).',
    '/checkout': '/checkout - No checkout após a oferta.',
    '/fim-funil': '/fim-funil - Página de finalização do funil.',
    '/audio-upsell': '/audio-upsell - Cliente JÁ COMPROU! Tela de Upsell.',
    '/suporte': '/suporte - Lead acessou a página diretamente pedindo Suporte ou tendo dúvidas antes de comprar.',
    '/vsl-abandon': '/vsl-abandon - O lead tentou abandonar a VSL pela segunda vez e foi redirecionado para o Whatsapp.'
};

// --- MAPA DE PROGRESSÃO DA ROTA (PARA O BOTÃO DE AVANÇO) ---
const NEXT_ROUTE_MAP = {
    '/age-selection-women': '/women-success',
    '/age-selection-men': '/men-success',
    '/women-success': '/morning-feeling',
    '/men-success': '/morning-feeling',
    '/morning-feeling': '/transition',
    '/transition': '/vsl',
    '/vsl': '/compont-test-1',
    '/vsl2': '/compont-test-1',
    '/quiz-step-1': '/quiz-step-2',
    '/quiz-step-2': '/quiz-step-3',
    '/quiz-step-3': '/quiz-step-4',
    '/quiz-step-4': '/quiz-step-5',
    '/quiz-step-5': '/quiz-step-6',
    '/quiz-step-6': '/processing',
    '/quiz-step-9': '/processing',
    '/quiz-step-10': '/processing',
    '/compont-test-1': '/compont-test-2',
    '/compont-test-2': '/compont-test-3',
    '/compont-test-3': '/compont-test-4',
    '/compont-test-4': '/compont-test-5',
    '/compont-test-5': '/compont-test-6',
    '/compont-test-6': '/processing',
    '/processing': '/resultado',
    '/resultado': '/fim',
    '/resultado-pressel': '/fim',
    '/fim': '/checkout',
    '/checkout': '/fim-funil',
    '/audio-upsell': '/recupera'
};
const FALLBACK_SEEN_KEY = 'whatsapp_agente1_seen';
const HOTMART_POST_PITCH_URL = 'https://pay.hotmart.com/N105101154W?offDiscount=DESCONTO+APLICADO&bid=1775256934969';
const SUPPORT_CHECKPOINT_ALIASES = new Set(['/suporteDesconto']);

const normalizeChatCheckpoint = (from) => {
    if (SUPPORT_CHECKPOINT_ALIASES.has(from)) {
        return '/suporte';
    }

    return from;
};

const JohannChat = () => {
    const { t, i18n } = useTranslation();
    useEffect(() => {
        // Bloquear scroll do body pra prevenir viewport bugs no iOS quando o teclado abre
        const originalBodyOverflow = document.body.style.overflow;
        const originalHtmlOverflow = document.documentElement.style.overflow;
        const originalBodyHeight = document.body.style.height;
        const originalHtmlHeight = document.documentElement.style.height;

        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.height = '100%';
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100%';

        return () => {
            document.documentElement.style.overflow = originalHtmlOverflow;
            document.documentElement.style.height = originalHtmlHeight;
            document.body.style.overflow = originalBodyOverflow;
            document.body.style.height = originalBodyHeight;
        };
    }, []);

    const location = useLocation();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Controle rigoroso de Strict Mode para evitar duplicidade 
    // das "10 mensagens" iniciais de abertura
    const isChatStartedRef = useRef(false);
    const messagesEndRef = useRef(null);
    const chatDataRef = useRef({
        checkpointId: '/quiz',
        sourceFrom: '/quiz',
        leadData: {},
        session_id: 'ws_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        // 1. Identificar checkpoint da URL
        const searchParams = new URLSearchParams(location.search);
        let rawFrom = searchParams.get('from') || '/quiz';
        // Normalizar
        rawFrom = rawFrom.replace(/^\/main/, '').replace(/^\/(pt|de)/, '') || '/quiz';
        const normalizedFrom = normalizeChatCheckpoint(rawFrom);
        chatDataRef.current.sourceFrom = rawFrom;
        chatDataRef.current.checkpointId = normalizedFrom;

        // 2. Carregar dados do lead do localStorage
        try {
            const raw = localStorage.getItem('lead_cache_app_espiritualidade');
            chatDataRef.current.leadData = raw ? JSON.parse(raw) : {};
        } catch (e) {
            console.error("Erro ao ler lead data", e);
        }

        // 3. Iniciar o chat (ganchos) - blindado contra double-render
        if (!isChatStartedRef.current) {
            isChatStartedRef.current = true;
            const localizedOpenings = getOpeningMessages(t);
            startOpeningSequence(normalizedFrom, localizedOpenings);
        }
    }, [t]);

    const startOpeningSequence = async (cp, localizedOpenings) => {
        let opening = localizedOpenings[cp] || localizedOpenings['/quiz'];

        // Lógica de Fallback para o Agente 1
        if (opening === 'AGENTE_1') {
            const hasSeenPrimary = localStorage.getItem(FALLBACK_SEEN_KEY) === 'true';
            if (!hasSeenPrimary) {
                opening = t('johannChat.ui.agente_1_fallback_1', { returnObjects: true });
                localStorage.setItem(FALLBACK_SEEN_KEY, 'true');
            } else {
                opening = t('johannChat.ui.agente_1_fallback_2', { returnObjects: true });
            }
        }

        // Lógica da primeira vez absoluta em qualquer backredirect/chat
        const FIRST_BACKREDIRECT_KEY = 'whatsapp_first_backredirect_seen';
        const isSuporte = chatDataRef.current.checkpointId === '/suporte';

        if (!localStorage.getItem(FIRST_BACKREDIRECT_KEY)) {
            localStorage.setItem(FIRST_BACKREDIRECT_KEY, 'true');

            // Nunca exibir no suporte direto
            if (!isSuporte) {
                // Garantir que a Array não seja mutada por referência se for do OPENING_MESSAGES
                opening = [
                    t('johannChat.ui.mentor_tracking'),
                    ...(Array.isArray(opening) ? opening : [opening])
                ];
            }
        }

        // Pequeno delay inicial para "carregamento"
        await new Promise(r => setTimeout(r, 200));

        for (const msg of opening) {
            const isObject = typeof msg === 'object';
            const text = isObject ? msg.content : msg;

            setIsTyping(true);
            const isFirstMsg = opening.indexOf(msg) === 0;
            // Força a animação de digitação visível na primeira mensagem por mais tempo
            const readingTime = isFirstMsg ? 1800 : Math.max(600, (text?.length || 50) * 15);
            await new Promise(r => setTimeout(r, readingTime));
            setIsTyping(false);

            const newMessage = {
                id: Date.now() + Math.random(),
                type: isObject ? (msg.type || 'text') : 'text',
                content: text,
                isUser: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                imageUrl: isObject ? msg.imageUrl : undefined,
                audioUrl: isObject ? msg.audioUrl : undefined,
                videoUrl: isObject ? msg.videoUrl : undefined,
                actionUnlock: isObject ? msg.actionUnlock : undefined,
                unlockUrl: isObject ? msg.unlockUrl : undefined,
            };
            setMessages(prev => [...prev, newMessage]);
            await new Promise(r => setTimeout(r, 300)); // Intervalo menor entre bolhas
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userText = inputValue.trim();
        setInputValue('');

        // Adicionar mensagem do usuário
        const userMsg = {
            id: Date.now(),
            type: 'text',
            content: userText,
            isUser: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, userMsg]);

        // Enviar para n8n
        setIsTyping(true);
        try {
            // Extrai a 'data' do cache (pois o leadCache salva como { data: { genero... } })
            const funilData = chatDataRef.current.leadData?.data || chatDataRef.current.leadData;
            const enrichedCheckpoint = CHECKPOINT_DESCRIPTIONS[chatDataRef.current.checkpointId] || chatDataRef.current.checkpointId;

            // Busca do identificador absoluto do funil (gerado em /quiz -> "lead_xyz...")
            let funnelLeadId = '';
            try {
                funnelLeadId = localStorage.getItem('lead_id');
            } catch (e) {
                console.warn('Falha ao ler lead_id raiz');
            }

            // Determinar a etapa do funil para o n8n (Segmentação solicitada pelo Vinicius)
            const getFunnelEtapa = (route, sourceFrom) => {
                const r = route || '';
                const source = sourceFrom || '';
                if (source === '/suporteDesconto') {
                    return 'Suporte_Checkout_Desconto';
                }
                // CURIOSOS
                if (['/quiz', '/age-selection-men', '/ge-selection-men', '/age-selection-women', '/women-success', '/men-success', '/morning-feeling', '/transition', '/vsl', '/vsl2', '/vls'].includes(r)) {
                    return 'curisosos';
                }
                // EXAME
                if (r.startsWith('/quiz-step-') || r.startsWith('/compont-test-') || ['/processing', '/resultado', '/resultado-pressel'].includes(r)) {
                    return 'exame';
                }
                // ANTES-PITCH
                if (r === '/fim') {
                    return 'antes-pitch';
                }
                // POS-PITCH
                if (['/fim-pos-pitch', '/checkout', '/fim-funil'].includes(r)) {
                    return 'pos-pitch';
                }
                // UPSELL
                if (r.includes('audio-upsell')) {
                    return r === '/audio-upsell-pos-play' ? 'pos_audio_upsell' : 'antes_audio_upsell';
                }
                // SUPORTE
                if (r === '/suporte') {
                    return 'Suporte_Checkout';
                }
                return 'outros';
            };

            const route = chatDataRef.current.checkpointId;
            const sourceFrom = chatDataRef.current.sourceFrom;
            const etapa = getFunnelEtapa(route, sourceFrom);

            console.log(`[JohannChat] Payload Webhook - Rota: ${route} | Etapa: ${etapa}`); // Log para depuração do n8n

            let metodoPagamento = undefined;
            try {
                if (etapa === 'Suporte_Checkout' || route === '/suporte') {
                    metodoPagamento = localStorage.getItem('metodo_pagamento') || undefined;
                }
            } catch (e) { }

            const payload = {
                sessao_chat_id: chatDataRef.current.session_id,
                checkpoint_abandono: enrichedCheckpoint,
                etapa: etapa,
                language: i18n.language,
                metodo_pagamento: metodoPagamento,
                id_lead: funnelLeadId || funilData?.id_lead || funilData?.client_uuid || 'nao_identificado',
                lead_id_crm: funnelLeadId || funilData?.id_lead || funilData?.client_uuid || 'nao_identificado',
                mensagem_usuario: userText,
                memoria_funil: funilData,
                historico_conversa: messages.map(m => ({
                    role: m.isUser ? 'user' : 'assistant',
                    content: m.content
                }))
            };

            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Se o n8n retornar Texto Puro ao invés de JSON (Comum em webhooks simples)
            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            console.log("[JohannChat] Recebido do n8n:", data); // Ajuda no Debug!

            setIsTyping(false);

            if (data) {
                // Se a resposta for uma STRING direta (ex: nó "Respond to Webhook" em texto)
                if (typeof data === 'string') {
                    await processIncomingMessage({ texto: data });
                    return;
                }

                // Se for um Array (comum quando o n8n retorna N itens)
                const items = Array.isArray(data) ? data : [data];

                let processedAny = false;

                for (const item of items) {
                    // Tenta múltiplos formatos famosos (message1, message2 vindo do script antigo)
                    const msgsToProcess = ['message1', 'message2', 'message3', 'message4', 'message5', 'message6'];
                    for (const key of msgsToProcess) {
                        if (item[key]) {
                            await processIncomingMessage(item[key]);
                            processedAny = true;
                        }
                    }

                    if (!processedAny) {
                        // Caçador de chaves comuns de resposta de IA no N8N
                        const textContent = item.output || item.message || item.response || item.text || item.texto || item.answer || item.chat || '';
                        const imageContent = item.image || item.imagem || item.imageUrl || item.url || null;
                        const audioContent = item.audio || item.audioUrl || null;

                        if (textContent || imageContent || audioContent) {
                            await processIncomingMessage({
                                texto: textContent,
                                imagem: imageContent,
                                audio: audioContent
                            });
                            processedAny = true;
                        }
                    }

                    if (!processedAny) {
                        // Caçador EXTREMO: Varre o objeto procurando qualquer string maior que 3 letras (Bypass pra key bizarra)
                        const fallbackText = Object.values(item).find(v => typeof v === 'string' && v.trim().length > 3);
                        if (fallbackText) {
                            await processIncomingMessage({ texto: fallbackText });
                            processedAny = true;
                        }
                    }
                }

                // Fallback extremo
                if (!processedAny) {
                    console.warn("[JohannChat] Formato do n8n desconhecido no Webhook:", data);
                    await processIncomingMessage({
                        texto: "🚦 *(Mensagem recebida, mas o formato de resposta do N8N não foi reconhecido pelo Front-end/Chat)* -> RAW: " + JSON.stringify(data).substring(0, 150) + "..."
                    });
                }
            } else {
                await processIncomingMessage({ texto: "🚨 *(O Webhook do N8N respondeu com sucesso [Status 200], mas o corpo da mensagem [Body/Data] veio vazio)*" });
            }
        } catch (error) {
            console.error("Erro Crítico de Conexão N8N:", error);
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: Date.now(),
                type: 'text',
                content: t('johannChat.ui.connection_error_short'),
                isUser: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }
    };

    const processIncomingMessage = async (msgData) => {
        try {
            console.log("[JohannChat - Renderizador] Processando msgData bruto:", msgData);

            // Agora aceita várias propriedades comuns convertendo para "texto" interno
            let text = typeof msgData === 'string' ? msgData : (msgData.texto || msgData.text || msgData.output || msgData.message || '');

            // Tratamento contra objetos aninhados (React Crash se tentar renderizar objeto na tela)
            if (text && typeof text === 'object') {
                text = text.content || text.text || text.response || JSON.stringify(text);
            }

            text = String(text || '');

            // --- LIMPEZA DE HTML (Bypass para injeção de iframes do N8N / Webhook Test) ---
            if (text.includes('srcdoc=')) {
                // Modificado para capturar quebras de linha ([\s\S])
                const srcdocMatch = text.match(/srcdoc=["']([\s\S]*?)["']/i);
                if (srcdocMatch && srcdocMatch[1]) {
                    text = srcdocMatch[1];
                }
            }
            // Remove tags HTML residuais somente se cheiras a HTML
            if (text.includes('<') && text.includes('>')) {
                text = text.replace(/<[^>]+>/g, '').trim();
                text = text.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'");
            }

            // --- LÓGICA DE LIBERAÇÃO DE ACESSO ---
            let actionUnlock = false;
            let unlockUrl = null;
            let isAudioUnlock = false;
            // Admite as tags de ativação para o CTA do botão
            const tags = ['#LIBERAR_ACESSO#', '#SINCERIDADE_MULLER#', '#MENTOR_ATENTO#', '#SINAL_DOURADO_ATIVADO#', '#LIBERAR_AUDIO#', '#liberar_botão_sem_duvida'];
            if (text && tags.some(tag => text.toLowerCase().includes(tag.toLowerCase()))) {
                actionUnlock = true;

                if (text.includes('#LIBERAR_AUDIO#')) {
                    isAudioUnlock = true;
                }

                // Se for a tag do sinal dourado, define o link da Hotmart
                if (text.includes('#SINAL_DOURADO_ATIVADO#')) {
                    unlockUrl = HOTMART_POST_PITCH_URL;
                }

                // Link específico para oferta rápida de suporte
                if (text.toLowerCase().includes('#liberar_botão_sem_duvida')) {
                    unlockUrl = 'https://pay.hotmart.com/N105101154W?checkoutMode=10&bid=1775422780953';
                }

                tags.forEach(tag => {
                    text = text.replace(new RegExp(`${tag}[:]?`, 'gi'), '').trim();
                });
            }

            if (!text && !msgData.imagem && !msgData.audio) return;

            setIsTyping(true);
            await new Promise(r => setTimeout(r, Math.max(800, text.length * 12)));
            setIsTyping(false);

            const newMessage = {
                id: Date.now() + Math.random(),
                type: 'text',
                content: text,
                isUser: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                imageUrl: msgData.imagem,
                audioUrl: msgData.audio,
                videoUrl: msgData.video || msgData.videoUrl,
                actionUnlock, // Ativa o botão no balão da IA
                unlockUrl, // Armazena a URL customizada se existir
                isAudioUnlock
            };

            if (msgData.imagem) newMessage.type = 'image';
            if (msgData.audio) newMessage.type = 'audio';
            if (msgData.video || msgData.videoUrl) newMessage.type = 'video';

            setMessages(prev => [...prev, newMessage]);
            await new Promise(r => setTimeout(r, 500));
        } catch (fatalError) {
            console.error("[JohannChat] Erro FATAL no processamento de mensagem (Verifique o Parse de JSON):", fatalError);
            setMessages(prev => [...prev, {
                id: Date.now(),
                type: 'text',
                content: t('johannChat.ui.connection_error_critical'),
                isUser: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }
    };

    const handleUnlockNextStep = (msg) => {
        const { unlockUrl, isAudioUnlock } = msg || {};

        // Se houver uma URL customizada (ex: Hotmart no sinal dourado), redireciona direto
        if (unlockUrl) {
            window.location.href = unlockUrl;
            return;
        }

        // Redireciona de volta para onde o lead estava (checkpointId)
        // em vez de pular para o próximo passo, conforme solicitado pelo Vinicius.
        let route = chatDataRef.current.checkpointId || '/quiz';
        if (route === '/fim-pos-pitch') route = '/fim';
        if (route === '/audio-upsell-pos-play') route = '/audio-upsell';
        if (route === '/vsl-abandon') route = '/compont-test-1';

        // Preservar UTMs e parâmetros de busca
        const currentParams = new URLSearchParams(location.search);
        if (isAudioUnlock) {
            currentParams.set('autoPlay', 'true');
        }
        const queryString = currentParams.toString();

        navigate(`${route}${queryString ? `?${queryString}` : ''}`);
    };

    return (
        <div className={styles.whatsappContainer}>
            {/* Header */}
            <header className={styles.header}>
                <img src={EXPERT_IMG} alt="Johann Müller" className={styles.profilePic} />
                <div className={styles.profileInfo}>
                    <span className={styles.profileName}>Johann Müller</span>
                    <span className={styles.profileStatus}>{t('johannChat.ui.online')}</span>
                </div>

            </header>

            {/* Chat Body */}
            <main className={styles.chatBody}>
                <div className={styles.chatContainer}>
                    <div className={styles.messagesContainer}>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`${styles.chatMessage} ${msg.isUser ? styles.messageOut : styles.messageIn}`}>
                                <div className={styles.messageContent}>
                                    {msg.type === 'text' && <div className={styles.messageText} dangerouslySetInnerHTML={{ __html: msg.content }} />}
                                    {msg.type === 'image' && (
                                        <>
                                            <img src={msg.imageUrl} alt="Anexo" style={{ maxWidth: '100%', borderRadius: '4px' }} />
                                            {msg.content && <div className={styles.messageText} style={{ marginTop: '5px' }}>{msg.content}</div>}
                                        </>
                                    )}
                                    {msg.type === 'audio' && (
                                        <div className={styles.audioPlayer}>
                                            <button className={styles.playBtn}>
                                                <svg width="24" height="24" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                            </button>
                                            <div className={styles.waveform}>
                                                {[...Array(15)].map((_, i) => <span key={i} style={{ height: `${Math.random() * 100}%` }}></span>)}
                                            </div>
                                            <span className={styles.audioTime}>0:30</span>
                                        </div>
                                    )}
                                    {msg.type === 'video' && (
                                        <div className={styles.videoPlayer}>
                                            <video
                                                src={msg.videoUrl}
                                                controls
                                                style={{ maxWidth: '100%', borderRadius: '8px', backgroundColor: '#000' }}
                                            />
                                            {msg.content && <div className={styles.messageText} style={{ marginTop: '5px' }}>{msg.content}</div>}
                                        </div>
                                    )}
                                    {msg.actionUnlock && !msg.isUser && (
                                        <button
                                            className={styles.unlockButton}
                                            onClick={() => handleUnlockNextStep(msg)}
                                        >
                                            {msg.unlockUrl ? t('johannChat.ui.button_offer') : t('johannChat.ui.button_continue')}
                                        </button>
                                    )}
                                    <span className={styles.messageTime}>
                                        {msg.time}
                                        {msg.isUser && <span className={styles.messageStatus}>✓✓</span>}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className={styles.typingIndicator}>
                                <span></span><span></span><span></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.messageInputContainer}>
                    <input
                        type="text"
                        placeholder={t('johannChat.ui.placeholder')}
                        className={styles.messageInput}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                </div>
                <button className={styles.sendBtn} onClick={handleSendMessage}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </footer>
        </div>
    );
};

export default JohannChat;
