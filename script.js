const deckContainer = document.getElementById('deck');
const magCard = document.getElementById('magician-card');
const btn = document.getElementById('btn-action');
const status = document.getElementById('status-text');

const suits = ['♥', '♦', '♣', '♠'];
const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

function initDeck() {
    deckContainer.innerHTML = '';
    let i = 0;
    for (let s of suits) {
        for (let v of values) {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `<b>${v}</b><br>${s}`;
            if (s === '♥' || s === '♦') card.style.color = 'red';

            // Ângulo do leque profissional (-60 a 60 graus)
            const angle = -60 + (i * (120 / 51));
            card.style.transform = `rotate(${angle}deg) translate(120px)`;
            card.style.zIndex = i;

            card.onclick = () => pickCard(card, v, s);
            deckContainer.appendChild(card);
            i++;
        }
    }
}

function pickCard(el, v, s) {
    if (!magCard.classList.contains('flipped')) return;

    status.innerText = "Analisando sua mente...";
    
    // Animação de movimento para o slot
    const slot = document.getElementById('slot').getBoundingClientRect();
    const rect = el.getBoundingClientRect();

    el.style.zIndex = 500;
    el.style.transform = `translate(${slot.left - rect.left}px, ${slot.top - rect.top}px) rotate(0deg)`;
    
    setTimeout(() => {
        magCard.classList.remove('flipped'); // Mágico vira de frente
        status.innerText = `Você escolheu o ${v} de ${s}!`;
        el.style.boxShadow = "0 0 30px gold";
    }, 1500);
}

btn.onclick = () => {
    initDeck();
    magCard.classList.add('flipped'); // Mágico vira de costas
    status.innerText = "O Mágico não está olhando. Escolha uma carta!";
    btn.style.visibility = 'hidden';
};

initDeck();