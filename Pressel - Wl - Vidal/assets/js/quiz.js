document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1;
    const totalSteps = 5;
    const userAnswers = {};
    const step2Selected = new Set();
    const quizContent = document.getElementById('quiz-content');
    const quizForm = document.getElementById('quiz-form');
    const progressSpans = document.querySelectorAll('#progress-indicator span');
    const step2Buttons = () => Array.from(document.querySelectorAll('#question-2 .visual-option'));
    const step2Images = () => Array.from(document.querySelectorAll('#question-2 .visual-option img'));
    const step3Buttons = () => Array.from(document.querySelectorAll('#question-3 .option-button'));
    const continueBtnStep2 = document.getElementById('continue-step-2');
    
    function updateProgress() {
        if (!progressSpans.length) return;
        progressSpans.forEach((span, index) => {
            if (index < currentStep) {
                span.classList.add('completed');
            } else {
                span.classList.remove('completed');
            }
        });
    }

    function showStep(stepId) {
        document.querySelectorAll('.quiz-step').forEach(el => {
            el.classList.remove('active');
        });
        const stepElement = document.getElementById(stepId);
        if (stepElement) {
            stepElement.classList.add('active');
        }
        // Esconde o botão continuar ao sair do passo 2
        if (continueBtnStep2) {
            if (stepId !== 'question-2') {
                continueBtnStep2.style.display = 'none';
                continueBtnStep2.setAttribute('aria-hidden', 'true');
                continueBtnStep2.setAttribute('aria-disabled', 'true');
            } else {
                // Atualiza visibilidade baseado na seleção atual
                updateContinueVisibility();
            }
        }
    }

    function showLoadingAndSubmit() {
        const header = document.querySelector('.quiz-header');
        if (header) {
            header.style.display = 'none';
        }
        // Configura imagens do passo de carregamento conforme o sexo
        try {
            const beforeImg = document.querySelector('.before-image');
            const afterImg = document.querySelector('.after-image');
            if (beforeImg && afterImg) {
                if (userAnswers[1] === 'f') {
                    // Mulher: por baixo corpo todo, por cima depois.webp
                    beforeImg.src = 'img/corpo-todo_1.webp';
                    beforeImg.alt = 'Imagen de cuerpo entero';
                    afterImg.src = 'img/depois.webp';
                    afterImg.alt = 'Imagen de resultado después';
                } else if (userAnswers[1] === 'm') {
                    // Homem: por baixo mão no peito-h.webp, por cima forte.webp
                    beforeImg.src = encodeURI('img/mão no peito-h.webp');
                    beforeImg.alt = 'Imagen de pecho';
                    afterImg.src = 'img/forte.webp';
                    afterImg.alt = 'Imagen fuerte';
                } else {
                    // Padrão: antes/depois
                    beforeImg.src = 'img/antes.webp';
                    beforeImg.alt = 'Imagen de resultado antes';
                    afterImg.src = 'img/depois.webp';
                    afterImg.alt = 'Imagen de resultado después';
                }
            }
        } catch (e) {
            // silencioso para não quebrar fluxo
        }
        showStep('loading-step');
        
        setTimeout(() => {
            submitQuiz();
        }, 4500); // Duração sincronizada com a animação CSS
    }

    function resetStep2Focus() {
        step2Images().forEach(img => img.classList.remove('focus-bottom'));
    }

    function updateContinueVisibility() {
        if (!continueBtnStep2) return;
        const hasSelection = step2Selected.size > 0;
        continueBtnStep2.style.display = hasSelection ? 'block' : 'none';
        continueBtnStep2.setAttribute('aria-hidden', hasSelection ? 'false' : 'true');
        continueBtnStep2.setAttribute('aria-disabled', hasSelection ? 'false' : 'true');
    }

    function toggleStep2Selection(button) {
        if (!button) return;
        const val = button.dataset.value;
        if (step2Selected.has(val)) {
            step2Selected.delete(val);
            button.classList.remove('selected');
        } else {
            step2Selected.add(val);
            button.classList.add('selected');
        }
        updateContinueVisibility();
    }

    function configureStep2ForFemale() {
        const buttons = step2Buttons();
        if (!buttons || buttons.length < 4) return;
        resetStep2Focus();
        const options = [
            { label: 'Cuerpo entero', img: 'img/corpo-todo_1.webp', alt: 'Cuerpo entero' },
            { label: 'Celulitis', img: 'img/celulite.webp', alt: 'Celulitis' },
            { label: 'Flacidez en el brazo', img: 'img/flacidez-no-braço_1.webp', alt: 'Flacidez en el brazo' },
            { label: 'Abdomen', img: 'img/barriga.webp', alt: 'Abdomen' }
        ];
        buttons.forEach((btn, i) => {
            const imgEl = btn.querySelector('img');
            const spanEl = btn.querySelector('span');
            if (imgEl && options[i]) {
                imgEl.src = options[i].img;
                imgEl.alt = `Imagen ilustrativa: ${options[i].alt}`;
                if (options[i].label === 'Abdomen') {
                    imgEl.classList.add('focus-bottom');
                }
            }
            if (spanEl && options[i]) {
                spanEl.textContent = options[i].label;
            }
        });
    }

    function configureStep2ForMale() {
        const buttons = step2Buttons();
        if (!buttons || buttons.length < 4) return;
        resetStep2Focus();
        const options = [
            { label: 'Abdomen', img: encodeURI('img/barriga-h.webp'), alt: 'Abdomen' },
            { label: 'Cuerpo entero', img: encodeURI('img/corpo todo-h.webp'), alt: 'Cuerpo entero' },
            { label: 'Papada', img: encodeURI('img/papada-h.webp'), alt: 'Papada' },
            { label: 'Pecho', img: encodeURI('img/mão no peito-h.webp'), alt: 'Pecho' }
        ];
        buttons.forEach((btn, i) => {
            const imgEl = btn.querySelector('img');
            const spanEl = btn.querySelector('span');
            if (imgEl && options[i]) {
                imgEl.src = options[i].img;
                imgEl.alt = `Imagen ilustrativa: ${options[i].alt}`;
            }
            if (spanEl && options[i]) {
                spanEl.textContent = options[i].label;
            }
        });
    }

    function configureStep3ForFemale() {
        const buttons = step3Buttons();
        if (!buttons || buttons.length < 4) return;
        const options = [
            { emoji: '😞', text: 'Siento que perdí el control sobre mi cuerpo' },
            { emoji: '👗', text: 'Parece que ninguna ropa me hace ver bonita' },
            { emoji: '🪞', text: 'Evito los espejos porque no me gusta lo que veo' },
            { emoji: '💔', text: 'Duele ver cómo cambió mi cuerpo' }
        ];
        buttons.forEach((btn, i) => {
            if (!options[i]) return;
            btn.innerHTML = `<span class="emoji">${options[i].emoji}</span> ${options[i].text}`;
        });
    }

    function configureStep3ForMale() {
        const buttons = step3Buttons();
        if (!buttons || buttons.length < 4) return;
        const options = [
            { emoji: '😞', text: 'Siento que perdí el control sobre mi cuerpo' },
            { emoji: '👔', text: 'Parece que ninguna ropa me hace ver bonito' },
            { emoji: '🪞', text: 'Evito los espejos porque no me gusta lo que veo' },
            { emoji: '💔', text: 'Duele ver cómo cambió mi cuerpo' }
        ];
        buttons.forEach((btn, i) => {
            if (!options[i]) return;
            btn.innerHTML = `<span class="emoji">${options[i].emoji}</span> ${options[i].text}`;
        });
    }

    function handleOptionSelection(event) {
        const selectedButton = event.currentTarget;
        const questionNumber = parseInt(selectedButton.dataset.question);
        const answerValue = selectedButton.dataset.value;
        
        // Passo 2: múltipla seleção (não navegar automaticamente)
        if (questionNumber === 2) {
            toggleStep2Selection(selectedButton);
            return; // Não continua fluxo automático
        }

        // Demais passos: seleção única
        userAnswers[questionNumber] = answerValue;

        // Se selecionar Mulher no Passo 1, ajustar Step 2 (imagens e labels)
        if (questionNumber === 1) {
            if (answerValue === 'f') {
                configureStep2ForFemale();
                configureStep3ForFemale();
            } else if (answerValue === 'm') {
                configureStep2ForMale();
                configureStep3ForMale();
            }
        }
        
        const optionsInStep = document.querySelectorAll(`[data-question="${questionNumber}"]`);
        optionsInStep.forEach(btn => {
            // Em passos diferentes do 2, bloqueia re-seleção
            btn.style.pointerEvents = 'none';
            if (btn === selectedButton) {
                btn.classList.add('selected');
            }
        });

        setTimeout(() => {
            if (currentStep < totalSteps) {
                currentStep++;
                updateProgress();
                showStep(`question-${currentStep}`);
            } else {
                showLoadingAndSubmit();
            }
        }, 400);
    }
    
    function submitQuiz() {
        // Garante registro de múltipla seleção do passo 2
        if (step2Selected.size > 0) {
            userAnswers[2] = Array.from(step2Selected);
        }
        for (const key in userAnswers) {
            const input = document.getElementById(`form-resposta${key}`);
            if (input) {
                const value = userAnswers[key];
                input.value = Array.isArray(value) ? value.join(',') : value;
            }
        }
        quizForm.submit();
    }

    if (quizContent) {
        document.querySelectorAll('.option-button').forEach(button => {
            button.addEventListener('click', handleOptionSelection);
        });
        if (continueBtnStep2) {
            continueBtnStep2.addEventListener('click', () => {
                // Validação: requer ao menos 1 seleção
                if (step2Selected.size === 0) {
                    updateContinueVisibility();
                    return;
                }
                // Avança para o próximo passo (3)
                userAnswers[2] = Array.from(step2Selected);
                if (currentStep === 2) {
                    currentStep++;
                    updateProgress();
                    showStep('question-3');
                }
            });
        }
        updateProgress();
    }
});