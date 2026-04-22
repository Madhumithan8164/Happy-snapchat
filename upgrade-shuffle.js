// Upgrade 4 — Shuffle & Re-animate with 3D Card Flip

function initShuffle() {
    if (document.getElementById('shuffle-btn')) return;

    // Inject floating button
    const btn = document.createElement('button');
    btn.id = 'shuffle-btn';
    btn.innerHTML = '🔀 Shuffle';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.textContent = 'Shuffling...';

        const hexes = [...document.querySelectorAll('.hex-wrap')];

        // Phase 1: all flip face-down (staggered 8ms apart)
        hexes.forEach((hex, i) => {
            setTimeout(() => {
                hex.classList.add('flipping');
            }, i * 8);
        });

        // Phase 2: after all flipped, shuffle the content
        const totalFlipTime = hexes.length * 8 + 350;
        setTimeout(() => {
            // Get all current images and captions
            const data = hexes.map(h => ({
                src: h.querySelector('img').src,
                cap: h.querySelector('.hex-caption').textContent
            }));

            // Fisher-Yates shuffle
            for (let i = data.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [data[i], data[j]] = [data[j], data[i]];
            }

            // Assign new data while cards are face-down
            hexes.forEach((hex, i) => {
                hex.querySelector('img').src = data[i].src;
                if (hex.querySelector('.hex-caption'))
                    hex.querySelector('.hex-caption').textContent = data[i].cap;
            });

            // Phase 3: flip back, staggered
            hexes.forEach((hex, i) => {
                setTimeout(() => {
                    hex.classList.remove('flipping');
                }, i * 12);
            });

            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = '🔀 Shuffle';
            }, hexes.length * 12 + 500);

        }, totalFlipTime);
    });
}

window.initShuffle = initShuffle;
