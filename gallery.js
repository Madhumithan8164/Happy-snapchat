document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Confetti Burst
    confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.1 },
        colors: ['#000000', '#FFFC00', '#FF007F', '#00E5FF']
    });

    // 2. Populate Grid with Photos
    const yearlyContainer = document.getElementById('yearly-gallery-container');
    const cloudinaryGrid = document.getElementById('cloudinary-grid');
    const recentSection = document.getElementById('recent-snaps');

    const CLOUD_NAME = "harshitha-s"; 
    const UPLOAD_PRESET = "dpjakoxyg";
    const TAG = "birthday_memories";



    async function loadGallery() {
        // --- 1. Load Cloudinary Snaps (Dynamic) ---
        try {
            const response = await fetch(`https://res.cloudinary.com/${CLOUD_NAME}/image/list/${TAG}.json`);
            if (response.ok) {
                const data = await response.json();
                if (data.resources.length > 0) {
                    recentSection.classList.remove('hidden');
                    data.resources.forEach(resource => {
                        const url = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/q_auto,f_auto/${resource.public_id}.${resource.format}`;
                        addTileToGrid(cloudinaryGrid, url);
                    });
                }
            }
        } catch (e) { console.warn("Cloudinary fetch failed or no images yet."); }

        // --- 2. Load Local Yearly Snaps (from photos.json) ---
        try {
            const response = await fetch('./photos.json');
            if (response.ok) {
                const yearsData = await response.json(); // Format: { "2021": ["img1.jpg", "img2.jpg"], "2022": [...] }
                
                Object.keys(yearsData).sort((a, b) => b - a).forEach(year => {
                    const section = createYearSection(year);
                    const grid = section.querySelector('.gallery-grid');
                    yearsData[year].forEach(fileName => {
                        const url = `./${year}/${fileName}`;
                        addTileToGrid(grid, url, fileName);
                    });
                    yearlyContainer.appendChild(section);
                });
            } else {
                // Fallback if no photos.json exists yet
                const fallbackSection = createYearSection("2021");
                loadPlaceholders(fallbackSection.querySelector('.gallery-grid'));
                yearlyContainer.appendChild(fallbackSection);
            }
        } catch (e) {
            console.error("Error loading photos.json:", e);
        }
    }

    function createYearSection(year) {
        const section = document.createElement('section');
        section.className = 'year-section';
        section.innerHTML = `
            <h2 class="year-title">${year}</h2>
            <div class="gallery-grid"></div>
        `;
        return section;
    }

    const hiddenSnaps = JSON.parse(localStorage.getItem('hiddenSnaps') || '[]');

    function addTileToGrid(grid, url, fileName = "") {
        // Skip if already hidden
        if (hiddenSnaps.includes(fileName)) return;

        const tile = document.createElement('div');
        tile.className = 'gallery-tile';
        
        const isVideo = url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.mov');
        
        if (isVideo) {
            const video = document.createElement('video');
            video.src = url;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.className = 'tile-media';
            // Play on hover
            tile.onmouseenter = () => video.play();
            tile.onmouseleave = () => { video.pause(); video.currentTime = 0; };
            tile.appendChild(video);
            
            const videoIcon = document.createElement('div');
            videoIcon.className = 'video-icon';
            videoIcon.innerHTML = '▶';
            tile.appendChild(videoIcon);
        } else {
            const img = document.createElement('img');
            img.src = url;
            img.loading = "lazy";
            img.className = 'tile-media';
            tile.appendChild(img);
        }
        
        // --- Move to Bin Button ---
        if (fileName) { // Only for local photos
            const binBtn = document.createElement('div');
            binBtn.className = 'move-to-bin-btn';
            binBtn.innerHTML = '🗑️';
            binBtn.title = "Move to Bin";
            binBtn.onclick = (e) => {
                e.stopPropagation();
                moveToBin(fileName, tile);
            };
            tile.appendChild(binBtn);
        }

        // --- Lightbox Click Event ---
        tile.addEventListener('click', () => {
            openLightbox(url, isVideo);
        });

        grid.appendChild(tile);
    }

    function moveToBin(fileName, tileElement) {
        if (confirm(`Move "${fileName}" to the bin?`)) {
            hiddenSnaps.push(fileName);
            localStorage.setItem('hiddenSnaps', JSON.stringify(hiddenSnaps));
            
            // Animation
            gsap.to(tileElement, {
                scale: 0,
                opacity: 0,
                duration: 0.5,
                ease: "back.in(1.7)",
                onComplete: () => tileElement.remove()
            });

            confetti({
                particleCount: 50,
                spread: 30,
                origin: { y: 0.8 }
            });
        }
    }

    // --- Admin Sync Panel Logic ---
    const adminBtn = document.getElementById('admin-sync-btn');
    const syncModal = document.getElementById('sync-modal');
    const syncList = document.getElementById('sync-list');
    const closeSync = document.getElementById('close-sync-btn');
    const clearSyncBtn = document.getElementById('clear-sync-btn');

    if (clearSyncBtn) {
        clearSyncBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to clear the Bin Sync List? Do this ONLY after you have manually moved the files to the stealth cache.")) {
                hiddenSnaps.length = 0;
                localStorage.setItem('hiddenSnaps', '[]');
                syncList.innerHTML = "No snaps in the bin yet.";
                alert("Bin Sync List cleared!");
            }
        });
    }

    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            syncList.innerHTML = hiddenSnaps.map(name => `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
                    <span>${name}</span>
                    <button class="snap-pill-btn" style="padding: 2px 10px; font-size: 0.7rem; background: var(--accent-blue);" onclick="restorePhoto('${name}')">Restore</button>
                </div>
            `).join('') || "No snaps in the bin yet.";
            syncModal.classList.remove('hidden');
        });
    }

    // Make restorePhoto available globally for the onclick attribute
    window.restorePhoto = (fileName) => {
        const index = hiddenSnaps.indexOf(fileName);
        if (index > -1) {
            hiddenSnaps.splice(index, 1);
            localStorage.setItem('hiddenSnaps', JSON.stringify(hiddenSnaps));
            alert(`✅ ${fileName} restored! Refreshing gallery...`);
            location.reload(); // Refresh to show the restored photo
        }
    };

    if (closeSync) {
        closeSync.addEventListener('click', () => syncModal.classList.add('hidden'));
    }

    // --- Lightbox Functions ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');

    function openLightbox(url, isVideo) {
        // Clear previous content
        lightbox.querySelectorAll('img, video').forEach(el => {
            if (el.id !== 'lightbox-img') el.remove();
        });
        lightboxImg.classList.add('hidden');

        if (isVideo) {
            const video = document.createElement('video');
            video.src = url;
            video.controls = true;
            video.autoplay = true;
            video.className = 'lightbox-content';
            video.id = 'lightbox-video';
            lightbox.appendChild(video);
        } else {
            lightboxImg.src = url;
            lightboxImg.classList.remove('hidden');
        }

        lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => {
            const video = document.getElementById('lightbox-video');
            if (video) video.pause();
            lightbox.classList.add('hidden');
            document.body.style.overflow = 'auto';
        });

        // Close on clicking background
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                const video = document.getElementById('lightbox-video');
                if (video) video.pause();
                lightbox.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        });
    }

    function loadPlaceholders(grid) {
        for (let i = 0; i < 8; i++) {
            addTileToGrid(grid, `https://picsum.photos/400/600?random=${i + 100}`);
        }
    }

    loadGallery();

    // 3. Vault Tile Interaction
    const vault = document.getElementById('secret-vault');
    if (vault) {
        vault.addEventListener('click', () => {
            alert("🔒 Password Required: Enter '69 & 96' in the Chat UI on the Home Page to unlock the vault!");
        });
    }

    // 4. Cloudinary Upload Widget
    const addPhotoBtn = document.getElementById('add-photo-btn');
    if (addPhotoBtn) {
        const myWidget = cloudinary.createUploadWidget({
            cloudName: CLOUD_NAME, 
            uploadPreset: UPLOAD_PRESET,
            tags: [TAG], // Automatically tag images so they show up in the gallery
            sources: ['local', 'camera', 'facebook', 'instagram'],
            multiple: true,
            cropping: false,
            styles: {
                palette: {
                    window: "#FFFC00",
                    sourceBg: "#FFFFFF",
                    windowBorder: "#000000",
                    tabIcon: "#000000",
                    inactiveTabIcon: "#555a5f",
                    menuIcons: "#000000",
                    link: "#FF007F",
                    action: "#000000",
                    inProgress: "#FF007F",
                    complete: "#20B832",
                    error: "#E41317",
                    textDark: "#000000",
                    textLight: "#FFFFFF"
                }
            }
        }, (error, result) => { 
            if (!error && result && result.event === "success") { 
                console.log('Done! Here is the image info: ', result.info); 
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                // Reload gallery to show new photo
                setTimeout(loadGallery, 1000);
            }
        });

        addPhotoBtn.addEventListener('click', () => {
            myWidget.open();
        }, false);
    }
});
