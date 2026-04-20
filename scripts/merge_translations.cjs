const fs = require('fs')

const currentDePath = '/Users/brunogovas/Projects/Silver Bullet/Projetos/Funil_Quiz_2.0/SILVER-BULLET-AQUISICAO-FREQUENCIA/src/i18n/locales/de/translation.json'
const oldDePath = '/tmp/old_funnel_repo_2/src/i18n/locales/de/translation.json'
const currentPtPath = '/Users/brunogovas/Projects/Silver Bullet/Projetos/Funil_Quiz_2.0/SILVER-BULLET-AQUISICAO-FREQUENCIA/src/i18n/locales/pt/translation.json'

const currDe = JSON.parse(fs.readFileSync(currentDePath, 'utf8'))
const oldDe = JSON.parse(fs.readFileSync(oldDePath, 'utf8'))
const currPt = JSON.parse(fs.readFileSync(currentPtPath, 'utf8'))

// Copy keys required from oldDE to currDe
currDe.checkout_modal = oldDe.checkout_modal
currDe.inner_peace_plan = oldDe.inner_peace_plan
currDe.comments = oldDe.comments
currDe.vsl_comments_data = oldDe.vsl_comments_data
currDe.quiz_landing = oldDe.quiz_landing
currDe.checkout_cancel = oldDe.checkout_cancel
currDe.checkout_success = oldDe.checkout_success
currDe.plan_extended = oldDe.plan_extended

if (!currDe.checkout_prompt) {
    currDe.checkout_prompt = { error_generic: "Fehler." }
}

// Ensure 'compontTest' is mirrored from currPt to currDe
currDe.compontTest = currPt.compontTest || {
    feature1: "Exame Vibracional",
    feature2: "Sincronização em tempo real"
} // We will just insert the German translation properly.
currDe.compontTest = {
    feature1: "Vibrationsuntersuchung",
    feature2: "Echtzeitsynchronisation"
}

fs.writeFileSync(currentDePath, JSON.stringify(currDe, null, 2))

// Now ensure we update PT's compontTest if it doesn't exist
if (!currPt.compontTest) {
    currPt.compontTest = {
        feature1: "Exame Vibracional",
        feature2: "Sincronização em tempo real"
    }
    fs.writeFileSync(currentPtPath, JSON.stringify(currPt, null, 2))
}

console.log('Merged DE translations successfully.')
