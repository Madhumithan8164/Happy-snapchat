// Upgrade 2 — Emoji Reaction System
// Note: Adapted to localStorage for this local-build project

function attachReactions(hexEl, photoId) {
    let bar = null;

    hexEl.addEventListener('mouseenter', () => {
        if (bar) return;
        bar = document.createElement('div');
        bar.className = 'reaction-bar';
        bar.innerHTML = `
            <button data-e="❤️">❤️ <span>0</span></button>
            <button data-e="🔥">🔥 <span>0</span></button>
            <button data-e="😂">😂 <span>0</span></button>
            <button data-e="😭">😭 <span>0</span></button>
        `;
        hexEl.appendChild(bar);

        // Load counts from LocalStorage
        const allReactions = JSON.parse(localStorage.getItem('photo_reactions') || '{}');
        const photoData = allReactions[photoId] || {};
        
        bar.querySelectorAll('button').forEach(btn => {
            const e = btn.dataset.e;
            btn.querySelector('span').textContent = photoData[e] || 0;
        });

        // Reaction click
        bar.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (ev) => {
                ev.stopPropagation();
                const emoji = btn.dataset.e;
                launchParticle(emoji, hexEl);

                // Increment in LocalStorage
                const currentAll = JSON.parse(localStorage.getItem('photo_reactions') || '{}');
                if (!currentAll[photoId]) currentAll[photoId] = {};
                currentAll[photoId][emoji] = (currentAll[photoId][emoji] || 0) + 1;
                localStorage.setItem('photo_reactions', JSON.stringify(currentAll));

                const cur = parseInt(btn.querySelector('span').textContent) || 0;
                btn.querySelector('span').textContent = cur + 1;
                
                // Visual feedback
                btn.style.transform = "scale(1.4)";
                setTimeout(() => btn.style.transform = "", 150);
            });
        });
    });

    hexEl.addEventListener('mouseleave', () => {
        if (bar) {
            bar.remove();
            bar = null;
        }
    });
}

function launchParticle(emoji, hexEl) {
    const rect = hexEl.getBoundingClientRect();
    // Spawn 3 particles with slight random offsets
    for (let i = 0; i < 3; i++) {
        const p = document.createElement('div');
        p.className = 'emoji-particle';
        p.textContent = emoji;
        p.style.left = (rect.left + rect.width / 2 + (Math.random() - 0.5) * 30) + 'px';
        p.style.top = (rect.top + rect.height / 2) + 'px';
        p.style.animationDelay = (i * 80) + 'ms';
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1200);
    }
}

window.attachReactions = attachReactions;
