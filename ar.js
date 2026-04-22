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

// Wait for DOM to be fully ready before grabbing targets
let targets = [];

sceneEl.addEventListener('loaded', () => {
    targets = [
        {
            targetEl: document.getElementById('target1'),
            videoEl: document.getElementById('video1'),
            arImageEl: document.getElementById('ar-image1')
        },
        {
            targetEl: document.getElementById('target2'),
            videoEl: document.getElementById('video2'),
            arImageEl: document.getElementById('ar-image2')
        }
    ];

    setupTargetListeners();
    console.log('AR Scene loaded. Targets ready.');
});

let arSceneReady = false;
let pendingStart = false;

sceneEl.addEventListener('loaded', () => {
    arSceneReady = true;
    if (pendingStart) {
        pendingStart = false;
        startAR();
    }
});

function startAR() {
    arSceneWrapper.classList.add('active');
    arContainer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    if (scanningIndicator) {
        scanningIndicator.classList.remove('hidden');
        scanningIndicator.textContent = '🎯 Point at the Photo...';
    }
    if (viewfinder) viewfinder.classList.remove('hidden');

    // Unlock all videos during this user-gesture click event
    // This is required by mobile browsers before they allow .play()
    const v1 = document.getElementById('video1');
    const v2 = document.getElementById('video2');
    [v1, v2].forEach(v => {
        if (v) {
            v.muted = true;
            v.play().then(() => { v.pause(); v.currentTime = 0; }).catch(() => {});
        }
    });

    try {
        const sys = sceneEl.systems['mindar-image-system'] || sceneEl.systems.mindarimage;
        if (sys) {
            sys.start();
        } else {
            console.warn('MindAR not ready');
            showFallback();
        }
    } catch (err) {
        console.error('startAR error:', err);
        showFallback();
    }
}

function showFallback() {
    arContainer.classList.add('hidden');
    arSceneWrapper.classList.remove('active');
    fallbackContainer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

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
    arContainer.classList.add('hidden');
    arSceneWrapper.classList.remove('active');
    document.body.style.overflow = 'auto';

    try {
        const sys = sceneEl.systems['mindar-image-system'] || sceneEl.systems.mindarimage;
        if (sys) sys.stop();
    } catch (e) {}

    const v1 = document.getElementById('video1');
    const v2 = document.getElementById('video2');
    [v1, v2].forEach(v => { if (v) { v.pause(); v.currentTime = 0; } });

    if (scanningIndicator) scanningIndicator.classList.remove('hidden');
    if (viewfinder) viewfinder.classList.remove('hidden');

    // Reset images
    ['ar-image1', 'ar-image2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('visible', 'false');
    });
});

closeFallbackBtn.addEventListener('click', () => {
    fallbackContainer.classList.add('hidden');
    document.body.style.overflow = 'auto';
    if (fallbackVideo) fallbackVideo.pause();
});

function setupTargetListeners() {
    targets.forEach(t => {
        if (!t.targetEl || !t.videoEl) return;

        t.targetEl.addEventListener('targetFound', () => {
            console.log('Target found:', t.targetEl.id);
            if (scanningIndicator) scanningIndicator.classList.add('hidden');
            if (viewfinder) viewfinder.classList.add('hidden');

            // Reset image, show video
            if (t.arImageEl) t.arImageEl.setAttribute('visible', 'false');

            // Play with sound, fall back to muted if blocked
            t.videoEl.currentTime = 0;
            t.videoEl.muted = false;
            const playPromise = t.videoEl.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    console.warn('Sound blocked, trying muted...');
                    t.videoEl.muted = true;
                    t.videoEl.play().catch(e => console.error('Video play failed completely:', e));
                });
            }
        });

        t.targetEl.addEventListener('targetLost', () => {
            console.log('Target lost:', t.targetEl.id);
            if (scanningIndicator) scanningIndicator.classList.remove('hidden');
            if (viewfinder) viewfinder.classList.remove('hidden');
            t.videoEl.pause();
        });

        t.videoEl.addEventListener('ended', () => {
            console.log('Video ended:', t.targetEl.id);
            if (t.arImageEl) t.arImageEl.setAttribute('visible', 'true');
        });
    });
}
