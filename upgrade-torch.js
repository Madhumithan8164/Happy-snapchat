// Upgrade: Spotlight / Torch Mode
// Replaces the Magnet Effect

(function() {
    const TORCH_RADIUS = 180; // px
    
    let cachedHexes = [];
    let lastUpdate = 0;

    function cacheHexes() {
        cachedHexes = Array.from(document.querySelectorAll('.hex-wrap'));
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
                const radSq = TORCH_RADIUS * TORCH_RADIUS;

                if (distSq < radSq) {
                    const dist = Math.sqrt(distSq);
                    const intensity = Math.max(0.1, 1 - (dist / TORCH_RADIUS));
                    
                    // Light up
                    hex.style.opacity = "1";
                    hex.style.filter = `brightness(${0.2 + intensity * 1.5}) contrast(${1 + intensity * 0.5})`;
                    hex.style.transform = `scale(${1 + intensity * 0.1})`;
                    hex.style.zIndex = '5';
                } else {
                    // Dim down
                    hex.style.opacity = "0.15";
                    hex.style.filter = "brightness(0.2) grayscale(0.5)";
                    hex.style.transform = "scale(0.95)";
                    hex.style.zIndex = '1';
                }
            });
        });
    });

    // Reset when grid is re-rendered
    window.addEventListener('resize', () => { cachedHexes = []; });
    window.addEventListener('honeycombRendered', () => { 
        cachedHexes = []; 
        // Force initial dim
        setTimeout(() => {
            document.querySelectorAll('.hex-wrap').forEach(h => {
                h.style.opacity = "0.15";
                h.style.filter = "brightness(0.2) grayscale(0.5)";
                h.style.transform = "scale(0.95)";
                h.style.transition = "all 0.4s ease";
            });
        }, 100);
    });
})();
