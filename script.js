// ========================================
// DOM ELEMENTS
// ========================================
const deckContainer = document.getElementById('deck');
const magCard = document.getElementById('magician-card');
const btn = document.getElementById('btn-action');
const btnReset = document.getElementById('btn-reset');
const status = document.getElementById('status-text');
const slot = document.getElementById('slot');
const particlesContainer = document.getElementById('particles');

// ========================================
// CARD DATA
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
// PARTICLES ANIMATION
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
// DECK INITIALIZATION
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
// CARD SELECTION
// ========================================
function pickCard(cardElement, value, suit) {
    if (!magCard.classList.contains('flipped') || isAnimating || selectedCard) return;
    
    isAnimating = true;
    selectedCard = cardElement;
    cardElement.classList.add('selected');
    
    // Update status with mysterious message
    updateStatus('Concentrando energia mística...', 'O mágico está lendo sua mente');
    
    // Get positions for animation
    const slotRect = slot.getBoundingClientRect();
    const cardRect = cardElement.getBoundingClientRect();
    
    // Calculate translation
    const translateX = slotRect.left - cardRect.left + (slotRect.width - cardRect.width) / 2;
    const translateY = slotRect.top - cardRect.top + (slotRect.height - cardRect.height) / 2;
    
    // Animate card to slot
    cardElement.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
    cardElement.style.transform = `translate(${translateX}px, ${translateY}px) rotate(0deg) scale(1.1)`;
    
    slot.classList.add('has-card');
    
    // Dramatic pause before reveal
    setTimeout(() => {
        // Flip magician back to front
        magCard.classList.remove('flipped');
        
        // Add glow effect to selected card
        cardElement.querySelector('.card-inner').style.boxShadow = '0 0 40px var(--gold), 0 0 80px rgba(201, 162, 39, 0.5)';
        
        setTimeout(() => {
            // Reveal the card
            const valueName = valueNames[value] || value;
            const suitName = suits[suit].name;
            
            updateStatus(
                `${valueName} de ${suitName}!`,
                'O mágico nunca falha... Sua mente foi lida com precisão'
            );
            
            // Show reset button
            btnReset.classList.remove('hidden');
            isAnimating = false;
        }, 800);
    }, 1500);
}

// ========================================
// STATUS UPDATES
// ========================================
function updateStatus(mainText, subtitleText) {
    const statusLine = status.querySelector('.status-line');
    const statusSubtitle = status.querySelector('.status-subtitle');
    
    // Fade out
    status.style.opacity = '0';
    status.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
        statusLine.textContent = mainText;
        statusSubtitle.textContent = subtitleText;
        
        // Fade in
        status.style.transition = 'all 0.5s ease';
        status.style.opacity = '1';
        status.style.transform = 'translateY(0)';
    }, 300);
}

// ========================================
// GAME CONTROLS
// ========================================
function startTrick() {
    // Initialize deck with animation
    initDeck();
    
    // Animate cards appearing
    const cards = deckContainer.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease, transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
            card.style.opacity = '1';
        }, index * 20);
    });
    
    // Flip magician to show back (looking away)
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
    // Reset everything
    slot.classList.remove('has-card', 'active');
    btnReset.classList.add('hidden');
    btn.classList.remove('hidden');
    
    // Reset status
    updateStatus(
        'O Mestre das Cartas aguarda...',
        'Prepare-se para testemunhar o impossível'
    );
    
    // Clear deck with fade out
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
// EVENT LISTENERS
// ========================================
btn.addEventListener('click', startTrick);
btnReset.addEventListener('click', resetTrick);

// Handle window resize
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
// INITIALIZATION
// ========================================
createParticles();
initDeck();
