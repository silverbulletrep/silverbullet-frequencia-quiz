const fs = require('fs')

const dePath = '/Users/brunogovas/Projects/Silver Bullet/Projetos/Funil_Quiz_2.0/SILVER-BULLET-AQUISICAO-FREQUENCIA/src/i18n/locales/de/translation.json'
const ptPath = '/Users/brunogovas/Projects/Silver Bullet/Projetos/Funil_Quiz_2.0/SILVER-BULLET-AQUISICAO-FREQUENCIA/src/i18n/locales/pt/translation.json'

const de = JSON.parse(fs.readFileSync(dePath, 'utf8'))
const pt = JSON.parse(fs.readFileSync(ptPath, 'utf8'))

if (!pt.vsl) pt.vsl = {}
pt.vsl.preparing_exam = "Estamos a preparar as questões do seu Exame Vibracional. Assista ao vídeo antes de começarmos."

if (!de.vsl) de.vsl = {}
de.vsl.preparing_exam = "Wir bereiten die Fragen für Ihre Vibrationsuntersuchung vor. Sehen Sie sich das Video an, bevor wir beginnen."

fs.writeFileSync(dePath, JSON.stringify(de, null, 2))
fs.writeFileSync(ptPath, JSON.stringify(pt, null, 2))

console.log('Keys injected successfully.')
