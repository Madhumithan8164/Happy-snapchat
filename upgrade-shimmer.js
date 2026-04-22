// Upgrade 5 — Idle Shimmer Wave (Optimized)

function initShimmer() {
    const grid = document.getElementById('honeycomb-grid');
    if (!grid) return;
    
    let isHovered = false;
    let shimmerInterval = null;
    let cachedColumns = [];

    grid.addEventListener('mouseenter', () => { isHovered = true; stopShimmer(); });
    grid.addEventListener('mouseleave', () => { isHovered = false; startShimmer(); });

    function cacheColumns() {
        const hexes = [...document.querySelectorAll('.hex-wrap')];
        const cols = {};
        hexes.forEach(hex => {
            const col = Math.round(hex.getBoundingClientRect().left / 10); 
            if (!cols[col]) cols[col] = [];
            cols[col].push(hex);
        });
        cachedColumns = Object.values(cols).sort((a,b) =>
            a[0].getBoundingClientRect().left - b[0].getBoundingClientRect().left
        );
    }

    function runShimmer() {
        if (isHovered || cachedColumns.length === 0) return;
        
        cachedColumns.forEach((colHexes, colIdx) => {
            setTimeout(() => {
                if (isHovered) return;
                colHexes.forEach(hex => {
                    hex.classList.add('shimmer-active');
                    setTimeout(() => hex.classList.remove('shimmer-active'), 500);
                });
            }, colIdx * 50);
        });
    }

    function startShimmer() {
        if (shimmerInterval) clearInterval(shimmerInterval);
        if (cachedColumns.length === 0) cacheColumns();
        
        shimmerInterval = setInterval(runShimmer, 6000);
        // Initial run
        setTimeout(runShimmer, 1000);
    }

    function stopShimmer() {
        if (shimmerInterval) clearInterval(shimmerInterval);
        document.querySelectorAll('.hex-wrap.shimmer-active')
            .forEach(h => h.classList.remove('shimmer-active'));
    }

    // Reset cache on resize or re-render
    window.addEventListener('resize', () => { cachedColumns = []; });
    window.addEventListener('honeycombRendered', () => { cachedColumns = []; });

    startShimmer();
}

window.initShimmer = initShimmer;
