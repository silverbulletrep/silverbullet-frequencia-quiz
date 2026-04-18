// Gerenciador de Áudio Global - Frequências Vibracionais
// Importante: Coloque o arquivo de áudio (ex: 432hz.mp3) na pasta public/audio/
// e mude o nome do arquivo para /audio/432hz_ambient.mp3 (dependendo de onde estiver servido).

let audioInstance = null;
let isPlaying = false;

export const startMindfulAudio = () => {
    if (typeof window === 'undefined') return;
    try {
        if (!audioInstance) {
            // Placeholder: Substituir pelo asset real no public/audio/
            const audioSrc = import.meta.env.BASE_URL 
                ? `${import.meta.env.BASE_URL}audio/432hz_ambient.mp3`.replace('//', '/')
                : '/audio/432hz_ambient.mp3';
                
            audioInstance = new Audio(audioSrc); 
            audioInstance.loop = true;
            audioInstance.volume = 0.25; // Volume sutil (Mindfulness)
        }
        if (!isPlaying) {
            const playPromise = audioInstance.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    isPlaying = true;
                }).catch(e => {
                    console.warn('[Audio] Autoplay com bloqueio preventivo do browser:', e);
                });
            }
        }
    } catch (e) {
        console.warn('[Audio] Falha ao iniciar:', e);
    }
};

export const stopMindfulAudio = () => {
    try {
        if (audioInstance && isPlaying) {
            audioInstance.pause();
            audioInstance.currentTime = 0;
            isPlaying = false;
        }
    } catch (e) {}
};
