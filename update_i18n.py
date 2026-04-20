import json

def update_locales():
    themes = {
        "abundance": {
            "steps": ["Mapeando fluxos de abundância bloqueados...", "Identificando padrões de escassez energética...", "Analisando resistência ao recebimento financeiro...", "Sintonizando frequência de prosperidade 528Hz...", "Validando diagnóstico com especialista..."],
            "insights": ["⚠️ Detectado padrão de autossabotagem financeira", "⚠️ Dreno energético identificado no fluxo de entrada", "✨ Potencial de manifestação: Elevado após desbloqueio", "🔍 Sinais de crenças limitantes subconscientes"],
            "energyBars": { "vital": "Energia Vital", "blockage": "Densidade dos Bloqueios", "clarity": "Clareza Mental" }
        },
        "attract": {
            "steps": ["Analisando magnetismo pessoal...", "Identificando barreiras emocionais invisíveis...", "Mapeando ciclos repetitivos de relacionamento...", "Calibrando frequência harmônica de atração...", "Validando diagnóstico com especialista..."],
            "insights": ["⚠️ Barreira magnética de proteção detectada", "⚠️ Ciclo de rejeição identificado no subconsciente", "✨ Potencial de conexão: Muito alto", "🔍 Necessidade de alinhamento do centro afetivo"],
            "energyBars": { "vital": "Magnetismo", "blockage": "Densidade dos Bloqueios", "clarity": "Clareza Mental" }
        },
        "healing": {
            "steps": ["Escaneando dreno de vitalidade celular...", "Identificando bloqueios na regeneração...", "Analisando stress biovibracional acumulado...", "Ativando frequência de restauração quântica...", "Validando diagnóstico com especialista..."],
            "insights": ["⚠️ Nível crítico de oxidação energética", "⚠️ Bloqueio na comunicação intercelular", "✨ Capacidade regenerativa: Preservada", "🔍 Sinais de fadiga vibracional crônica"],
            "energyBars": { "vital": "Vitalidade", "blockage": "Densidade dos Bloqueios", "clarity": "Clareza Mental" }
        },
        "energy": {
            "steps": ["Mapeando ruído mental e ansiedade...", "Analisando fragmentação do campo de paz...", "Identificando sobrecarga de estímulos...", "Silenciando frequências desarmônicas...", "Validando diagnóstico com especialista..."],
            "insights": ["⚠️ Alta frequência de ruído cognitivo", "⚠️ Desalinhamento do eixo de serenidade", "✨ Potencial de clareza: Profundo", "🔍 Sinais de esgotamento do campo áurico"],
            "energyBars": { "vital": "Paz Interior", "blockage": "Densidade dos Bloqueios", "clarity": "Clareza Mental" }
        },
        "default": {
            "steps": ["Iniciando escaneamento vibracional completo...", "Mapeando desalinhamentos gerais...", "Analisando fluxo energético primordial...", "Preparando recomendações personalizadas...", "Validando diagnóstico com especialista..."],
            "insights": ["⚠️ Desalinhamento vibracional geral detectado", "⚠️ Ruído no campo de manifestação", "✨ Potencial transformador: Presente", "🔍 Necessidade de calibração imediata"],
            "energyBars": { "vital": "Energia Geral", "blockage": "Densidade dos Bloqueios", "clarity": "Clareza Mental" }
        }
    }

    themes_de = {
        "abundance": {
            "steps": ["Blockierte Fülle-Flüsse werden kartiert...", "Muster des energetischen Mangels werden identifiziert...", "Widerstand gegen finanziellen Empfang wird analysiert...", "Auf 528Hz Wohlstandsfrequenz abstimmen...", "Diagnose mit einem Spezialisten validieren..."],
            "insights": ["⚠️ Muster finanzieller Selbstsabotage entdeckt", "⚠️ Energieabfluss im Eingangsstrom identifiziert", "✨ Manifestationspotenzial: Hoch nach Entblockung", "🔍 Anzeichen unbewusster einschränkender Glaubenssätze"],
            "energyBars": { "vital": "Lebensenergie", "blockage": "Dichte der Blockaden", "clarity": "Geistige Klarheit" }
        },
        "attract": {
            "steps": ["Persönlicher Magnetismus wird analysiert...", "Unsichtbare emotionale Barrieren werden identifiziert...", "Wiederkehrende Beziehungszyklen werden kartiert...", "Harmonische Anziehungsfrequenz wird kalibriert...", "Diagnose mit einem Spezialisten validieren..."],
            "insights": ["⚠️ Magnetische Schutzbarriere erkannt", "⚠️ Ablehnungszyklus im Unterbewusstsein identifiziert", "✨ Verbindungspotenzial: Sehr hoch", "🔍 Notwendigkeit der Ausrichtung des affektiven Zentrums"],
            "energyBars": { "vital": "Magnetismus", "blockage": "Dichte der Blockaden", "clarity": "Geistige Klarheit" }
        },
        "healing": {
            "steps": ["Abfluss der zellulären Vitalität wird gescannt...", "Blockaden bei der Regeneration werden identifiziert...", "Akkumulierter biovibrationaler Stress wird analysiert...", "Frequenz der Quantenwiederherstellung wird aktiviert...", "Diagnose mit einem Spezialisten validieren..."],
            "insights": ["⚠️ Kritisches Niveau energetischer Oxidation", "⚠️ Blockade in der interzellulären Kommunikation", "✨ Regenerative Kapazität: Erhalten", "🔍 Anzeichen chronischer Schwingungsermüdung"],
            "energyBars": { "vital": "Vitalität", "blockage": "Dichte der Blockaden", "clarity": "Geistige Klarheit" }
        },
        "energy": {
            "steps": ["Geistiges Rauschen und Angst werden kartiert...", "Zersplitterung des Friedensfeldes wird analysiert...", "Reizüberflutung wird identifiziert...", "Disharmonische Frequenzen werden stummgeschaltet...", "Diagnose mit einem Spezialisten validieren..."],
            "insights": ["⚠️ Hohe Frequenz kognitiven Rauschens", "⚠️ Fehlausrichtung der Gelassenheitsachse", "✨ Klarheitspotenzial: Tief", "🔍 Anzeichen einer Erschöpfung des Aurafeldes"],
            "energyBars": { "vital": "Innerer Frieden", "blockage": "Dichte der Blockaden", "clarity": "Geistige Klarheit" }
        },
        "default": {
            "steps": ["Vollständiger Schwingungsscan wird gestartet...", "Allgemeine Fehlausrichtungen werden kartiert...", "Primordialer Energiefluss wird analysiert...", "Personalisierte Empfehlungen werden vorbereitet...", "Diagnose mit einem Spezialisten validieren..."],
            "insights": ["⚠️ Allgemeine Schwingungsfehlausrichtung erkannt", "⚠️ Rauschen im Manifestationsfeld", "✨ Transformatives Potenzial: Vorhanden", "🔍 Sofortiger Kalibrierungsbedarf"],
            "energyBars": { "vital": "Allgemeine Energie", "blockage": "Dichte der Blockaden", "clarity": "Geistige Klarheit" }
        }
    }

    pt_path = 'src/i18n/locales/pt/translation.json'
    de_path = 'src/i18n/locales/de/translation.json'

    # PT Update
    with open(pt_path, 'r', encoding='utf-8') as f:
        pt_data = json.load(f)
    if 'processing' not in pt_data:
        pt_data['processing'] = {}
    pt_data['processing']['themes'] = themes
    if 'loader' not in pt_data['processing']:
        pt_data['processing']['loader'] = {}
    pt_data['processing']['loader']['analyzing'] = 'ANALISANDO...'
    
    if 'contact_card' not in pt_data['processing']:
        pt_data['processing']['contact_card'] = {}
    pt_data['processing']['contact_card']['title'] = 'Como você quer receber seu resultado?'
    pt_data['processing']['contact_card']['subtitle'] = '*WhatsApp garante um acesso rápido'
    
    with open(pt_path, 'w', encoding='utf-8') as f:
        json.dump(pt_data, f, indent=2, ensure_ascii=False)

    # DE Update
    with open(de_path, 'r', encoding='utf-8') as f:
        de_data = json.load(f)
    if 'processing' not in de_data:
        de_data['processing'] = {}
    de_data['processing']['themes'] = themes_de
    if 'loader' not in de_data['processing']:
        de_data['processing']['loader'] = {}
    de_data['processing']['loader']['analyzing'] = 'ANALYSIEREN...'

    if 'contact_card' not in de_data['processing']:
        de_data['processing']['contact_card'] = {}
    de_data['processing']['contact_card']['title'] = 'Wie möchten Sie Ihr Ergebnis erhalten?'
    de_data['processing']['contact_card']['subtitle'] = '*WhatsApp garantiert einen schnellen Zugriff'

    de_data['result']['cta']['nudge_prefix'] = "SEHEN SIE DEN BUTTON UNTEN:"
    de_data['result']['cta']['nudge_main'] = "Wir fangen an, Ihren Schwingungsplan vorzubereiten!"

    with open(de_path, 'w', encoding='utf-8') as f:
        json.dump(de_data, f, indent=2, ensure_ascii=False)

if __name__ == '__main__':
    update_locales()
