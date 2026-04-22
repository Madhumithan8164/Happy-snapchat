// Upgrade 3 — Full-Screen Hex Bloom Lightbox

function initHexLightbox(photos) {
    if (document.getElementById('hex-lightbox')) return;

    const lb = document.createElement('div');
    lb.id = 'hex-lightbox';
    lb.innerHTML = `
        <div id="lb-backdrop"></div>
        <div id="lb-panel">
            <img id="lb-img" src="" alt="">
            <div id="lb-meta">
                <span id="lb-caption"></span>
                <span id="lb-year"></span>
            </div>
            <button id="lb-prev" class="lb-nav-btn">&#8592;</button>
            <button id="lb-next" class="lb-nav-btn">&#8594;</button>
            <button id="lb-close">&#x2715;</button>
        </div>
    `;
    document.body.appendChild(lb);

    let currentIdx = 0;

    function open(idx, originHex) {
        currentIdx = idx;
        const photo = photos[idx];
        const rect = originHex.getBoundingClientRect();

        // Set clip-path start point = hex position on screen
        const cx = ((rect.left + rect.width / 2) / window.innerWidth * 100).toFixed(1);
        const cy = ((rect.top + rect.height / 2) / window.innerHeight * 100).toFixed(1);

        const panel = document.getElementById('lb-panel');
        panel.style.clipPath = `polygon(${cx}% ${cy}%, ${cx}% ${cy}%, ${cx}% ${cy}%, ${cx}% ${cy}%, ${cx}% ${cy}%, ${cx}% ${cy}%)`;

        document.getElementById('lb-img').src = photo.src;
        document.getElementById('lb-caption').textContent = photo.caption || '';
        document.getElementById('lb-year').textContent = photo.year || '';
        lb.classList.add('active');

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                panel.style.transition = 'clip-path 0.55s cubic-bezier(0.4,0,0.2,1)';
                panel.style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 100% 0%)';
            });
        });
    }

    function close() {
        console.log("Closing lightbox...");
        const panel = document.getElementById('lb-panel');
        if (panel) {
            panel.style.clipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
        }
        setTimeout(() => {
            lb.classList.remove('active');
            console.log("Lightbox closed.");
        }, 500);
    }

    function navigate(dir) {
        currentIdx = (currentIdx + dir + photos.length) % photos.length;
        const img = document.getElementById('lb-img');
        if (!img) return;
        img.style.opacity = '0';
        setTimeout(() => {
            img.src = photos[currentIdx].src;
            document.getElementById('lb-caption').textContent = photos[currentIdx].caption || '';
            document.getElementById('lb-year').textContent = photos[currentIdx].year || '';
            img.style.opacity = '1';
        }, 200);
    }

    // Attach events with more robustness
    lb.addEventListener('click', (e) => {
        if (e.target.id === 'hex-lightbox' || e.target.id === 'lb-backdrop' || e.target.id === 'lb-panel') {
            close();
        }
    });

    const closeBtn = document.getElementById('lb-close');
    if (closeBtn) {
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            close();
        };
    }

    document.getElementById('lb-prev').onclick = (e) => { e.stopPropagation(); navigate(-1); };
    document.getElementById('lb-next').onclick = (e) => { e.stopPropagation(); navigate(1); };
    
    document.addEventListener('keydown', e => {
        if (!lb.classList.contains('active')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') navigate(-1);
        if (e.key === 'ArrowRight') navigate(1);
    });

    window.openHexLightbox = open;
}

window.initHexLightbox = initHexLightbox;
