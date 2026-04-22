// Upgrade: Cursor Ripple Wave
// Replaces the Torch Mode

(function() {
    const RIPPLE_RADIUS = 250; 
    
    let cachedHexes = [];
    let lastUpdate = 0;

    function cacheHexes() {
        cachedHexes = Array.from(document.querySelectorAll('.hex-wrap'));
        // Reset styles for ripple mode
        cachedHexes.forEach(h => {
            h.style.opacity = "1";
            h.style.filter = "none";
            h.style.transform = "scale(1)";
        });
    }

    document.addEventListener('mousemove', (e) => {
        const grid = document.getElementById('honeycomb-grid');
        const container = document.getElementById('memories');
        if (!grid || !container || container.classList.contains('hidden')) return;

        const now = performance.now();
        if (now - lastUpdate < 16) return;
        lastUpdate = now;

        if (cachedHexes.length === 0) cacheHexes();

        requestAnimationFrame(() => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            cachedHexes.forEach(hex => {
                const rect = hex.getBoundingClientRect();
                const hexCX = rect.left + rect.width / 2;
                const hexCY = rect.top + rect.height / 2;
                
                const dx = mouseX - hexCX;
                const dy = mouseY - hexCY;
                const distSq = dx * dx + dy * dy;
                const radSq = RIPPLE_RADIUS * RIPPLE_RADIUS;

                if (distSq < radSq) {
                    const dist = Math.sqrt(distSq);
                    const force = 1 - (dist / RIPPLE_RADIUS);
                    
                    // Ripple Wave Math
                    const scale = 1 + (Math.sin(force * Math.PI) * 0.4);
                    const brightness = 1 + (force * 0.5);
                    
                    hex.style.transform = `scale(${scale})`;
                    hex.style.filter = `brightness(${brightness})`;
                    hex.style.zIndex = Math.floor(force * 100);
                    hex.style.transition = 'transform 0.15s cubic-bezier(0.2, 0, 0.4, 1), filter 0.15s ease';
                } else {
                    if (hex.style.transform !== 'scale(1)') {
                        hex.style.transform = "scale(1)";
                        hex.style.filter = "brightness(1)";
                        hex.style.zIndex = '1';
                        hex.style.transition = 'transform 0.5s cubic-bezier(0.2, 0, 0.4, 1), filter 0.5s ease';
                    }
                }
            });
        });
    });

    // Reset when grid is re-rendered
    window.addEventListener('resize', () => { cachedHexes = []; });
    window.addEventListener('honeycombRendered', () => { 
        cachedHexes = []; 
    });
})();
