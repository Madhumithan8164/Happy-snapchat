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

// Setup targets
const targets = [
    {
        targetEl: document.getElementById('target1'),
        videoEl: document.getElementById('video1'),
        arVideoEl: document.getElementById('ar-video1'),
        arImageEl: document.getElementById('ar-image1')
    },
    {
        targetEl: document.getElementById('target2'),
        videoEl: document.getElementById('video2'),
        arVideoEl: document.getElementById('ar-video2'),
        arImageEl: document.getElementById('ar-image2')
    }
];

let arSceneReady = false;
let pendingStart = false;

// Wait for the A-Frame scene to fully load
sceneEl.addEventListener('loaded', () => {
    arSceneReady = true;
    console.log('AR Scene loaded and ready');
    if (pendingStart) {
        pendingStart = false;
        startAR();
    }
});

function startAR() {
    // Show the scene canvas and overlay
    arSceneWrapper.classList.add('active');
    arContainer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Show scanning UI
    if (scanningIndicator) scanningIndicator.classList.remove('hidden');
    if (viewfinder) viewfinder.classList.remove('hidden');

    // CRITICAL: Unlock all videos during this user-gesture click
    // Mobile browsers block video.play() unless triggered by a user interaction.
    // We trigger play+pause here so the browser "unlocks" each video element.
    targets.forEach(t => {
        if (t.videoEl) {
            t.videoEl.muted = true;
            t.videoEl.play().then(() => {
                t.videoEl.pause();
                t.videoEl.currentTime = 0;
            }).catch(() => {});
        }
    });

    try {
        const mindARSystem = sceneEl.systems['mindar-image-system'];
        if (mindARSystem) {
            mindARSystem.start();
        } else if (sceneEl.systems.mindarimage) {
            sceneEl.systems.mindarimage.start();
        } else {
            console.warn('MindAR system not found');
            showFallback();
        }
    } catch (err) {
        console.error('Failed to start MindAR:', err);
        showFallback();
    }
}

function showFallback() {
    arContainer.classList.add('hidden');
    arSceneWrapper.classList.remove('active');
    fallbackContainer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Handle "Scan Me" button click
startArBtn.addEventListener('click', () => {
    if (arSceneReady) {
        startAR();
    } else {
        // Scene still loading — wait for it
        pendingStart = true;
        arSceneWrapper.classList.add('active'); // show loading state
        arContainer.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        if (scanningIndicator) scanningIndicator.textContent = '⏳ Loading AR...';
    }
});

// Close AR
closeArBtn.addEventListener('click', () => {
    arContainer.classList.add('hidden');
    arSceneWrapper.classList.remove('active');
    document.body.style.overflow = 'auto';

    try {
        const mindARSystem = sceneEl.systems['mindar-image-system'] || sceneEl.systems.mindarimage;
        if (mindARSystem) mindARSystem.stop();
    } catch (e) { /* ignore */ }

    targets.forEach(t => {
        if (t.videoEl) { t.videoEl.pause(); t.videoEl.currentTime = 0; }
    });

    // Reset scanning UI for next time
    if (scanningIndicator) { 
        scanningIndicator.classList.remove('hidden');
        scanningIndicator.textContent = '🎯 Point at the Photo...';
    }
    if (viewfinder) viewfinder.classList.remove('hidden');
});

// Close Fallback
closeFallbackBtn.addEventListener('click', () => {
    fallbackContainer.classList.add('hidden');
    document.body.style.overflow = 'auto';
    fallbackVideo.pause();
});

// Handle MindAR Target Found / Lost / Ended
targets.forEach(t => {
    if (t.targetEl && t.videoEl) {

        t.targetEl.addEventListener('targetFound', () => {
            console.log('Target found:', t.targetEl.id);
            if (scanningIndicator) scanningIndicator.classList.add('hidden');
            if (viewfinder) viewfinder.classList.add('hidden');

            if (t.arVideoEl) t.arVideoEl.setAttribute('visible', 'true');
            if (t.arImageEl) t.arImageEl.setAttribute('visible', 'false');

            t.videoEl.currentTime = 0;
            t.videoEl.muted = false; // unmute now that we're playing for real
            t.videoEl.play().catch(e => {
                // If unmuted play fails, try muted as fallback
                console.warn('Unmuted play failed, trying muted:', e);
                t.videoEl.muted = true;
                t.videoEl.play().catch(e2 => console.error('Video play failed:', e2));
            });
        });

        t.targetEl.addEventListener('targetLost', () => {
            console.log('Target lost:', t.targetEl.id);
            if (scanningIndicator) scanningIndicator.classList.remove('hidden');
            if (viewfinder) viewfinder.classList.remove('hidden');
            t.videoEl.pause();
        });

        t.videoEl.addEventListener('ended', () => {
            console.log('Video ended:', t.targetEl.id);
            if (t.arVideoEl) t.arVideoEl.setAttribute('visible', 'false');
            if (t.arImageEl) t.arImageEl.setAttribute('visible', 'true');
        });
    }
});
