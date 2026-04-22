(function() {
    const MAGNET_RADIUS = 150; 
    const MAGNET_STRENGTH = 12; 
    
    let cachedHexes = [];
    let lastUpdate = 0;

    // Cache hexes once grid is rendered
    function cacheHexes() {
        cachedHexes = Array.from(document.querySelectorAll('.hex-wrap'));
    }

    document.addEventListener('mousemove', (e) => {
        const grid = document.getElementById('honeycomb-grid');
        const container = document.getElementById('memories');
        if (!grid || !container || container.classList.contains('hidden')) return;

        // Throttle to 60fps
        const now = performance.now();
        if (now - lastUpdate < 16) return;
        lastUpdate = now;

        if (cachedHexes.length === 0) cacheHexes();

        requestAnimationFrame(() => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            cachedHexes.forEach(hex => {
                const rect = hex.getBoundingClientRect();
                
                // Quick distance check
                const dx = mouseX - (rect.left + rect.width / 2);
                const dy = mouseY - (rect.top + rect.height / 2);
                
                const distSq = dx * dx + dy * dy;
                const radSq = MAGNET_RADIUS * MAGNET_RADIUS;

                if (distSq < radSq) {
                    const dist = Math.sqrt(distSq);
                    const force = (1 - dist / MAGNET_RADIUS);
                    const tx = dx * force * (MAGNET_STRENGTH / dist);
                    const ty = dy * force * (MAGNET_STRENGTH / dist);
                    
                    hex.style.transform = `translate(${tx}px, ${ty}px) scale(1.15)`;
                    hex.style.zIndex = '10';
                    hex.style.transition = 'transform 0.1s ease-out';
                } else {
                    if (hex.style.zIndex === '10') {
                        hex.style.transform = 'translate(0,0) scale(1)';
                        hex.style.zIndex = '';
                        hex.style.transition = 'transform 0.4s ease-out';
                    }
                }
            });
        });
    });

    // Reset all on mouse leave
    document.addEventListener('mouseleave', () => {
        cachedHexes.forEach(hex => {
            hex.style.transform = 'translate(0,0) scale(1)';
            hex.style.zIndex = '';
        });
    });

    // Re-cache when grid is re-rendered
    window.addEventListener('resize', () => { cachedHexes = []; });
    window.addEventListener('honeycombRendered', () => { cachedHexes = []; });
})();
