const startArBtn = document.getElementById('start-ar-btn');
const arContainer = document.getElementById('ar-container');
const arSceneWrapper = document.getElementById('ar-scene-wrapper');
const closeArBtn = document.getElementById('close-ar-btn');
const fallbackContainer = document.getElementById('fallback-container');
const closeFallbackBtn = document.getElementById('close-fallback-btn');
const fallbackVideo = document.getElementById('fallback-video');
const scanningIndicator = document.querySelector('.scanning-indicator');
const viewfinder = document.querySelector('.viewfinder');
const sceneEl = document.getElementById('ar-scene');

// Video & Image Reveal Modals
const videoModal = document.getElementById('video-modal');
const revealVideo = document.getElementById('ar-reveal-video');
const closeVideoModalBtn = document.getElementById('close-video-modal-btn');
const imageModal = document.getElementById('image-modal');
const revealImage = document.getElementById('ar-reveal-image');
const closeImageModalBtn = document.getElementById('close-image-modal-btn');

// Video/image sources per target
const targetData = [
    { videoSrc: './AR/video/Video%201.mp4', imageSrc: './AR/final%20image/final%201.jpeg' },
    { videoSrc: './AR/video/Video%202.mp4', imageSrc: './AR/final%20image/final%202.jpeg' }
];

let arSceneReady = false;
let pendingStart = false;
let targets = [];

// Wait for A-Frame scene to load before grabbing entities
sceneEl.addEventListener('loaded', () => {
    arSceneReady = true;
    targets = [
        { targetEl: document.getElementById('target1'), dataIndex: 0 },
        { targetEl: document.getElementById('target2'), dataIndex: 1 }
    ];
    setupTargetListeners();
    console.log('AR Scene ready.');

    if (pendingStart) {
        pendingStart = false;
        startAR();
    }
});

// --- AR Start / Stop ---

function startAR() {
    arSceneWrapper.classList.add('active');
    arContainer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (scanningIndicator) {
        scanningIndicator.classList.remove('hidden');
        scanningIndicator.textContent = '🎯 Point at the Photo...';
    }
    if (viewfinder) viewfinder.classList.remove('hidden');

    try {
        const sys = sceneEl.systems['mindar-image-system'] || sceneEl.systems.mindarimage;
        if (sys) sys.start();
        else showFallback();
    } catch (err) {
        console.error('MindAR start error:', err);
        showFallback();
    }
}

function stopAR() {
    try {
        const sys = sceneEl.systems['mindar-image-system'] || sceneEl.systems.mindarimage;
        if (sys) sys.stop();
    } catch (e) {}
    arContainer.classList.add('hidden');
    arSceneWrapper.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function showFallback() {
    arContainer.classList.add('hidden');
    arSceneWrapper.classList.remove('active');
    fallbackContainer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// --- Button Listeners ---

startArBtn.addEventListener('click', () => {
    if (arSceneReady) {
        startAR();
    } else {
        pendingStart = true;
        arSceneWrapper.classList.add('active');
        arContainer.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        if (scanningIndicator) scanningIndicator.textContent = '⏳ Loading AR...';
    }
});

closeArBtn.addEventListener('click', () => {
    stopAR();
});

closeFallbackBtn.addEventListener('click', () => {
    fallbackContainer.classList.add('hidden');
    document.body.style.overflow = 'auto';
    if (fallbackVideo) fallbackVideo.pause();
});

// --- Video Modal ---
function showVideoModal(dataIndex) {
    const data = targetData[dataIndex];
    revealVideo.src = data.videoSrc;
    revealVideo.currentTime = 0;
    videoModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    revealVideo.play().catch(e => {
        console.warn('Video play failed:', e);
        // Force muted play as fallback
        revealVideo.muted = true;
        revealVideo.play();
    });
}

closeVideoModalBtn.addEventListener('click', () => {
    videoModal.classList.add('hidden');
    revealVideo.pause();
    revealVideo.src = '';
    document.body.style.overflow = 'auto';
});

revealVideo.addEventListener('ended', () => {
    videoModal.classList.add('hidden');
    revealVideo.pause();
    // Show final image
    const currentSrc = revealVideo.getAttribute('data-image-src');
    if (currentSrc) {
        revealImage.src = currentSrc;
        imageModal.classList.remove('hidden');
    }
});

// --- Image Modal ---
closeImageModalBtn.addEventListener('click', () => {
    imageModal.classList.add('hidden');
    revealImage.src = '';
    document.body.style.overflow = 'auto';
});

// --- MindAR Target Events ---
function setupTargetListeners() {
    targets.forEach(t => {
        if (!t.targetEl) return;

        t.targetEl.addEventListener('targetFound', () => {
            console.log('Target found:', t.targetEl.id, '→ index', t.dataIndex);

            // Hide scanning UI
            if (scanningIndicator) scanningIndicator.classList.add('hidden');
            if (viewfinder) viewfinder.classList.add('hidden');

            // Stop AR camera and show video modal
            stopAR();

            // Store which image to show after video
            const data = targetData[t.dataIndex];
            revealVideo.setAttribute('data-image-src', data.imageSrc);

            showVideoModal(t.dataIndex);
        });

        t.targetEl.addEventListener('targetLost', () => {
            if (scanningIndicator) scanningIndicator.classList.remove('hidden');
            if (viewfinder) viewfinder.classList.remove('hidden');
        });
    });
}
