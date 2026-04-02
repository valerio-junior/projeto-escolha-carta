// ========================================
// ELEMENTOS DOM
// ========================================
const deckContainer = document.getElementById('deck');
const magCard = document.getElementById('magician-card');
const btn = document.getElementById('btn-action');
const btnReset = document.getElementById('btn-reset');
const status = document.getElementById('status-text');
const slot = document.getElementById('slot');
const particlesContainer = document.getElementById('particles');

// ========================================
// DADOS DAS CARTAS
// ========================================
const suits = {
    '♥': { name: 'Copas', color: 'red' },
    '♦': { name: 'Ouros', color: 'red' },
    '♣': { name: 'Paus', color: 'black' },
    '♠': { name: 'Espadas', color: 'black' }
};

const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const valueNames = {
    'A': 'Ás',
    'J': 'Valete',
    'Q': 'Dama',
    'K': 'Rei'
};

let selectedCard = null;
let isAnimating = false;

// ========================================
// ANIMAÇÃO DE PARTÍCULAS
// ========================================
function createParticles() {
    const particleCount = window.innerWidth < 600 ? 15 : 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (6 + Math.random() * 4) + 's';
        particlesContainer.appendChild(particle);
    }
}

// ========================================
// INICIALIZAÇÃO DO BARALHO
// ========================================
function initDeck() {
    deckContainer.innerHTML = '';
    selectedCard = null;
    
    let cardIndex = 0;
    const totalCards = 52;
    
    // Ajusta para telas menores
    let angleSpread, translateDistance;
    if (window.innerHeight < 550) {
        angleSpread = 80;
        translateDistance = 50;
    } else if (window.innerHeight < 700 || window.innerWidth < 600) {
        angleSpread = 90;
        translateDistance = 60;
    } else {
        angleSpread = 110;
        translateDistance = 80;
    }
    
    const startAngle = -angleSpread / 2;
    
    for (const suit in suits) {
        for (const value of values) {
            const card = createCard(value, suit, cardIndex, totalCards, startAngle, angleSpread, translateDistance);
            deckContainer.appendChild(card);
            cardIndex++;
        }
    }
}

function createCard(value, suit, index, total, startAngle, angleSpread, translateDistance) {
    const card = document.createElement('div');
    card.className = `card ${suits[suit].color}`;
    
    const angle = startAngle + (index * (angleSpread / (total - 1)));
    card.style.transform = `rotate(${angle}deg) translateY(-${translateDistance}px)`;
    card.style.zIndex = index;
    
    card.innerHTML = `
        <div class="card-inner">
            <div class="card-face card-front">
                <div class="card-corner top">
                    <span class="card-value">${value}</span>
                    <span class="card-suit-small">${suit}</span>
                </div>
                <span class="card-center">${suit}</span>
                <div class="card-corner bottom">
                    <span class="card-value">${value}</span>
                    <span class="card-suit-small">${suit}</span>
                </div>
            </div>
            <div class="card-face card-back"></div>
        </div>
    `;
    
    card.addEventListener('click', () => pickCard(card, value, suit));
    
    return card;
}

// ========================================
// SELEÇÃO DE CARTA
// ========================================
async function pickCard(cardElement, value, suit) {
    if (!magCard.classList.contains('flipped') || isAnimating || selectedCard) return;
    
    isAnimating = true;
    selectedCard = cardElement;
    cardElement.classList.add('selected');
    
    // Atualizar status com mensagem misteriosa
    updateStatus('Concentrando energia mística...', 'O mágico está lendo sua mente');

    // Encontrar posição do slot e da carta
    const cardRect = cardElement.getBoundingClientRect();
    const slotRect = slot.getBoundingClientRect();

    // Posicionar em fixed para animação global confiável
    cardElement.style.position = 'fixed';
    cardElement.style.left = `${cardRect.left}px`;
    cardElement.style.top = `${cardRect.top}px`;
    cardElement.style.right = 'auto';
    cardElement.style.bottom = 'auto';
    cardElement.style.transform = 'none';
    cardElement.style.zIndex = '1000';
    cardElement.style.transition = 'all 0.8s var(--transition-smooth)';
    document.body.appendChild(cardElement);

    const targetLeft = slotRect.left + (slotRect.width - cardRect.width) / 2;
    const targetTop = slotRect.top + (slotRect.height - cardRect.height) / 2;

    await new Promise(resolve => {
        const onTransitionEnd = (event) => {
            if (event.propertyName === 'left' || event.propertyName === 'top') {
                cardElement.removeEventListener('transitionend', onTransitionEnd);
                resolve();
            }
        };

        cardElement.addEventListener('transitionend', onTransitionEnd);
        requestAnimationFrame(() => {
            cardElement.style.left = `${targetLeft}px`;
            cardElement.style.top = `${targetTop}px`;
        });
    });

    // Ajustar para dentro do slot
    slot.classList.add('has-card');
    slot.appendChild(cardElement);
    cardElement.style.transition = '';
    cardElement.style.position = 'absolute';
    cardElement.style.left = '50%';
    cardElement.style.top = '50%';
    cardElement.style.transform = 'translate(-50%, -50%)';
    cardElement.style.zIndex = '2';

    // Virar carta para baixo depois de “chegar”
    cardElement.classList.add('face-down');
    updateStatus('Carta escondida...', 'O mágico agora vai se concentrar para ler sua mente');

    // Pausa dramática antes da revelação
    setTimeout(() => {
        // Virar mágico de volta para frente
        magCard.classList.remove('flipped');
        updateStatus('Revelando...', 'A mente foi lida...');

        setTimeout(() => {
            // Virar carta para cima para revelar
            cardElement.classList.remove('face-down');

            // Adicionar efeito de brilho à carta selecionada
            cardElement.querySelector('.card-inner').style.boxShadow = '0 0 40px var(--gold), 0 0 80px rgba(201, 162, 39, 0.5)';

            setTimeout(() => {
                const valueName = valueNames[value] || value;
                const suitName = suits[suit].name;

                updateStatus(
                    `${valueName} de ${suitName}!`,
                    'O mágico nunca falha... Sua mente foi lida com precisão'
                );

                // Mostrar botão de reset
                btnReset.classList.remove('hidden');
                isAnimating = false;
            }, 600);
        }, 800);
    }, 450);
}

// ========================================
// ATUALIZAÇÕES DE STATUS
// ========================================
function updateStatus(mainText, subtitleText) {
    const statusLine = status.querySelector('.status-line');
    const statusSubtitle = status.querySelector('.status-subtitle');
    
    // Desvanecer
    status.style.opacity = '0';
    status.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
        statusLine.textContent = mainText;
        statusSubtitle.textContent = subtitleText;
        
        // Aparecer
        status.style.transition = 'all 0.5s ease';
        status.style.opacity = '1';
        status.style.transform = 'translateY(0)';
    }, 300);
}

// ========================================
// CONTROLES DO JOGO
// ========================================
function startTrick() {
    // Inicializar baralho com animação
    initDeck();
    
    // Animar cartas aparecendo
    const cards = deckContainer.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease, transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
            card.style.opacity = '1';
        }, index * 20);
    });
    
    // Virar mágico para mostrar costas (olhando para longe)
    setTimeout(() => {
        magCard.classList.add('flipped');
        slot.classList.add('active');
        
        updateStatus(
            'O Mágico virou de costas...',
            'Escolha uma carta com cuidado. Ele sentirá sua escolha.'
        );
        
        btn.classList.add('hidden');
    }, 400);
}

function resetTrick() {
    // Resetar tudo
    slot.classList.remove('has-card', 'active');
    const selected = slot.querySelector('.card');
    if (selected) {
        selected.remove();
    }
    btnReset.classList.add('hidden');
    btn.classList.remove('hidden');
    
    // Resetar status
    updateStatus(
        'O Mestre das Cartas aguarda...',
        'Prepare-se para testemunhar o impossível'
    );
    
    // Limpar baralho com desvanecimento
    const cards = deckContainer.querySelectorAll('.card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8) rotate(0deg)';
        }, index * 10);
    });
    
    setTimeout(() => {
        deckContainer.innerHTML = '';
        initDeck();
    }, 600);
}

// ========================================
// OUVINTES DE EVENTOS
// ========================================
btn.addEventListener('click', startTrick);
btnReset.addEventListener('click', resetTrick);

// Lidar com redimensionamento da janela
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (!selectedCard && !magCard.classList.contains('flipped')) {
            initDeck();
        }
    }, 250);
});

// ========================================
// INICIALIZAÇÃO
// ========================================
createParticles();
initDeck();
