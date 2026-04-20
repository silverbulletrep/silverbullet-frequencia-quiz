import json

def fix_badge():
    de_path = 'src/i18n/locales/de/translation.json'
    pt_path = 'src/i18n/locales/pt/translation.json'
    
    with open(de_path, 'r', encoding='utf-8') as f:
        de_data = json.load(f)
    if 'result' not in de_data: de_data['result'] = {}
    de_data['result']['alert_badge'] = "WARNUNG"
    
    with open(de_path, 'w', encoding='utf-8') as f:
        json.dump(de_data, f, indent=2, ensure_ascii=False)
        
    with open(pt_path, 'r', encoding='utf-8') as f:
        pt_data = json.load(f)
    if 'result' not in pt_data: pt_data['result'] = {}
    pt_data['result']['alert_badge'] = "ALERTA"
    with open(pt_path, 'w', encoding='utf-8') as f:
        json.dump(pt_data, f, indent=2, ensure_ascii=False)

if __name__ == '__main__':
    fix_badge()
